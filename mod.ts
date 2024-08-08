// deno-lint-ignore-file no-explicit-any
import ts from "npm:typescript@5.5.3";
import { properties } from "./props.ts";

/**
 * Converts a TypeScript file to JSON.
 * @param file The file to convert
 * @param data The contents of the file
 * @returns A JSON representation of the file
 * @internal
 */
export function convert(file: string, data: string): string {
  const sauce = ts.createSourceFile(file, data, ts.ScriptTarget.Latest, false);
  const obj = visit(sauce);
  return JSON.stringify(obj, null, 2);
}

/**
 * A visitor used to enumerate Ast nodes.
 * @param node A TypeScript AST node
 * @returns A JSON representation of the AST node
 * @internal
 */
export function visit(node: any): any {
  const ast: any = {};

  for (const prop of properties.values()) {
    if (!node || !node[prop]) continue;
    const nodeProp = node[prop];

    if (prop === "kind" || prop === "token") {
      const kind = ts.SyntaxKind[nodeProp];
      ast[prop] = kind;
    } else if (ts.isTypeNode(nodeProp)) {
      ast[prop] = visit(nodeProp);
    } else if (Array.isArray(nodeProp)) {
      ast[prop] = [...nodeProp].map(visit);
    } else {
      const type = typeof nodeProp;
      if (type === "boolean" || type === "number" || type === "string") {
        ast[prop] = nodeProp;
      } else if (type === "object") {
        ast[prop] = visit(nodeProp);
      }
    }
  }

  return ast;
}

/**
 * If the module is executed as a script, convert the file and print the JSON.
 */
if (import.meta.main) {
  if (!Deno.args.length) {
    console.error("No file");
    Deno.exit(1);
  }

  const file = Deno.args[0];
  const decoder = new TextDecoder();
  const data = decoder.decode(Deno.readFileSync(file));
  const json = convert(file, data);
  console.log(json);
}
