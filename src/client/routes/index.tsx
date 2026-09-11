import { createFileRoute } from "@tanstack/react-router";
import { Empty, Flex } from "antd";
import logo from "../assets/logo.png";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return (
    <Flex align="center" justify="center" className="h-full w-full">
      <Empty
        image={logo}
        styles={{
          image: {
            filter: "grayscale(1)",
            opacity: 0.3,
            userSelect: "none",
            pointerEvents: "none",
          },
        }}
        description={false}
      />
    </Flex>
  );
}
