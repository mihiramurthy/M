open Proof_lib

let read_all channel =
  let buf = Buffer.create 1024 in
  (try
     while true do
       Buffer.add_string buf (input_line channel);
       Buffer.add_char buf '\n'
     done
   with End_of_file -> ());
  Buffer.contents buf

let () =
  let text =
    if Array.length Sys.argv > 1 then (
      let ic = open_in Sys.argv.(1) in
      let s = read_all ic in
      close_in ic;
      s)
    else read_all stdin
  in
  try
    let proof = Parse.parse_proof text in
    let result = Checker.check_proof proof in
    let steps_json = Json_out.of_steps proof in
    let result_json = Json_out.of_result result in
    (* merge *)
    let merged =
      let body = String.sub result_json 1 (String.length result_json - 2) in
      "{" ^ body ^ ",\"steps\":" ^ steps_json ^ "}"
    in
    print_endline merged
  with Parse.Parse_error msg ->
    Printf.printf
      {|{"ok":false,"engine":"ocaml","pattern":"parse_error","error":{"stepId":"?","rule":"parse","formula":"?","message":"%s","hint":"Use lines like: S1: P /\\ Q  [AndIntro A B]"}}|}
      (Json_out.esc msg);
    print_newline ();
    exit 1
