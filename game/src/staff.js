// Sizzle & Serve — the staff: a waiter and a prep cook who work the kitchen.
// One job: draw the two karyawan and decide what each is doing, from the game state.
// They stand on the empty floor at the ends of the plates row — the waiter at
// the right pass, the prep cook at the left — so they never cover the order board,
// the timer, the stations, or a plate, and no click zone lives where they stand.

import { findMatchingPlate } from './state.js';

// The waiter carries a dish off right after a serve; while a plate matches an
// order he waits with his tray up; otherwise he stands by with his tray down.
export function waiterPose(game) {
  if (!game || game.screen !== 'playing') return 'idle';
  if (game.lastServeAt != null && game.elapsed - game.lastServeAt < 2.5) return 'carry';
  if (game.orders && game.orders.some((o) => findMatchingPlate(game, o.recipe))) return 'ready';
  return 'idle';
}

// The prep cook mirrors the busiest prep job: chopping at his table, then
// stirring his bowl while the pot boils; otherwise he holds his bowl and waits.
export function helperPose(game) {
  if (!game || game.screen !== 'playing') return 'idle';
  if (game.board && game.board.chopping) return 'chop';
  if (game.pot && game.pot.cooking && game.pot.item) return 'stir';
  return 'idle';
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draw the waiter standing on the floor at (cx, feetY), about 150*s tall.
// pose: 'idle' | 'ready' | 'carry'. t is seconds (game.elapsed); frozen
// staged shots get a fixed t, so the frame is stable.
export function drawWaiter(ctx, cx, feetY, s, pose, t) {
  const bob = pose === 'idle' ? Math.sin(t * 2) * 2 : 0;
  const lookX = pose === 'idle' ? 0 : -6;
  const lean = pose === 'carry' ? -0.05 : 0;
  ctx.save();
  ctx.translate(cx, feetY);
  ctx.rotate(lean);
  ctx.translate(-cx, -feetY);
  ctx.translate(0, bob);

  // soft shadow
  ctx.fillStyle = 'rgba(34,49,78,0.15)';
  ellipse(ctx, cx, feetY + 2, 42 * s, 7 * s);
  ctx.fill();

  // legs + shoes (staggered when carrying)
  const step = pose === 'carry' ? 8 * s : 0;
  ctx.fillStyle = '#1d2b45';
  roundRect(ctx, cx - 20 * s - step, feetY - 30 * s, 16 * s, 24 * s, 4 * s);
  ctx.fill();
  roundRect(ctx, cx + 4 * s + step, feetY - 30 * s, 16 * s, 24 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#141c2e';
  ellipse(ctx, cx - 12 * s - step, feetY - 3 * s, 12 * s, 5 * s);
  ctx.fill();
  ellipse(ctx, cx + 12 * s + step, feetY - 3 * s, 12 * s, 5 * s);
  ctx.fill();

  // shirt: white trapezoid
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(34,49,78,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 30 * s, feetY - 90 * s);
  ctx.lineTo(cx + 30 * s, feetY - 90 * s);
  ctx.lineTo(cx + 36 * s, feetY - 26 * s);
  ctx.lineTo(cx - 36 * s, feetY - 26 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // long navy apron + gold waistband
  ctx.fillStyle = '#22314e';
  roundRect(ctx, cx - 22 * s, feetY - 70 * s, 44 * s, 44 * s, 6 * s);
  ctx.fill();
  ctx.fillStyle = '#f2a93b';
  ctx.fillRect(cx - 22 * s, feetY - 70 * s, 44 * s, 5 * s);
  // bow tie
  ctx.fillStyle = '#1d2b45';
  ctx.beginPath();
  ctx.moveTo(cx, feetY - 92 * s);
  ctx.lineTo(cx - 9 * s, feetY - 97 * s);
  ctx.lineTo(cx - 9 * s, feetY - 87 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, feetY - 92 * s);
  ctx.lineTo(cx + 9 * s, feetY - 97 * s);
  ctx.lineTo(cx + 9 * s, feetY - 87 * s);
  ctx.closePath();
  ctx.fill();
  circle(ctx, cx, feetY - 92 * s, 3 * s);
  ctx.fill();

  // neck
  ctx.fillStyle = '#e8b98a';
  ctx.fillRect(cx - 7 * s, feetY - 98 * s, 14 * s, 8 * s);

  // head + neat dark hair
  ctx.fillStyle = '#e8b98a';
  circle(ctx, cx, feetY - 116 * s, 22 * s);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath();
  ctx.arc(cx, feetY - 120 * s, 22 * s, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 8 * s, feetY - 132 * s, 12 * s, 6 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // eyes + smile, looking toward the pass
  ctx.fillStyle = '#22314e';
  circle(ctx, cx - 8 * s + lookX * s, feetY - 118 * s, 2.5 * s);
  ctx.fill();
  circle(ctx, cx + 8 * s + lookX * s, feetY - 118 * s, 2.5 * s);
  ctx.fill();
  ctx.strokeStyle = '#22314e';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(cx + lookX * s, feetY - 108 * s, pose === 'carry' ? 9 * s : 6 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  drawWaiterArms(ctx, cx, feetY, s, pose, t);
  ctx.restore();
}

// Arms + the tray in the left hand, per pose. Shoulders sit at the shirt top;
// the hand is a skin circle, the arm a white sleeve line.
function drawWaiterArms(ctx, cx, feetY, s, pose, t) {
  const shoulderL = { x: cx - 28 * s, y: feetY - 86 * s };
  const shoulderR = { x: cx + 28 * s, y: feetY - 86 * s };
  ctx.lineCap = 'round';

  let leftHand;
  let rightHand;
  if (pose === 'carry') {
    leftHand = { x: cx - 46 * s, y: feetY - 136 * s };
    rightHand = { x: cx + 40 * s, y: feetY - 118 * s + Math.sin(t * 6) * 4 * s };
  } else if (pose === 'ready') {
    leftHand = { x: cx - 44 * s, y: feetY - 110 * s };
    rightHand = { x: cx + 38 * s, y: feetY - 52 * s };
  } else {
    leftHand = { x: cx - 38 * s, y: feetY - 56 * s };
    rightHand = { x: cx + 38 * s, y: feetY - 52 * s };
  }

  // sleeves
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10 * s;
  ctx.beginPath();
  ctx.moveTo(shoulderL.x, shoulderL.y);
  ctx.lineTo(leftHand.x, leftHand.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shoulderR.x, shoulderR.y);
  ctx.lineTo(rightHand.x, rightHand.y);
  ctx.stroke();

  // hands
  ctx.fillStyle = '#e8b98a';
  circle(ctx, leftHand.x, leftHand.y, 7 * s);
  ctx.fill();
  circle(ctx, rightHand.x, rightHand.y, 7 * s);
  ctx.fill();

  // the silver tray on the left hand
  ctx.fillStyle = '#c7d0d9';
  ellipse(ctx, leftHand.x, leftHand.y, 30 * s, 7 * s);
  ctx.fill();
  ctx.strokeStyle = '#8a94a0';
  ctx.lineWidth = 1.5;
  ellipse(ctx, leftHand.x, leftHand.y, 30 * s, 7 * s);
  ctx.stroke();
  if (pose === 'carry') {
    // cloche dome on the tray: the dish is on its way out
    ctx.fillStyle = '#dfe5ea';
    ctx.beginPath();
    ctx.arc(leftHand.x, leftHand.y - 2 * s, 16 * s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a94a0';
    ctx.stroke();
    circle(ctx, leftHand.x, leftHand.y - 18 * s, 3 * s);
    ctx.fill();
  } else if (pose === 'ready') {
    // a small empty plate waiting on the tray
    ctx.fillStyle = '#ffffff';
    ellipse(ctx, leftHand.x, leftHand.y - 4 * s, 12 * s, 4 * s);
    ctx.fill();
  }
}

// Draw the prep cook standing on the floor at (cx, feetY), about 140*s tall,
// with his little prep table to his right. pose: 'idle' | 'chop' | 'stir'.
// t is seconds (game.elapsed); frozen staged shots get a fixed t.
export function drawHelper(ctx, cx, feetY, s, pose, t) {
  const bob = pose === 'idle' ? Math.sin(t * 2 + 1) * 2 : 0;
  ctx.save();
  ctx.translate(0, bob);

  // soft shadow
  ctx.fillStyle = 'rgba(34,49,78,0.15)';
  ellipse(ctx, cx, feetY + 2, 40 * s, 7 * s);
  ctx.fill();

  // prep table to his right: wooden top, two legs, board + tomato on top
  const tableX = cx + 34 * s;
  const tableW = 62 * s;
  const tableTop = feetY - 50 * s;
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(tableX + 4 * s, tableTop + 9 * s, 5 * s, feetY - tableTop - 9 * s);
  ctx.fillRect(tableX + tableW - 9 * s, tableTop + 9 * s, 5 * s, feetY - tableTop - 9 * s);
  ctx.fillStyle = '#b07a45';
  roundRect(ctx, tableX, tableTop, tableW, 9 * s, 4 * s);
  ctx.fill();
  // little board with a tomato half on it
  ctx.fillStyle = '#d9a066';
  roundRect(ctx, tableX + 8 * s, tableTop - 8 * s, 46 * s, 8 * s, 3 * s);
  ctx.fill();
  ctx.fillStyle = '#e0392f';
  ctx.beginPath();
  ctx.arc(tableX + 31 * s, tableTop - 10 * s, 8 * s, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3e9b4f';
  ctx.beginPath();
  ctx.moveTo(tableX + 31 * s, tableTop - 18 * s);
  ctx.lineTo(tableX + 27 * s, tableTop - 13 * s);
  ctx.lineTo(tableX + 35 * s, tableTop - 13 * s);
  ctx.closePath();
  ctx.fill();

  // legs + shoes (brown trousers)
  ctx.fillStyle = '#4a3a28';
  roundRect(ctx, cx - 19 * s, feetY - 28 * s, 15 * s, 22 * s, 4 * s);
  ctx.fill();
  roundRect(ctx, cx + 4 * s, feetY - 28 * s, 15 * s, 22 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  ellipse(ctx, cx - 11 * s, feetY - 3 * s, 11 * s, 5 * s);
  ctx.fill();
  ellipse(ctx, cx + 11 * s, feetY - 3 * s, 11 * s, 5 * s);
  ctx.fill();

  // shirt: light green trapezoid
  ctx.fillStyle = '#7fb069';
  ctx.strokeStyle = 'rgba(34,49,78,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 29 * s, feetY - 86 * s);
  ctx.lineTo(cx + 29 * s, feetY - 86 * s);
  ctx.lineTo(cx + 35 * s, feetY - 24 * s);
  ctx.lineTo(cx - 35 * s, feetY - 24 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // green apron + pocket
  ctx.fillStyle = '#4da34d';
  roundRect(ctx, cx - 21 * s, feetY - 66 * s, 42 * s, 40 * s, 6 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,49,78,0.2)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - 13 * s, feetY - 52 * s, 26 * s, 14 * s, 4 * s);
  ctx.stroke();

  // neck
  ctx.fillStyle = '#eec39a';
  ctx.fillRect(cx - 7 * s, feetY - 94 * s, 14 * s, 8 * s);

  // head
  ctx.fillStyle = '#eec39a';
  circle(ctx, cx, feetY - 112 * s, 21 * s);
  ctx.fill();
  // eyes + smile
  ctx.fillStyle = '#22314e';
  circle(ctx, cx - 8 * s, feetY - 114 * s, 2.5 * s);
  ctx.fill();
  circle(ctx, cx + 8 * s, feetY - 114 * s, 2.5 * s);
  ctx.fill();
  ctx.fillStyle = 'rgba(224,57,47,0.35)';
  circle(ctx, cx - 15 * s, feetY - 105 * s, 3.5 * s);
  ctx.fill();
  circle(ctx, cx + 15 * s, feetY - 105 * s, 3.5 * s);
  ctx.fill();
  ctx.strokeStyle = '#22314e';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(cx, feetY - 104 * s, 6 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // green bandana: cap + knot + tails
  ctx.fillStyle = '#2c7a3a';
  ctx.beginPath();
  ctx.arc(cx, feetY - 116 * s, 21 * s, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - 21 * s, feetY - 120 * s, 42 * s, 7 * s);
  circle(ctx, cx + 20 * s, feetY - 122 * s, 5 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 18 * s, feetY - 118 * s);
  ctx.lineTo(cx + 28 * s, feetY - 100 * s);
  ctx.lineTo(cx + 22 * s, feetY - 99 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 22 * s, feetY - 118 * s);
  ctx.lineTo(cx + 32 * s, feetY - 104 * s);
  ctx.lineTo(cx + 26 * s, feetY - 101 * s);
  ctx.closePath();
  ctx.fill();

  drawHelperArms(ctx, cx, feetY, s, pose, t);
  ctx.restore();
}

// Arms: the left arm holds a mixing bowl; the right arm works — chopping
// over the prep table, stirring the bowl, or resting on the table.
function drawHelperArms(ctx, cx, feetY, s, pose, t) {
  const shoulderL = { x: cx - 27 * s, y: feetY - 82 * s };
  const shoulderR = { x: cx + 27 * s, y: feetY - 82 * s };
  ctx.lineCap = 'round';

  // the bowl, held against the body by the left arm
  const bowl = { x: cx - 24 * s, y: feetY - 56 * s };
  const leftHand = { x: bowl.x - 4 * s, y: bowl.y + 2 * s };

  let rightHand;
  if (pose === 'chop') {
    rightHand = { x: cx + 65 * s, y: feetY - 72 * s + Math.sin(t * 10) * 9 * s };
  } else if (pose === 'stir') {
    rightHand = {
      x: bowl.x + Math.cos(t * 5) * 5 * s,
      y: bowl.y + Math.sin(t * 5) * 5 * s,
    };
  } else {
    rightHand = { x: cx + 42 * s, y: feetY - 46 * s }; // resting on the table
  }

  // sleeves
  ctx.strokeStyle = '#7fb069';
  ctx.lineWidth = 10 * s;
  ctx.beginPath();
  ctx.moveTo(shoulderL.x, shoulderL.y);
  ctx.lineTo(leftHand.x, leftHand.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shoulderR.x, shoulderR.y);
  ctx.lineTo(rightHand.x, rightHand.y);
  ctx.stroke();

  // hands
  ctx.fillStyle = '#eec39a';
  circle(ctx, leftHand.x, leftHand.y, 6.5 * s);
  ctx.fill();
  circle(ctx, rightHand.x, rightHand.y, 6.5 * s);
  ctx.fill();

  // the mixing bowl (drawn over the left hand)
  ctx.fillStyle = '#fff6e8';
  ctx.beginPath();
  ctx.arc(bowl.x, bowl.y, 15 * s, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,49,78,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(bowl.x, bowl.y, 15 * s, 0, Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#8fbf7f';
  ctx.beginPath();
  ctx.ellipse(bowl.x, bowl.y - 1 * s, 11 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // the tool in the right hand
  if (pose === 'chop') {
    // small knife, blade pointing down over the board
    ctx.save();
    ctx.translate(rightHand.x + 2 * s, rightHand.y + 4 * s);
    ctx.rotate(0.5);
    ctx.fillStyle = '#8a5a3b';
    roundRect(ctx, -2.5 * s, -12 * s, 5 * s, 10 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = '#c7d0d9';
    roundRect(ctx, -9 * s, -2 * s, 18 * s, 10 * s, 3 * s);
    ctx.fill();
    ctx.restore();
  } else if (pose === 'stir' || pose === 'idle') {
    // wooden spoon
    ctx.save();
    ctx.translate(rightHand.x, rightHand.y);
    ctx.rotate(pose === 'stir' ? -0.4 : 0.25);
    ctx.strokeStyle = '#8a5a3b';
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 18 * s);
    ctx.stroke();
    ctx.fillStyle = '#a06a35';
    ellipse(ctx, 0, 22 * s, 5 * s, 7 * s);
    ctx.fill();
    ctx.restore();
  }
}
