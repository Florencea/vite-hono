import type { SwaggerUiCustomOptions } from "../config.js";
import { customScript, openapiStyles } from "./loader.js";

export function renderSwaggerUiHtml({
  docUrl,
  options,
}: {
  docUrl: string;
  options: SwaggerUiCustomOptions;
}): string {
  const swaggerConfig = JSON.stringify({
    url: docUrl,
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: ["SwaggerUIBundle.presets.apis", "SwaggerUIStandalonePreset"],
    plugins: ["SwaggerUIBundle.plugins.DownloadUrl"],
    layout: "StandaloneLayout",
    ...options.swaggerOptions,
  });

  const siteTitle = options.customSiteTitle ?? "OpenAPI";
  const favIcon = options.customfavIcon ?? "favicon.ico";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    <link rel="icon" type="image/x-icon" href="${favIcon}">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
${openapiStyles}
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
    <script>
      window.onload = function() {
        const config = ${swaggerConfig};
        config.presets = [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ];
        config.plugins = [
          SwaggerUIBundle.plugins.DownloadUrl
        ];
        const ui = SwaggerUIBundle(config);
        window.ui = ui;
      };
    </script>
    <script>
${customScript}
    </script>
  </body>
</html>`;
}
