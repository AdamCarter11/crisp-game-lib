(function (exports) {
  'use strict';

  function clamp$1(v, low = 0, high = 1) {
      return Math.max(low, Math.min(v, high));
  }
  function wrap$1(v, low, high) {
      const w = high - low;
      const o = v - low;
      if (o >= 0) {
          return (o % w) + low;
      }
      else {
          let wv = w + (o % w) + low;
          if (wv >= high) {
              wv -= w;
          }
          return wv;
      }
  }
  function isInRange(v, low, high) {
      return low <= v && v < high;
  }
  function range(v) {
      return [...Array(v).keys()];
  }

  function isVectorLike(v) {
      return v.x != null && v.y != null;
  }
  class Vector {
      constructor(x, y) {
          this.x = 0;
          this.y = 0;
          this.set(x, y);
      }
      set(x = 0, y = 0) {
          if (isVectorLike(x)) {
              this.x = x.x;
              this.y = x.y;
              return this;
          }
          this.x = x;
          this.y = y;
          return this;
      }
      add(x, y) {
          if (isVectorLike(x)) {
              this.x += x.x;
              this.y += x.y;
              return this;
          }
          this.x += x;
          this.y += y;
          return this;
      }
      sub(x, y) {
          if (isVectorLike(x)) {
              this.x -= x.x;
              this.y -= x.y;
              return this;
          }
          this.x -= x;
          this.y -= y;
          return this;
      }
      mul(v) {
          this.x *= v;
          this.y *= v;
          return this;
      }
      div(v) {
          this.x /= v;
          this.y /= v;
          return this;
      }
      clamp(xLow, xHigh, yLow, yHigh) {
          this.x = clamp$1(this.x, xLow, xHigh);
          this.y = clamp$1(this.y, yLow, yHigh);
          return this;
      }
      wrap(xLow, xHigh, yLow, yHigh) {
          this.x = wrap$1(this.x, xLow, xHigh);
          this.y = wrap$1(this.y, yLow, yHigh);
          return this;
      }
      addWithAngle(angle, length) {
          this.x += Math.cos(angle) * length;
          this.y += Math.sin(angle) * length;
          return this;
      }
      swapXy() {
          const t = this.x;
          this.x = this.y;
          this.y = t;
          return this;
      }
      normalize() {
          this.div(this.length);
          return this;
      }
      rotate(angle) {
          if (angle === 0) {
              return this;
          }
          const tx = this.x;
          this.x = tx * Math.cos(angle) - this.y * Math.sin(angle);
          this.y = tx * Math.sin(angle) + this.y * Math.cos(angle);
          return this;
      }
      getAngle(to) {
          return to == null
              ? Math.atan2(this.y, this.x)
              : Math.atan2(to.y - this.y, to.x - this.x);
      }
      distanceTo(to) {
          const ox = this.x - to.x;
          const oy = this.y - to.y;
          return Math.sqrt(ox * ox + oy * oy);
      }
      isInRect(x, y, width, height) {
          return isInRange(this.x, x, x + width) && isInRange(this.y, y, y + height);
      }
      equals(other) {
          return this.x === other.x && this.y === other.y;
      }
      floor() {
          this.x = Math.floor(this.x);
          this.y = Math.floor(this.y);
          return this;
      }
      round() {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
      }
      ceil() {
          this.x = Math.ceil(this.x);
          this.y = Math.ceil(this.y);
          return this;
      }
      get length() {
          return Math.sqrt(this.x * this.x + this.y * this.y);
      }
  }

  const size = new Vector();
  let canvas;
  let context;
  let bodyCss;
  const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
  let background = document.createElement("img");
  let captureCanvas;
  let captureContext;
  let viewBackground = "black";
  function init(_size, _bodyBackground, _viewBackground, isCapturing) {
      size.set(_size);
      viewBackground = _viewBackground;
      bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
      document.body.style.cssText = bodyCss;
      canvas = document.createElement("canvas");
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.cssText = canvasCss;
      const cs = 95;
      const cw = size.x >= size.y ? cs : (cs / size.y) * size.x;
      const ch = size.y >= size.x ? cs : (cs / size.x) * size.y;
      canvas.style.width = `${cw}vmin`;
      canvas.style.height = `${ch}vmin`;
      context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      document.body.appendChild(canvas);
      if (isCapturing) {
          captureCanvas = document.createElement("canvas");
          const cw = size.y * 2;
          captureCanvas.width = size.x > cw ? size.x : cw;
          captureCanvas.height = size.y;
          captureContext = captureCanvas.getContext("2d");
          captureContext.fillStyle = _bodyBackground;
          gcc.setOptions({ scale: 2, capturingFps: 60 });
      }
  }
  function clear() {
      context.fillStyle = viewBackground;
      context.fillRect(0, 0, size.x, size.y);
  }
  function capture() {
      captureContext.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      captureContext.drawImage(canvas, (captureCanvas.width - canvas.width) / 2, 0);
      gcc.capture(captureCanvas);
  }

  const textPatterns = [
      // !
      `
  l
  l
  l

  l
`,
      `
 l l
 l l



`,
      `
 l l
lllll
 l l
lllll
 l l
`,
      `
 lll
l l
 lll
  l l
 lll
`,
      `
l   l
l  l
  l
 l  l
l   l
`,
      `
 l
l l
 ll l
l  l
 ll l
`,
      `
  l
  l



`,
      `
   l
  l
  l
  l
   l
`,
      `
 l
  l
  l
  l
 l
`,
      `
  l
l l l
 lll
l l l
  l
`,
      `
  l
  l
lllll
  l
  l
`,
      `



  l
 l
`,
      `


lllll


`,
      `




  l
`,
      `
    l
   l
  l
 l
l
`,
      // 0
      `
 lll
l  ll
l l l
ll  l
 lll
`,
      `
 ll
l l
  l
  l
lllll
`,
      `
 lll
l   l
  ll
 l
lllll
`,
      `
 lll
l   l
  ll
l   l
 lll
`,
      `
  ll
 l l
l  l
lllll
   l
`,
      `
lllll
l
llll
    l
llll
`,
      `
 lll
l
llll
l   l
 lll
`,
      `
lllll
l   l
   l
  l
 l
`,
      `
 lll
l   l
 lll
l   l
 lll
`,
      `
 lll
l   l
 llll
    l
 lll
`,
      // :
      `

  l

  l

`,
      `

  l

  l
 l
`,
      `
   ll
 ll
l
 ll
   ll
`,
      `

lllll

lllll

`,
      `
ll
  ll
    l
  ll
ll
`,
      `
 lll
l   l
  ll

  l
`,
      `
 lll
l   l
l lll
l
 lll
`,
      // A
      `
 lll
l   l
lllll
l   l
l   l
`,
      `
llll
l   l
llll
l   l
llll
`,
      `
 lll
l   l
l
l   l
 lll
`,
      `
llll
l   l
l   l
l   l
llll
`,
      `
lllll
l
llll
l
lllll
`,
      `
lllll
l
llll
l
l
`,
      `
 lll
l
l  ll
l   l
 llll
`,
      `
l   l
l   l
lllll
l   l
l   l
`,
      `
lllll
  l
  l
  l
lllll
`,
      `
 llll
   l
   l
l  l
 ll
`,
      `
l   l
l  l
lll
l  l
l   l
`,
      `
l
l
l
l
lllll
`,
      `
l   l
ll ll
l l l
l   l
l   l
`,
      `
l   l
ll  l
l l l
l  ll
l   l
`,
      `
 lll
l   l
l   l
l   l
 lll
`,
      `
llll
l   l
llll
l
l
`,
      `
 lll
l   l
l   l
l  ll
 llll
`,
      `
llll
l   l
llll
l   l
l   l
`,
      `
 llll
l
 lll
    l
llll
`,
      `
lllll
  l
  l
  l
  l
`,
      `
l   l
l   l
l   l
l   l
 lll
`,
      `
l   l
l   l
 l l
 l l
  l
`,
      `
l   l
l   l
l l l
l l l
 l l
`,
      `
l   l
 l l
  l
 l l
l   l
`,
      `
l   l
 l l
  l
  l
  l
`,
      `
lllll
   l
  l
 l
lllll
`,
      `
  ll
  l
  l
  l
  ll
`,
      `
l
 l
  l
   l
    l
`,
      `
 ll
  l
  l
  l
 ll
`,
      `
  l
 l l



`,
      `




lllll
`,
      `
 l
  l



`,
      // a
      `
 ll
   l
 lll
l  l
 ll
`,
      `
l
l
lll
l  l
lll
`,
      `

 ll
l  
l
 ll
`,
      `
   l
   l
 lll
l  l
 lll
`,
      `
 ll
l  l
lll
l
 ll
`,
      `
   l
  l 
 lll
  l
  l
`,
      `
 lll
l  l
 lll
   l
 ll
`,
      `
l
l
lll
l  l
l  l
`,
      `
  l

  l
  l
  l
`,
      `
   l

   l
   l
 ll
`,
      `
l
l
l l
ll
l l
`,
      `
 ll
  l
  l
  l
 lll
`,
      `

ll l
l l l
l l l
l l l
`,
      `

l ll
ll  l
l   l
l   l
`,
      `

 ll
l  l
l  l
 ll
`,
      `

lll
l  l
lll
l
`,
      `

 lll
l  l
 lll
   l
`,
      `

l ll
ll
l
l
`,
      `
 ll
l
 ll  
   l
 ll
`,
      `
 l
lll
 l
 l
  l
`,
      `

l  l
l  l
l  l
 ll
`,
      `

l  l
l  l
 ll
 ll
`,
      `

l l l
l l l
l l l
 l l
`,
      `

l  l
 ll
 ll
l  l
`,
      `

l  l
 ll
 l
l
`,
      `

llll
  l
 l
llll
`,
      //{
      `
  ll
  l
 l
  l
  ll
`,
      `
  l
  l
  l
  l
  l
`,
      `
 ll
  l
   l
  l
 ll
`,
      `

 l
l l l
   l

`
  ];

  let rgbObjects;
  const colors = [
      "transparent",
      "black",
      "red",
      "green",
      "yellow",
      "blue",
      "purple",
      "cyan",
      "white",
      "dark_red",
      "dark_green",
      "dark_yellow",
      "dark_blue",
      "dark_purple",
      "dark_cyan",
      "dark_white"
  ];
  let currentColor;
  const colorChars = "tlrgybpcwRGYBPCW";
  const rgbNumbers = [
      undefined,
      0x616161,
      0xe91e63,
      0x4caf50,
      0xffeb3b,
      0x3f51b5,
      0x9c27b0,
      0x03a9f4,
      0xeeeeee
  ];
  function init$1() {
      rgbObjects = [];
      rgbNumbers.forEach(n => {
          rgbObjects.push({
              r: (n & 0xff0000) >> 16,
              g: (n & 0xff00) >> 8,
              b: n & 0xff
          });
      });
      rgbNumbers.forEach((n, i) => {
          if (i < 2) {
              return;
          }
          rgbObjects.push({
              r: Math.floor((n & 0xff0000) * 0.5) >> 16,
              g: Math.floor((n & 0xff00) * 0.5) >> 8,
              b: Math.floor((n & 0xff) * 0.5)
          });
      });
  }
  function setColor(colorName, isSettingCurrent = true, context$1) {
      if (isSettingCurrent) {
          currentColor = colorName;
      }
      const c = rgbObjects[colors.indexOf(colorName)];
      (context$1 != null
          ? context$1
          : context).fillStyle = `rgb(${c.r},${c.g},${c.b})`;
  }

  let hitBoxes;
  let tmpHitBoxes;
  function clear$1() {
      hitBoxes = [];
      tmpHitBoxes = [];
  }
  function concatTmpHitBoxes() {
      hitBoxes = hitBoxes.concat(tmpHitBoxes);
      tmpHitBoxes = [];
  }
  function checkHitBoxes(box) {
      const collision = { rect: {}, text: {}, char: {} };
      hitBoxes.forEach(r => {
          if (testCollision(box, r)) {
              Object.assign(collision, r.collision);
          }
      });
      return collision;
  }
  function testCollision(r1, r2) {
      const ox = r2.pos.x - r1.pos.x;
      const oy = r2.pos.y - r1.pos.y;
      return -r2.size.x < ox && ox < r1.size.x && -r2.size.y < oy && oy < r1.size.y;
  }

  function text(str, x, y, options) {
      return letters(false, str, x, y, options);
  }
  function char(str, x, y, options) {
      return letters(true, str, x, y, options);
  }
  function letters(isCharacter, str, x, y, options) {
      if (typeof x === "number") {
          if (typeof y === "number") {
              return print(str, x - letterSize / 2, y - letterSize / 2, Object.assign({ isCharacter, isCheckCollision: true, color: currentColor }, options));
          }
          else {
              throw "invalid params";
          }
      }
      else {
          return print(str, x.x - letterSize / 2, x.y - letterSize / 2, Object.assign({ isCharacter, isCheckCollision: true, color: currentColor }, y));
      }
  }
  const dotCount = 6;
  const dotSize = 1;
  const letterSize = dotCount * dotSize;
  let textImages;
  let characterImages;
  let cachedImages;
  let isCacheEnabled = false;
  let letterCanvas;
  let letterContext;
  const defaultOptions = {
      color: "black",
      backgroundColor: "transparent",
      rotation: 0,
      mirror: { x: 1, y: 1 },
      scale: { x: 1, y: 1 },
      isCharacter: false,
      isCheckCollision: false
  };
  function init$2() {
      letterCanvas = document.createElement("canvas");
      letterCanvas.width = letterCanvas.height = letterSize;
      letterContext = letterCanvas.getContext("2d");
      textImages = textPatterns.map((lp, i) => {
          return {
              image: createLetterImages(lp),
              hitBox: getHitBox(String.fromCharCode(0x21 + i), false)
          };
      });
      characterImages = range(64).map(() => undefined);
      cachedImages = {};
  }
  function defineCharacters(pattern, startLetter) {
      const index = startLetter.charCodeAt(0) - 0x21;
      pattern.forEach((lp, i) => {
          characterImages[index + i] = {
              image: createLetterImages(lp),
              hitBox: getHitBox(String.fromCharCode(0x21 + index + i), true)
          };
      });
  }
  function enableCache() {
      isCacheEnabled = true;
  }
  function print(_str, x, y, _options = {}) {
      const options = Object.assign(Object.assign({}, defaultOptions), _options);
      const bx = Math.floor(x);
      let str = _str;
      let px = bx;
      let py = Math.floor(y);
      let collision = { text: {}, char: {} };
      for (let i = 0; i < str.length; i++) {
          const c = str[i];
          if (c === "\n") {
              px = bx;
              py += letterSize * options.scale.y;
              continue;
          }
          Object.assign(collision, printChar(c, px, py, options));
          px += letterSize * options.scale.x;
      }
      return collision;
  }
  function printChar(c, x, y, _options) {
      const cca = c.charCodeAt(0);
      if (cca < 0x20 || cca > 0x7e) {
          return;
      }
      const options = Object.assign(Object.assign({}, defaultOptions), _options);
      if (options.backgroundColor !== "transparent") {
          setColor(options.backgroundColor, false);
          context.fillRect(x, y, letterSize * options.scale.x, letterSize * options.scale.y);
      }
      if (cca <= 0x20 || options.color === "transparent") {
          return;
      }
      const cc = cca - 0x21;
      const li = options.isCharacter ? characterImages[cc] : textImages[cc];
      const rotation = wrap(options.rotation, 0, 4);
      if (options.color === "black" &&
          rotation === 0 &&
          options.mirror.x === 1 &&
          options.mirror.y === 1) {
          return drawLetterImage(li, x, y, options.scale, options.isCheckCollision);
      }
      const cacheIndex = JSON.stringify({ c, options });
      const ci = cachedImages[cacheIndex];
      if (ci != null) {
          return drawLetterImage(ci, x, y, options.scale, options.isCheckCollision);
      }
      letterContext.clearRect(0, 0, letterSize, letterSize);
      if (rotation === 0 && options.mirror.x === 1 && options.mirror.y === 1) {
          letterContext.drawImage(li.image, 0, 0);
      }
      else {
          letterContext.save();
          letterContext.translate(letterSize / 2, letterSize / 2);
          letterContext.rotate((Math.PI / 2) * rotation);
          if (options.mirror.x === -1 || options.mirror.y === -1) {
              letterContext.scale(options.mirror.x, options.mirror.y);
          }
          letterContext.drawImage(li.image, -letterSize / 2, -letterSize / 2);
          letterContext.restore();
      }
      if (options.color !== "black") {
          letterContext.globalCompositeOperation = "source-in";
          setColor(options.color, true, letterContext);
          letterContext.fillRect(0, 0, letterSize, letterSize);
          letterContext.globalCompositeOperation = "source-over";
      }
      const hitBox = getHitBox(c, options.isCharacter);
      if (isCacheEnabled) {
          const cachedImage = document.createElement("img");
          cachedImage.src = letterCanvas.toDataURL();
          cachedImages[cacheIndex] = {
              image: cachedImage,
              hitBox
          };
      }
      return drawLetterImage({ image: letterCanvas, hitBox }, x, y, options.scale, options.isCheckCollision);
  }
  function drawLetterImage(li, x, y, scale, isCheckCollision) {
      if (scale.x === 1 && scale.y === 1) {
          context.drawImage(li.image, x, y);
      }
      else {
          context.drawImage(li.image, x, y, letterSize * scale.x, letterSize * scale.x);
      }
      if (!isCheckCollision) {
          return;
      }
      const hitBox = {
          pos: { x: x + li.hitBox.pos.x, y: y + li.hitBox.pos.y },
          size: { x: li.hitBox.size.x * scale.x, y: li.hitBox.size.y * scale.y },
          collision: li.hitBox.collision
      };
      const collision = checkHitBoxes(hitBox);
      hitBoxes.push(hitBox);
      return collision;
  }
  function createLetterImages(pattern, isSkippingFirstAndLastLine = true) {
      letterContext.clearRect(0, 0, letterSize, letterSize);
      let p = pattern.split("\n");
      if (isSkippingFirstAndLastLine) {
          p = p.slice(1, p.length - 1);
      }
      let pw = 0;
      p.forEach(l => {
          pw = Math.max(l.length, pw);
      });
      const xPadding = Math.max(Math.ceil((dotCount - pw) / 2), 0);
      const ph = p.length;
      const yPadding = Math.max(Math.ceil((dotCount - ph) / 2), 0);
      p.forEach((l, y) => {
          if (y + yPadding >= dotCount) {
              return;
          }
          for (let x = 0; x < dotCount - xPadding; x++) {
              const c = l.charAt(x);
              let ci = colorChars.indexOf(c);
              if (c !== "" && ci >= 1) {
                  const rgb = rgbObjects[ci];
                  letterContext.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
                  letterContext.fillRect((x + xPadding) * dotSize, (y + yPadding) * dotSize, dotSize, dotSize);
              }
          }
      });
      const img = document.createElement("img");
      img.src = letterCanvas.toDataURL();
      return img;
  }
  function getHitBox(c, isCharacter) {
      const b = {
          pos: new Vector(letterSize, letterSize),
          size: new Vector(),
          collision: { char: {}, text: {} }
      };
      if (isCharacter) {
          b.collision.char[c] = true;
      }
      else {
          b.collision.text[c] = true;
      }
      const d = letterContext.getImageData(0, 0, letterSize, letterSize).data;
      let i = 0;
      for (let y = 0; y < letterSize; y++) {
          for (let x = 0; x < letterSize; x++) {
              if (d[i + 3] > 0) {
                  if (x < b.pos.x) {
                      b.pos.x = x;
                  }
                  if (y < b.pos.y) {
                      b.pos.y = y;
                  }
                  if (x > b.pos.x + b.size.x - 1) {
                      b.size.x = x - b.pos.x + 1;
                  }
                  if (y > b.pos.y + b.size.y - 1) {
                      b.size.y = y - b.pos.y + 1;
                  }
              }
              i += 4;
          }
      }
      return b;
  }

  let isPressed = false;
  let isJustPressed = false;
  let isJustReleased = false;
  const defaultOptions$1 = {
      onKeyDown: undefined
  };
  let options$1;
  let isKeyPressing = false;
  let isKeyPressed = false;
  let isKeyReleased = false;
  function init$3(_options) {
      options$1 = Object.assign(Object.assign({}, defaultOptions$1), _options);
      document.addEventListener("keydown", e => {
          isKeyPressing = isKeyPressed = true;
          if (options$1.onKeyDown != null) {
              options$1.onKeyDown();
          }
      });
      document.addEventListener("keyup", e => {
          isKeyPressing = false;
          isKeyReleased = true;
      });
  }
  function update$1() {
      isJustPressed = !isPressed && isKeyPressed;
      isJustReleased = isPressed && isKeyReleased;
      isKeyPressed = isKeyReleased = false;
      isPressed = isKeyPressing;
  }
  function clearJustPressed() {
      isJustPressed = false;
      isPressed = true;
  }

  class Random {
      constructor(seed = null) {
          this.setSeed(seed);
      }
      get(lowOrHigh = 1, high) {
          if (high == null) {
              high = lowOrHigh;
              lowOrHigh = 0;
          }
          return (this.next() / 0xffffffff) * (high - lowOrHigh) + lowOrHigh;
      }
      getInt(lowOrHigh, high) {
          if (high == null) {
              high = lowOrHigh;
              lowOrHigh = 0;
          }
          return (this.next() % (high - lowOrHigh)) + lowOrHigh;
      }
      getPlusOrMinus() {
          return this.getInt(2) * 2 - 1;
      }
      select(values) {
          return values[this.getInt(values.length)];
      }
      setSeed(w, x = 123456789, y = 362436069, z = 521288629, loopCount = 32) {
          this.w = w != null ? w >>> 0 : Math.floor(Math.random() * 0xffffffff) >>> 0;
          this.x = x >>> 0;
          this.y = y >>> 0;
          this.z = z >>> 0;
          for (let i = 0; i < loopCount; i++) {
              this.next();
          }
          return this;
      }
      next() {
          const t = this.x ^ (this.x << 11);
          this.x = this.y;
          this.y = this.z;
          this.z = this.w;
          this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
          return this.w;
      }
  }

  const pos = new Vector();
  let isPressed$1 = false;
  let isJustPressed$1 = false;
  let isJustReleased$1 = false;
  let defaultOptions$2 = {
      isDebugMode: false,
      anchor: new Vector(),
      padding: new Vector(),
      onPointerDownOrUp: undefined
  };
  let screen;
  let pixelSize;
  let options$2;
  const debugRandom = new Random();
  const debugPos = new Vector();
  const debugMoveVel = new Vector();
  let debugIsDown = false;
  let cursorPos = new Vector(-9999, -9999);
  let isDown = false;
  let isClicked = false;
  let isReleased = false;
  function init$4(_screen, _pixelSize, _options) {
      options$2 = Object.assign(Object.assign({}, defaultOptions$2), _options);
      screen = _screen;
      pixelSize = new Vector(_pixelSize.x + options$2.padding.x * 2, _pixelSize.y + options$2.padding.y * 2);
      if (options$2.isDebugMode) {
          debugPos.set(pixelSize.x / 2, pixelSize.y / 2);
      }
      document.addEventListener("mousedown", e => {
          onDown(e.pageX, e.pageY);
      });
      document.addEventListener("touchstart", e => {
          onDown(e.touches[0].pageX, e.touches[0].pageY);
      });
      document.addEventListener("mousemove", e => {
          onMove(e.pageX, e.pageY);
      });
      document.addEventListener("touchmove", e => {
          e.preventDefault();
          onMove(e.touches[0].pageX, e.touches[0].pageY);
      }, { passive: false });
      document.addEventListener("mouseup", e => {
          onUp();
      });
      document.addEventListener("touchend", e => {
          e.preventDefault();
          e.target.click();
          onUp();
      }, { passive: false });
  }
  function update$2() {
      calcPointerPos(cursorPos.x, cursorPos.y, pos);
      if (options$2.isDebugMode && !pos.isInRect(0, 0, pixelSize.x, pixelSize.y)) {
          updateDebug();
          pos.set(debugPos);
          isJustPressed$1 = !isPressed$1 && debugIsDown;
          isJustReleased$1 = isPressed$1 && !debugIsDown;
          isPressed$1 = debugIsDown;
      }
      else {
          isJustPressed$1 = !isPressed$1 && isClicked;
          isJustReleased$1 = isPressed$1 && isReleased;
          isPressed$1 = isDown;
      }
      isClicked = isReleased = false;
  }
  function clearJustPressed$1() {
      isJustPressed$1 = false;
      isPressed$1 = true;
  }
  function calcPointerPos(x, y, v) {
      if (screen == null) {
          return;
      }
      v.x =
          ((x - screen.offsetLeft) / screen.clientWidth + options$2.anchor.x) *
              pixelSize.x -
              options$2.padding.x;
      v.y =
          ((y - screen.offsetTop) / screen.clientHeight + options$2.anchor.y) *
              pixelSize.y -
              options$2.padding.y;
  }
  function updateDebug() {
      if (debugMoveVel.length > 0) {
          debugPos.add(debugMoveVel);
          if (!isInRange(debugPos.x, -pixelSize.x * 0.1, pixelSize.x * 1.1) &&
              debugPos.x * debugMoveVel.x > 0) {
              debugMoveVel.x *= -1;
          }
          if (!isInRange(debugPos.y, -pixelSize.y * 0.1, pixelSize.y * 1.1) &&
              debugPos.y * debugMoveVel.y > 0) {
              debugMoveVel.y *= -1;
          }
          if (debugRandom.get() < 0.05) {
              debugMoveVel.set(0);
          }
      }
      else {
          if (debugRandom.get() < 0.1) {
              debugMoveVel.set(0);
              debugMoveVel.addWithAngle(debugRandom.get(Math.PI * 2), (pixelSize.x + pixelSize.y) * debugRandom.get(0.01, 0.03));
          }
      }
      if (debugRandom.get() < 0.05) {
          debugIsDown = !debugIsDown;
      }
  }
  function onDown(x, y) {
      cursorPos.set(x, y);
      isDown = isClicked = true;
      if (options$2.onPointerDownOrUp != null) {
          options$2.onPointerDownOrUp();
      }
  }
  function onMove(x, y) {
      cursorPos.set(x, y);
  }
  function onUp(e) {
      isDown = false;
      isReleased = true;
      if (options$2.onPointerDownOrUp != null) {
          options$2.onPointerDownOrUp();
      }
  }

  let pos$1 = new Vector();
  let isPressed$2 = false;
  let isJustPressed$2 = false;
  let isJustReleased$2 = false;
  function init$5() {
      init$3({
          onKeyDown: sss.playEmpty
      });
      init$4(canvas, size, {
          onPointerDownOrUp: sss.playEmpty,
          anchor: new Vector(0.5, 0.5)
      });
  }
  function update$3() {
      update$1();
      update$2();
      pos$1 = pos;
      isPressed$2 = isPressed || isPressed$1;
      isJustPressed$2 = isJustPressed || isJustPressed$1;
      isJustReleased$2 = isJustReleased || isJustReleased$1;
  }
  function clearJustPressed$2() {
      clearJustPressed();
      clearJustPressed$1();
  }

  var input = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get pos () { return pos$1; },
    get isPressed () { return isPressed$2; },
    get isJustPressed () { return isJustPressed$2; },
    get isJustReleased () { return isJustReleased$2; },
    init: init$5,
    update: update$3,
    clearJustPressed: clearJustPressed$2
  });

  let lastFrameTime = 0;
  let _init;
  let _update;
  const defaultOptions$3 = {
      viewSize: { x: 126, y: 126 },
      bodyBackground: "#111",
      viewBackground: "black",
      isUsingVirtualPad: true,
      isFourWaysStick: false,
      isCapturing: false
  };
  let options$3;
  let textCacheEnableTicks = 10;
  function init$6(__init, __update, _options) {
      _init = __init;
      _update = __update;
      options$3 = Object.assign(Object.assign({}, defaultOptions$3), _options);
      init(options$3.viewSize, options$3.bodyBackground, options$3.viewBackground, options$3.isCapturing);
      init$5();
      init$2();
      _init();
      update$4();
  }
  function update$4() {
      requestAnimationFrame(update$4);
      const now = window.performance.now();
      const timeSinceLast = now - lastFrameTime;
      if (timeSinceLast < 1000 / 60 - 5) {
          return;
      }
      lastFrameTime = now;
      sss.update();
      update$3();
      _update();
      if (options$3.isCapturing) {
          capture();
      }
      textCacheEnableTicks--;
      if (textCacheEnableTicks === 0) {
          enableCache();
      }
  }

  class Terminal {
      constructor(_size) {
          this.size = new Vector();
          this.size.set(_size);
          this.letterGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.colorGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.backgroundColorGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.rotationGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
          this.characterGrid = range(this.size.x).map(() => range(this.size.y).map(() => undefined));
      }
      print(str, _x, _y, _options = {}) {
          const options = Object.assign(Object.assign({}, defaultOptions), _options);
          let x = Math.floor(_x);
          let y = Math.floor(_y);
          const bx = x;
          for (let i = 0; i < str.length; i++) {
              const c = str[i];
              if (c === "\n") {
                  x = bx;
                  y++;
                  continue;
              }
              if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
                  x++;
                  continue;
              }
              this.letterGrid[x][y] = c;
              this.colorGrid[x][y] = options.color;
              this.backgroundColorGrid[x][y] = options.backgroundColor;
              this.rotationGrid[x][y] = options.rotation;
              this.characterGrid[x][y] = options.isCharacter;
              x++;
          }
      }
      getCharAt(_x, _y) {
          if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
              return undefined;
          }
          const x = Math.floor(_x);
          const y = Math.floor(_y);
          const char = this.letterGrid[x][y];
          const cg = this.colorGrid[x][y];
          const bg = this.backgroundColorGrid[x][y];
          const rg = this.rotationGrid[x][y];
          const hg = this.characterGrid[x][y];
          return {
              char,
              options: { color: cg, backgroundColor: bg, rotation: rg, isCharacter: hg }
          };
      }
      setCharAt(_x, _y, char, _options) {
          if (_x < 0 || _x >= this.size.x || _y < 0 || _y >= this.size.y) {
              return;
          }
          const options = Object.assign(Object.assign({}, defaultOptions), _options);
          const x = Math.floor(_x);
          const y = Math.floor(_y);
          this.letterGrid[x][y] = char;
          this.colorGrid[x][y] = options.color;
          this.backgroundColorGrid[x][y] = options.backgroundColor;
          this.rotationGrid[x][y] = options.rotation;
          this.characterGrid[x][y] = options.isCharacter;
      }
      draw() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 0; y < this.size.y; y++) {
                  const c = this.letterGrid[x][y];
                  if (c == null) {
                      continue;
                  }
                  const cg = this.colorGrid[x][y];
                  const bg = this.backgroundColorGrid[x][y];
                  const rg = this.rotationGrid[x][y];
                  const hg = this.characterGrid[x][y];
                  printChar(c, x * letterSize, y * letterSize, {
                      color: cg,
                      backgroundColor: bg,
                      rotation: rg,
                      isCharacter: hg
                  });
              }
          }
      }
      clear() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 0; y < this.size.y; y++) {
                  this.letterGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = this.characterGrid[x][y] = undefined;
              }
          }
      }
      scrollUp() {
          for (let x = 0; x < this.size.x; x++) {
              for (let y = 1; y < this.size.y; y++) {
                  this.letterGrid[x][y - 1] = this.letterGrid[x][y];
                  this.colorGrid[x][y - 1] = this.colorGrid[x][y];
                  this.backgroundColorGrid[x][y - 1] = this.backgroundColorGrid[x][y];
                  this.rotationGrid[x][y - 1] = this.rotationGrid[x][y];
                  this.characterGrid[x][y - 1] = this.characterGrid[x][y];
              }
          }
          const y = this.size.y - 1;
          for (let x = 0; x < this.size.x; x++) {
              this.letterGrid[x][y] = this.colorGrid[x][y] = this.backgroundColorGrid[x][y] = this.rotationGrid[x][y] = this.characterGrid[x][y] = undefined;
          }
      }
      getState() {
          return {
              charGrid: this.letterGrid.map(l => [].concat(l)),
              colorGrid: this.colorGrid.map(l => [].concat(l)),
              backgroundColorGrid: this.backgroundColorGrid.map(l => [].concat(l)),
              rotationGrid: this.rotationGrid.map(l => [].concat(l)),
              symbolGrid: this.characterGrid.map(l => [].concat(l))
          };
      }
      setState(state) {
          this.letterGrid = state.charGrid.map(l => [].concat(l));
          this.colorGrid = state.colorGrid.map(l => [].concat(l));
          this.backgroundColorGrid = state.backgroundColorGrid.map(l => [].concat(l));
          this.rotationGrid = state.rotationGrid.map(l => [].concat(l));
          this.characterGrid = state.symbolGrid.map(l => [].concat(l));
      }
  }

  function rect(x, y, width, height) {
      return drawRect(false, x, y, width, height);
  }
  function box(x, y, width, height) {
      return drawRect(true, x, y, width, height);
  }
  function bar(x, y, length, thickness, rotate = 0.5, centerPosRatio = 0.5) {
      if (typeof x !== "number") {
          centerPosRatio = rotate;
          rotate = thickness;
          thickness = length;
          length = y;
          y = x.y;
          x = x.x;
      }
      const l = new Vector(length).rotate(rotate);
      const p = new Vector(x - l.x * centerPosRatio, y - l.y * centerPosRatio);
      return drawLine(p, l, thickness);
  }
  function line(x1, y1, x2 = 3, y2 = 3, thickness = 3) {
      const p = new Vector();
      const p2 = new Vector();
      if (typeof x1 === "number") {
          if (typeof y1 === "number") {
              if (typeof x2 === "number") {
                  p.set(x1, y1);
                  p2.set(x2, y2);
              }
              else {
                  p.set(x1, y1);
                  p2.set(x2);
                  thickness = y1;
              }
          }
          else {
              throw "invalid params";
          }
      }
      else {
          if (typeof y1 === "number") {
              if (typeof x2 === "number") {
                  p.set(x1);
                  p2.set(y1, x2);
                  thickness = y2;
              }
              else {
                  throw "invalid params";
              }
          }
          else {
              if (typeof x2 === "number") {
                  p.set(x1);
                  p2.set(y1);
                  thickness = x2;
              }
              else {
                  throw "invalid params";
              }
          }
      }
      return drawLine(p, p2.sub(p), thickness);
  }
  function drawRect(isAlignCenter, x, y, width, height) {
      if (typeof x === "number") {
          if (typeof y === "number") {
              if (typeof width === "number") {
                  return addRect(isAlignCenter, x, y, width, height);
              }
              else {
                  return addRect(isAlignCenter, x, y, width.x, width.y);
              }
          }
          else {
              throw "invalid params";
          }
      }
      else {
          if (typeof y === "number") {
              if (typeof width === "number") {
                  return addRect(isAlignCenter, x.x, x.y, y, width);
              }
              else {
                  throw "invalid params";
              }
          }
          else {
              return addRect(isAlignCenter, x.x, x.y, y.x, y.y);
          }
      }
  }
  function drawLine(p, l, thickness) {
      const t = Math.floor(clamp(thickness, 3, 10));
      const lx = Math.abs(l.x);
      const ly = Math.abs(l.y);
      const rn = clamp(Math.ceil(lx > ly ? lx / t : ly / t) + 1, 3, 99);
      l.div(rn - 1);
      let collision = { rect: {} };
      for (let i = 0; i < rn; i++) {
          collision = Object.assign(collision, addRect(true, p.x, p.y, thickness, thickness, true));
          p.add(l);
      }
      concatTmpHitBoxes();
      return collision;
  }
  function addRect(isAlignCenter, x, y, width, height, isAddingToTmp = false) {
      let pos = isAlignCenter
          ? { x: Math.floor(x - width / 2), y: Math.floor(y - height / 2) }
          : { x: Math.floor(x), y: Math.floor(y) };
      const size = { x: Math.floor(width), y: Math.floor(height) };
      let box = { pos, size, collision: { rect: {} } };
      box.collision.rect[currentColor] = true;
      const collision = checkHitBoxes(box);
      if (currentColor !== "transparent") {
          (isAddingToTmp ? tmpHitBoxes : hitBoxes).push(box);
          context.fillRect(pos.x, pos.y, size.x, size.y);
      }
      return collision;
  }

  const PI = Math.PI;
  const abs = Math.abs;
  const sin = Math.sin;
  const cos = Math.cos;
  const atan2 = Math.atan2;
  const sqrt = Math.sqrt;
  const pow = Math.pow;
  const floor = Math.floor;
  const round = Math.round;
  const ceil = Math.ceil;
  exports.ticks = 0;
  exports.score = 0;
  let random = new Random();
  function end() {
      initGameOver();
  }
  function color(colorName) {
      setColor(colorName);
  }
  function vec(x, y) {
      return new Vector(x, y);
  }
  function play(type) {
      sss.play(soundEffectTypeToString[type]);
  }
  const soundEffectTypeToString = {
      coin: "c",
      laser: "l",
      explosion: "e",
      powerUp: "p",
      hit: "h",
      jump: "j",
      select: "s",
      lucky: "u"
  };
  const defaultOptions$4 = {
      seed: 0,
      isCapturing: false,
      viewSize: { x: 100, y: 100 },
      isPlayingBgm: false
  };
  let state;
  let updateFunc = {
      title: updateTitle,
      inGame: updateInGame,
      gameOver: updateGameOver
  };
  let terminal;
  let hiScore = 0;
  let isNoTitle = true;
  let seed = 0;
  let loopOptions;
  let terminalSize;
  let isPlayingBgm;
  addGameScript();
  window.addEventListener("load", onLoad);
  function onLoad() {
      loopOptions = {
          viewSize: { x: 100, y: 100 },
          bodyBackground: "#e0e0e0",
          viewBackground: "#eeeeee"
      };
      let opts;
      if (typeof options !== "undefined" && options != null) {
          opts = Object.assign(Object.assign({}, defaultOptions$4), options);
      }
      else {
          opts = defaultOptions$4;
      }
      seed = opts.seed;
      loopOptions.isCapturing = opts.isCapturing;
      loopOptions.viewSize = opts.viewSize;
      isPlayingBgm = opts.isPlayingBgm;
      init$1();
      init$6(init$7, _update$1, loopOptions);
  }
  function init$7() {
      if (typeof description !== "undefined" &&
          description != null &&
          description.trim().length > 0) {
          isNoTitle = false;
          seed += getHash(description);
      }
      if (typeof title !== "undefined" &&
          title != null &&
          title.trim().length > 0) {
          isNoTitle = false;
          document.title = title;
      }
      if (typeof characters !== "undefined" && characters != null) {
          defineCharacters(characters, "a");
      }
      sss.init(seed);
      const sz = loopOptions.viewSize;
      terminalSize = { x: Math.floor(sz.x / 6), y: Math.floor(sz.y / 6) };
      terminal = new Terminal(terminalSize);
      setColor("black");
      if (isNoTitle) {
          initInGame();
          exports.ticks = 0;
      }
      else {
          initTitle();
      }
  }
  function _update$1() {
      exports.ticks = exports.ticks;
      exports.difficulty = exports.ticks / 3600 + 1;
      clear$1();
      updateFunc[state]();
      exports.ticks++;
  }
  function initInGame() {
      state = "inGame";
      exports.ticks = -1;
      const s = Math.floor(exports.score);
      if (s > hiScore) {
          hiScore = s;
      }
      exports.score = 0;
      if (isPlayingBgm) {
          sss.playBgm();
      }
  }
  function updateInGame() {
      terminal.clear();
      clear();
      update();
      drawScore();
      terminal.draw();
  }
  function initTitle() {
      state = "title";
      exports.ticks = -1;
      terminal.clear();
      clear();
  }
  function updateTitle() {
      if (exports.ticks === 0) {
          drawScore();
          if (typeof title !== "undefined" && title != null) {
              terminal.print(title, Math.floor(terminalSize.x - title.length) / 2, 3);
          }
          terminal.draw();
      }
      if (exports.ticks === 30 || exports.ticks == 40) {
          if (typeof description !== "undefined" && description != null) {
              let maxLineLength = 0;
              description.split("\n").forEach(l => {
                  if (l.length > maxLineLength) {
                      maxLineLength = l.length;
                  }
              });
              const x = Math.floor((terminalSize.x - maxLineLength) / 2);
              description.split("\n").forEach((l, i) => {
                  terminal.print(l, x, Math.floor(terminalSize.y / 2) + i);
              });
              terminal.draw();
          }
      }
      if (isJustPressed$2) {
          initInGame();
      }
  }
  function initGameOver() {
      state = "gameOver";
      clearJustPressed$2();
      exports.ticks = -1;
      drawGameOver();
      if (isPlayingBgm) {
          sss.stopBgm();
      }
  }
  function updateGameOver() {
      if (exports.ticks > 20 && isJustPressed$2) {
          initInGame();
      }
      else if (exports.ticks === 500 && !isNoTitle) {
          initTitle();
      }
      if (exports.ticks === 10) {
          drawGameOver();
      }
  }
  function drawGameOver() {
      terminal.print("GAME OVER", Math.floor((terminalSize.x - 9) / 2), Math.floor(terminalSize.y / 2));
      terminal.draw();
  }
  function drawScore() {
      terminal.print(`${Math.floor(exports.score)}`, 0, 0);
      const hs = `HI ${hiScore}`;
      terminal.print(hs, terminalSize.x - hs.length, 0);
  }
  function addGameScript() {
      let gameName = window.location.search.substring(1);
      gameName = gameName.replace(/\W/g, "");
      if (gameName.length === 0) {
          return;
      }
      const script = document.createElement("script");
      script.setAttribute("src", `${gameName}/main.js`);
      document.head.appendChild(script);
  }
  function getHash(v) {
      let hash = 0;
      for (let i = 0; i < v.length; i++) {
          const chr = v.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0;
      }
      return hash;
  }

  exports.PI = PI;
  exports.abs = abs;
  exports.atan2 = atan2;
  exports.bar = bar;
  exports.box = box;
  exports.ceil = ceil;
  exports.char = char;
  exports.clamp = clamp$1;
  exports.color = color;
  exports.cos = cos;
  exports.end = end;
  exports.floor = floor;
  exports.input = input;
  exports.line = line;
  exports.play = play;
  exports.pow = pow;
  exports.random = random;
  exports.range = range;
  exports.rect = rect;
  exports.round = round;
  exports.sin = sin;
  exports.sqrt = sqrt;
  exports.text = text;
  exports.vec = vec;
  exports.wrap = wrap$1;

}(this.window = this.window || {}));