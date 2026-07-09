import { useEffect, useRef } from "react";

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useReveal(ref, options = { threshold: 0.1 }) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add("reveal");

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          io.disconnect();
        }
      },
      options
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, options.threshold]);
}

export function useStagger(containerRef, itemSelector, step = 75) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (!items.length) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        items.forEach((item, i) => {
          setTimeout(
            () => item.classList.add("in-view"),
            reduceMotion ? 0 : i * step
          );
        });
      },
      { threshold: 0.12 }
    );

    io.observe(container);
    return () => io.disconnect();
  }, [containerRef, itemSelector, step]);
}

export function useCountUp(ref, { count, pad = 0 }) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const render = (v) => {
      el.textContent = String(v).padStart(pad, "0");
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        if (reduceMotion) {
          render(count);
          return;
        }

        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          render(Math.round(count * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, count, pad]);
}

export function useActiveNav(sectionIds) {
  useEffect(() => {
    const navLinks = document.querySelectorAll(".site-nav a");
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const href = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === href);
          });
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, [sectionIds]);
}

export function useDragScroll() {
  const ref = useRef(null);
  const movedRef = useRef(false);

  useEffect(() => {
    const strip = ref.current;
    if (!strip) return;

    let down = false;
    let startX = 0;
    let startScroll = 0;
    let activePointer = null;

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".folder-menu a, .folder-menu button")) return;

      down = true;
      movedRef.current = false;
      activePointer = e.pointerId;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
    };

    const onPointerMove = (e) => {
      if (!down || e.pointerId !== activePointer) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 8) {
        if (!movedRef.current) {
          movedRef.current = true;
          strip.classList.add("dragging");
          strip.setPointerCapture(e.pointerId);
        }
        e.preventDefault();
        strip.scrollLeft = startScroll - dx;
      }
    };

    const endDrag = (e) => {
      if (!down) return;
      if (e && activePointer !== null && e.pointerId !== activePointer) return;
      down = false;
      activePointer = null;
      strip.classList.remove("dragging");
      if (e && strip.hasPointerCapture?.(e.pointerId)) {
        strip.releasePointerCapture(e.pointerId);
      }
      setTimeout(() => {
        movedRef.current = false;
      }, 0);
    };

    strip.addEventListener("pointerdown", onPointerDown);
    strip.addEventListener("pointermove", onPointerMove);
    strip.addEventListener("pointerup", endDrag);
    strip.addEventListener("pointercancel", endDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      strip.removeEventListener("pointerdown", onPointerDown);
      strip.removeEventListener("pointermove", onPointerMove);
      strip.removeEventListener("pointerup", endDrag);
      strip.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  return { ref, movedRef };
}
