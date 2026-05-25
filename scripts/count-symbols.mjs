//AI Usage log:
//  Tool: ChatGPT 
//  All code is AI generated and human verified
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { parse } from "@babel/parser";
import { walk } from "estree-walker";

const SOURCE_DIR = "./client/src";

let files = 0, classes = 0, functions = 0, methods = 0;

function getFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (["node_modules", "dist", "coverage"].includes(entry)) continue;
      getFiles(full);
    } else if ([".js", ".jsx"].includes(extname(entry))) {
      files++;
      const code = readFileSync(full, "utf8");
      try {
        const ast = parse(code, {
          sourceType: "module",
          plugins: ["jsx"],
        });
        walk(ast, {
          enter(node) {
            if (node.type === "ClassDeclaration" || node.type === "ClassExpression") classes++;
            if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") functions++;
            if (node.type === "ClassMethod") methods++;
          }
        });
      } catch (e) {
        console.warn(`Could not parse ${full}: ${e.message}`);
      }
    }
  }
}

getFiles(SOURCE_DIR);

console.log("=== SYMBOL COUNT ===");
console.log(`Files     : ${files}`);
console.log(`Classes   : ${classes}`);
console.log(`Functions : ${functions}`);
console.log(`Methods   : ${methods}`);
