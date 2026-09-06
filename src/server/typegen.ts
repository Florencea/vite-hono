import { Hono } from "hono";
import {
  InputData,
  jsonInputForTargetLanguage,
  type LanguageName,
  type Options,
  quicktype,
} from "quicktype-core";

export const typegenRouter = new Hono();

const TYPEGEN_CONFIG: Record<string, Partial<Options>> = {
  typescript: {
    lang: "typescript",
    rendererOptions: { "just-types": "true" },
    indentation: "  ",
  },
  java: {
    lang: "java",
    rendererOptions: { "just-types": "true", package: "com.example" },
  },
  csharp: {
    lang: "csharp",
    rendererOptions: {
      namespace: "Example",
      features: "attributes-only",
      "just-types": true,
      "keep-property-name": true,
    },
  },
};

typegenRouter.post("/:lang", async (c) => {
  try {
    const lang = c.req.param("lang");
    if (!lang || !TYPEGEN_CONFIG[lang]) {
      return c.json({ error: `Unsupported language: ${lang}` }, 400);
    }

    let bodyText = await c.req.text();
    if (!bodyText || bodyText.trim() === "") {
      bodyText = "{}";
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      parsedBody = { text: bodyText };
    }

    const jsonInput = jsonInputForTargetLanguage(lang as LanguageName);
    await jsonInput.addSource({
      name: "Example",
      samples: [JSON.stringify(parsedBody)],
    });
    const inputData = new InputData();
    inputData.addInput(jsonInput);
    const result = await quicktype({
      inputData,
      ...TYPEGEN_CONFIG[lang],
    });
    return c.json(result.lines);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

export default typegenRouter;
