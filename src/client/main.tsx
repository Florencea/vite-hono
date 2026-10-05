import { createRoot } from "react-dom/client";
import { Providers } from "./providers";

const container = document.getElementById("root");
if (container === null) throw new Error("react root element `#root` does not exist in DOM");

createRoot(container).render(<Providers container={container} />);
