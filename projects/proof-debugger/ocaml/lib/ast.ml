(** Propositional formulas and natural-deduction proof steps. *)

type formula =
  | Atom of string
  | Not of formula
  | And of formula * formula
  | Or of formula * formula
  | Imp of formula * formula
  | Bot
  | Top

type rule =
  | Premise
  | Assumption
  | Reit
  | AndIntro
  | AndElimL
  | AndElimR
  | OrIntroL
  | OrIntroR
  | OrElim
  | ImpIntro
  | ImpElim (* modus ponens *)
  | ModusTollens
  | NegIntro
  | NegElim
  | BotElim
  | Dne (* double negation elimination *)
  | Contra
  | Unknown of string

type step = {
  id : string;
  formula : formula;
  rule : rule;
  cites : string list;
  discharge : string option; (* assumption id discharged, for ImpIntro/NegIntro *)
  raw : string;
}

type proof = {
  goal : formula option;
  steps : step list;
}

let rec formula_equal a b =
  match a, b with
  | Atom x, Atom y -> String.equal x y
  | Not x, Not y -> formula_equal x y
  | And (a1, a2), And (b1, b2)
  | Or (a1, a2), Or (b1, b2)
  | Imp (a1, a2), Imp (b1, b2) -> formula_equal a1 b1 && formula_equal a2 b2
  | Bot, Bot | Top, Top -> true
  | _ -> false

let rec string_of_formula = function
  | Atom s -> s
  | Bot -> "⊥"
  | Top -> "⊤"
  | Not f -> "¬" ^ string_of_formula_atom f
  | And (a, b) -> string_of_formula_atom a ^ " ∧ " ^ string_of_formula_atom b
  | Or (a, b) -> string_of_formula_atom a ^ " ∨ " ^ string_of_formula_atom b
  | Imp (a, b) -> string_of_formula_atom a ^ " → " ^ string_of_formula_atom b

and string_of_formula_atom = function
  | Atom _ | Bot | Top | Not _ as f -> string_of_formula f
  | f -> "(" ^ string_of_formula f ^ ")"

let string_of_rule = function
  | Premise -> "Premise"
  | Assumption -> "Assumption"
  | Reit -> "Reiteration"
  | AndIntro -> "∧-Intro"
  | AndElimL -> "∧-Elim-L"
  | AndElimR -> "∧-Elim-R"
  | OrIntroL -> "∨-Intro-L"
  | OrIntroR -> "∨-Intro-R"
  | OrElim -> "∨-Elim"
  | ImpIntro -> "→-Intro"
  | ImpElim -> "→-Elim (MP)"
  | ModusTollens -> "Modus Tollens"
  | NegIntro -> "¬-Intro"
  | NegElim -> "¬-Elim"
  | BotElim -> "⊥-Elim"
  | Dne -> "¬¬-Elim"
  | Contra -> "Contradiction"
  | Unknown s -> "Unknown(" ^ s ^ ")"
