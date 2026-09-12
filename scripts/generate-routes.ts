import { Generator, getConfig } from "@tanstack/router-generator";

async function generateRoutes(): Promise<void> {
  const config = getConfig();
  const generator = new Generator({ config, root: process.cwd() });
  await generator.run();
  console.info(
    "[router] Route tree generated successfully at src/client/routeTree.gen.ts",
  );
}

await generateRoutes();
