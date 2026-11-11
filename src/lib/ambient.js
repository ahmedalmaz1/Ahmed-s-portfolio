const KEY = "sound"; // localStorage: "on" | "off"
const FILES = { webm: "/audio/ambient.webm", m4a: "/audio/ambient.m4a" };

const LEVEL = 0.35; // music volume (0..1)
const DUCKED = 0.08; // while a video plays
const FADE_IN = 2.5; // seconds
const FADE_OUT = 0.9;

let el = null;
let ctx = null;
let gain = null;

let wanted = false;
let playing = false;
let ducked = false;
let inited = false;
let stopTimer = 0;
let hideTimer = 0;

const subs = new Set();
const notify = () => subs.forEach((fn) => fn());

export const subscribe = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};
export const getEnabled = () => wanted;

export const getPreference = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
export const setPreference = (value) => {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
};

const level = () => (ducked ? DUCKED : LEVEL);

const pickSrc = () => {
  const probe = document.createElement("audio");
  return probe.canPlayType('audio/webm; codecs="opus"')
    ? FILES.webm
    : FILES.m4a;
};

const ensure = () => {
  if (el) return;
  el = new Audio();
  el.loop = true;
  el.preload = "none";
  el.src = pickSrc();

  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  gain = ctx.createGain();
  gain.gain.value = 0;
  ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
};

// smooth, click-free volume change
const ramp = (to, seconds) => {
  if (!gain) return;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.setTargetAtTime(to, now, Math.max(seconds, 0.05) / 3);
};

export async function start() {
  if (typeof window === "undefined") return false;
  if (wanted && playing) return true;

  ensure();
  clearTimeout(stopTimer);
  clearTimeout(hideTimer);
  wanted = true;
  setPreference("on");
  notify();

  try {
    const played = el.play();
    await ctx.resume();
    await played;
  } catch {
    wanted = false;
    notify();
    return false;
  }

  playing = true;
  ramp(level(), FADE_IN);
  return true;
}

export function stop() {
  wanted = false;
  setPreference("off");
  notify();
  if (!el) return;

  ramp(0, FADE_OUT);
  clearTimeout(stopTimer);
  stopTimer = window.setTimeout(
    () => {
      if (wanted) return;
      el.pause();
      playing = false;
    },
    FADE_OUT * 1000 + 100,
  );
}

export const toggle = () => (wanted ? stop() : start());

export function duck(on) {
  ducked = on;
  if (wanted && playing) ramp(level(), 0.6);
}

export function init() {
  if (inited || typeof window === "undefined") return;
  inited = true;

  if (getPreference() === "on") {
    const events = ["pointerdown", "keydown", "touchend"];
    const resume = (e) => {
      // the toggle button handles its own click
      if (
        e.target instanceof Element &&
        e.target.closest("[data-sound-toggle]")
      )
        return;
      events.forEach((t) => window.removeEventListener(t, resume));
      start();
    };
    events.forEach((t) =>
      window.addEventListener(t, resume, { passive: true }),
    );
  }

  document.addEventListener("visibilitychange", () => {
    if (!el || !wanted) return;
    clearTimeout(hideTimer);

    if (document.hidden) {
      ramp(0, 0.4);
      hideTimer = window.setTimeout(() => {
        el.pause();
        ctx.suspend();
      }, 500);
    } else {
      ctx.resume();
      el.play().catch(() => {});
      ramp(level(), 1.2);
    }
  });
}
