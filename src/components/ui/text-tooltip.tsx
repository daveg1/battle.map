import { Tooltip } from "radix-ui";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
} from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
}

export function TextTooltip({ text, as = "span", className }: Props) {
  const textRef = useRef<HTMLElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkIsTruncated = useCallback(() => {
    const element = textRef.current;
    if (!element) {
      setIsTruncated(false);
      return;
    }

    setIsTruncated(
      element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight,
    );
  }, []);

  useEffect(() => {
    checkIsTruncated();

    const element = textRef.current;
    if (!element) {
      return;
    }

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(checkIsTruncated);
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener("resize", checkIsTruncated);
    return () => {
      window.removeEventListener("resize", checkIsTruncated);
    };
  }, [checkIsTruncated, text]);

  const TextTag = as;
  const textNode = (
    <TextTag ref={textRef} className={className}>
      {text}
    </TextTag>
  );

  if (!isTruncated) {
    return textNode;
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{textNode}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            sideOffset={6}
            className="z-50 max-w-72 rounded border border-stone-700 bg-stone-900 px-2 py-1 text-sm leading-5 text-stone-100 shadow-lg"
          >
            {text}
            <Tooltip.Arrow className="fill-stone-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
