"use client";

import { useEffect, useRef } from "react";
import styles from "./DitherHero.module.css";

const CONFIG = {
  gradientStyle: 1,
  ditherStyle: 0,
  ditherSize: 2.0,
  ditherOpacity: 1,
  speed: 0.4,
  colors: ["#2d3436", "#6c5b4a", "#b8860b", "#daa520"],
  imageOpacity: 0.8,
  imageScale: 1,
};

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSpeed;
  uniform int uGradientStyle;
  uniform int uDitherStyle;
  uniform float uDitherSize;
  uniform float uDitherOpacity;
  uniform int uColorCount;
  uniform vec3 uColors[8];

  uniform sampler2D uImage;
  uniform vec2 uImageResolution;
  uniform float uImageOpacity;
  uniform float uImageScale;
  uniform bool uHasImage;

  float bayer8x8(vec2 pos) {
    int x = int(mod(pos.x, 8.0));
    int y = int(mod(pos.y, 8.0));
    int index = x + y * 8;
    float bayer[64];
    bayer[0] = 0.0; bayer[1] = 32.0; bayer[2] = 8.0; bayer[3] = 40.0; bayer[4] = 2.0; bayer[5] = 34.0; bayer[6] = 10.0; bayer[7] = 42.0;
    bayer[8] = 48.0; bayer[9] = 16.0; bayer[10] = 56.0; bayer[11] = 24.0; bayer[12] = 50.0; bayer[13] = 18.0; bayer[14] = 58.0; bayer[15] = 26.0;
    bayer[16] = 12.0; bayer[17] = 44.0; bayer[18] = 4.0; bayer[19] = 36.0; bayer[20] = 14.0; bayer[21] = 46.0; bayer[22] = 6.0; bayer[23] = 38.0;
    bayer[24] = 60.0; bayer[25] = 28.0; bayer[26] = 52.0; bayer[27] = 20.0; bayer[28] = 62.0; bayer[29] = 30.0; bayer[30] = 54.0; bayer[31] = 22.0;
    bayer[32] = 3.0; bayer[33] = 35.0; bayer[34] = 11.0; bayer[35] = 43.0; bayer[36] = 1.0; bayer[37] = 33.0; bayer[38] = 9.0; bayer[39] = 41.0;
    bayer[40] = 51.0; bayer[41] = 19.0; bayer[42] = 59.0; bayer[43] = 27.0; bayer[44] = 49.0; bayer[45] = 17.0; bayer[46] = 57.0; bayer[47] = 25.0;
    bayer[48] = 15.0; bayer[49] = 47.0; bayer[50] = 7.0; bayer[51] = 39.0; bayer[52] = 13.0; bayer[53] = 45.0; bayer[54] = 5.0; bayer[55] = 37.0;
    bayer[56] = 63.0; bayer[57] = 31.0; bayer[58] = 55.0; bayer[59] = 23.0; bayer[60] = 61.0; bayer[61] = 29.0; bayer[62] = 53.0; bayer[63] = 21.0;
    for (int i = 0; i < 64; i++) { if (i == index) return bayer[i] / 64.0; }
    return 0.0;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float blueNoise(vec2 pos) { float n = 0.0; n += hash(pos) * 0.5; n += hash(pos * 2.0 + 100.0) * 0.25; n += hash(pos * 4.0 + 200.0) * 0.125; return fract(n * 2.0); }
  float halftone(vec2 pos, float value) { vec2 center = floor(pos) + 0.5; float dist = length(pos - center); float radius = sqrt(value) * 0.7; return step(dist, radius); }
  float linePattern(vec2 pos, float angle) { float c = cos(angle); float s = sin(angle); vec2 rotated = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c); return fract(rotated.x); }
  float bayer4x4(vec2 pos) { int x = int(mod(pos.x, 4.0)); int y = int(mod(pos.y, 4.0)); int index = x + y * 4; float bayer[16]; bayer[0]=0.0; bayer[1]=8.0; bayer[2]=2.0; bayer[3]=10.0; bayer[4]=12.0; bayer[5]=4.0; bayer[6]=14.0; bayer[7]=6.0; bayer[8]=3.0; bayer[9]=11.0; bayer[10]=1.0; bayer[11]=9.0; bayer[12]=15.0; bayer[13]=7.0; bayer[14]=13.0; bayer[15]=5.0; for (int i = 0; i < 16; i++) { if (i == index) return bayer[i] / 16.0; } return 0.0; }
  float ign(vec2 pos) { return fract(52.9829189 * fract(0.06711056 * pos.x + 0.00583715 * pos.y)); }
  float rings(vec2 pos) { vec2 center = floor(pos) + 0.5; return fract(length(pos - center) * 2.0); }

  float wavyGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 4.0 + time) * 0.3; v += cos(uv.y * 3.0 - time * 0.7) * 0.3; v += sin((uv.x + uv.y) * 5.0 + time * 1.3) * 0.2; v += cos(uv.x * 2.0 - uv.y * 3.0 + time * 0.5) * 0.2; return v * 0.5 + 0.5; }
  float radialGradient(vec2 uv, float time) { vec2 center = vec2(0.5 + sin(time * 0.5) * 0.2, 0.5 + cos(time * 0.3) * 0.2); float dist = length(uv - center); return sin(dist * 8.0 - time * 2.0) * 0.5 + 0.5; }
  float diagonalGradient(vec2 uv, float time) { float angle = time * 0.2; float c = cos(angle); float s = sin(angle); vec2 rotated = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c); return sin(rotated.x * 6.0 + rotated.y * 2.0 + time) * 0.5 + 0.5; }
  float noiseGradient(vec2 uv, float time) { vec2 p = uv * 3.0; float n = 0.0; n += sin(p.x + time) * cos(p.y + time * 0.7); n += sin(p.x * 2.1 - time * 0.8) * cos(p.y * 1.9 + time * 0.6) * 0.5; n += sin(p.x * 3.3 + time * 1.1) * cos(p.y * 2.8 - time * 0.9) * 0.25; return n * 0.3 + 0.5; }
  float plasmaGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 10.0 + time); v += sin(uv.y * 10.0 + time * 1.2); v += sin((uv.x + uv.y) * 10.0 + time * 1.5); v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time); return v * 0.125 + 0.5; }
  float spiralGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = uv - center; float r = length(pos); float a = atan(pos.y, pos.x); return sin(r * 20.0 + a * 3.0 - time * 3.0) * 0.5 + 0.5; }
  float squareGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = abs(uv - center); float d = max(pos.x, pos.y); return sin(d * 15.0 - time * 2.0) * 0.5 + 0.5; }
  float zigzagGradient(vec2 uv, float time) { vec2 pos = uv * 5.0; float v = pos.y + sin(pos.x * 2.0 + time) * 0.5; return sin(v * 4.0 + time) * 0.5 + 0.5; }
  float swirlGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = uv - center; float len = length(pos); float ang = atan(pos.y, pos.x); ang += len * 8.0 - time; return sin(ang * 4.0) * 0.5 + 0.5; }
  float auroraGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 3.0 + time * 0.5) * 0.5; v += sin(uv.x * 5.0 + uv.y * 2.0 + time * 0.8) * 0.3; v += sin(uv.x * 8.0 - time * 0.3) * 0.2; float y = uv.y + sin(uv.x * 2.0 + time) * 0.1; return sin(y * 5.0 + v * 5.0) * 0.5 + 0.5; }

  vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 imgRes) {
    float screenAspect = screenRes.x / screenRes.y;
    float imgAspect = imgRes.x / imgRes.y;
    vec2 scale = vec2(1.0);
    if (screenAspect > imgAspect) {
      scale = vec2(1.0, imgAspect / screenAspect);
    } else {
      scale = vec2(screenAspect / imgAspect, 1.0);
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float time = uTime * uSpeed;

    float gradient = 0.0;
    if (uGradientStyle == 0) gradient = wavyGradient(uv, time);
    else if (uGradientStyle == 1) gradient = radialGradient(uv, time);
    else if (uGradientStyle == 2) gradient = diagonalGradient(uv, time);
    else if (uGradientStyle == 3) gradient = noiseGradient(uv, time);
    else if (uGradientStyle == 4) gradient = plasmaGradient(uv, time);
    else if (uGradientStyle == 5) gradient = spiralGradient(uv, time);
    else if (uGradientStyle == 6) gradient = squareGradient(uv, time);
    else if (uGradientStyle == 7) gradient = zigzagGradient(uv, time);
    else if (uGradientStyle == 8) gradient = swirlGradient(uv, time);
    else if (uGradientStyle == 9) gradient = auroraGradient(uv, time);

    gradient = clamp(gradient, 0.0, 1.0);
    float baseGradient = gradient;

    if (uHasImage) {
      vec2 baseUV = getCoverUV(uv, uResolution, uImageResolution);
      vec2 imgUV = (baseUV - 0.5) / uImageScale + 0.5;

      if (imgUV.x >= 0.0 && imgUV.x <= 1.0 && imgUV.y >= 0.0 && imgUV.y <= 1.0) {
        vec4 imgColor = texture2D(uImage, imgUV);
        float imgAlpha = imgColor.a;
        float luminance = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));
        float structure = smoothstep(0.0, 1.0, luminance);
        float imageAffectedGradient = gradient * structure * 1.5;
        float blendedGradient = mix(gradient, imageAffectedGradient, uImageOpacity);
        gradient = mix(baseGradient, blendedGradient, imgAlpha);
      }
    }

    vec2 ditherPos = gl_FragCoord.xy / uDitherSize;
    float threshold = 0.0;
    if (uDitherStyle == 0) threshold = bayer8x8(ditherPos);
    else if (uDitherStyle == 1) threshold = blueNoise(ditherPos);
    else if (uDitherStyle == 2) threshold = halftone(ditherPos, gradient);
    else if (uDitherStyle == 3) threshold = linePattern(ditherPos, 0.785);
    else if (uDitherStyle == 4) threshold = hash(floor(ditherPos));
    else if (uDitherStyle == 5) threshold = bayer4x4(ditherPos);
    else if (uDitherStyle == 6) threshold = ign(ditherPos);
    else if (uDitherStyle == 7) threshold = rings(ditherPos);

    float scaledGradient = gradient * float(uColorCount - 1);
    int colorIndex = int(floor(scaledGradient));
    float localGradient = fract(scaledGradient);

    int nextIndex = colorIndex + 1;
    if (nextIndex >= uColorCount) nextIndex = uColorCount - 1;

    vec3 color1 = uColors[0];
    vec3 color2 = uColors[0];

    for (int i = 0; i < 8; i++) {
      if (i == colorIndex) color1 = uColors[i];
      if (i == nextIndex) color2 = uColors[i];
    }

    vec3 finalColor;
    if (uDitherStyle == 2) {
      finalColor = mix(color1, color2, threshold);
    } else {
      finalColor = localGradient > threshold ? color2 : color1;
    }

    gl_FragColor = vec4(finalColor, uDitherOpacity);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
}

type DitherHeroProps = {
  children?: React.ReactNode;
};

export default function DitherHero({ children }: DitherHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());
  const textureRef = useRef<WebGLTexture | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vertexShader);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program Link Error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );
    textureRef.current = texture;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let imgAspect = { w: 1, h: 1 };
    let hasImage = false;

    const img = new Image();
    img.onload = () => {
      imgAspect = { w: img.width, h: img.height };
      hasImage = true;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
    img.src = "/hero.webp";

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const render = () => {
      const time = (Date.now() - startTimeRef.current) / 1000;
      gl.useProgram(program);

      gl.uniform2f(
        gl.getUniformLocation(program, "uResolution"),
        gl.canvas.width,
        gl.canvas.height
      );
      gl.uniform1f(gl.getUniformLocation(program, "uTime"), time);
      gl.uniform1f(gl.getUniformLocation(program, "uSpeed"), CONFIG.speed);
      gl.uniform1i(
        gl.getUniformLocation(program, "uGradientStyle"),
        CONFIG.gradientStyle
      );
      gl.uniform1i(
        gl.getUniformLocation(program, "uDitherStyle"),
        CONFIG.ditherStyle
      );
      gl.uniform1f(
        gl.getUniformLocation(program, "uDitherSize"),
        CONFIG.ditherSize
      );
      gl.uniform1f(
        gl.getUniformLocation(program, "uDitherOpacity"),
        CONFIG.ditherOpacity
      );
      gl.uniform1i(
        gl.getUniformLocation(program, "uColorCount"),
        CONFIG.colors.length
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.uniform1i(gl.getUniformLocation(program, "uImage"), 0);
      gl.uniform1i(gl.getUniformLocation(program, "uHasImage"), hasImage ? 1 : 0);
      gl.uniform2f(
        gl.getUniformLocation(program, "uImageResolution"),
        imgAspect.w,
        imgAspect.h
      );
      gl.uniform1f(
        gl.getUniformLocation(program, "uImageOpacity"),
        CONFIG.imageOpacity
      );
      gl.uniform1f(
        gl.getUniformLocation(program, "uImageScale"),
        CONFIG.imageScale
      );

      const colorArray: number[] = [];
      for (let i = 0; i < 8; i++) {
        const hex =
          CONFIG.colors[i] || CONFIG.colors[CONFIG.colors.length - 1];
        colorArray.push(...hexToRgb(hex));
      }
      gl.uniform3fv(gl.getUniformLocation(program, "uColors"), colorArray);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      observer.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section ref={containerRef} className={styles.hero} aria-label="Home">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>{children}</div>
    </section>
  );
}
