// Approved canonical robot language, shared by the app and design gallery.
(function(root) {
  const TOKENS=Object.freeze({eyeWidth:28,eyeHeight:24,separation:49,glow:.9});
  const common={leftWidth:28,rightWidth:28,leftHeight:24,rightHeight:24,leftCurve:0,rightCurve:0,leftTilt:0,rightTilt:0,leftX:0,rightX:0,leftY:0,rightY:0,leftOpen:1,rightOpen:1,separation:49,mouthWidth:0,mouthHeight:2.4,mouthCurve:0,mouthOpen:0,mouthTilt:0,tongue:0,heart:0,ring:0,tear:0,glasses:0,sunglasses:0,headphones:0,crown:0,sparkles:0,eyeR:1,eyeG:1,eyeB:1,accentR:.78,accentG:.92,accentB:1,glow:.9};
  const p=(values={})=>Object.freeze({...common,...values});
  root.DocoGalleryRobotTokens=TOKENS;
  root.DocoGalleryProposals={
    idle:p(), listening:p({leftHeight:25,rightHeight:23}),
    calibrating:p({leftHeight:18,rightHeight:18,leftOpen:.95,rightOpen:.95}),
    "camera-off":p({leftHeight:3,rightHeight:3}),
    attentive:p({leftHeight:27,rightHeight:27,leftY:-1,rightY:-1}),
    happy:p({leftHeight:9,rightHeight:9,leftCurve:-5,rightCurve:-5}),
    amused:p({leftHeight:11,rightHeight:16,leftCurve:-3,rightCurve:-2,mouthWidth:12,mouthCurve:3,mouthTilt:-.06}),
    celebrating:p({leftHeight:6,rightHeight:6,leftCurve:-6,rightCurve:-6,mouthWidth:19,mouthHeight:10,mouthOpen:1}),
    laughing:p({leftHeight:5,rightHeight:5,leftCurve:-6,rightCurve:-6,mouthWidth:22,mouthHeight:13,mouthOpen:1}),
    proud:p({leftHeight:12,rightHeight:12,leftCurve:-3.5,rightCurve:-3.5,leftY:-2,rightY:-2,mouthWidth:12,mouthCurve:3}),
    sleepy:p({leftHeight:3.5,rightHeight:3.5,leftCurve:1.5,rightCurve:1.5,leftY:3,rightY:3}),
    relaxed:p({leftHeight:5,rightHeight:5,leftCurve:2.5,rightCurve:2.5,mouthWidth:14,mouthCurve:4}),
    bored:p({leftHeight:8,rightHeight:8,leftY:2,rightY:2,mouthWidth:12}),
    concerned:p({leftHeight:12,rightHeight:12,leftCurve:3.7,rightCurve:3.7,leftTilt:-.04,rightTilt:.04}),
    crying:p({leftHeight:4,rightHeight:4,leftCurve:4,rightCurve:4,mouthWidth:12,mouthCurve:-4}),
    surprised:p({leftHeight:28,rightHeight:28,leftY:-1,rightY:-1}),
    shocked:p({leftHeight:31,rightHeight:31,mouthWidth:7,mouthHeight:11,mouthOpen:1}),
    scared:p({leftHeight:25,rightHeight:25,leftCurve:2,rightCurve:2,leftTilt:-.12,rightTilt:.12,mouthWidth:10,mouthCurve:-3}),
    angry:p({leftHeight:16,rightHeight:16,leftTilt:.18,rightTilt:-.18,mouthWidth:12,mouthCurve:-3}),
    determined:p({leftHeight:12,rightHeight:12,leftTilt:.08,rightTilt:-.08}),
    suspicious:p({leftHeight:7,rightHeight:10,leftX:-2,rightX:-2,leftTilt:.03,rightTilt:-.04}),
    curious:p({leftHeight:27,rightHeight:22,leftY:-1,rightY:0}),
    confused:p({leftHeight:13,rightHeight:23,leftTilt:.07,rightTilt:-.06,mouthWidth:12}),
    cool:p({leftHeight:16,rightHeight:16,sunglasses:1,mouthWidth:12,mouthCurve:2,mouthTilt:-.05}),
    vibing:p({leftHeight:6,rightHeight:6,leftCurve:-3.5,rightCurve:-3.5,headphones:.85}),
    love:p({leftHeight:25,rightHeight:25,mouthWidth:12,mouthCurve:4}),
    playful:p({leftHeight:5,rightHeight:24,leftOpen:.4,leftCurve:-3,mouthWidth:17,mouthCurve:5}),
    mischievous:p({leftHeight:11,rightHeight:11,leftTilt:.08,rightTilt:-.08,mouthWidth:18,mouthCurve:5,mouthTilt:-.06}),
    bashful:p({leftHeight:10,rightHeight:10,leftCurve:-2,rightCurve:-2,leftY:3,rightY:3,mouthWidth:9,mouthCurve:2}),
    silly:p({leftHeight:24,rightHeight:12,leftTilt:-.05,rightTilt:.05,mouthWidth:15,mouthCurve:4,mouthTilt:.08}),
    dizzy:p({leftHeight:23,rightHeight:23}),
    nerdy:p({leftHeight:23,rightHeight:23,glasses:1,mouthWidth:9,mouthCurve:2}),
    daydreaming:p({leftHeight:17,rightHeight:17,leftY:-2,rightY:-2,mouthWidth:12,mouthCurve:3}),
    peeking:p({leftHeight:13,rightHeight:22,leftOpen:.8,leftX:2,rightX:2,mouthWidth:8,mouthCurve:2}),
    humming:p({leftHeight:5,rightHeight:5,leftCurve:-3,rightCurve:-3,mouthWidth:10,mouthCurve:2}),
    pondering:p({leftHeight:14,rightHeight:14,leftY:-1,rightY:-1}),
    twinkling:p({leftHeight:26,rightHeight:26}),
    stretching:p({leftHeight:4,rightHeight:4,leftCurve:-4.5,rightCurve:-4.5,mouthWidth:7,mouthHeight:9,mouthOpen:1})
  };
  root.DocoGalleryNotes={
    idle:"Neutral eyes · quiet, occasional checks", listening:"Eyes locate the sound · head follows",
    calibrating:"Measured left-to-right scan", "camera-off":"Resting display · no searching gaze",
    attentive:"Eyes open slightly · steady focus", happy:"Soft happy arcs · one small lift",
    amused:"A knowing look · tiny half-smile", celebrating:"Bright cheer · lifted smile-eyes",
    laughing:"Squeezed smile-eyes · measured chuckles", proud:"Small chin lift · hold the satisfaction",
    sleepy:"Slow eyelids · a drowsy head dip", relaxed:"Resting lids · unhurried pause",
    bored:"Half-lids · one sideways check", concerned:"Gentle worried lids · lean closer",
    crying:"Closed worried eyes · a little frown", surprised:"Quick open · a still beat to process",
    shocked:"Larger open · tiny gasp, then hold", scared:"Worried eyes · a small retreat",
    angry:"Soft grumpy slant · compact pout", determined:"Narrow focus · deliberate nod",
    suspicious:"Side-eye first · slow head follow", curious:"One eyelid rises · look, then tilt",
    confused:"Uneven lids · a questioning tilt", cool:"Rounded shades · calm confidence",
    vibing:"Headphones · restrained two-beat sway", love:"Soft heart eyes · a warm hold",
    playful:"Quick wink · friendly tilt", mischievous:"Narrowed grin · a sideways plan",
    bashful:"Look away · tuck down, then peek back", silly:"Wonky lids · a lopsided smile",
    dizzy:"Rounded spirals · tiny slow head turn", nerdy:"Round glasses · an eager little nod",
    daydreaming:"Upward glance · linger in a thought", peeking:"Look sideways · follow, then peek back",
    humming:"Content lids · a small rhythmic smile", pondering:"Look up · pause before returning",
    twinkling:"Puffy light-stars · quiet delight", stretching:"Squeeze lids · slow lift and release"
  };
})(typeof window!=="undefined"?window:globalThis);
