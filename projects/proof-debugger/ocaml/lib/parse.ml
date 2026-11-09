open Ast

exception Parse_error of string

let is_atom_char c =
  (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c = '_'

(** Recursive-descent parser for propositional formulas.
    Supports: atoms, ¬ ~ not, ∧ /\ and, ∨ \/ or, → -> implies, ⊥ false, ⊤ true, parentheses. *)
let parse_formula input =
  let s = String.trim input in
  let n = String.length s in
  let i = ref 0 in
  let peek () = if !i >= n then None else Some s.[!i] in
  let bump () = incr i in
  let skip_ws () =
    while
      match peek () with
      | Some (' ' | '\t') -> true
      | _ -> false
    do
      bump ()
    done
  in
  let starts_with prefix =
    let plen = String.length prefix in
    !i + plen <= n && String.sub s !i plen = prefix
  in
  let consume prefix =
    if starts_with prefix then (
      i := !i + String.length prefix;
      true)
    else false
  in
  let rec parse_imp () =
    skip_ws ();
    let left = parse_or () in
    skip_ws ();
    if consume "->" || consume "→" || consume "implies" then (
      skip_ws ();
      Imp (left, parse_imp ()))
    else left
  and parse_or () =
    skip_ws ();
    let left = parse_and () in
    let rec loop acc =
      skip_ws ();
      if consume "\\/" || consume "∨" || consume " or " then (
        skip_ws ();
        loop (Or (acc, parse_and ())))
      else if
        match peek () with
        | Some 'v' when !i + 1 < n && (s.[!i + 1] = ' ' || s.[!i + 1] = '(') ->
            bump ();
            true
        | _ -> false
      then (
        skip_ws ();
        loop (Or (acc, parse_and ())))
      else acc
    in
    loop left
  and parse_and () =
    skip_ws ();
    let left = parse_unary () in
    let rec loop acc =
      skip_ws ();
      if consume "/\\" || consume "∧" || consume " and " then (
        skip_ws ();
        loop (And (acc, parse_unary ())))
      else if
        match peek () with
        | Some '^' ->
            bump ();
            true
        | _ -> false
      then (
        skip_ws ();
        loop (And (acc, parse_unary ())))
      else acc
    in
    loop left
  and parse_unary () =
    skip_ws ();
    if consume "~" || consume "¬" || consume "not " then Not (parse_unary ())
    else parse_atom ()
  and parse_atom () =
    skip_ws ();
    if consume "(" then (
      let f = parse_imp () in
      skip_ws ();
      if not (consume ")") then raise (Parse_error "expected ')'");
      f)
    else if consume "⊥" || consume "false" || consume "bot" then Bot
    else if consume "⊤" || consume "true" || consume "top" then Top
    else
      match peek () with
      | Some c when is_atom_char c ->
          let buf = Buffer.create 8 in
          while
            match peek () with
            | Some c when is_atom_char c -> true
            | _ -> false
          do
            Buffer.add_char buf (Option.get (peek ()));
            bump ()
          done;
          let name = Buffer.contents buf in
          if name = "false" then Bot
          else if name = "true" then Top
          else Atom name
      | _ -> raise (Parse_error ("unexpected token near: " ^ String.sub s !i (min 12 (n - !i))))
  in
  let f = parse_imp () in
  skip_ws ();
  if !i <> n then raise (Parse_error ("trailing input: " ^ String.sub s !i (n - !i)));
  f

let parse_rule name =
  let n = String.lowercase_ascii (String.trim name) in
  match n with
  | "premise" | "prem" | "given" -> Premise
  | "assumption" | "assume" | "hyp" -> Assumption
  | "reit" | "reiteration" | "r" -> Reit
  | "andintro" | "and-intro" | "/\\i" | "∧i" | "andi" -> AndIntro
  | "andeliml" | "and-elim-l" | "/\\e1" | "∧e1" | "andel" -> AndElimL
  | "andelimr" | "and-elim-r" | "/\\e2" | "∧e2" | "ander" -> AndElimR
  | "orintrol" | "or-intro-l" | "\\/i1" | "∨i1" | "oril" -> OrIntroL
  | "orintror" | "or-intro-r" | "\\/i2" | "∨i2" | "orir" -> OrIntroR
  | "orelim" | "or-elim" | "\\/e" | "∨e" -> OrElim
  | "impintro" | "imp-intro" | "->i" | "→i" | "cp" | "conditional proof" -> ImpIntro
  | "impelim" | "imp-elim" | "->e" | "→e" | "mp" | "modus ponens" -> ImpElim
  | "mt" | "modus tollens" -> ModusTollens
  | "negintro" | "neg-intro" | "~i" | "¬i" | "rai" -> NegIntro
  | "negelim" | "neg-elim" | "~e" | "¬e" -> NegElim
  | "botelim" | "bot-elim" | "falseelim" | "⊥e" -> BotElim
  | "dne" | "~~e" | "¬¬e" | "double negation" -> Dne
  | "contra" | "contradiction" | "⊥" -> Contra
  | other -> Unknown other

(** Line format:
      ID: FORMULA  [Rule Cite1 Cite2]  {discharge AssumpId?}
    Example:
      S3: Q  [MP S1 S2]
      S5: P -> Q  [ImpIntro S4] {discharge A1}
*)
let parse_step_line line =
  let line = String.trim line in
  if line = "" || line.[0] = '#' then None
  else
    try
      let id_sep = String.index line ':' in
      let id = String.trim (String.sub line 0 id_sep) in
      let rest = String.trim (String.sub line (id_sep + 1) (String.length line - id_sep - 1)) in
      let bracket_start =
        try String.index rest '[' with Not_found -> raise (Parse_error ("missing [rule] in: " ^ line))
      in
      let formula_str = String.trim (String.sub rest 0 bracket_start) in
      let after = String.trim (String.sub rest bracket_start (String.length rest - bracket_start)) in
      let br_end =
        try String.index after ']' with Not_found -> raise (Parse_error ("missing ] in: " ^ line))
      in
      let inside = String.trim (String.sub after 1 (br_end - 1)) in
      let trailing = String.trim (String.sub after (br_end + 1) (String.length after - br_end - 1)) in
      let tokens = List.filter (( <> ) "") (String.split_on_char ' ' inside) in
      let rule_name, cites =
        match tokens with
        | [] -> raise (Parse_error "empty rule bracket")
        | r :: cs -> (r, cs)
      in
      let discharge =
        if String.length trailing > 0 && trailing.[0] = '{' then
          let inner = String.sub trailing 1 (String.length trailing - 1) in
          let inner =
            if String.length inner > 0 && inner.[String.length inner - 1] = '}' then
              String.sub inner 0 (String.length inner - 1)
            else inner
          in
          let parts = List.filter (( <> ) "") (String.split_on_char ' ' (String.trim inner)) in
          match parts with
          | "discharge" :: a :: _ | a :: _ -> Some a
          | [] -> None
        else None
      in
      Some
        {
          id;
          formula = parse_formula formula_str;
          rule = parse_rule rule_name;
          cites;
          discharge;
          raw = line;
        }
    with
    | Parse_error _ as e -> raise e
    | _ -> raise (Parse_error ("could not parse step: " ^ line))

let parse_proof text =
  let lines = String.split_on_char '\n' text in
  let goal = ref None in
  let steps = ref [] in
  List.iter
    (fun line ->
      let t = String.trim line in
      if String.length t >= 5 && String.lowercase_ascii (String.sub t 0 5) = "goal:" then
        let g = String.trim (String.sub t 5 (String.length t - 5)) in
        goal := Some (parse_formula g)
      else
        match parse_step_line line with
        | None -> ()
        | Some st -> steps := st :: !steps)
    lines;
  { goal = !goal; steps = List.rev !steps }
