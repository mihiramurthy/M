let esc s =
  let buf = Buffer.create (String.length s) in
  String.iter
    (function
      | '"' -> Buffer.add_string buf "\\\""
      | '\\' -> Buffer.add_string buf "\\\\"
      | '\n' -> Buffer.add_string buf "\\n"
      | c -> Buffer.add_char buf c)
    s;
  Buffer.contents buf

let of_result = function
  | Checker.Valid { steps_checked; goal_reached } ->
      Printf.sprintf
        {|{"ok":true,"stepsChecked":%d,"goalReached":%b,"engine":"ocaml"}|}
        steps_checked goal_reached
  | Checker.Invalid { first_error = e; steps_before_error; pattern } ->
      Printf.sprintf
        {|{"ok":false,"stepsBeforeError":%d,"pattern":"%s","engine":"ocaml","error":{"stepId":"%s","rule":"%s","formula":"%s","message":"%s","hint":"%s"}}|}
        steps_before_error (esc pattern) (esc e.step_id) (esc e.rule) (esc e.formula)
        (esc e.message) (esc e.hint)

let of_steps (proof : Ast.proof) =
  let parts =
    List.map
      (fun (st : Ast.step) ->
        Printf.sprintf
          {|{"id":"%s","formula":"%s","rule":"%s","cites":[%s]}|}
          (esc st.id)
          (esc (Ast.string_of_formula st.formula))
          (esc (Ast.string_of_rule st.rule))
          (String.concat "," (List.map (fun c -> "\"" ^ esc c ^ "\"") st.cites)))
      proof.steps
  in
  "[" ^ String.concat "," parts ^ "]"
