// Sizzle & Serve — the chef: a flat-vector cook who works the kitchen.
// One job: draw the chef and decide what he is doing, from the game state.
// He stands at the pass between the two plates, so he never covers the
// order board, the timer, the stations, or a plate — and no click zone
// lives where he stands, so he never eats a click.

import { findMatchingPlate } from './state.js';

// What the chef is doing right now: chop beats grill beats stir beats serve.
export function chefPose(game) {
  if (!game || game.screen !== 'playing') return 'idle';
  if (game.board && game.board.chopping) return 'chop';
  if (game.grill && game.grill.cooking && game.grill.item) return 'grill';
  if (game.pot && game.pot.cooking && game.pot.item) return 'stir';
  if (game.orders && game.orders.some((o) => findMatchingPlate(game, o.recipe))) return 'serve';
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

// Draw the chef standing on the floor at (cx, feetY), about 160*s tall.
// pose: 'idle' | 'chop' | 'grill' | 'stir' | 'serve' | 'wave'. t is seconds
// (game.elapsed); frozen staged shots get a fixed t, so the frame is stable.
export function drawChef(ctx, cx, feetY, s, pose, t) {
  const bob = pose === 'idle' ? Math.sin(t * 2) * 2 : 0;
  const lookX = pose === 'chop' ? -7 : pose === 'grill' ? -4 : pose === 'stir' ? 6 : pose === 'wave' ? 7 : 0;
  const tilt = pose === 'chop' ? -0.06 : pose === 'stir' ? 0.06 : 0;
  ctx.save();
  ctx.translate(0, bob);

  // soft shadow
  ctx.fillStyle = 'rgba(34,49,78,0.15)';
  ellipse(ctx, cx, feetY + 2, 46 * s, 7 * s);
  ctx.fill();

  // legs + shoes
  ctx.fillStyle = '#22314e';
  roundRect(ctx, cx - 20 * s, feetY - 30 * s, 16 * s, 24 * s, 4 * s);
  ctx.fill();
  roundRect(ctx, cx + 4 * s, feetY - 30 * s, 16 * s, 24 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#141c2e';
  ellipse(ctx, cx - 12 * s, feetY - 3 * s, 12 * s, 5 * s);
  ctx.fill();
  ellipse(ctx, cx + 12 * s, feetY - 3 * s, 12 * s, 5 * s);
  ctx.fill();

  // jacket: white trapezoid, shoulders to hips
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(34,49,78,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 32 * s, feetY - 92 * s);
  ctx.lineTo(cx + 32 * s, feetY - 92 * s);
  ctx.lineTo(cx + 38 * s, feetY - 26 * s);
  ctx.lineTo(cx - 38 * s, feetY - 26 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // apron panel + pocket
  ctx.fillStyle = '#eef2f7';
  roundRect(ctx, cx - 24 * s, feetY - 72 * s, 48 * s, 42 * s, 6 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,49,78,0.2)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - 14 * s, feetY - 56 * s, 28 * s, 16 * s, 4 * s);
  ctx.stroke();
  // jacket buttons
  ctx.fillStyle = '#22314e';
  circle(ctx, cx, feetY - 82 * s, 2.5 * s);
  ctx.fill();
  circle(ctx, cx, feetY - 66 * s, 2.5 * s);
  ctx.fill();

  // neck + red neckerchief
  ctx.fillStyle = '#f2c79b';
  ctx.fillRect(cx - 7 * s, feetY - 98 * s, 14 * s, 8 * s);
  ctx.fillStyle = '#d9382b';
  ctx.beginPath();
  ctx.moveTo(cx - 11 * s, feetY - 96 * s);
  ctx.lineTo(cx + 11 * s, feetY - 96 * s);
  ctx.lineTo(cx, feetY - 80 * s);
  ctx.closePath();
  ctx.fill();

  // head
  ctx.fillStyle = '#f2c79b';
  circle(ctx, cx, feetY - 118 * s, 24 * s);
  ctx.fill();
  // eyes + cheeks + moustache + smile, all shifted toward where he looks
  ctx.fillStyle = '#22314e';
  circle(ctx, cx - 9 * s + lookX * s, feetY - 121 * s, 2.6 * s);
  ctx.fill();
  circle(ctx, cx + 9 * s + lookX * s, feetY - 121 * s, 2.6 * s);
  ctx.fill();
  ctx.fillStyle = 'rgba(224,57,47,0.35)';
  circle(ctx, cx - 16 * s + lookX * s, feetY - 110 * s, 4 * s);
  ctx.fill();
  circle(ctx, cx + 16 * s + lookX * s, feetY - 110 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#4a2c14';
  ellipse(ctx, cx - 6 * s + lookX * s, feetY - 112 * s, 6 * s, 2.6 * s);
  ctx.fill();
  ellipse(ctx, cx + 6 * s + lookX * s, feetY - 112 * s, 6 * s, 2.6 * s);
  ctx.fill();
  ctx.strokeStyle = '#22314e';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(cx + lookX * s, feetY - 108 * s, pose === 'serve' ? 10 * s : 7 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // toque: puffy white hat, tilted a touch toward the work
  ctx.save();
  ctx.translate(cx, feetY - 118 * s);
  ctx.rotate(tilt);
  ctx.translate(-cx, -(feetY - 118 * s));
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(34,49,78,0.2)';
  ctx.lineWidth = 2;
  circle(ctx, cx - 15 * s, feetY - 146 * s, 14 * s);
  ctx.fill();
  ctx.stroke();
  circle(ctx, cx, feetY - 152 * s, 16 * s);
  ctx.fill();
  ctx.stroke();
  circle(ctx, cx + 15 * s, feetY - 146 * s, 14 * s);
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, cx - 25 * s, feetY - 144 * s, 50 * s, 12 * s, 6 * s);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawChefArms(ctx, cx, feetY, s, pose, t);
  ctx.restore();
}

// Arms + the tool in hand, per pose. Shoulders sit at the jacket top;
// the hand is a skin circle, the arm a white sleeve line.
function drawChefArms(ctx, cx, feetY, s, pose, t) {
  const shoulderL = { x: cx - 30 * s, y: feetY - 88 * s };
  const shoulderR = { x: cx + 30 * s, y: feetY - 88 * s };
  ctx.lineCap = 'round';

  // hand targets per pose
  let leftHand;
  let rightHand;
  if (pose === 'serve') {
    const lift = Math.sin(t * 6) * 4 * s;
    leftHand = { x: cx - 44 * s, y: feetY - 128 * s + lift };
    rightHand = { x: cx + 44 * s, y: feetY - 128 * s + lift };
  } else if (pose === 'wave') {
    leftHand = { x: cx - 38 * s, y: feetY - 50 * s };
    rightHand = { x: cx + 40 * s, y: feetY - 132 * s + Math.sin(t * 4) * 6 * s };
  } else if (pose === 'chop') {
    leftHand = { x: cx - 42 * s, y: feetY - 58 * s }; // hand on hip
    rightHand = { x: cx + 36 * s, y: feetY - 118 * s + Math.sin(t * 10) * 10 * s };
  } else if (pose === 'grill') {
    leftHand = { x: cx - 42 * s, y: feetY - 58 * s }; // hand on hip
    rightHand = { x: cx + 44 * s, y: feetY - 72 * s + Math.sin(t * 6) * 8 * s };
  } else if (pose === 'stir') {
    leftHand = { x: cx - 42 * s, y: feetY - 58 * s }; // hand on hip
    rightHand = {
      x: cx + 42 * s + Math.cos(t * 5) * 5 * s,
      y: feetY - 66 * s + Math.sin(t * 5) * 5 * s,
    };
  } else {
    // idle: arms relaxed, wooden spoon in the right hand
    leftHand = { x: cx - 38 * s, y: feetY - 50 * s };
    rightHand = { x: cx + 38 * s, y: feetY - 50 * s };
  }

  // sleeves
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 11 * s;
  ctx.beginPath();
  ctx.moveTo(shoulderL.x, shoulderL.y);
  ctx.lineTo(leftHand.x, leftHand.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shoulderR.x, shoulderR.y);
  ctx.lineTo(rightHand.x, rightHand.y);
  ctx.stroke();

  // hands
  ctx.fillStyle = '#f2c79b';
  circle(ctx, leftHand.x, leftHand.y, 7 * s);
  ctx.fill();
  circle(ctx, rightHand.x, rightHand.y, 7 * s);
  ctx.fill();

  // the tool in the right hand
  if (pose === 'chop') {
    // cleaver, blade pointing down
    ctx.save();
    ctx.translate(rightHand.x + 2 * s, rightHand.y + 4 * s);
    ctx.rotate(0.5);
    ctx.fillStyle = '#8a5a3b';
    roundRect(ctx, -3 * s, -14 * s, 6 * s, 12 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = '#c7d0d9';
    roundRect(ctx, -11 * s, -2 * s, 22 * s, 12 * s, 3 * s);
    ctx.fill();
    ctx.restore();
  } else if (pose === 'grill') {
    // spatula, held flat
    ctx.save();
    ctx.translate(rightHand.x, rightHand.y);
    ctx.fillStyle = '#8a5a3b';
    roundRect(ctx, -4 * s, -2 * s, 8 * s, 18 * s, 3 * s);
    ctx.fill();
    ctx.fillStyle = '#9aa5b1';
    roundRect(ctx, -13 * s, 14 * s, 26 * s, 9 * s, 3 * s);
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
    ctx.lineTo(0, 20 * s);
    ctx.stroke();
    ctx.fillStyle = '#a06a35';
    ellipse(ctx, 0, 24 * s, 6 * s, 8 * s);
    ctx.fill();
    ctx.restore();
  }
}
