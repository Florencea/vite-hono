import { useSiteTitle } from "../constants/routes";

export interface DocTitleProps {
  title?: string | number;
  isDirty?: boolean;
  count?: number;
  withAppSuffix?: boolean;
}

export const DocTitle = ({
  title,
  isDirty = false,
  count,
  withAppSuffix = true,
}: DocTitleProps) => {
  const defaultRouteTitle = useSiteTitle();
  const baseTitle =
    typeof title === "number" ? title.toString() : (title ?? defaultRouteTitle);

  const prefixes: string[] = [];
  if (isDirty) {
    prefixes.push("*");
  }
  if (typeof count === "number" && count > 0) {
    prefixes.push(`(${count.toString()})`);
  }

  const prefixStr = prefixes.length > 0 ? `${prefixes.join(" ")} ` : "";
  let finalTitle = `${prefixStr}${baseTitle}`;

  if (
    title &&
    withAppSuffix &&
    !finalTitle.endsWith(import.meta.env.VITE_TITLE)
  ) {
    finalTitle = `${finalTitle} - ${import.meta.env.VITE_TITLE}`;
  }

  return <title>{finalTitle}</title>;
};
