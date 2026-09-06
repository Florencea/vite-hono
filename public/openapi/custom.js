const waitForElementExist = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const highlightMarkdown = async () => {
  const elm = await waitForElementExist(".renderedMarkdown");
  const elmCodes = elm.querySelectorAll("pre code");
  hljs.configure({ languages: ["json", "java", "plaintext"] });
  for (const elmCode of elmCodes) {
    hljs.highlightElement(elmCode);
  }
};

const getTypeGenResult = async (lang, jsonText) => {
  try {
    const res = await fetch(`./typegen/${lang}`, {
      method: "POST",
      body: jsonText,
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    return result.join("\n");
  } catch (err) {
    return JSON.stringify(err);
  }
};

const copyTextToClipboard = (btn, text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "absolute";
  textArea.style.opacity = 0;
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus({ preventScroll: true });
  textArea.select();
  try {
    const copySuccess = document.execCommand("copy");
    if (copySuccess) {
      btn.classList.add("copy-btn-success");
      setTimeout(() => {
        btn.classList.remove("copy-btn-success");
      }, 100);
    } else {
      throw new Error("copy failed");
    }
  } catch {
    btn.classList.add("copy-btn-failed");
    setTimeout(() => {
      btn.classList.remove("copy-btn-failed");
    }, 100);
  } finally {
    textArea.remove();
  }
};

const AddCopyPathBtnOnTitle = async () => {
  await waitForElementExist(".opblock-summary");
  const elms = document.querySelectorAll(".opblock-summary");
  for (const elm of elms) {
    const oldBtn = elm.querySelector("button.copy-btn-path");
    const originalBtn = elm.querySelector(
      "div.view-line-link.copy-to-clipboard",
    );
    originalBtn.style.display = "none";
    if (!oldBtn) {
      const method = elm.querySelector(".opblock-summary-method").innerText;
      const path =
        elm.querySelector(".opblock-summary-path")?.attributes["data-path"]
          .value ??
        elm.querySelector(".opblock-summary-path__deprecated").attributes[
          "data-path"
        ].value;
      const description = elm.querySelector(
        ".opblock-summary-description",
      ).innerText;
      const TEXT = `[${method}] ${path} ${description}`;
      const BTN_ICON = `<svg width="15" height="16"><use href="#copy" xlink:href="#copy"></use></svg>`;

      const btn = document.createElement("button");
      btn.innerHTML = BTN_ICON;
      btn.title = "Copy path and summary to clipboard";
      btn.classList.add("copy-to-clipboard", "copy-btn-path");
      btn.onclick = async () => {
        copyTextToClipboard(btn, TEXT);
      };

      elm.appendChild(btn);
    }
  }
};

const findMutationtarget = (mutations) => {
  const targetMutation = mutations?.find((mutation) => {
    return (
      mutation?.target?.classList?.contains("opblock") ||
      mutation?.target?.classList?.contains("opblock-body") ||
      mutation?.target?.classList?.contains("model-example")
    );
  });
  return targetMutation?.target;
};

const getChildElements = async (mutationTarget, childSelector) => {
  return mutationTarget.querySelectorAll(childSelector);
};

const highlightPanelCodes = (panelCodes) => {
  for (const panelCode of panelCodes) {
    panelCode.classList.add("language-json");
    hljs.configure({ ignoreUnescapedHTML: true });
    hljs.highlightElement(panelCode);
  }
};

const removeExcludeDivs = (panel) => {
  const excludeDivs = [
    ...panel.querySelectorAll("div.download-contents"),
    ...panel.querySelectorAll("div.copy-to-clipboard"),
  ];
  excludeDivs.forEach((div) => div.remove());
};

const addBtn = async (panel, options) => {
  const oldBtn = panel.querySelector("button.btn");
  if (panel && !oldBtn) {
    panel.style.position = "relative";
    const BTN_ICON = `<svg width="15" height="16"><use href="#copy" xlink:href="#copy"></use></svg>`;
    const btn = document.createElement("button");
    btn.innerHTML = BTN_ICON;
    btn.title = options?.title;
    btn.classList.add(...(options?.classList ?? []));
    btn.onclick = async () => {
      const btnText = await options?.getText();
      copyTextToClipboard(btn, btnText);
    };
    panel.append(btn);
  }
};

const AddCopyBtnsOnExamplePanel = async (mutations) => {
  const mutationTarget = findMutationtarget(mutations);
  if (mutationTarget) {
    const panelsExample = await getChildElements(
      mutationTarget,
      'div[data-name="examplePanel"]',
    );
    const panelsResponse = await getChildElements(
      mutationTarget,
      "td.response-col_description .highlight-code",
    );
    const panelCodesExample = await getChildElements(
      mutationTarget,
      'div[data-name="examplePanel"] pre',
    );
    const panelCodesResponse = await getChildElements(
      mutationTarget,
      "td.response-col_description .highlight-code pre",
    );

    const panels = [...panelsExample, ...panelsResponse].filter((p) => !!p);
    const panelCodes = [...panelCodesExample, ...panelCodesResponse];

    highlightPanelCodes(panelCodes);

    for (const panel of panels) {
      removeExcludeDivs(panel);
      const EXAMPLE_TEXT = panel.querySelector("pre").innerText;

      await addBtn(panel, {
        title: "Copy Example to clipboard",
        classList: ["copy-to-clipboard", "copy-btn-default"],
        getText: async () => EXAMPLE_TEXT,
      });

      await addBtn(panel, {
        title: "Copy TypeScript Interfaces to clipboard",
        classList: ["copy-to-clipboard", "copy-typescript-btn-default"],
        getText: () => getTypeGenResult("typescript", EXAMPLE_TEXT),
      });

      await addBtn(panel, {
        title: "Copy Java Classes to clipboard",
        classList: ["copy-to-clipboard", "copy-java-btn-default"],
        getText: () => getTypeGenResult("java", EXAMPLE_TEXT),
      });

      await addBtn(panel, {
        title: "Copy C# Classes to clipboard",
        classList: ["copy-to-clipboard", "copy-csharp-btn-default"],
        getText: () => getTypeGenResult("csharp", EXAMPLE_TEXT),
      });
    }
  }
};

await highlightMarkdown();

const observer = new MutationObserver(AddCopyBtnsOnExamplePanel);
const observer2 = new MutationObserver(AddCopyPathBtnOnTitle);

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
observer2.observe(document.body, {
  childList: true,
  subtree: true,
});
