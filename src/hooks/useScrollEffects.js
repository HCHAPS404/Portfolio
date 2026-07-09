import { useEffect, useState } from "react";

export function useScrollEffects(threshold = 80) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > threshold);

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [threshold]);

  return { scrolled, progress };
}

const EMPTY_RAIL = { lineTop: 0, lineHeight: 0, fillHeight: 0 };

function nodeCenterY(node, listTop) {
  const rect = node.getBoundingClientRect();
  return rect.top + rect.height / 2 - listTop;
}

export function useXpTimelineFill(listRef) {
  const [rail, setRail] = useState(EMPTY_RAIL);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const allNodes = [...list.querySelectorAll(".xp-node")];
      if (!allNodes.length) {
        setRail(EMPTY_RAIL);
        return;
      }

      const listTop = list.getBoundingClientRect().top;
      const firstCenter = nodeCenterY(allNodes[0], listTop);
      const lastCenter = nodeCenterY(allNodes[allNodes.length - 1], listTop);

      const visibleNodes = [
        ...list.querySelectorAll(".xp-item.in-view .xp-node"),
      ];
      const fillEnd = visibleNodes.length
        ? nodeCenterY(visibleNodes[visibleNodes.length - 1], listTop)
        : firstCenter;

      setRail({
        lineTop: firstCenter,
        lineHeight: Math.max(0, lastCenter - firstCenter),
        fillHeight: Math.max(0, fillEnd - firstCenter),
      });
    };

    const io = new IntersectionObserver(
      () => requestAnimationFrame(measure),
      { threshold: [0, 0.12, 0.35, 0.6] }
    );

    const items = list.querySelectorAll(".xp-item");
    items.forEach((el) => io.observe(el));

    const mo = new MutationObserver(() => requestAnimationFrame(measure));
    items.forEach((el) => {
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    });

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    measure();

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [listRef]);

  return rail;
}
