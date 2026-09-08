import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render as browserRender } from "vitest-browser-react";
import { Providers } from "../../src/client/providers";
import { routeTree } from "../../src/client/routeTree.gen";

function getOrCreateRootContainer(): HTMLElement {
  let container = document.getElementById("root");
  if (!container) {
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
  const container = getOrCreateRootContainer();

  const history = createMemoryHistory({
    initialEntries: [initialUrl],
  });

  const router = createRouter({
    routeTree,
    history,
    context: {
      queryClient: undefined as unknown as QueryClient,
    },
  });

  const screen = await browserRender(
    <Providers container={container}>
      <TestRouterProvider router={router} />
    </Providers>,
    { container },
  );

  return Object.assign(screen, { router, container });
}
