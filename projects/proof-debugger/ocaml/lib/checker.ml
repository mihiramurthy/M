open Ast

type open_assumption = { id : string; formula : formula }

type context = {
  proved : (string, formula) Hashtbl.t;
  open_assumps : open_assumption list;
}

type step_error = {
  step_id : string;
  rule : string;
  formula : string;
  message : string;
  hint : string;
}

type check_result =
  | Valid of { steps_checked : int; goal_reached : bool }
  | Invalid of {
      first_error : step_error;
      steps_before_error : int;
      pattern : string;
    }

let lookup ctx id =
  try Some (Hashtbl.find ctx.proved id) with Not_found -> None

let require_cite ctx id =
  match lookup ctx id with
  | Some f -> f
  | None -> failwith ("unknown citation '" ^ id ^ "' — no prior step/assumption with that id")

let pattern_of_rule = function
  | ImpElim -> "modus_ponens_misapply"
  | ModusTollens -> "modus_tollens_misapply"
  | AndIntro -> "and_intro_mismatch"
  | AndElimL | AndElimR -> "and_elim_mismatch"
  | ImpIntro -> "imp_intro_discharge"
  | NegIntro -> "neg_intro_discharge"
  | Reit -> "reiteration_mismatch"
  | Premise | Assumption -> "premise_form"
  | OrIntroL | OrIntroR -> "or_intro_mismatch"
  | Dne -> "dne_mismatch"
  | Contra | NegElim | BotElim -> "contradiction_form"
  | _ -> "rule_application"

let hint_for = function
  | ImpElim -> "Cite both the implication P→Q and the antecedent P; conclude Q."
  | ModusTollens -> "Cite P→Q and ¬Q; conclude ¬P."
  | AndIntro -> "Cite φ and ψ; conclude φ∧ψ."
  | AndElimL -> "Cite φ∧ψ; conclude φ."
  | AndElimR -> "Cite φ∧ψ; conclude ψ."
  | ImpIntro -> "Assume P, derive Q, discharge the assumption, conclude P→Q."
  | NegIntro -> "Assume φ, derive ⊥, discharge, conclude ¬φ."
  | Reit -> "Reiteration must copy a prior formula exactly."
  | Premise -> "Premises introduce given formulas without citations."
  | _ -> "Verify the rule's required premises and conclusion shape."

(** Apply a rule; returns the derived formula or raises Failure. *)
let apply_rule ctx step =
  let cites = step.cites in
  let expected = step.formula in
  match step.rule with
  | Premise ->
      if cites <> [] then failwith "Premise takes no citations";
      expected
  | Assumption ->
      if cites <> [] then failwith "Assumption takes no citations";
      expected
  | Reit ->
      (match cites with
      | [ a ] ->
          let f = require_cite ctx a in
          if formula_equal f expected then expected
          else
            failwith
              ("Reiteration of " ^ a ^ " yields " ^ string_of_formula f ^ ", not "
             ^ string_of_formula expected)
      | _ -> failwith "Reiteration needs exactly one citation")
  | ImpElim ->
      (match cites with
      | [ a; b ] ->
          let fa = require_cite ctx a in
          let fb = require_cite ctx b in
          let try_mp imp_f ant_f =
            match imp_f with
            | Imp (p, q) when formula_equal p ant_f && formula_equal q expected -> true
            | _ -> false
          in
          if try_mp fa fb || try_mp fb fa then expected
          else
            failwith
              ("Modus ponens on " ^ a ^ "=" ^ string_of_formula fa ^ " and " ^ b ^ "="
             ^ string_of_formula fb ^ " does not yield " ^ string_of_formula expected
             ^ ". Need formulas P and (P→Q) to conclude Q.")
      | _ -> failwith "→-Elim (MP) needs exactly two citations: P and P→Q")
  | ModusTollens ->
      (match cites with
      | [ a; b ] ->
          let fa = require_cite ctx a in
          let fb = require_cite ctx b in
          let ok =
            match fa, fb with
            | Imp (p, q), Not q' when formula_equal q q' && formula_equal expected (Not p) -> true
            | Not q', Imp (p, q) when formula_equal q q' && formula_equal expected (Not p) -> true
            | _ -> false
          in
          if ok then expected
          else
            failwith
              "Modus tollens needs (P→Q) and ¬Q to conclude ¬P — citations do not match that pattern"
      | _ -> failwith "Modus tollens needs exactly two citations")
  | AndIntro ->
      (match cites with
      | [ a; b ] ->
          let fa = require_cite ctx a in
          let fb = require_cite ctx b in
          (match expected with
          | And (x, y) when formula_equal x fa && formula_equal y fb -> expected
          | And (x, y) when formula_equal x fb && formula_equal y fa -> expected
          | _ ->
              failwith
                ("∧-Intro from " ^ string_of_formula fa ^ " and " ^ string_of_formula fb
               ^ " should conclude their conjunction, not " ^ string_of_formula expected))
      | _ -> failwith "∧-Intro needs exactly two citations")
  | AndElimL ->
      (match cites with
      | [ a ] ->
          (match require_cite ctx a with
          | And (l, _) when formula_equal l expected -> expected
          | And (l, _) ->
              failwith
                ("∧-Elim-L on " ^ a ^ " yields " ^ string_of_formula l ^ ", not "
               ^ string_of_formula expected)
          | f -> failwith (a ^ " is " ^ string_of_formula f ^ ", not a conjunction"))
      | _ -> failwith "∧-Elim-L needs one citation")
  | AndElimR ->
      (match cites with
      | [ a ] ->
          (match require_cite ctx a with
          | And (_, r) when formula_equal r expected -> expected
          | And (_, r) ->
              failwith
                ("∧-Elim-R on " ^ a ^ " yields " ^ string_of_formula r ^ ", not "
               ^ string_of_formula expected)
          | f -> failwith (a ^ " is " ^ string_of_formula f ^ ", not a conjunction"))
      | _ -> failwith "∧-Elim-R needs one citation")
  | OrIntroL ->
      (match cites with
      | [ a ] ->
          let fa = require_cite ctx a in
          (match expected with
          | Or (l, _) when formula_equal l fa -> expected
          | _ ->
              failwith
                ("∨-Intro-L from " ^ string_of_formula fa ^ " should conclude ("
               ^ string_of_formula fa ^ " ∨ _), not " ^ string_of_formula expected))
      | _ -> failwith "∨-Intro-L needs one citation")
  | OrIntroR ->
      (match cites with
      | [ a ] ->
          let fa = require_cite ctx a in
          (match expected with
          | Or (_, r) when formula_equal r fa -> expected
          | _ ->
              failwith
                ("∨-Intro-R from " ^ string_of_formula fa ^ " should conclude (_ ∨ "
               ^ string_of_formula fa ^ "), not " ^ string_of_formula expected))
      | _ -> failwith "∨-Intro-R needs one citation")
  | ImpIntro ->
      let assump_id =
        match step.discharge with
        | Some id -> id
        | None -> failwith "→-Intro needs {discharge AssumpId}"
      in
      let concl_id =
        match cites with
        | c :: _ -> c
        | [] -> failwith "→-Intro needs the derived conclusion citation"
      in
      let assump_f =
        match List.find_opt (fun a -> a.id = assump_id) ctx.open_assumps with
        | Some a -> a.formula
        | None -> (
            match lookup ctx assump_id with
            | Some f -> f
            | None -> failwith ("cannot discharge unknown assumption " ^ assump_id))
      in
      let concl_f = require_cite ctx concl_id in
      (match expected with
      | Imp (p, q) when formula_equal p assump_f && formula_equal q concl_f -> expected
      | Imp (p, q) ->
          failwith
            ("→-Intro should conclude (" ^ string_of_formula assump_f ^ " → "
           ^ string_of_formula concl_f ^ "), got (" ^ string_of_formula p ^ " → "
           ^ string_of_formula q ^ ")")
      | _ -> failwith "→-Intro must conclude an implication")
  | NegIntro ->
      let assump_id =
        match step.discharge with
        | Some id -> id
        | None -> failwith "¬-Intro needs {discharge AssumpId}"
      in
      let bot_id =
        match cites with
        | [ c ] -> c
        | _ -> failwith "¬-Intro needs a citation that derives ⊥ under the assumption"
      in
      let assump_f =
        match List.find_opt (fun a -> a.id = assump_id) ctx.open_assumps with
        | Some a -> a.formula
        | None -> (
            match lookup ctx assump_id with
            | Some f -> f
            | None -> failwith ("cannot discharge unknown assumption " ^ assump_id))
      in
      (match require_cite ctx bot_id with
      | Bot -> (
          match expected with
          | Not p when formula_equal p assump_f -> expected
          | _ ->
              failwith
                ("¬-Intro discharging " ^ string_of_formula assump_f ^ " should conclude ¬"
               ^ string_of_formula_atom assump_f))
      | f -> failwith ("¬-Intro requires deriving ⊥, but " ^ bot_id ^ " is " ^ string_of_formula f))
  | NegElim ->
      (match cites with
      | [ a; b ] ->
          let fa = require_cite ctx a in
          let fb = require_cite ctx b in
          let ok =
            match fa, fb with
            | p, Not p' when formula_equal p p' && expected = Bot -> true
            | Not p', p when formula_equal p p' && expected = Bot -> true
            | _ -> false
          in
          if ok then Bot else failwith "¬-Elim needs φ and ¬φ to conclude ⊥"
      | _ -> failwith "¬-Elim needs two citations")
  | Contra ->
      (match cites with
      | [ a; b ] ->
          let fa = require_cite ctx a in
          let fb = require_cite ctx b in
          let contradictory =
            match fa, fb with
            | p, Not p' | Not p', p -> formula_equal p p'
            | _ -> false
          in
          if contradictory && expected = Bot then Bot
          else failwith "Contradiction rule needs φ and ¬φ to conclude ⊥"
      | _ -> failwith "Contradiction needs two citations")
  | BotElim ->
      (match cites with
      | [ a ] ->
          (match require_cite ctx a with
          | Bot -> expected
          | f -> failwith (a ^ " is " ^ string_of_formula f ^ ", not ⊥"))
      | _ -> failwith "⊥-Elim needs one citation of ⊥")
  | Dne ->
      (match cites with
      | [ a ] ->
          (match require_cite ctx a with
          | Not (Not p) when formula_equal p expected -> expected
          | f ->
              failwith
                ("¬¬-Elim on " ^ string_of_formula f ^ " does not yield " ^ string_of_formula expected))
      | _ -> failwith "¬¬-Elim needs one citation")
  | OrElim ->
      failwith
        "∨-Elim subproof checking is limited in this demo — expand into ImpIntro/MP style or use a simpler strategy"
  | Unknown name -> failwith ("unknown or unsupported rule '" ^ name ^ "'")

let check_proof (proof : proof) =
  let proved = Hashtbl.create 64 in
  let rec find i assumps steps =
    match steps with
    | [] ->
        let goal_reached =
          match proof.goal with
          | None -> true
          | Some g -> (
              match List.rev proof.steps with
              | last :: _ -> formula_equal last.formula g
              | [] -> false)
        in
        Valid { steps_checked = i; goal_reached }
    | step :: rest ->
        let ctx = { proved; open_assumps = assumps } in
        (try
           let formula = apply_rule ctx step in
           Hashtbl.replace proved step.id formula;
           let assumps' =
             match step.rule with
             | Assumption -> { id = step.id; formula } :: assumps
             | ImpIntro | NegIntro -> (
                 match step.discharge with
                 | Some id -> List.filter (fun a -> a.id <> id) assumps
                 | None -> assumps)
             | _ -> assumps
           in
           find (i + 1) assumps' rest
         with Failure m ->
           Invalid
             {
               first_error =
                 {
                   step_id = step.id;
                   rule = string_of_rule step.rule;
                   formula = string_of_formula step.formula;
                   message = m;
                   hint = hint_for step.rule;
                 };
               steps_before_error = i;
               pattern = pattern_of_rule step.rule;
             })
  in
  find 0 [] proof.steps
