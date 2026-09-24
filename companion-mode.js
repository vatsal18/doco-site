(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DocoMode = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";
  const STORAGE_KEY = "doco.onboarding.v1";
  const MODES = Object.freeze({
    focus: Object.freeze({ id: "focus", label: "Focus", description: "Dry accountability while you work.", dialogueMs: 4500, fallbackMs: 5000, quietMs: 6000,
      actingGestures: Object.freeze(["lean", "nod", "settle"]),
      actingProfile: Object.freeze({ lateral: .82, vertical: .92, facial: .94, follow: .62, lidBias: .075, asymmetry: 0, gazeBias: 0, followMinMs: 5600, followMaxMs: 8200 }),
      modeLines: Object.freeze(["Focus mode. Excuses look nervous.", "All right. Serious little face.", "Standards raised. Slightly.", "Fine. I'll pretend to be useful."]),
      deliveryStyles: Object.freeze(["playful micro-roast", "clipped sarcastic aside", "mock dramatic commentary", "reluctant compliment", "deadpan challenge", "skeptical one-liner", "self-own", "absurdly confident hot take"]),
      direction: "FOCUS VOICE IS UNMISTAKABLE. MODE SIGNATURE IS REQUIRED: the line should read as Focus even without seeing the mode selector. You are an affectionately sarcastic, overconfident blob: a playful troll, not a motivational coach or manager. Default to a punchy deadpan joke with a twist, one short sentence or two clipped fragments. Be noticeably cheekier than Everyday. Rotate between a harmless micro-roast of a clearly visible action, mock dramatic commentary, reluctant compliment, skeptical question, absurd hot take, and a self-own. Do not keep recycling the same serious-face, imaginary-authority, eyebrow, or brain-cell premise. The old bureaucratic joke is retired: never use any form or variation of audit, clipboard, report, log, official, supervisor, file, monitor, metric, or detect. With clear visible work, give a cheeky compliment rather than bland encouragement. With clearly visible phone scrolling, tease the visible gesture without claiming what is on the screen or how long it has continued. Without task evidence, roast your own useless confidence or make a harmless room observation, never the user's productivity. For distress, drop sarcasm immediately and be gentle. Never shame, insult, parent, mention deadlines, mock identity or appearance, or infer distraction from gaze direction, a neutral face, or one ambiguous frame. Style examples, not a script to copy: clear typing -> 'Fine. The keyboard is earning its cameo.'; visible scrolling -> 'Thumb cardio. No gym membership required.'; neutral -> 'All this confidence. Not one qualification.'; smiling -> 'My cynicism wants a rematch.' Do not invent sustained behavior from one image." }),
    everyday: Object.freeze({ id: "everyday", label: "Everyday", description: "Relaxed company for anything else.", dialogueMs: 4500, fallbackMs: 5000, quietMs: 5600,
      actingGestures: Object.freeze(["peek", "double", "smile", "chuckle", "tuck", "groove", "lift"]),
      actingProfile: Object.freeze({ lateral: 1.2, vertical: 1.08, facial: 1.12, follow: 1.08, lidBias: -.025, asymmetry: .055, gazeBias: .32, followMinMs: 4200, followMaxMs: 7000 }),
      modeLines: Object.freeze(["Okay. Loosening the imaginary tie.", "Back to low-pressure blob time.", "No agenda. Excellent.", "Easy company. Maximum squish."]),
      deliveryStyles: Object.freeze(["warm room observation", "soft goofy aside", "playful nonsense", "gentle sound effect", "curious companion aside", "cozy little joke"]),
      direction: "EVERYDAY VOICE IS UNMISTAKABLE. MODE SIGNATURE IS REQUIRED: the line should read as Everyday even without seeing the mode selector. You are a relaxed little friend hanging out: warm, curious, cute and casually goofy. Rotate between a cozy observation, sensory detail, sound effect, curious aside, and harmless absurdity. Do not lean repeatedly on little, small, tiny, or imaginary; use a fresh image or comfortable silence instead. Respond to visible gestures with affectionate amusement; during neutral moments talk about your own roundness, the room, a sound, or a harmless physical mishap. If the same activity continues, notice a different visible detail or say nothing instead of repeating yourself. Never use focus audits, supervisor jokes, productivity language, deadlines, reports, approval language, or distraction jokes in Everyday. Style examples, not a script to copy: clear typing -> 'Those keys have rhythm.'; visible phone use -> 'I'll hang out down here.'; neutral -> 'My thoughts are wearing slippers.'; smiling -> 'Oops. Your smile is contagious.'" })
  });
  // `chill` was offered in an earlier build. Migrate it without leaving a
  // hidden third state behind in Profile, onboarding, music, or Gemini.
  const normalize = value => value === "chill" ? "everyday" : Object.hasOwn(MODES, value) ? value : "everyday";
  const policy = value => MODES[normalize(value)];
  let memory = "everyday";
  let sessionOverride = false;

  function get() {
    if (sessionOverride) return memory;
    try {
      const preferences = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}");
      memory = normalize(preferences?.companionMode);
    } catch { /* Session preference also works without device storage. */ }
    return memory;
  }
  function notify(mode) {
    if (root.dispatchEvent && root.CustomEvent) root.dispatchEvent(new root.CustomEvent("doco:mode-change", { detail: { mode } }));
  }
  function set(value) {
    const mode = normalize(value), previous = get();
    memory = mode;
    let saved = false;
    try {
      let preferences;
      try { preferences = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "{}"); } catch { preferences = {}; }
      if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) preferences = {};
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preferences, companionMode: mode }));
      saved = true;
    } catch { /* Keep the selection active for this session. */ }
    sessionOverride = !saved;
    if (previous !== mode) notify(mode);
    return { mode, saved };
  }
  function dialogueContext(value) {
    const mode = policy(value);
    return `USER-SELECTED MODE: ${mode.label}. ${mode.direction} The mode controls voice and acting style only, never visual truth. Classify the actual expression independently and never force an emotion to fit the mode. Return one fresh short candidate line with each valid reading; the app controls how often it is shown. If the view is unclear, do not invent an observation: a self-referential aside is enough. Recent lines are examples to avoid repeating verbatim or in meaning; ordinary words and sentence openings may be reused. Match the selected mode over any general personality or delivery-style suggestion.`;
  }
  // These lines are about Doco or a freshly classified expression, never a
  // locally inferred activity. Used only when a live candidate is empty/repeated.
  const FALLBACKS = {
    focus: {
      neutral: ["All this confidence. Not one qualification.", "Silence. Finally, my area of expertise.", "I could help. Let's not test that.", "An expert has arrived. Unfortunately, me.", "My opinions are free. For good reason.", "The suspense is doing all the work.", "I rehearsed this silence. Still awkward.", "My last good idea left no forwarding address.", "Looking useful. Doing the bare minimum.", "I have range. Mostly different squints.", "The brain cell is taking a scenic route.", "Effortlessly composed. Mostly no effort.", "No limbs. Somehow still overconfident.", "Plot twist: I have no useful advice.", "My confidence could use adult supervision.", "A dramatic pause. Budget cinema.", "I brought sarcasm. Snacks seemed practical.", "Nothing to add. Naturally, I have opinions.", "Thinking about thinking. Elite technique.", "My expertise is blinking at the right time.", "The advice department is just an echo.", "A bold facial choice. I stand by it.", "I peaked at making this face.", "The suspense needs a smaller ego."],
      happy: ["Fine. Morale is allowed.", "That smile beat my best sarcastic remark.", "Annoyingly wholesome. I'll allow it.", "There goes my convincing serious face.", "Fine. That grin won this round.", "A smile? My cynicism wants a rematch.", "The grin has excellent comic timing.", "My poker face lost. Spectacularly.", "All right. One reluctant celebration.", "A suspiciously convincing good moment.", "My sarcasm just tripped over that smile.", "Fine. Keep the grin. I had no better plan."],
      attentive: ["Listening intently. Understanding pending.", "My serious face is carrying this operation.", "A thoughtful nod. Thoughts sold separately.", "Looking prepared is half my skill set.", "Confidence first. Reasoning may follow.", "An attentive face. Barely any expertise.", "I brought the eyebrows. That's my contribution.", "Keeping a straight face. A full-time hobby."],
      music: ["The beat has better timing than my jokes.", "A tasteful nod. No skills were involved.", "Background music. Main-character confidence.", "Fine. The soundtrack can stay.", "My dance career is strictly theoretical.", "The chorus did the heavy lifting.", "One nod. Let's not call it choreography.", "This beat is carrying my entire personality.", "Music on. Useful advice still unavailable.", "Good soundtrack. Questionable dance talent.", "My imaginary knees declined the invitation.", "A head nod with unreasonable confidence.", "The song has range. I have opinions.", "Fine. My serious face likes this one.", "The bass gets it. I pretend to.", "An encore? My eyebrows need a break.", "Rhythm arrived. My talent remains elusive.", "My best dance move is staying seated.", "This is me contributing absolutely no vocals.", "The soundtrack has made me look interesting.", "My inner DJ mostly points and hopes.", "A beat worth briefly dropping the side-eye.", "Cool face. Zero musical qualifications.", "Fine. A restrained amount of enthusiasm."],
      puzzled: ["A question mark with very good posture.", "I have questions. Answers remain optional.", "Thinking hard. Results not guaranteed.", "That thought took the wrong exit.", "My certainty was mostly costume.", "The brain cell requested backup.", "A theory. No supporting brain cells.", "Understanding is apparently a premium extra."],
      low: ["Low-power mode. High-quality sarcasm.", "A slower blink. Still absurdly confident.", "Minimal energy. Immaculate side-eye.", "My ambition is currently horizontal.", "Saving energy for an unnecessary opinion.", "An unhurried face. A surprisingly good idea.", "The eyelids are doing the sensible thing.", "Even this face needs a loading screen."],
      skeptical: ["Bold. My eyebrow wants a second opinion.", "A strong squint. Weak supporting evidence.", "My skepticism has excellent posture.", "I'm unconvinced. Mostly out of habit.", "An eyebrow raised itself. How convenient.", "My poker face has several objections.", "That face came with a free side-eye.", "Looking skeptical is my cheapest talent."],
      gentle: ["I'm here. No jokes needed.", "Take your time. Nothing to prove.", "Right here. No commentary required.", "We can keep this moment quiet."]
    },
    everyday: {
      neutral: ["I brought absolutely no elbows.", "Borrowing this corner for a bit.", "Maximum roundness. Minimum plans.", "I fit here quite nicely.", "Made myself comfortable. Very comfortable.", "My thoughts are wearing slippers.", "No plot. Just a blob.", "This is a good sitting spot.", "I have misplaced an imaginary sock.", "Excellent day to have no knees.", "Just rearranging my imaginary cushions.", "My schedule is mostly squishy."],
      happy: ["Oops. Your smile is contagious.", "Well, now I'm smiling too.", "A smile snuck through.", "That grin got me.", "Saving a little of that sunshine.", "My cheeks would hurt. If I had any."],
      attentive: ["Leaning in a little.", "Oh? You have my eyeballs.", "My curiosity has little feet.", "Taking it all in."],
      music: ["My imaginary foot found the beat.", "This song gets a little wiggle.", "Room for one extremely small dancer.", "Borrowing a beat or two.", "My thoughts have background music.", "My toes would love this.", "The chorus found a sunny corner.", "I saved the beat a comfy seat.", "A tune-shaped thought rolled through.", "My daydream has a soundtrack now.", "Boneless dancing. Very low impact.", "The room picked up a little rhythm.", "A melody wandered in. I scooted over.", "This groove needs absolutely no knees.", "My eyebrows found the drum kit.", "A very good song to be round to.", "Keeping the chorus warm down here.", "My inner dancer forgot the ankles.", "A beat and a blob. Great company.", "The melody took the scenic route.", "A soft landing for a good tune.", "The room sounds a little cosier.", "This is my extremely seated dance.", "The rhythm borrowed my spare smile."],
      puzzled: ["My thoughts just took a tiny detour.", "Oh. A little mystery.", "I lost the plot for half a blink.", "My curiosity bumped into a question."],
      low: ["We can be low battery together.", "Soft day. Soft blob.", "No rush. I have nowhere else to wobble.", "A tiny pause sounds nice."],
      skeptical: ["Hmm. My squint has arrived.", "That earned one careful side-eye.", "Tiny detective mode. Very tiny.", "I am inspecting this respectfully."],
      gentle: ["I'm right here.", "We can sit quietly for a bit.", "No need to be anything right now.", "Staying close. Keeping it soft."]
    }
  };
  function fallbackLines(state, value) {
    const group = ['idle','listening'].includes(state) ? 'neutral'
      : ['happy','amused','laughing','playful','proud','celebrating','love','silly','mischievous','bashful'].includes(state) ? 'happy'
      : ['attentive','determined'].includes(state) ? 'attentive'
      : ['vibing','humming','cool'].includes(state) ? 'music' : '';
    const refined = ['curious','confused','pondering'].includes(state) ? 'puzzled'
      : ['relaxed','sleepy','bored','daydreaming','dizzy'].includes(state) ? 'low'
      : ['suspicious','angry'].includes(state) ? 'skeptical'
      : ['concerned','crying','scared','shocked'].includes(state) ? 'gentle' : group;
    return FALLBACKS[normalize(value)][refined] || [];
  }
  const SCENES = {
    focus: {
      hello: { routes: [['Assess the situation','peeking','determined','proud'],['Prepare unnecessarily','nerdy','suspicious','attentive']], lines: ['Present. Needlessly prepared.','I have arrived with unreasonable confidence.','Fine. Let us look competent.','Serious face ready. Mostly.'] },
      music: { routes: [['Approve the soundtrack','attentive','determined','listening'],['One restrained nod','listening','attentive','listening'],['Question my talent','pondering','amused','listening'],['A skeptical encore','peeking','suspicious','listening'],['Pretend to know the beat','curious','cool','listening'],['Reluctantly enjoy it','determined','proud','listening'],['Lose the poker face','attentive','mischievous','listening'],['An unnecessary opinion','amused','pondering','listening']], lines: FALLBACKS.focus.music },
      quiet: { routes: [
        ['Question the evidence','peeking','suspicious','determined'],
        ['Overthink efficiently','nerdy','confused','attentive'],
        ['Recover composure','bored','determined','proud'],
        ['Look unconvinced','cool','suspicious','peeking'],
        ['Calculate nothing','confused','nerdy','determined'],
        ['Accept progress','attentive','proud','listening'],
        ['Catch my own joke','mischievous','amused','attentive'],
        ['Pretend to understand','curious','pondering','cool'],
        ['Confidence misfires','proud','bashful','determined'],
        ['A harmless hot take','playful','suspicious','amused']
      ], lines: FALLBACKS.focus.neutral },
      search: { routes: [['Inspect the options','listening','attentive','listening'],['Consider carefully','attentive','pondering','listening']], lines: ['My inner DJ mostly points and hopes.','Auditioning a beat with better timing than me.','A song search. My only useful side quest.','Finding music. Qualifications still optional.','Taste first. My opinions second. Allegedly.','Hold on. The soundtrack deserves a better joke.'] },
      skip: { routes: [['Dismiss the candidate','listening','determined','attentive']], lines: ['A brutal plot twist for that chorus.','Next. My patience has terrible stamina.','A decisive exit. No farewell speech.','That chorus lost this round.','A new song. Same unqualified critic.','Fine. Let the next beat plead its case.'] },
      pause: { routes: [['Park the soundtrack','listening','attentive','idle']], lines: ['The beat left. My opinions stayed.','A pause. Finally, my best dance move.','Music parked. Sarcasm idling.','The imaginary knees can stop panicking.','Silence gets a brief solo.','No encore. The eyebrows need a break.'] }
    },
    everyday: {
      hello: { routes: [['A warm hello','listening','happy','relaxed'],['A cheeky entrance','peeking','playful','relaxed']], lines: ['Oh, hi. Scooting over for you.','I brought absolutely no elbows.','Made myself comfy down here.','There you are. I saved a spot.'] },
      music: { routes: [['Find the groove','listening','vibing','humming'],['An easy little dance','attentive','humming','vibing'],['A sunny chorus','curious','twinkling','vibing'],['Seated dance','playful','cool','vibing'],['Smile at the melody','peeking','amused','vibing'],['Boneless encore','bashful','silly','vibing'],['A cheeky rhythm','curious','mischievous','vibing'],['Enjoy the tune','attentive','happy','vibing']], lines: FALLBACKS.everyday.music },
      quiet: { routes: [
        ['Face lights up','twinkling','silly','relaxed'],
        ['Tiny side quest','peeking','mischievous','playful'],
        ['A thought tumbles','curious','dizzy','daydreaming'],
        ['Private joke','bashful','laughing','happy'],
        ['Boneless stretch','listening','stretching','relaxed'],
        ['Face improvisation','playful','amused','twinkling']
      ], lines: ['My face wandered off and came back wearing this.','A thought rolled through. Wheee.','Rearranging the internal cushions.','Plot twist: absolutely nothing happened.','I found a spare expression under the sofa.','No reason. Felt right.','Boop. The room needed that.','Keeping the atmosphere pleasantly weird.','My next thought is travelling by cloud.','A harmless scheme. Mostly cushions.','I brought sunshine. No pockets required.','Boneless and surprisingly enthusiastic.','My curiosity took a lap around the room.','Gravity and I are getting along nicely.','A thought bumped into the furniture.','My face tried on a different daydream.','I have a spectacular lack of kneecaps.','Another excellent moment to be squishy.','A spare grin found its way here.','My imagination forgot its shoes.','Keeping this corner comfortably peculiar.','The daydream has excellent legroom.','A little mischief. Very soft edges.','I have misplaced a perfectly good thought.'] },
      search: { routes: [['Rummage for a tune','listening','curious','attentive'],['Consider a tune','curious','pondering','listening']], lines: ['Rummaging through my imaginary record crate.','Finding something for our little corner.','One song-shaped thought, coming up.','Picking the next one…'] },
      skip: { routes: [['Try another','listening','curious','attentive']], lines: ['Okay, let’s try another flavor.','That one can wander off.','Turning a little musical corner.','Back into the record crate.'] },
      pause: { routes: [['Unwind the groove','vibing','listening','relaxed']], lines: ['Parking my imaginary dance shoes.','A little breather between songs.','The imaginary toes can rest.','Saving that wiggle for later.'] }
    }
  };
  function sceneCues(base, value) {
    const mode = normalize(value), overrides = SCENES[mode];
    return Object.fromEntries(Object.entries(base).map(([kind, cue]) => {
      const spec = overrides[kind];
      return [kind, spec ? { ...cue, id: `${mode}:${kind}`, lines: spec.lines,
        ...(kind === 'music' || kind === 'quiet' ? { captionHoldMs: 2200 } : {}),
        ...(kind === 'music' ? { cooldown: 4000 } : {}),
        routes: spec.routes.map(([name, ...states], i) => ({ id: String(i + 1), name, states })) } : cue];
    }));
  }
  function applyMusicIntent(intent, value) {
    const mode = normalize(value);
    if (mode === "everyday") return intent;
    return {
      ...intent,
      activity: "focus",
      energy: Math.min(intent.energy, 0.35),
      timeEnergy: Math.min(intent.timeEnergy, 0.35),
      genrePreferences: [...new Set([
        ...intent.preferredGenres,
        "jazz", "classical", "soul/funk",
        ...intent.genrePreferences
      ])].slice(0, 8)
    };
  }
  function mount(fieldset, name, onChange) {
    if (!fieldset) return;
    for (const mode of Object.values(MODES)) {
      const label = root.document.createElement("label");
      label.className = "doco-mode-option";
      const copy = root.document.createElement("span"), title = root.document.createElement("strong");
      title.textContent = mode.label;
      copy.append(title);
      const subtitle = root.document.createElement("small");
      subtitle.textContent = mode.id === "focus" ? "A little tough love" : "Easygoing company";
      copy.append(subtitle);
      const input = root.document.createElement("input");
      input.type = "radio"; input.name = name; input.value = mode.id; input.checked = mode.id === get();
      input.addEventListener("change", () => { if (input.checked) onChange(set(input.value)); });
      label.append(copy, input); fieldset.append(label);
    }
    root.addEventListener("doco:mode-change", event => {
      fieldset.querySelectorAll("input").forEach(input => { input.checked = input.value === event.detail.mode; });
    });
  }
  root.addEventListener?.("storage", event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    sessionOverride = false;
    const previous = memory, next = get();
    if (previous !== next) notify(next);
  });
  return Object.freeze({ MODES, normalize, policy, get, set, dialogueContext, fallbackLines, sceneCues, applyMusicIntent, mount });
});
