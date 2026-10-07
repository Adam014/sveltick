import { rm } from "node:fs/promises";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { rollup } from "rollup";
import { dts } from "rollup-plugin-dts";

await rm("dist", { recursive: true, force: true });

const bundle = await rollup({
  input: "src/index.ts",
  plugins: [typescript({ tsconfig: "./tsconfig.build.json" }), terser()],
});

try {
  await bundle.write({
    file: "dist/sveltick.es.js",
    format: "es",
    sourcemap: true,
  });
  await bundle.write({
    file: "dist/sveltick.cjs",
    format: "cjs",
    exports: "named",
    sourcemap: true,
  });
} finally {
  await bundle.close();
}

const declarations = await rollup({
  input: "dist/types/index.d.ts",
  plugins: [dts()],
});

try {
  // NodeNext consumers need a declaration matching each module format.
  await declarations.write({ file: "dist/index.d.ts", format: "es" });
  await declarations.write({ file: "dist/index.d.cts", format: "es" });
} finally {
  await declarations.close();
}

await rm("dist/types", { recursive: true, force: true });
