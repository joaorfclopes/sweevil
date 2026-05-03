import { Notyf } from "notyf";

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export const notyf = new Notyf({
  position: { x: "right", y: isMobile ? "top" : "bottom" },
  duration: 2500,
  dismissible: true,
});
