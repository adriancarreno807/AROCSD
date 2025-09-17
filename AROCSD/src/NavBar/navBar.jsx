import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

/* Resolve paths correctly under Vite when BASE_URL is not "/" */
const BASE = (import.meta.env.BASE_URL || "/").endsWith("/")
  ? import.meta.env.BASE_URL || "/"
  : (import.meta.env.BASE_URL || "/") + "/";

/* ---- Layout ---- */
const BAR_HEIGHT = 100;

const Bar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  height: ${BAR_HEIGHT}px;
  display: flex;
  align-items: center;
  z-index: 1000;

  /* translucent dark overlay */
  background: rgba(15, 15, 15, 0.7);
  backdrop-filter: saturate(140%) blur(0px);

  /* subtle separators like the reference */
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 -1px 0 rgba(0, 0, 0, 0.2) inset;
`;

const Wrap = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;

  @media (min-width: 1280px) {
    max-width: 1200px;
  }
`;

const Logo = styled.a`
  display: inline-flex;
  align-items: center;
  margin-right: 100px;
  text-decoration: none;

  img {
    height: 80px;
    width: auto;
    display: block;
  }
`;

const Nav = styled.nav`
  justify-self: start;
`;

const Menu = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: none;
  gap: 28px;
  align-items: center;
  margin-left: 100px;

  @media (min-width: 980px) {
    display: flex;
  }
`;

const Item = styled.li`
  position: relative;
`;

const LinkA = styled.a`
  text-decoration: none;
  color: #f5f5f5;
  font-weight: 500;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  transition: color 0.15s ease;

  &:hover,
  &:focus-visible {
    color: #fff;
  }
`;

/* ---- Dropdown ---- */
const DropWrap = styled.div`
  position: relative;
`;

const DropButton = styled.button`
  background: none;
  border: 0;
  color: #f5f5f5;
  font-weight: 600;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: #fff;
  }
`;

/* Use a transient prop ($open) so styled-components won't pass it to the DOM */
const Dropdown = styled.div`
  position: absolute;
  top: 44px;
  left: 0;
  min-width: 220px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  padding: 6px 0;
  box-shadow: 0 10px 28px rgba(0,0,0,0.35);
  display: ${(p) => (p.$open ? "block" : "none")};
`;

const DropLink = styled.a`
  display: block;
  padding: 10px 14px;
  color: #eaeaea;
  text-decoration: none;
  font-size: 16px;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
  }
`;

/* ---- Right side: social + mobile button ---- */
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.a`
  height: 36px;
  width: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease, transform 0.06s ease;

  &:hover { background: rgba(255, 255, 255, 0.12); }
  &:active { transform: translateY(1px); }
`;

const Burger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  height: 40px;
  width: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.25);
  background: transparent;
  color: #fff;
  cursor: pointer;

  @media (min-width: 980px) {
    display: none;
  }
`;

const BurgerIcon = styled.span`
  position: relative;
  width: 18px;
  height: 2px;
  background: #fff;
  display: inline-block;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 18px;
    height: 2px;
    left: 0;
    background: #fff;
  }
  &::before { top: -6px; }
  &::after  { top: 6px; }
`;

/* ---- Mobile Drawer ---- */
/* Use transient prop ($open) to avoid DOM warnings */
const Drawer = styled.div`
  position: fixed;
  top: ${BAR_HEIGHT}px; /* matches the bar height */
  left: 0; right: 0;
  background: rgba(15, 15, 15, 0.96);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 14px 18px 18px;
  display: ${(p) => (p.$open ? "block" : "none")};
  z-index: 1100;

  @media (min-width: 980px) {
    display: none;
  }
`;

const DrawerLink = styled.a`
  display: block;
  padding: 14px 6px;
  text-decoration: none;
  color: #eee;
  font-size: 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);

  &:last-child { border-bottom: 0; }
  &:hover { color: #fff; }
`;

/* ---- Component ---- */
export default function Navbar() {
  const [openEvents, setOpenEvents] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click / ESC
  useEffect(() => {
    function onDocClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpenEvents(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpenEvents(false);
        setOpenMobile(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock the body scroll when mobile drawer is open
  useEffect(() => {
    if (openMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openMobile]);

  // Base-aware logo path to avoid 404s when deployed under a subpath
  const logoSrc = `${BASE}image5.jpeg`;

  return (
    <Bar role="navigation" aria-label="Main">
      <Wrap>
        <Logo href="/">
          <img src={logoSrc} alt="AROCSD" />
        </Logo>

        <Nav>
          <Menu>
            <Item><LinkA href="#history">History</LinkA></Item>
            <Item><LinkA href="#map">Cruise Routes</LinkA></Item>
            <Item><LinkA href="#faq">FAQ</LinkA></Item>

            <Item ref={dropRef}>
              <DropWrap>
                <DropButton
                  aria-haspopup="menu"
                  aria-expanded={openEvents}
                  aria-controls="nav-events-menu"
                  onClick={() => setOpenEvents((s) => !s)}
                >
                  Events <IoChevronDown size={18} />
                </DropButton>
                <Dropdown id="nav-events-menu" $open={openEvents} role="menu">
                  <DropLink href="#cars-and-coffee">Cars &amp; Coffee</DropLink>
                  <DropLink href="#rally">Rally</DropLink>
                  <DropLink href="#track-day">Track Day</DropLink>
                </Dropdown>
              </DropWrap>
            </Item>

            <Item><LinkA href="#media">Media</LinkA></Item>
            <Item><LinkA href="#about">About Us</LinkA></Item>
          </Menu>
        </Nav>

        <Right>
          <IconButton
            href="https://instagram.com"
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagram size={16} />
          </IconButton>
          <IconButton
            href="https://facebook.com"
            aria-label="Facebook"
            target="_blank"
            rel="noreferrer"
          >
            <FaFacebookF size={16} />
          </IconButton>

          <Burger
            aria-label="Open menu"
            aria-expanded={openMobile}
            aria-controls="mobile-drawer"
            onClick={() => setOpenMobile((s) => !s)}
          >
            <BurgerIcon />
          </Burger>
        </Right>
      </Wrap>

      <Drawer id="mobile-drawer" $open={openMobile}>
        <DrawerLink href="#history" onClick={() => setOpenMobile(false)}>
          History &amp; Entries
        </DrawerLink>
        <DrawerLink href="#map" onClick={() => setOpenMobile(false)}>
          Cruise Route
        </DrawerLink>
        <DrawerLink href="#faq" onClick={() => setOpenMobile(false)}>
          FAQ
        </DrawerLink>
        <DrawerLink href="#events" onClick={() => setOpenMobile(false)}>
          Events
        </DrawerLink>
        <DrawerLink href="#media" onClick={() => setOpenMobile(false)}>
          Media
        </DrawerLink>
        <DrawerLink href="#about" onClick={() => setOpenMobile(false)}>
          About Us
        </DrawerLink>
      </Drawer>
    </Bar>
  );
}
