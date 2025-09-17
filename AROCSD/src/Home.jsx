import React, { useEffect, useRef, useState } from "react";
import styled, { css, createGlobalStyle } from "styled-components";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

/* ===============================
   BACKGROUND (public) — WebP only
================================ */
const BG_WEBP = "/image9.jpg";
const BG_WEBP_SET = ""; // e.g. "/image-1-1920.webp 1920w, /image-1-3200.webp 3200w"

/* Solid fallback paint on body */
const GlobalStyles = createGlobalStyle`
  body { background: #0b0b0b; }
`;

/* Fixed, behind everything; CONSTANT (no fade) */
const BackgroundLayer = styled.div`
  image-rendering: -webkit-optimize-contrast;
  position: fixed;
  inset: 0;
  z-index: -2;
  opacity: 1;            /* <- always visible */
`;

const BgImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;  /* or "center 20%" to bias top */
  user-select: none;
  pointer-events: none;
`;

/* Optional overlay to improve foreground contrast */
const PageWrap = styled.div`
  position: relative;
  min-height: 100dvh;
  isolation: isolate;
  &::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(1200px 700px at 50% 0%, rgba(0,0,0,0.35), transparent 60%),
      linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0));
    z-index: -1;
  }
`;

/* ===============================
   Fade-in utilities (for TEXT only)
================================ */
function useInView({ root = null, rootMargin = "0px 0px -12% 0px", threshold = 0.18 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { root, rootMargin, threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [root, rootMargin, threshold]);
  return { ref, inView };
}

const RevealWrap = styled.div`
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 700ms ease, transform 700ms ease;
  ${(p) => p.$in && css`opacity: 1; transform: translateY(0);`}
  ${(p) => typeof p.$i === "number" && css`
    transition-delay: ${Math.min(p.$i * 90, 450)}ms;
  `}
  @media (prefers-reduced-motion: reduce) {
    transition: none; opacity: 1; transform: none;
  }
`;
function Reveal({ children, index = 0, observerOpts, as = "div", ...rest }) {
  const { ref, inView } = useInView(observerOpts);
  return (
    <RevealWrap ref={ref} as={as} $in={inView} $i={index} {...rest}>
      {children}
    </RevealWrap>
  );
}

/* ===============================
   HERO CAROUSEL
================================ */

/* Black bezel around the carousel to separate from background */
const HomeFrame = styled.div`
  --bezel: 16px;
  position: relative;
  padding: var(--bezel);
  background: #000;
  margin: 0 auto;
  max-width: 1440px;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.05) inset;
  

  @media (max-width: 640px) {
    --bezel: 10px;
  }
`;

const RAW_IMAGES = ["/image1.jpeg","/image2.jpeg","/image4.jpeg","/image6.jpeg","/image0.jpeg"];
const IMAGES = RAW_IMAGES.map((p) => encodeURI(p));

const Shell = styled.section`
  position: relative;
  width: 100%;
  height: min(86vh, 820px);
  min-height: 420px;
  overflow: hidden;
  background: #000;
`;

const Track = styled.div`
  height: 100%;
  display: flex;
  transform: translateX(${(p) => `-${p.index * 100}%`});
  transition: transform ${(p) => (p.anim ? 520 : 0)}ms ease-in-out;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  height: 100%;
  position: relative;
  background: #000;
`;

const SlideImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  user-select: none;
`;

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(p) => (p.left ? "left: 28px;" : "right: 28px;")}
  height: 68px; width: 68px; border-radius: 50%; border: 0;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(15,15,15,.7); color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.25), 0 0 0 4px rgba(0,0,0,.15) inset;
  transition: transform .06s ease, filter .2s ease; z-index: 2;
  &:hover { filter: brightness(1.05); }
  &:active { transform: translateY(-50%) scale(.97); }
  @media (max-width: 520px) {
    height: 56px; width: 56px; ${(p) => (p.left ? "left: 14px;" : "right: 14px;")}
  }
`;

const Dots = styled.div`
  position: absolute; left: 0; right: 0; bottom: 14px;
  display: flex; gap: 10px; justify-content: center; align-items: center; z-index: 2;
`;
const Dot = styled.button`
  height: 10px; width: 10px; border-radius: 50%; border: 0; cursor: pointer;
  background: ${(p) => (p.active ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.45)")};
  transform: ${(p) => (p.active ? "scale(1.15)" : "scale(1)")};
  transition: transform .15s ease, background .15s ease;
`;

/* ===============================
   CONTENT STYLES
================================ */
const Section = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 20px;
  color: #eaeaea;
`;
const H2 = styled.h2`
  font-size: clamp(28px, 4vw, 40px);
  margin: 0 0 12px;
  color: rgba(214, 214, 214, 1);
  font-family: Garamond, serif;
  font-weight: 800;
`;
const P = styled.p`
  font-size: clamp(16px, 1.4vw, 18px);
  line-height: 1.7;
  margin: 0 0 16px 50px;
  color: rgba(214, 214, 214, 1);
  font-family: Tahoma, sans-serif;
  
`;

/* ===============================
   COMPONENT
================================ */
export default function Home({ autoPlay = true, intervalMs = 5000 }) {
  /* ---- Carousel state ---- */
  const [index, setIndex] = useState(1);
  const [anim, setAnim] = useState(true);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const slides = [IMAGES[IMAGES.length - 1], ...IMAGES, IMAGES[0]];

  const startTimer = () => {
    if (!autoPlay) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go("next", false), intervalMs);
  };
  const go = (dir, reset = true) => {
    setAnim(true);
    setIndex((i) => (dir === "next" ? i + 1 : i - 1));
    if (reset) startTimer();
  };
  useEffect(() => {
    startTimer();
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [autoPlay, intervalMs]);
  const stop = () => timerRef.current && clearInterval(timerRef.current);

  const handleTransitionEnd = () => {
    if (index === 0) { setAnim(false); setIndex(IMAGES.length); }
    else if (index === IMAGES.length + 1) { setAnim(false); setIndex(1); }
  };
  useEffect(() => {
    if (!anim) {
      const id = requestAnimationFrame(() => setAnim(true));
      return () => cancelAnimationFrame(id);
    }
  }, [anim]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go("prev");
      if (e.key === "ArrowRight") go("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? "next" : "prev");
    touchStartX.current = null;
  };

  return (
    <>
      <GlobalStyles />

      {/* Constant background (no fade) */}
      <BackgroundLayer>
        <picture>
          <source type="/image9.jpg" srcSet={BG_WEBP_SET || BG_WEBP} sizes="100vw" />
          <BgImg
            src={BG_WEBP}
            srcSet={BG_WEBP_SET || undefined}
            sizes="100vw"
            alt=""
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </BackgroundLayer>

      <PageWrap>
        {/* ======= HOME CAROUSEL with black separation ======= */}
        <HomeFrame>
          <Shell
            onMouseEnter={stop}
            onMouseLeave={startTimer}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Track index={index} anim={anim} onTransitionEnd={handleTransitionEnd}>
              {slides.map((src, i) => (
                <Slide key={i}><SlideImg src={src} alt={`Slide ${i}`} /></Slide>
              ))}
            </Track>

            <Arrow left aria-label="Previous slide" onClick={() => go("prev")}>
              <IoArrowBack size={28} />
            </Arrow>
            <Arrow aria-label="Next slide" onClick={() => go("next")}>
              <IoArrowForward size={28} />
            </Arrow>

            <Dots>
              {IMAGES.map((_, i) => (
                <Dot
                  key={i}
                  active={index === i + 1}
                  onClick={() => { setAnim(true); setIndex(i + 1); startTimer(); }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </Dots>
          </Shell>
        </HomeFrame>

        {/* ======= TEXT SECTIONS (still fade in) ======= */}
        <Section>
          <Reveal><H2>Welcome to AROCSD</H2></Reveal>
          <Reveal index={1}><P>
            A celebration of design, speed, and community—bringing iconic machines and the people who love them together.
          </P></Reveal>
          <Reveal index={2}><P>
            Join our rally, track day, and cars &amp; coffee. Explore curated exhibits, meet enthusiasts, and enjoy the scene.
          </P></Reveal>
        </Section>

        <Section>
          <Reveal><H2>What to Expect</H2></Reveal>
          <Reveal index={1}><P>• Scenic cruise routes and checkpoints.</P></Reveal>
          <Reveal index={2}><P>• Track sessions for every skill level.</P></Reveal>
          <Reveal index={3}><P>• Vendors, food, and after-hours meetups.</P></Reveal>
        </Section>
      </PageWrap>
    </>
  );
}
