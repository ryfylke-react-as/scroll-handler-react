import {
  ScrollHandler,
  ScrollEffect,
  BetweenScrollEffect,
} from "@ryfylke-react/scroll-handler";
import React from "react";
type ReactScrollEventTarget =
  | React.MutableRefObject<HTMLElement | null>
  | React.RefObject<HTMLElement | null>
  | number;

export {
  ScrollHandler,
  ScrollEffect,
  BetweenScrollEffect,
} from "@ryfylke-react/scroll-handler";

const parseTarget = (target: ReactScrollEventTarget) => {
  if (typeof target === "number") {
    return target;
  }
  return target.current!;
};

export const useScrollHandler = (opts: {
  target?: HTMLElement;
  onScroll?: ScrollEffect[];
  getScrollTop?: () => number;
  between?: {
    after: ReactScrollEventTarget;
    before: ReactScrollEventTarget;
    effect: BetweenScrollEffect;
  }[];
  onceOver?: {
    target: ReactScrollEventTarget;
    effect: ScrollEffect;
  }[];
  onceUnder?: {
    target: ReactScrollEventTarget;
    effect: ScrollEffect;
  }[];
  when?: {
    condition: () => boolean;
    effect: ScrollEffect;
  }[];
}) => {
  const handlerRef = React.useRef<ScrollHandler | null>(null);
  const effectDependency = Object.keys(opts).reduce(
    (acc, key) => {
      acc += key;
      if (Array.isArray(opts[key as "onceUnder"])) {
        acc += opts[key as "onceUnder"]?.length;
      }
      return acc;
    },
    ""
  );

  React.useEffect(() => {
    const handler = new ScrollHandler({
      target: opts.target,
      getScrollTop: opts.getScrollTop,
    });
    opts.onScroll?.forEach((effect) => handler.onScroll(effect));
    opts.between?.forEach(({ after, before, effect }) =>
      handler.between(
        parseTarget(after),
        parseTarget(before),
        effect
      )
    );
    opts.onceOver?.forEach(({ target, effect }) =>
      handler.onceOver(parseTarget(target), effect)
    );
    opts.onceUnder?.forEach(({ target, effect }) =>
      handler.onceUnder(parseTarget(target), effect)
    );
    opts.when?.forEach(({ condition, effect }) =>
      handler.when(condition, effect)
    );
    handler.enable();
    handlerRef.current = handler;

    return () => {
      handler.disable();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectDependency]);

  return handlerRef.current;
};
