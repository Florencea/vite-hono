import { Generator, getConfig } from "@tanstack/router-generator";

async function generateRoutes(): Promise<void> {
  const config = getConfig({
    routesDirectory: "./src/client/routes",
    generatedRouteTree: "./src/client/routeTree.gen.ts",
    autoCodeSplitting: true,
  });
  const generator = new Generator({ config, root: process.cwd() });
  await generator.run();
  console.info("[router] Route tree generated successfully at src/client/routeTree.gen.ts");
}

await generateRoutes();
