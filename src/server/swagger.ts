import type { SwaggerUiCustomOptions } from "./config.js";

export function renderSwaggerUiHtml({
  docUrl,
  options,
}: {
  docUrl: string;
  options: SwaggerUiCustomOptions;
}): string {
  const cssLinks = options.customCssUrl
    .map((url) => `    <link rel="stylesheet" href="${url}" />`)
    .join("\n");

  const jsScripts = options.customJs.map((url) => `    <script src="${url}"></script>`).join("\n");

  const swaggerConfig = JSON.stringify({
    url: docUrl,
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: ["SwaggerUIBundle.presets.apis", "SwaggerUIStandalonePreset"],
    plugins: ["SwaggerUIBundle.plugins.DownloadUrl"],
    layout: "StandaloneLayout",
    ...options.swaggerOptions,
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.customSiteTitle}</title>
    <link rel="icon" type="image/x-icon" href="${options.customfavIcon}">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
${cssLinks}
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        background: #fafafa;
      }
      .swagger-ui .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
${jsScripts}
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
  </body>
</html>`;
}
