(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DocoOledFace = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const BASE = Object.freeze({
    leftWidth: 30, rightWidth: 30,
    leftHeight: 22, rightHeight: 22,
    leftCurve: 0, rightCurve: 0,
    leftTilt: 0, rightTilt: 0,
    leftX: 0, rightX: 0,
    leftY: 0, rightY: 0,
    leftOpen: 1, rightOpen: 1,
    separation: 48,
    heart: 0,
    ring: 0,
    tear: 0,
    mouthWidth: 0,
    mouthHeight: 3,
    mouthCurve: 0,
    mouthOpen: 0,
    mouthTilt: 0,
    tongue: 0,
    glasses: 0,
    sunglasses: 0,
    headphones: 0,
    crown: 0,
    sparkles: 0,
    eyeR: 1,
    eyeG: 1,
    eyeB: 1,
    accentR: 0.82,
    accentG: 0.94,
    accentB: 1,
    glow: 1
  });

  const profile = (overrides = {}) => Object.freeze({ ...BASE, ...overrides });

  // These are original OLED interpretations of Doco's states. The supplied
  // texture sheet informs the emotional grammar only; no source image is used.
  const EYE_PROFILES = Object.freeze({
    idle: profile(),
    listening: profile({ leftHeight: 24, rightHeight: 24, separation: 50, glow: 1.08 }),
    calibrating: profile({ leftWidth: 29, rightWidth: 29, leftHeight: 21, rightHeight: 21, glow: 0.92 }),
    "camera-off": profile({ leftHeight: 16, rightHeight: 16, leftCurve: -2, rightCurve: -2, glow: 0.72 }),
    attentive: profile({ leftHeight: 25, rightHeight: 25, separation: 51, glow: 1.1 }),
    happy: profile({ leftWidth: 34, rightWidth: 34, leftHeight: 12, rightHeight: 12, leftCurve: -5.5, rightCurve: -5.5, leftY: -1, rightY: -1, mouthWidth: 27, mouthCurve: 7, glow: 1.18 }),
    amused: profile({ leftWidth: 34, rightWidth: 34, leftHeight: 11, rightHeight: 11, leftCurve: -5.2, rightCurve: -5.2, leftTilt: -0.04, rightTilt: 0.04, mouthWidth: 22, mouthCurve: 5, mouthTilt: -0.08, glow: 1.15 }),
    celebrating: profile({ leftWidth: 36, rightWidth: 36, leftHeight: 13, rightHeight: 13, leftCurve: -6.4, rightCurve: -6.4, separation: 52, mouthWidth: 32, mouthHeight: 13, mouthOpen: 1, crown: 0.88, sparkles: 1, accentR: 1, accentG: 0.86, accentB: 0.28, glow: 1.25 }),
    laughing: profile({ leftWidth: 35, rightWidth: 35, leftHeight: 10, rightHeight: 10, leftCurve: -5.6, rightCurve: -5.6, leftTilt: -0.06, rightTilt: 0.06, mouthWidth: 34, mouthHeight: 15, mouthOpen: 1, glow: 1.22 }),
    proud: profile({ leftWidth: 33, rightWidth: 33, leftHeight: 13, rightHeight: 13, leftCurve: -4.5, rightCurve: -4.5, leftTilt: -0.08, rightTilt: 0.08, mouthWidth: 20, mouthCurve: 5, crown: 1, accentR: 1, accentG: 0.82, accentB: 0.28, glow: 1.12 }),
    sleepy: profile({ leftWidth: 34, rightWidth: 34, leftHeight: 6, rightHeight: 6, leftCurve: -1.6, rightCurve: -1.6, leftY: 4, rightY: 4, mouthWidth: 14, mouthHeight: 10, mouthOpen: 0.82, glow: 0.64 }),
    relaxed: profile({ leftWidth: 33, rightWidth: 33, leftHeight: 9, rightHeight: 9, leftCurve: -3.8, rightCurve: -3.8, leftY: 2, rightY: 2, mouthWidth: 22, mouthCurve: 5, glow: 0.8 }),
    bored: profile({ leftWidth: 32, rightWidth: 32, leftHeight: 5, rightHeight: 5, leftY: 4, rightY: 4, mouthWidth: 23, mouthCurve: -1, glow: 0.58 }),
    concerned: profile({ leftWidth: 32, rightWidth: 32, leftHeight: 13, rightHeight: 13, leftCurve: 5.2, rightCurve: 5.2, leftTilt: -0.05, rightTilt: 0.05, mouthWidth: 21, mouthCurve: -5, glow: 0.82 }),
    crying: profile({ leftWidth: 31, rightWidth: 31, leftHeight: 11, rightHeight: 11, leftCurve: 5.8, rightCurve: 5.8, leftY: 1, rightY: 1, tear: 1, mouthWidth: 25, mouthCurve: -5, glow: 0.78 }),
    surprised: profile({ leftWidth: 28, rightWidth: 28, leftHeight: 31, rightHeight: 31, separation: 53, mouthWidth: 21, mouthHeight: 19, mouthOpen: 1, glow: 1.24 }),
    shocked: profile({ leftWidth: 31, rightWidth: 31, leftHeight: 34, rightHeight: 34, separation: 55, mouthWidth: 24, mouthHeight: 22, mouthOpen: 1, glow: 1.3 }),
    scared: profile({ leftWidth: 27, rightWidth: 27, leftHeight: 31, rightHeight: 31, leftTilt: -0.08, rightTilt: 0.08, separation: 54, mouthWidth: 18, mouthCurve: -5, glow: 1.08 }),
    angry: profile({ leftWidth: 36, rightWidth: 36, leftHeight: 14, rightHeight: 14, leftTilt: 0.24, rightTilt: -0.24, leftCurve: 1, rightCurve: 1, separation: 50, mouthWidth: 24, mouthCurve: -5, glow: 1.1 }),
    determined: profile({ leftWidth: 35, rightWidth: 35, leftHeight: 13, rightHeight: 13, leftTilt: 0.15, rightTilt: -0.15, separation: 49, glow: 1.02 }),
    suspicious: profile({ leftWidth: 34, rightWidth: 31, leftHeight: 7, rightHeight: 13, leftTilt: 0.08, rightTilt: -0.12, leftY: 2, rightY: -1, glow: 0.88 }),
    curious: profile({ leftWidth: 29, rightWidth: 33, leftHeight: 25, rightHeight: 17, leftY: -1, rightY: 2, leftTilt: -0.05, rightTilt: 0.08, mouthWidth: 15, mouthCurve: -2, mouthTilt: 0.05, glow: 1.04 }),
    confused: profile({ leftWidth: 34, rightWidth: 28, leftHeight: 15, rightHeight: 24, leftTilt: 0.12, rightTilt: -0.07, leftY: 2, rightY: -1, mouthWidth: 20, mouthCurve: -4, mouthTilt: 0.12, glow: 0.96 }),
    cool: profile({ leftWidth: 38, rightWidth: 38, leftHeight: 10, rightHeight: 10, leftTilt: -0.04, rightTilt: 0.04, separation: 49, sunglasses: 1, accentR: 0.32, accentG: 0.94, accentB: 1, glow: 0.94 }),
    vibing: profile({ leftWidth: 36, rightWidth: 36, leftHeight: 12, rightHeight: 12, leftCurve: -3.8, rightCurve: -3.8, leftTilt: -0.08, rightTilt: 0.08, separation: 50, mouthWidth: 26, mouthCurve: 5, headphones: 1, accentR: 0.4, accentG: 0.9, accentB: 1, glow: 1.16 }),
    love: profile({ leftWidth: 32, rightWidth: 32, leftHeight: 29, rightHeight: 29, leftCurve: -2, rightCurve: -2, leftTilt: -0.12, rightTilt: 0.12, separation: 52, mouthWidth: 22, mouthCurve: 6, sparkles: 0.72, accentR: 1, accentG: 0.88, accentB: 0.96, glow: 1.28 }),
    playful: profile({ leftWidth: 36, rightWidth: 29, leftHeight: 11, rightHeight: 25, leftCurve: -5, rightCurve: -1, leftOpen: 0.5, leftY: 1, rightY: -2, leftTilt: -0.08, rightTilt: 0.1, separation: 52, mouthWidth: 30, mouthCurve: 8, mouthTilt: -0.16, accentR: 0.78, accentG: 0.48, accentB: 1, glow: 1.16 }),
    mischievous: profile({ leftWidth: 35, rightWidth: 32, leftHeight: 8, rightHeight: 15, leftOpen: 0.18, leftTilt: 0.12, rightTilt: -0.12, mouthWidth: 22, mouthCurve: 3, mouthTilt: -0.14, glow: 1.02 }),
    bashful: profile({ leftWidth: 31, rightWidth: 31, leftHeight: 9, rightHeight: 9, leftCurve: -3.8, rightCurve: -3.8, leftTilt: -0.1, rightTilt: 0.1, leftY: 3, rightY: 3, mouthWidth: 17, mouthCurve: 4, glow: 0.92 }),
    silly: profile({ leftWidth: 33, rightWidth: 29, leftHeight: 23, rightHeight: 13, leftTilt: 0.13, rightTilt: -0.13, leftY: -1, rightY: 2, mouthWidth: 28, mouthHeight: 13, mouthOpen: 0.9, tongue: 1, sparkles: 0.72, accentR: 0.7, accentG: 0.42, accentB: 1, glow: 1.18 }),
    dizzy: profile({ leftWidth: 34, rightWidth: 28, leftHeight: 18, rightHeight: 25, leftCurve: -2, rightCurve: 2, leftTilt: 0.18, rightTilt: -0.18, separation: 52, sparkles: 0.82, accentR: 0.72, accentG: 0.62, accentB: 1, glow: 1.08 }),
    nerdy: profile({ leftWidth: 34, rightWidth: 34, leftHeight: 22, rightHeight: 22, separation: 50, glasses: 1, accentR: 0.74, accentG: 0.95, accentB: 1, glow: 1.02 }),
    daydreaming: profile({ leftWidth: 31, rightWidth: 31, leftHeight: 19, rightHeight: 19, leftX: 4, rightX: 4, leftY: -3, rightY: -3, leftTilt: -0.05, rightTilt: 0.05, mouthWidth: 20, mouthCurve: 5, sparkles: 0.62, accentR: 0.82, accentG: 0.78, accentB: 1, glow: 1.08 }),
    peeking: profile({ leftWidth: 29, rightWidth: 34, leftHeight: 13, rightHeight: 23, leftX: 6, rightX: 6, leftY: 2, rightY: -1, leftTilt: 0.05, rightTilt: -0.04, mouthWidth: 14, mouthCurve: 2, mouthTilt: 0.08, glow: 1.02 }),
    humming: profile({ leftWidth: 34, rightWidth: 34, leftHeight: 10, rightHeight: 10, leftCurve: -4.8, rightCurve: -4.8, leftTilt: -0.04, rightTilt: 0.04, mouthWidth: 18, mouthHeight: 9, mouthOpen: 0.58, glow: 1.12 }),
    pondering: profile({ leftWidth: 27, rightWidth: 34, leftHeight: 25, rightHeight: 13, leftY: -2, rightY: 2, leftTilt: -0.08, rightTilt: 0.11, mouthWidth: 17, mouthCurve: -2, mouthTilt: -0.12, glow: 0.98 }),
    twinkling: profile({ leftWidth: 34, rightWidth: 30, leftHeight: 8, rightHeight: 27, leftOpen: 0.12, leftY: 2, rightY: -2, rightTilt: 0.08, mouthWidth: 25, mouthCurve: 6, mouthTilt: -0.08, sparkles: 0.84, accentR: 0.82, accentG: 0.66, accentB: 1, glow: 1.18 }),
    stretching: profile({ leftWidth: 36, rightWidth: 36, leftHeight: 10, rightHeight: 10, leftCurve: -5.2, rightCurve: -5.2, leftTilt: -0.07, rightTilt: 0.07, mouthWidth: 31, mouthHeight: 14, mouthOpen: 0.92, glow: 1.2 })
  });

  // Common semantic states get several poses inside the same visual grammar.
  // These are not different emotions: they are small gaze, openness, and
  // posture variations that keep a long hold alive without lying about what
  // Gemini observed or recoloring the approved white OLED eyes.
  const HOLD_POSE_VARIANTS = Object.freeze({
    idle: [
      {},
      { leftY: -1, rightY: -1, separation: 49 },
      { leftX: -2, rightX: -2, leftHeight: 21, rightHeight: 21 },
      { leftX: 2, rightX: 2, leftHeight: 23, rightHeight: 23 }
    ],
    listening: [
      {},
      { leftHeight: 22, rightHeight: 24, leftY: 1, rightY: 0 },
      { leftHeight: 24, rightHeight: 22, leftY: 0, rightY: 1 },
      { leftX: 2, rightX: 2, separation: 51 }
    ],
    attentive: [
      {},
      { leftHeight: 26, rightHeight: 23, leftY: -1, rightY: 1 },
      { leftHeight: 23, rightHeight: 26, leftY: 1, rightY: -1 },
      { leftX: 2, rightX: 2, separation: 52 }
    ],
    curious: [
      {},
      { leftHeight: 23, rightHeight: 19, leftY: -1, rightY: 1, mouthCurve: -1 },
      { leftWidth: 33, rightWidth: 29, leftHeight: 18, rightHeight: 24, leftY: 1, rightY: -1, leftTilt: 0.07, rightTilt: -0.05, mouthTilt: -0.05 },
      { leftWidth: 31, rightWidth: 31, leftHeight: 22, rightHeight: 20, leftX: 3, rightX: 3, mouthCurve: 1 }
    ],
    happy: [
      {},
      { leftHeight: 10, rightHeight: 12, leftY: 1, rightY: 0, mouthCurve: 8 },
      { leftHeight: 12, rightHeight: 10, leftY: 0, rightY: 1, mouthWidth: 30 },
      { leftX: 2, rightX: 2, mouthCurve: 6 }
    ],
    amused: [
      {},
      { leftHeight: 9, rightHeight: 12, leftY: 1, rightY: 0, mouthTilt: 0.08 },
      { leftHeight: 12, rightHeight: 9, leftY: 0, rightY: 1, mouthTilt: -0.12 },
      { leftX: -2, rightX: -2, mouthWidth: 25 }
    ],
    relaxed: [
      {},
      { leftHeight: 8, rightHeight: 9, leftY: 3, rightY: 2, mouthCurve: 6 },
      { leftHeight: 9, rightHeight: 8, leftY: 2, rightY: 3, mouthWidth: 24 },
      { leftX: 2, rightX: 2, mouthCurve: 4 }
    ],
    surprised: [
      {},
      { leftHeight: 34, rightHeight: 29, leftY: -2, rightY: 1, mouthWidth: 18 },
      { leftHeight: 29, rightHeight: 34, leftY: 1, rightY: -2, mouthHeight: 22 },
      { leftX: 2, rightX: 2, separation: 56, mouthWidth: 24 }
    ],
    shocked: [
      {},
      { leftWidth: 29, rightWidth: 33, leftHeight: 36, rightHeight: 32, mouthHeight: 25 },
      { leftWidth: 33, rightWidth: 29, leftHeight: 32, rightHeight: 36, mouthWidth: 27 },
      { leftY: -2, rightY: -2, separation: 58, mouthHeight: 20 }
    ],
    concerned: [
      {},
      { leftHeight: 12, rightHeight: 15, leftY: 1, rightY: -1, mouthTilt: 0.08 },
      { leftHeight: 15, rightHeight: 12, leftY: -1, rightY: 1, mouthTilt: -0.08 },
      { leftX: -2, rightX: -2, mouthWidth: 18, mouthCurve: -6 }
    ],
    scared: [
      {},
      { leftWidth: 25, rightWidth: 29, leftHeight: 33, rightHeight: 29, leftX: -2, rightX: -2 },
      { leftWidth: 29, rightWidth: 25, leftHeight: 29, rightHeight: 33, leftX: 2, rightX: 2 },
      { leftY: -2, rightY: -2, separation: 57, mouthWidth: 14 }
    ],
    crying: [
      {},
      { leftHeight: 10, rightHeight: 12, leftY: 2, rightY: 0, mouthTilt: 0.08 },
      { leftHeight: 12, rightHeight: 10, leftY: 0, rightY: 2, mouthTilt: -0.08 },
      { leftX: -2, rightX: -2, mouthWidth: 22, mouthCurve: -6 }
    ],
    sleepy: [
      {},
      { leftHeight: 5, rightHeight: 7, leftY: 5, rightY: 3, mouthOpen: 0.68 },
      { leftHeight: 7, rightHeight: 5, leftY: 3, rightY: 5, mouthWidth: 17 },
      { leftX: 2, rightX: 2, mouthHeight: 8, mouthOpen: 0.55 }
    ],
    bored: [
      {},
      { leftX: -3, rightX: -3, leftHeight: 4, rightHeight: 6, mouthTilt: 0.08 },
      { leftX: 3, rightX: 3, leftHeight: 6, rightHeight: 4, mouthTilt: -0.08 },
      { leftY: 5, rightY: 5, mouthWidth: 19 }
    ],
    angry: [
      {},
      { leftHeight: 12, rightHeight: 15, leftTilt: 0.27, rightTilt: -0.20, mouthTilt: 0.05 },
      { leftHeight: 15, rightHeight: 12, leftTilt: 0.20, rightTilt: -0.27, mouthTilt: -0.05 },
      { separation: 47, mouthWidth: 28, mouthCurve: -6 }
    ],
    determined: [
      {},
      { leftHeight: 12, rightHeight: 14, leftTilt: 0.18, rightTilt: -0.13, leftX: 1, rightX: 1 },
      { leftHeight: 14, rightHeight: 12, leftTilt: 0.13, rightTilt: -0.18, leftX: -1, rightX: -1 },
      { separation: 47, leftWidth: 37, rightWidth: 37 }
    ],
    suspicious: [
      {},
      { leftX: -4, rightX: -4, leftHeight: 6, rightHeight: 15, rightY: -2 },
      { leftX: 4, rightX: 4, leftHeight: 9, rightHeight: 11, leftY: 1 },
      { leftWidth: 36, rightWidth: 29, mouthWidth: 14, mouthCurve: -1 }
    ],
    confused: [
      {},
      { leftWidth: 36, rightWidth: 26, leftHeight: 13, rightHeight: 26, mouthTilt: -0.12 },
      { leftWidth: 27, rightWidth: 35, leftHeight: 25, rightHeight: 14, leftTilt: -0.08, rightTilt: 0.12, mouthTilt: 0.14 },
      { leftX: 3, rightX: 3, mouthWidth: 16, mouthCurve: -2 }
    ],
    cool: [
      {},
      { leftX: -3, rightX: -3, leftY: 1, rightY: 1, mouthWidth: 14, mouthCurve: 2 },
      { leftX: 3, rightX: 3, leftTilt: -0.07, rightTilt: 0.07, mouthTilt: -0.08 },
      { leftWidth: 40, rightWidth: 40, mouthWidth: 18, mouthCurve: 3 }
    ],
    vibing: [
      {},
      { leftHeight: 10, rightHeight: 13, leftY: 2, rightY: -1, mouthTilt: 0.10 },
      { leftHeight: 13, rightHeight: 10, leftY: -1, rightY: 2, mouthTilt: -0.10 },
      { leftX: 2, rightX: 2, mouthWidth: 30, mouthCurve: 7 }
    ],
    love: [
      {},
      { leftHeight: 31, rightHeight: 27, leftY: -2, rightY: 1, mouthTilt: 0.06 },
      { leftHeight: 27, rightHeight: 31, leftY: 1, rightY: -2, mouthTilt: -0.06 },
      { separation: 55, mouthWidth: 26, mouthCurve: 8 }
    ],
    celebrating: [
      {},
      { leftHeight: 11, rightHeight: 14, leftY: 1, rightY: -1, mouthWidth: 35 },
      { leftHeight: 14, rightHeight: 11, leftY: -1, rightY: 1, mouthHeight: 15 },
      { separation: 55, mouthWidth: 36, mouthHeight: 16 }
    ],
    laughing: [
      {},
      { leftHeight: 8, rightHeight: 11, leftY: 2, rightY: 0, mouthTilt: 0.08 },
      { leftHeight: 11, rightHeight: 8, leftY: 0, rightY: 2, mouthTilt: -0.08 },
      { leftX: 2, rightX: 2, mouthWidth: 37, mouthHeight: 17 }
    ],
    proud: [
      {},
      { leftHeight: 11, rightHeight: 14, leftY: 1, rightY: -1, mouthTilt: 0.08 },
      { leftHeight: 14, rightHeight: 11, leftY: -1, rightY: 1, mouthTilt: -0.08 },
      { separation: 51, mouthWidth: 24, mouthCurve: 7 }
    ],
    playful: [
      {},
      { leftOpen: 0.34, rightHeight: 27, leftY: 2, rightY: -2, mouthTilt: 0.14 },
      { leftOpen: 0.62, rightHeight: 22, leftX: 2, rightX: 2, mouthTilt: -0.18 },
      { leftWidth: 38, rightWidth: 27, mouthWidth: 33, mouthCurve: 9 }
    ],
    mischievous: [
      {},
      { leftOpen: 0.10, rightHeight: 17, leftX: -3, rightX: -3, mouthTilt: 0.10 },
      { leftOpen: 0.26, rightHeight: 12, leftX: 3, rightX: 3, mouthTilt: -0.18 },
      { leftWidth: 38, rightWidth: 30, mouthWidth: 26, mouthCurve: 5 }
    ],
    bashful: [
      {},
      { leftHeight: 8, rightHeight: 10, leftY: 4, rightY: 2, mouthTilt: 0.08 },
      { leftHeight: 10, rightHeight: 8, leftY: 2, rightY: 4, mouthTilt: -0.08 },
      { leftX: -2, rightX: -2, mouthWidth: 20, mouthCurve: 6 }
    ],
    silly: [
      {},
      { leftHeight: 26, rightHeight: 11, leftY: -2, rightY: 3, mouthTilt: 0.12 },
      { leftHeight: 20, rightHeight: 17, leftX: 3, rightX: 3, mouthTilt: -0.15 },
      { leftWidth: 36, rightWidth: 26, mouthWidth: 31, mouthHeight: 15 }
    ],
    dizzy: [
      {},
      { leftHeight: 21, rightHeight: 22, leftTilt: 0.22, rightTilt: -0.14, leftY: -2, rightY: 2 },
      { leftHeight: 16, rightHeight: 28, leftTilt: 0.12, rightTilt: -0.22, leftY: 2, rightY: -2 },
      { leftX: -3, rightX: 3, separation: 55 }
    ],
    nerdy: [
      {},
      { leftHeight: 24, rightHeight: 20, leftY: -1, rightY: 1, leftX: -2, rightX: -2 },
      { leftHeight: 20, rightHeight: 24, leftY: 1, rightY: -1, leftX: 2, rightX: 2 },
      { separation: 52, leftWidth: 36, rightWidth: 36 }
    ],
    daydreaming: [
      {},
      { leftX: 6, rightX: 6, leftY: -4, rightY: -2, mouthTilt: 0.08 },
      { leftX: 2, rightX: 2, leftHeight: 17, rightHeight: 21, mouthTilt: -0.08 }
    ],
    peeking: [
      {},
      { leftX: -5, rightX: -5, leftHeight: 11, rightHeight: 25 },
      { leftX: 7, rightX: 7, leftHeight: 15, rightHeight: 21, mouthTilt: -0.08 }
    ],
    humming: [
      {},
      { leftHeight: 9, rightHeight: 11, leftY: 1, rightY: -1, mouthTilt: 0.10 },
      { leftHeight: 11, rightHeight: 9, leftY: -1, rightY: 1, mouthTilt: -0.10 }
    ],
    pondering: [
      {},
      { leftHeight: 27, rightHeight: 11, leftY: -3, rightY: 3, mouthTilt: 0.08 },
      { leftHeight: 22, rightHeight: 17, leftX: 3, rightX: 3, mouthTilt: -0.16 }
    ],
    twinkling: [
      {},
      { leftOpen: 0.08, rightHeight: 29, leftY: 3, rightY: -3, mouthTilt: 0.10 },
      { leftOpen: 0.22, rightHeight: 24, leftX: 3, rightX: 3, mouthTilt: -0.12 }
    ],
    stretching: [
      {},
      { leftHeight: 8, rightHeight: 12, leftY: 2, rightY: -1, mouthWidth: 34 },
      { leftHeight: 12, rightHeight: 8, leftY: -1, rightY: 2, mouthHeight: 16 }
    ]
  });

  function holdPoseFor(state, variantIndex = 0) {
    const base = EYE_PROFILES[state] || EYE_PROFILES.idle;
    const variants = HOLD_POSE_VARIANTS[state] || [{}];
    const variant = variants[Math.abs(Number(variantIndex) || 0) % variants.length] || {};
    return { ...base, ...variant };
  }

  // A performance layer sits on top of the static OLED shapes. Every state
  // uses the same two-eye rig, but gets a tiny, recognizable living gesture.
  // It is deliberately restrained: Doco feels theatrical and cute, never
  // frantic or like a sticker animation pasted onto the blob.
  const FACE_BEATS = Object.freeze({
    idle:         { mode: "breathe", rate: 0.38, bob: 0.56, sway: 0.24, squash: 0.014, tilt: 0.010, glow: 0.030 },
    listening:    { mode: "listen", rate: 0.54, bob: 0.72, sway: 0.40, squash: 0.018, tilt: 0.016, glow: 0.055 },
    calibrating:  { mode: "breathe", rate: 0.28, bob: 0.16, sway: 0.00, squash: 0.006, tilt: 0.000, glow: 0.012 },
    "camera-off":{ mode: "breathe", rate: 0.22, bob: 0.36, sway: 0.12, squash: 0.008, tilt: 0.006, glow: 0.012 },
    attentive:    { mode: "listen", rate: 0.70, bob: 0.78, sway: 0.45, squash: 0.020, tilt: 0.018, glow: 0.065 },
    happy:        { mode: "bounce", rate: 0.80, bob: 0.95, sway: 0.28, squash: 0.042, tilt: 0.020, glow: 0.110 },
    amused:       { mode: "wobble", rate: 0.72, bob: 0.48, sway: 0.68, squash: 0.030, tilt: 0.045, glow: 0.090 },
    celebrating:  { mode: "bounce", rate: 1.02, bob: 1.20, sway: 0.62, squash: 0.052, tilt: 0.055, glow: 0.160 },
    laughing:     { mode: "giggle", rate: 1.08, bob: 0.82, sway: 0.72, squash: 0.040, tilt: 0.052, glow: 0.135 },
    proud:        { mode: "pose", rate: 0.46, bob: 0.48, sway: 0.52, squash: 0.022, tilt: 0.030, glow: 0.085 },
    sleepy:       { mode: "drift", rate: 0.23, bob: 0.88, sway: 0.42, squash: 0.022, tilt: 0.016, glow: 0.022 },
    relaxed:      { mode: "drift", rate: 0.30, bob: 0.68, sway: 0.34, squash: 0.018, tilt: 0.014, glow: 0.030 },
    bored:        { mode: "drift", rate: 0.19, bob: 0.56, sway: 0.28, squash: 0.014, tilt: 0.012, glow: 0.016 },
    concerned:    { mode: "droop", rate: 0.35, bob: 0.62, sway: 0.38, squash: 0.020, tilt: 0.024, glow: 0.024 },
    crying:       { mode: "droop", rate: 0.29, bob: 0.74, sway: 0.40, squash: 0.024, tilt: 0.028, glow: 0.020 },
    surprised:    { mode: "gasp", rate: 0.62, bob: 0.70, sway: 0.10, squash: 0.034, tilt: 0.008, glow: 0.140 },
    shocked:      { mode: "gasp", rate: 0.82, bob: 0.88, sway: 0.14, squash: 0.042, tilt: 0.012, glow: 0.175 },
    scared:       { mode: "tremble", rate: 0.92, bob: 0.44, sway: 0.38, squash: 0.020, tilt: 0.032, glow: 0.070 },
    angry:        { mode: "tense", rate: 0.50, bob: 0.52, sway: 0.48, squash: 0.024, tilt: 0.036, glow: 0.075 },
    determined:   { mode: "tense", rate: 0.38, bob: 0.44, sway: 0.32, squash: 0.018, tilt: 0.024, glow: 0.050 },
    suspicious:   { mode: "sideEye", rate: 0.45, bob: 0.26, sway: 0.54, squash: 0.018, tilt: 0.040, glow: 0.040 },
    curious:      { mode: "peek", rate: 0.56, bob: 0.48, sway: 0.58, squash: 0.022, tilt: 0.040, glow: 0.068 },
    confused:     { mode: "wobble", rate: 0.44, bob: 0.38, sway: 0.62, squash: 0.020, tilt: 0.054, glow: 0.045 },
    cool:         { mode: "pose", rate: 0.38, bob: 0.24, sway: 0.48, squash: 0.014, tilt: 0.032, glow: 0.042 },
    vibing:       { mode: "groove", rate: 0.94, bob: 0.92, sway: 0.88, squash: 0.042, tilt: 0.065, glow: 0.145 },
    love:         { mode: "heartbeat", rate: 0.68, bob: 0.62, sway: 0.24, squash: 0.052, tilt: 0.020, glow: 0.170 },
    playful:      { mode: "peek", rate: 0.86, bob: 0.70, sway: 0.74, squash: 0.032, tilt: 0.062, glow: 0.100 },
    mischievous:  { mode: "sideEye", rate: 0.62, bob: 0.36, sway: 0.76, squash: 0.025, tilt: 0.060, glow: 0.070 },
    bashful:      { mode: "shy", rate: 0.38, bob: 0.42, sway: 0.32, squash: 0.022, tilt: 0.028, glow: 0.048 },
    silly:        { mode: "giggle", rate: 0.92, bob: 0.76, sway: 0.86, squash: 0.040, tilt: 0.070, glow: 0.118 },
    dizzy:        { mode: "wobble", rate: 0.76, bob: 0.52, sway: 0.92, squash: 0.030, tilt: 0.080, glow: 0.090 },
    nerdy:        { mode: "listen", rate: 0.44, bob: 0.50, sway: 0.38, squash: 0.016, tilt: 0.022, glow: 0.040 },
    daydreaming:  { mode: "drift", rate: 0.22, bob: 0.62, sway: 0.42, squash: 0.018, tilt: 0.026, glow: 0.072 },
    peeking:      { mode: "sideEye", rate: 0.42, bob: 0.34, sway: 0.74, squash: 0.018, tilt: 0.050, glow: 0.052 },
    humming:      { mode: "groove", rate: 0.48, bob: 0.48, sway: 0.46, squash: 0.022, tilt: 0.032, glow: 0.080 },
    pondering:    { mode: "wobble", rate: 0.30, bob: 0.34, sway: 0.58, squash: 0.016, tilt: 0.046, glow: 0.044 },
    twinkling:    { mode: "peek", rate: 0.72, bob: 0.62, sway: 0.72, squash: 0.030, tilt: 0.058, glow: 0.112 },
    stretching:   { mode: "bounce", rate: 0.42, bob: 0.88, sway: 0.22, squash: 0.050, tilt: 0.022, glow: 0.120 }
  });

  const NUMERIC_KEYS = Object.freeze(Object.keys(BASE));
  const FACE_SCALE = 1.68;
  const SEPARATION_SCALE = 1.34;
  const MOUTH_SCALE = 1.82;
  const mix = (from, to, amount) => from + (to - from) * amount;
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value) || 0));
  const smootherStep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  const SOFT_BLINK_STATES = new Set([
    "happy", "amused", "celebrating", "laughing", "proud", "sleepy", "relaxed",
    "bored", "concerned", "crying", "angry", "determined", "suspicious", "cool",
    "vibing", "mischievous", "bashful", "humming", "twinkling", "stretching"
  ]);

  // Thin OLED eyes cannot communicate a blink through height alone. Their
  // blink also contracts, settles, and briefly straightens the eye so it is
  // readable without introducing pupils or changing the approved white color.
  function blinkPoseFor(state, amount) {
    const closure = smootherStep(clamp(amount, 0, 1));
    const soft = SOFT_BLINK_STATES.has(state);
    return {
      open: 1 - closure * (soft ? 0.85 : 0.95),
      width: 1 - closure * (soft ? 0.16 : 0.07),
      y: closure * (soft ? 2.2 : 1.15),
      curve: 1 - closure * (soft ? 0.72 : 0.42)
    };
  }

  const emptyBeat = () => ({ x: 0, y: 0, leftY: 0, rightY: 0, leftTilt: 0, rightTilt: 0, scaleX: 1, scaleY: 1, glow: 0 });

  function sampleFaceBeat(profile, time, reducedMotion = false) {
    if (reducedMotion || !profile) return emptyBeat();
    const phase = time * profile.rate * Math.PI * 2;
    const sine = Math.sin(phase);
    const cosine = Math.cos(phase);
    const beat = emptyBeat();
    beat.x = sine * profile.sway;
    beat.y = sine * profile.bob * 0.34;
    beat.scaleX = 1 + cosine * profile.squash * 0.38;
    beat.scaleY = 1 - cosine * profile.squash * 0.42;
    beat.glow = (sine + 1) * profile.glow * 0.5;

    if (profile.mode === "bounce" || profile.mode === "gasp") {
      const lift = (1 - cosine) * 0.5;
      beat.y = -lift * profile.bob;
      beat.scaleX = 1 + lift * profile.squash;
      beat.scaleY = 1 - lift * profile.squash * 0.72;
      beat.leftTilt = sine * profile.tilt;
      beat.rightTilt = -sine * profile.tilt;
    } else if (profile.mode === "giggle" || profile.mode === "groove") {
      beat.x = sine * profile.sway;
      beat.y = (cosine - 1) * profile.bob * 0.5;
      beat.leftTilt = sine * profile.tilt;
      beat.rightTilt = -sine * profile.tilt;
      beat.leftY = Math.sin(phase * 1.2) * profile.bob * 0.16;
      beat.rightY = -beat.leftY;
    } else if (profile.mode === "wobble") {
      beat.x = sine * profile.sway;
      beat.leftTilt = sine * profile.tilt;
      beat.rightTilt = sine * profile.tilt * 0.72;
      beat.leftY = cosine * profile.bob * 0.22;
      beat.rightY = -beat.leftY;
    } else if (profile.mode === "peek" || profile.mode === "sideEye") {
      beat.x = sine * profile.sway;
      beat.leftY = -Math.max(0, sine) * profile.bob * 0.22;
      beat.rightY = Math.max(0, sine) * profile.bob * 0.17;
      beat.leftTilt = sine * profile.tilt;
      beat.rightTilt = -sine * profile.tilt * 0.72;
    } else if (profile.mode === "drift" || profile.mode === "droop" || profile.mode === "shy") {
      const settle = (sine + 1) * 0.5;
      beat.y = settle * profile.bob * 0.55;
      beat.scaleY = 1 - settle * profile.squash;
      beat.leftY = settle * profile.bob * 0.15;
      beat.rightY = profile.mode === "shy" ? settle * profile.bob * 0.26 : beat.leftY;
      beat.leftTilt = profile.mode === "shy" ? -settle * profile.tilt : sine * profile.tilt;
      beat.rightTilt = profile.mode === "shy" ? settle * profile.tilt : -sine * profile.tilt;
    } else if (profile.mode === "tremble") {
      beat.x = Math.sin(phase * 2.1) * profile.sway * 0.42;
      beat.y = Math.cos(phase * 1.7) * profile.bob * 0.28;
      beat.leftTilt = sine * profile.tilt;
      beat.rightTilt = -sine * profile.tilt;
    } else if (profile.mode === "tense") {
      beat.scaleX = 1 + profile.squash * 0.28;
      beat.scaleY = 1 - profile.squash * 0.24;
      beat.leftTilt = sine * profile.tilt * 0.45;
      beat.rightTilt = -sine * profile.tilt * 0.45;
    } else if (profile.mode === "heartbeat") {
      const pulse = Math.pow(Math.max(0, sine), 3);
      beat.y = -pulse * profile.bob;
      beat.scaleX = 1 + pulse * profile.squash;
      beat.scaleY = 1 + pulse * profile.squash * 0.74;
      beat.glow = profile.glow * (0.35 + pulse * 0.9);
    } else if (profile.mode === "pose") {
      beat.x = sine * profile.sway;
      beat.leftTilt = sine * profile.tilt;
      beat.rightTilt = -sine * profile.tilt;
    }
    // Convert the authored gesture into a clearly readable OLED performance.
    // Calm profiles remain subtle because their source amplitudes are tiny;
    // expressive profiles now travel far enough to register on a phone.
    beat.x *= 3.4;
    beat.y *= 3.4;
    beat.leftY *= 3.1;
    beat.rightY *= 3.1;
    beat.leftTilt *= 1.8;
    beat.rightTilt *= 1.8;
    beat.scaleX = 1 + (beat.scaleX - 1) * 1.55;
    beat.scaleY = 1 + (beat.scaleY - 1) * 1.55;
    return beat;
  }

  class OledFaceRenderer {
    constructor(canvas) {
      if (!canvas) throw new Error("OLED face canvas is required");
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("OLED face canvas is unavailable");
      this.canvas = canvas;
      this.context = context;
      this.state = "idle";
      this.current = { ...EYE_PROFILES.idle };
      this.target = { ...EYE_PROFILES.idle };
      this.transitionFrom = { ...EYE_PROFILES.idle };
      this.transitionStartedAt = -Infinity;
      // Keep this in the same family as the blob controller.  The renderer
      // always morphs from its current geometry, so a new reading can arrive
      // mid-transition without a visual reset.
      this.transitionDurationMs = 640;
      this.semanticTransitionActive = false;
      this.beatTransitionFrom = emptyBeat();
      this.holdVariantIndex = 0;
      this.nextHoldVariantAt = 6200;
      this.stateStartedAt = 0;
      // A state can be accurately detected many times in one session. Keep
      // its semantics intact while changing the *performance* so Doco does
      // not restart from the same blank pose each time it returns there.
      this.stateVisits = new Map();
      this.lastAt = 0;
      this.beatPose = emptyBeat();
      this.resize();
      // The shell may be hidden during onboarding initialization. Resize when
      // it becomes visible instead of measuring layout during every frame.
      this.resizeObserver = typeof globalThis.ResizeObserver === "function"
        ? new globalThis.ResizeObserver(() => this.resize())
        : null;
      this.resizeObserver?.observe(this.canvas);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }
      this.ratio = ratio;
      this.logicalScaleX = (rect.width || 240) / 240;
      this.logicalScaleY = (rect.height || 108) / 108;
    }

    destroy() {
      this.resizeObserver?.disconnect();
    }

    setState(state, now = performance.now()) {
      const nextState = EYE_PROFILES[state] ? state : "idle";
      if (nextState === this.state) return false;
      this.state = nextState;
      this.transitionFrom = { ...this.current };
      this.beatTransitionFrom = { ...this.beatPose };
      const variants = HOLD_POSE_VARIANTS[this.state] || [{}];
      const visit = this.stateVisits.get(this.state) || 0;
      this.holdVariantIndex = variants.length > 1 ? visit % variants.length : 0;
      this.stateVisits.set(this.state, visit + 1);
      this.target = holdPoseFor(this.state, this.holdVariantIndex);
      this.transitionStartedAt = now;
      this.stateStartedAt = now;
      this.transitionDurationMs = 920;
      this.semanticTransitionActive = true;
      this.nextHoldVariantAt = now + this.holdVariantDelay();
      return true;
    }

    holdVariantDelay() {
      const stateSeed = [...this.state].reduce((sum, character) => sum + character.charCodeAt(0), 0);
      const quietlyExpressive = new Set(["idle", "listening", "attentive", "relaxed", "bored"]);
      const baseDelay = quietlyExpressive.has(this.state) ? 2500 : 3600;
      const spread = quietlyExpressive.has(this.state) ? 1000 : 1900;
      return baseDelay + ((stateSeed * 17 + this.holdVariantIndex * 733) % spread);
    }

    advanceHoldVariant(now) {
      const variants = HOLD_POSE_VARIANTS[this.state];
      if (!variants || variants.length < 2) {
        this.nextHoldVariantAt = Infinity;
        return false;
      }
      this.holdVariantIndex = (this.holdVariantIndex + 1) % variants.length;
      this.stateVisits.set(this.state, this.holdVariantIndex + 1);
      this.transitionFrom = { ...this.current };
      this.target = holdPoseFor(this.state, this.holdVariantIndex);
      this.transitionStartedAt = now;
      this.transitionDurationMs = 780;
      this.semanticTransitionActive = false;
      this.nextHoldVariantAt = now + this.holdVariantDelay();
      return true;
    }

    roundedEyePath(width, height, curve) {
      const path = new Path2D();
      const halfWidth = width / 2;
      const halfHeight = Math.max(1, height / 2);
      const exponent = 0.52;
      // Thirty-two points are visually continuous at this scale, while
      // avoiding unnecessary path work twice on every animation frame.
      const points = 32;
      for (let index = 0; index <= points; index += 1) {
        const angle = index / points * Math.PI * 2;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const x = halfWidth * Math.sign(cosine) * Math.pow(Math.abs(cosine), exponent);
        const baseY = halfHeight * Math.sign(sine) * Math.pow(Math.abs(sine), exponent);
        const bend = curve * (1 - Math.pow(x / Math.max(halfWidth, 1), 2));
        const y = baseY + bend;
        if (index === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();
      return path;
    }

    roundedRectPath(x, y, width, height, radius) {
      const path = new Path2D();
      const r = Math.min(radius, width / 2, height / 2);
      path.moveTo(x + r, y);
      path.lineTo(x + width - r, y);
      path.quadraticCurveTo(x + width, y, x + width, y + r);
      path.lineTo(x + width, y + height - r);
      path.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      path.lineTo(x + r, y + height);
      path.quadraticCurveTo(x, y + height, x, y + height - r);
      path.lineTo(x, y + r);
      path.quadraticCurveTo(x, y, x + r, y);
      path.closePath();
      return path;
    }

    accessoryColor(alpha = 1) {
      return `rgba(${Math.round(this.current.accentR * 255)}, ${Math.round(this.current.accentG * 255)}, ${Math.round(this.current.accentB * 255)}, ${clamp(alpha, 0, 1)})`;
    }

    heartPath(size) {
      const path = new Path2D();
      const s = size / 30;
      path.moveTo(0, 12 * s);
      path.bezierCurveTo(-3 * s, 7 * s, -14 * s, 1 * s, -14 * s, -7 * s);
      path.bezierCurveTo(-14 * s, -15 * s, -4 * s, -18 * s, 0, -10 * s);
      path.bezierCurveTo(4 * s, -18 * s, 14 * s, -15 * s, 14 * s, -7 * s);
      path.bezierCurveTo(14 * s, 1 * s, 3 * s, 7 * s, 0, 12 * s);
      path.closePath();
      return path;
    }

    drawHeadphones(centerX, centerY, beat, geometric = false) {
      const amount = clamp(this.current.headphones, 0, 1);
      if (amount <= 0 || (!geometric && amount < 0.02)) return;
      const ctx = this.context;
      const lift = (1 - (geometric ? .85 : amount)) * 8;
      ctx.save();
      ctx.globalAlpha = geometric ? .85 : amount;
      // Unfold vertically at the temple anchors; never grow from the nose.
      if (geometric) { ctx.translate(centerX, centerY); ctx.scale(1, Math.min(1, amount / .85)); ctx.translate(-centerX, -centerY); }
      ctx.translate(beat.x * 0.5, beat.y * 0.44 + lift);
      ctx.strokeStyle = this.accessoryColor(0.94);
      ctx.fillStyle = this.accessoryColor(0.26);
      ctx.shadowColor = this.accessoryColor(0.86);
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 76, centerY + 7);
      ctx.bezierCurveTo(centerX - 72, centerY - 42, centerX + 72, centerY - 42, centerX + 76, centerY + 7);
      ctx.stroke();
      const leftPad = this.roundedRectPath(centerX - 91, centerY - 8, 22, 38, 10);
      const rightPad = this.roundedRectPath(centerX + 69, centerY - 8, 22, 38, 10);
      ctx.fill(leftPad); ctx.fill(rightPad);
      ctx.lineWidth = 4;
      ctx.stroke(leftPad); ctx.stroke(rightPad);
      ctx.restore();
    }

    drawGlasses(centerX, centerY, separation, beat, geometric = false) {
      if (geometric) return this.drawMorphGlasses(centerX, centerY, separation, beat);
      const specs = clamp(this.current.glasses, 0, 1);
      const shades = clamp(this.current.sunglasses, 0, 1);
      const amount = Math.max(specs, shades);
      if (amount < 0.02) return;
      const ctx = this.context;
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.shadowColor = this.accessoryColor(0.9);
      ctx.shadowBlur = 9;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (shades > 0.02) {
        const lensWidth = 72;
        const lensHeight = 49;
        const lensGap = 11;
        const lensY = centerY - lensHeight / 2 + beat.y;
        const leftX = centerX - lensGap / 2 - lensWidth + beat.x;
        const rightX = centerX + lensGap / 2 + beat.x;
        const leftLens = this.roundedRectPath(leftX, lensY, lensWidth, lensHeight, 18);
        const rightLens = this.roundedRectPath(rightX, lensY, lensWidth, lensHeight, 18);
        const rim = 7;
        const leftGlass = this.roundedRectPath(leftX + rim, lensY + rim, lensWidth - rim * 2, lensHeight - rim * 2, 13);
        const rightGlass = this.roundedRectPath(rightX + rim, lensY + rim, lensWidth - rim * 2, lensHeight - rim * 2, 13);

        // A dark lens pair with a clear bridge reads as goggles at every blob color.
        const lensGradient = ctx.createLinearGradient(0, lensY, 0, lensY + lensHeight);
        lensGradient.addColorStop(0, `rgba(13, 35, 53, ${0.98 * shades})`);
        lensGradient.addColorStop(0.55, `rgba(3, 10, 20, ${0.96 * shades})`);
        lensGradient.addColorStop(1, `rgba(0, 5, 12, ${0.9 * shades})`);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * shades})`;
        ctx.fill(leftLens); ctx.fill(rightLens);
        ctx.fillStyle = lensGradient;
        ctx.fill(leftGlass); ctx.fill(rightGlass);

        // Bridge and short side arms keep the silhouette readable as eyewear.
        ctx.strokeStyle = `rgba(238, 253, 255, ${0.98 * shades})`;
        ctx.lineWidth = 5.2;
        ctx.beginPath();
        ctx.moveTo(leftX + lensWidth - 1, centerY - 2 + beat.y);
        ctx.quadraticCurveTo(centerX, centerY - 8 + beat.y, rightX + 1, centerY - 2 + beat.y);
        ctx.moveTo(leftX + 1, centerY - 4 + beat.y);
        ctx.lineTo(leftX - 17, centerY - 8 + beat.y);
        ctx.moveTo(rightX + lensWidth - 1, centerY - 4 + beat.y);
        ctx.lineTo(rightX + lensWidth + 17, centerY - 8 + beat.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * shades})`;
        ctx.fill(this.roundedRectPath(centerX - 9 + beat.x, centerY - 6 + beat.y, 18, 11, 5));

        // One restrained reflection per lens gives depth without becoming eye-like.
        ctx.globalAlpha = shades * 0.76;
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.lineWidth = 3.2;
        for (const x of [leftX + 15, rightX + 15]) {
          ctx.beginPath();
          ctx.moveTo(x, lensY + 13);
          ctx.lineTo(x + 17, lensY + 8);
          ctx.stroke();
        }
      } else if (specs > 0.02) {
        const lensWidth = 65;
        const lensHeight = 45;
        const lensY = centerY - lensHeight / 2 + beat.y;
        const leftX = centerX - separation / 2 - lensWidth / 2 + beat.x;
        const rightX = centerX + separation / 2 - lensWidth / 2 + beat.x;
        const leftLens = this.roundedRectPath(leftX, lensY, lensWidth, lensHeight, 18);
        const rightLens = this.roundedRectPath(rightX, lensY, lensWidth, lensHeight, 18);
        ctx.strokeStyle = this.accessoryColor(0.98);
        ctx.lineWidth = 3.2;
        ctx.stroke(leftLens); ctx.stroke(rightLens);
        ctx.beginPath();
        ctx.moveTo(leftX + lensWidth, centerY + beat.y);
        ctx.quadraticCurveTo(centerX, centerY - 5 + beat.y, rightX, centerY + beat.y);
        ctx.moveTo(leftX, centerY - 4 + beat.y);
        ctx.lineTo(leftX - 13, centerY - 8 + beat.y);
        ctx.moveTo(rightX + lensWidth, centerY - 4 + beat.y);
        ctx.lineTo(rightX + lensWidth + 13, centerY - 8 + beat.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawMorphGlasses(centerX, centerY, separation, beat) {
      const specs=clamp(this.current.glasses,0,1),shades=clamp(this.current.sunglasses,0,1),amount=clamp(specs+shades,0,1);
      if (!amount) return;
      const shade=shades/(specs+shades),lerp=(a,b)=>a+(b-a)*shade,ctx=this.context;
      const color=`rgba(${Math.round(lerp(this.current.accentR*255,255))},${Math.round(lerp(this.current.accentG*255,255))},${Math.round(lerp(this.current.accentB*255,255))},.98)`;
      const width=lerp(65,72),height=lerp(45,49),y=centerY-height/2+beat.y;
      const left=lerp(centerX-separation/2-65/2,centerX-5.5-72)+beat.x;
      const right=lerp(centerX+separation/2-65/2,centerX+5.5)+beat.x;
      const outset=lerp(1.6,0),rim=lerp(1.6,7);
      ctx.save();ctx.globalAlpha=1;
      ctx.translate(centerX,centerY);ctx.scale(1,amount);ctx.translate(-centerX,-centerY);
      ctx.shadowColor=this.accessoryColor(.9);ctx.shadowBlur=9;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.fillStyle=color;
      for(const x of [left,right]){
        const ring=new Path2D();
        ring.addPath(this.roundedRectPath(x-outset,y-outset,width+outset*2,height+outset*2,18+outset));
        ring.addPath(this.roundedRectPath(x+rim,y+rim,width-rim*2,height-rim*2,lerp(16.4,13)));
        ctx.fill(ring,'evenodd');
        // Close the clear aperture from the rim inward, rather than growing
        // two eye-like dark dots. The same anchored frame remains throughout.
        if(shade>0){
          const gradient=ctx.createLinearGradient(0,y,0,y+height);
          gradient.addColorStop(0,'rgba(13,35,53,.98)');gradient.addColorStop(.55,'rgba(3,10,20,.96)');gradient.addColorStop(1,'rgba(0,5,12,.9)');
          const w=width-rim*2,h=height-rim*2,opening=1-shade;
          const lens=new Path2D();lens.addPath(this.roundedRectPath(x+rim,y+rim,w,h,Math.min(13,w/2,h/2)));
          if(opening>0)lens.addPath(this.roundedRectPath(x+width/2-w*opening/2,y+height/2-h*opening/2,w*opening,h*opening,Math.min(13,w/2,h/2)*opening));
          ctx.fillStyle=color;ctx.fill(lens,'evenodd');ctx.fillStyle=gradient;ctx.fill(lens,'evenodd');
          ctx.fillStyle=color;
        }
      }
      ctx.strokeStyle=color;ctx.lineWidth=lerp(3.2,5.2);ctx.beginPath();
      ctx.moveTo(left+width-lerp(0,1),centerY+lerp(0,-2)+beat.y);
      ctx.quadraticCurveTo(centerX,centerY+lerp(-5,-8)+beat.y,right+lerp(0,1),centerY+lerp(0,-2)+beat.y);
      ctx.moveTo(left+lerp(0,1),centerY-4+beat.y);ctx.lineTo(left-lerp(13,17),centerY-8+beat.y);
      ctx.moveTo(right+width-lerp(0,1),centerY-4+beat.y);ctx.lineTo(right+width+lerp(13,17),centerY-8+beat.y);ctx.stroke();
      if(shade>0){
        ctx.fill(this.roundedRectPath(centerX-9*shade+beat.x,centerY-6*shade+beat.y,18*shade,11*shade,5*shade));
        ctx.strokeStyle='rgba(255,255,255,.6992)';ctx.lineWidth=3.2*shade;ctx.beginPath();
        for(const x of [left+15,right+15]){ctx.moveTo(x,y+13);ctx.lineTo(x+17*shade,y+13-5*shade);}ctx.stroke();
      }
      ctx.restore();
    }

    drawCrownAndSparkles(centerX, centerY, time, beat) {
      const crown = clamp(this.current.crown, 0, 1);
      const sparkles = clamp(this.current.sparkles, 0, 1);
      if (crown < 0.02 && sparkles < 0.02) return;
      const ctx = this.context;
      ctx.save();
      ctx.translate(beat.x * 0.35, beat.y * 0.25);
      ctx.strokeStyle = this.accessoryColor(0.96);
      ctx.fillStyle = this.accessoryColor(0.28);
      ctx.shadowColor = this.accessoryColor(0.9);
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (crown > 0.02) {
        ctx.globalAlpha = crown;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 29, centerY - 27);
        ctx.lineTo(centerX - 23, centerY - 43);
        ctx.lineTo(centerX - 8, centerY - 33);
        ctx.lineTo(centerX, centerY - 48);
        ctx.lineTo(centerX + 9, centerY - 33);
        ctx.lineTo(centerX + 24, centerY - 43);
        ctx.lineTo(centerX + 29, centerY - 27);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
      if (sparkles > 0.02) {
        const pulse = 0.78 + Math.sin(time * 0.0045) * 0.22;
        ctx.globalAlpha = sparkles * pulse;
        ctx.lineWidth = 3.2;
        for (const [x, y, size] of [[centerX - 91, centerY - 22, 9], [centerX + 91, centerY - 15, 7], [centerX + 79, centerY + 28, 5]]) {
          ctx.beginPath();
          ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
          ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    drawEye(side, x, y, blink, gazeX, gazeY, time, beat) {
      const ctx = this.context;
      const prefix = side === "left" ? "left" : "right";
      const winkSide = this.frame?.winkSide;
      const winkAmount = winkSide === side ? clamp(this.frame?.wink, 0, 1) : 0;
      const blinkPose = blinkPoseFor(this.state, Math.max(blink, winkAmount));
      const open = clamp(this.current[`${prefix}Open`] * blinkPose.open, 0.035, 1);
      const width = this.current[`${prefix}Width`] * FACE_SCALE * blinkPose.width;
      const height = Math.max(1.8, this.current[`${prefix}Height`] * FACE_SCALE * open * (1 - clamp(this.frame?.squint, 0, 1) * 0.22));
      const curve = this.current[`${prefix}Curve`] * FACE_SCALE * Math.max(0.12, open) * blinkPose.curve;
      const tilt = this.current[`${prefix}Tilt`] + (side === "left" ? beat.leftTilt : beat.rightTilt);
      const micro = Math.sin(time * 0.00072 + (side === "left" ? 0 : 0.8)) * 0.35;

      ctx.save();
      ctx.translate(x + this.current[`${prefix}X`] + gazeX + beat.x, y + this.current[`${prefix}Y`] + gazeY + micro + blinkPose.y + beat.y + (side === "left" ? beat.leftY : beat.rightY));
      ctx.rotate(tilt);
      ctx.scale(beat.scaleX, beat.scaleY);
      const eyeColor = `rgba(${Math.round(this.current.eyeR * 255)}, ${Math.round(this.current.eyeG * 255)}, ${Math.round(this.current.eyeB * 255)}, 0.98)`;
      ctx.fillStyle = eyeColor;
      ctx.strokeStyle = eyeColor;
      ctx.shadowColor = `rgba(218, 238, 255, ${0.72 * (this.current.glow + beat.glow)})`;
      ctx.shadowBlur = 9 * (this.current.glow + beat.glow);

      ctx.globalAlpha = 1;
      ctx.fill(this.roundedEyePath(width, height, curve));
      ctx.restore();
    }

    drawMouth(centerX, centerY, beat) {
      const width = Math.max(0, this.current.mouthWidth) * MOUTH_SCALE;
      if (width <= 0) return;
      const ctx = this.context;
      const height = Math.max(2, this.current.mouthHeight * MOUTH_SCALE);
      const open = clamp(this.current.mouthOpen, 0, 1);
      const curve = this.current.mouthCurve;
      const emergence = clamp(width / 8, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(centerX + beat.x * 0.52, centerY + beat.y * 0.42);
      ctx.rotate(this.current.mouthTilt + (beat.leftTilt + beat.rightTilt) * 0.18);
      ctx.scale(beat.scaleX, beat.scaleY);
      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
      ctx.shadowColor = `rgba(218, 238, 255, ${0.6 * (this.current.glow + beat.glow)})`;
      ctx.shadowBlur = 7 * (this.current.glow + beat.glow);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (open > 0.08) {
        const halfWidth = width / 2;
        const halfHeight = Math.max(2, height * open / 2) * emergence;
        ctx.beginPath();
        ctx.moveTo(-halfWidth, 0);
        ctx.bezierCurveTo(-halfWidth, -halfHeight, halfWidth, -halfHeight, halfWidth, 0);
        ctx.bezierCurveTo(halfWidth, halfHeight, -halfWidth, halfHeight, -halfWidth, 0);
        if (this.current.tongue > 0.04) {
          const tongueAmount = clamp(this.current.tongue, 0, 1);
          ctx.fillStyle = "rgba(5, 8, 20, 0.82)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.beginPath();
          ctx.fillStyle = this.accessoryColor(0.98);
          ctx.ellipse(0, halfHeight * 0.58 + 3 * tongueAmount, width * 0.26, Math.max(4, halfHeight * 0.58) * tongueAmount, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fill();
        }
      } else {
        ctx.lineWidth = Math.max(2.4, height) * emergence;
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.quadraticCurveTo(0, curve, width / 2, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawTear(x, y, time) {
      const amount = clamp(this.current.tear, 0, 1);
      if (amount < 0.01) return;
      const ctx = this.context;
      const drift = (Math.sin(time * 0.002) + 1) * 1.5;
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.translate(x, y + 13 + drift);
      ctx.fillStyle = "rgba(235, 248, 255, 0.94)";
      ctx.shadowColor = "rgba(205, 235, 255, 0.9)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.bezierCurveTo(6, 0, 5, 8, 0, 10);
      ctx.bezierCurveTo(-5, 8, -6, 0, 0, -7);
      ctx.fill();
      ctx.restore();
    }

    render(frame = {}) {
      const now = Number(frame.observedAt) || performance.now();
      if (frame.primaryState && frame.primaryState !== this.state) this.setState(frame.primaryState, now);
      if (!frame.reducedMotion && now >= this.nextHoldVariantAt) this.advanceHoldVariant(now);
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastAt) / 1000 || 0.016));
      this.lastAt = now;
      const sharedProgress = Number(frame.transitionProgress);
      const transitionProgress = frame.reducedMotion
        ? 1
        : this.semanticTransitionActive && Number.isFinite(sharedProgress)
          ? clamp(sharedProgress, 0, 1)
          : clamp((now - this.transitionStartedAt) / this.transitionDurationMs, 0, 1);
      const transitionEase = smootherStep(transitionProgress);
      for (const key of NUMERIC_KEYS) this.current[key] = mix(this.transitionFrom[key], this.target[key], transitionEase);
      if (transitionProgress >= 1) this.semanticTransitionActive = false;
      // Beat time is local to this performance. A new expression therefore
      // enters at the beginning of its own gesture instead of inheriting an
      // arbitrary phase from a global clock (the source of the tiny shiver
      // users used to see between rapid Gemini readings).
      // Allow the expression to become readable before its living gesture.
      const performanceSeconds = Math.max(0, now - this.stateStartedAt - 460) / 1000;
      const destinationBeat = sampleFaceBeat(FACE_BEATS[this.state] || FACE_BEATS.idle, performanceSeconds, Boolean(frame.reducedMotion));
      const targetBeat = this.semanticTransitionActive
        ? Object.fromEntries(Object.keys(this.beatPose).map((key) => [key, mix(this.beatTransitionFrom[key], destinationBeat[key], transitionEase)]))
        : destinationBeat;
      const beatSmooth = frame.reducedMotion ? 1 : 1 - Math.exp(-dt * 5.2);
      for (const key of Object.keys(this.beatPose)) this.beatPose[key] = mix(this.beatPose[key], targetBeat[key], beatSmooth);
      this.frame = frame;

      const ctx = this.context;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const logicalScaleX = this.logicalScaleX;
      const logicalScaleY = this.logicalScaleY;
      ctx.setTransform(this.ratio * logicalScaleX, 0, 0, this.ratio * logicalScaleY, 0, 0);
      ctx.imageSmoothingEnabled = true;

      const centerX = 120;
      const centerY = 52;
      const separation = this.current.separation * SEPARATION_SCALE;
      const glanceX = frame.reducedMotion ? 0 : clamp(frame.glanceX, -1, 1) * 3.8;
      const glanceY = frame.reducedMotion ? 0 : clamp(frame.glanceY, -1, 1) * 2.4;
      const blink = frame.reducedMotion ? 0 : clamp(frame.blink, 0, 1);
      this.drawHeadphones(centerX, centerY, this.beatPose, true);
      this.drawEye("left", centerX - separation / 2, centerY, blink, glanceX, glanceY, now, this.beatPose);
      this.drawEye("right", centerX + separation / 2, centerY, blink, glanceX, glanceY, now, this.beatPose);
      this.drawGlasses(centerX, centerY, separation, this.beatPose, true);
      this.drawCrownAndSparkles(centerX, centerY, now, this.beatPose);
      this.drawTear(centerX + separation / 2 + 7, centerY, now);
      this.drawMouth(centerX, 86, this.beatPose);
    }
  }

  return { BASE, EYE_PROFILES, HOLD_POSE_VARIANTS, FACE_BEATS, NUMERIC_KEYS, FACE_SCALE, SEPARATION_SCALE, MOUTH_SCALE, OledFaceRenderer, blinkPoseFor, clamp, holdPoseFor, mix, smootherStep, sampleFaceBeat };
});
