import { QueryClient, useQueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { page } from "vite-plus/test/browser";
import { Providers } from "../../src/client/providers";
import { routeTree } from "../../src/client/routeTree.gen";

let currentRoot: Root | null = null;

export async function cleanupApp(): Promise<void> {
  if (currentRoot !== null) {
    await act(async () => {
      currentRoot?.unmount();
    });
    currentRoot = null;
  }
  const rootElement = document.getElementById("root");
  if (rootElement !== null) {
    rootElement.innerHTML = "";
  }
}

function getOrCreateRootContainer(): HTMLElement {
  let container = document.getElementById("root");
  if (container === null) {
    container = document.createElement("div");
    container.id = "root";
    document.body.appendChild(container);
  }
  return container;
}

const TestRouterProvider = ({ router }: { router: AnyRouter }) => {
  const queryClient = useQueryClient();
  return <RouterProvider router={router} context={{ queryClient }} />;
};

export async function renderAppAt(initialUrl = "/") {
  await cleanupApp();
  const container = getOrCreateRootContainer();

  const history = createMemoryHistory({
    initialEntries: [initialUrl],
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const router = createRouter({
    routeTree,
    history,
    context: {
      queryClient,
    },
  });

  currentRoot = createRoot(container);
  await act(async () => {
    currentRoot?.render(
      <StrictMode>
        <Providers container={container} queryClient={queryClient}>
          <TestRouterProvider router={router} />
        </Providers>
      </StrictMode>,
    );
  });

  return Object.assign(page, { router, container });
}
