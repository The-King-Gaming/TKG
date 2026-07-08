const script3js = document.createElement('script');
script3js.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
script3js.onload = () => initIntro();
document.head.appendChild(script3js);

function initIntro() {

const container = document.getElementById('intro-screen');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
container.appendChild(renderer.domElement);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 0, 22);

// ===== النجوم =====
function createStars() {
    const geo = new THREE.BufferGeometry();
    const count = 7000;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkles = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 300 + Math.random() * 500;
        pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
        sizes[i]    = Math.random() < 0.05 ? Math.random() * 3 + 2 : Math.random() * 1.2 + 0.2;
        twinkles[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('twinkle',  new THREE.BufferAttribute(twinkles, 1));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime:  { value: 0 },
            uAlpha: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute float twinkle;
            varying float vTwinkle;
            varying float vSize;
            uniform float uTime;
            void main() {
                vTwinkle = twinkle;
                vSize = size;
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (250.0 / -mv.z);
                gl_Position = projectionMatrix * mv;
            }
        `,
        fragmentShader: `
            varying float vTwinkle;
            varying float vSize;
            uniform float uTime;
            uniform float uAlpha;
            void main() {
                vec2 uv = gl_PointCoord - 0.5;
                float d = length(uv);
                if (d > 0.5) discard;
                float tw = 0.65 + 0.35 * sin(uTime * 1.5 + vTwinkle);
                float alpha = (1.0 - smoothstep(0.0, 0.5, d)) * tw * uAlpha;
                if (vSize > 2.0) {
                    float cx = max(0.0, 1.0 - abs(uv.x) * 10.0)
                             * max(0.0, 1.0 - abs(uv.y) * 40.0);
                    float cy = max(0.0, 1.0 - abs(uv.y) * 10.0)
                             * max(0.0, 1.0 - abs(uv.x) * 40.0);
                    alpha = max(alpha, (cx + cy) * 0.5 * uAlpha);
                }
                gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
}

const stars = createStars();
scene.add(stars);

// ===== بناء نقاط التاج (نفس الـ SVG بالظبط) =====
function buildCrownPoints(count) {
    const points = [];
    const S = 4.2;

    function sv(x, y) {
        return {
            x:  (x - 50) / 50,
            y: -(y - 50) / 50
        };
    }

    function addLine(ax, ay, bx, by, n) {
        for (let i = 0; i < n; i++) {
            const t = i / Math.max(1, n - 1);
            points.push(new THREE.Vector3(
                (ax + (bx - ax) * t) * S + (Math.random() - 0.5) * 0.012,
                (ay + (by - ay) * t) * S + (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.04
            ));
        }
    }

    function addCircle(cx, cy, r, n) {
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            points.push(new THREE.Vector3(
                (cx + Math.cos(a) * r) * S + (Math.random() - 0.5) * 0.008,
                (cy + Math.sin(a) * r) * S + (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.03
            ));
        }
    }

    function addEllipse(cx, cy, rx, ry, n) {
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            points.push(new THREE.Vector3(
                (cx + Math.cos(a) * rx) * S,
                (cy + Math.sin(a) * ry) * S,
                (Math.random() - 0.5) * 0.03
            ));
        }
    }

    // M10,80 L20,35 L40,50 L50,20 L60,50 L80,35 L90,80 Z
    const raw = [
        [10, 80], [20, 35], [40, 50],
        [50, 20], [60, 50], [80, 35], [90, 80]
    ].map(([x, y]) => sv(x, y));

    function lineLen(a, b) {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }

    const segments = [];
    for (let i = 0; i < raw.length - 1; i++) {
        segments.push({ a: raw[i], b: raw[i+1], len: lineLen(raw[i], raw[i+1]) });
    }
    segments.push({ a: raw[raw.length-1], b: raw[0], len: lineLen(raw[raw.length-1], raw[0]) });

    const totalLen = segments.reduce((s, seg) => s + seg.len, 0);
    const ptsForLines = Math.floor(count * 0.65);

    segments.forEach(seg => {
        const n = Math.max(5, Math.floor((seg.len / totalLen) * ptsForLines));
        addLine(seg.a.x, seg.a.y, seg.b.x, seg.b.y, n);
    });

    // الدوائر الثلاث
    const circlePts = Math.floor(count * 0.12);
    [
        { cx: 20, cy: 35, r: 2.5 },
        { cx: 50, cy: 20, r: 3.0 },
        { cx: 80, cy: 35, r: 2.5 }
    ].forEach(c => {
        const p  = sv(c.cx, c.cy);
        const rr = c.r / 50;
        addCircle(p.x, p.y, rr, Math.floor(circlePts / 3));
        for (let i = 0; i < 15; i++) {
            const a  = Math.random() * Math.PI * 2;
            const rd = Math.random() * rr;
            points.push(new THREE.Vector3(
                (p.x + Math.cos(a) * rd) * S,
                (p.y + Math.sin(a) * rd) * S,
                (Math.random() - 0.5) * 0.03
            ));
        }
    });

    // الإهليلج السفلي
    const ec  = sv(50, 80);
    addEllipse(ec.x, ec.y, 40/50, 6/50, Math.floor(count * 0.18));

    // إكمال العدد
    while (points.length < count) {
        const idx = Math.floor(Math.random() * Math.min(points.length, 200));
        points.push(new THREE.Vector3(
            points[idx].x + (Math.random() - 0.5) * 0.1,
            points[idx].y + (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.06
        ));
    }

    return points.slice(0, count);
}

// ===== الذرات =====
const ATOM_COUNT = 8000;

function createAtoms() {
    const geo = new THREE.BufferGeometry();
    const pos       = new Float32Array(ATOM_COUNT * 3);
    const targetPos = new Float32Array(ATOM_COUNT * 3);
    const sizes     = new Float32Array(ATOM_COUNT);
    const randoms   = new Float32Array(ATOM_COUNT);
    const speeds    = new Float32Array(ATOM_COUNT);

    const crown = buildCrownPoints(ATOM_COUNT);

    for (let i = 0; i < ATOM_COUNT; i++) {
        const spread = 60;
        pos[i * 3]     = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;

        targetPos[i * 3]     = crown[i].x;
        targetPos[i * 3 + 1] = crown[i].y;
        targetPos[i * 3 + 2] = crown[i].z;

        sizes[i]   = Math.random() * 0.12 + 0.03;
        randoms[i] = Math.random() * Math.PI * 2;
        speeds[i]  = Math.random() * 0.5 + 0.5;
    }

    geo.setAttribute('position',       new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('targetPosition', new THREE.BufferAttribute(targetPos, 3));
    geo.setAttribute('size',           new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('random',         new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('speed',          new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uProgress: { value: 0 },
            uAlpha:    { value: 0 },
            uTime:     { value: 0 }
        },
        vertexShader: `
            attribute vec3  targetPosition;
            attribute float size;
            attribute float random;
            attribute float speed;
            uniform float uProgress;
            uniform float uTime;
            varying float vAlpha;
            varying float vProgress;

            float easeInOutCubic(float t) {
                return t < 0.5
                    ? 4.0 * t * t * t
                    : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
            }

            void main() {
                float p  = clamp(uProgress * speed, 0.0, 1.0);
                float ep = easeInOutCubic(p);

                vec3 pos = mix(position, targetPosition, ep);

                float chaos = (1.0 - ep);
                pos.x += sin(uTime * 0.8 + random)       * chaos * 0.8;
                pos.y += cos(uTime * 0.6 + random * 1.3) * chaos * 0.8;
                pos.z += sin(uTime * 0.4 + random * 0.7) * chaos * 0.4;

                pos.y += sin(uTime * 1.5 + random) * 0.04 * ep;

                vAlpha    = ep;
                vProgress = ep;

                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mv.z) * (0.4 + ep * 0.6);
                gl_Position  = projectionMatrix * mv;
            }
        `,
        fragmentShader: `
            uniform float uAlpha;
            varying float vAlpha;
            varying float vProgress;
            void main() {
                vec2  uv   = gl_PointCoord - 0.5;
                float d    = length(uv);
                if (d > 0.5) discard;
                float core  = 1.0 - smoothstep(0.0, 0.25, d);
                float glow  = 1.0 - smoothstep(0.0, 0.5,  d);
                float alpha = (core * 0.8 + glow * 0.2) * uAlpha;
                float flash = vProgress * core;
                vec3  col   = vec3(1.0) + vec3(0.3) * flash;
                gl_FragColor = vec4(col, alpha);
            }
        `,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
}

const atoms = createAtoms();
scene.add(atoms);

// ===== هالة التاج =====
const crownGlowMat = new THREE.ShaderMaterial({
    uniforms: { uAlpha: { value: 0 } },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float uAlpha;
        void main() {
            vec2  uv   = vUv - 0.5;
            float d    = length(uv * vec2(1.0, 1.4));
            float glow = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0);
            gl_FragColor = vec4(1.0, 1.0, 1.0, glow * uAlpha * 0.15);
        }
    `,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
    side:        THREE.DoubleSide
});
const crownGlow = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), crownGlowMat);
crownGlow.position.z = -0.5;
scene.add(crownGlow);

// ===== فلاش =====
const flashMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, depthWrite: false
});
const flashMesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), flashMat);
flashMesh.position.z = 20;
scene.add(flashMesh);

// ===== إضاءة =====
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const mainLight = new THREE.PointLight(0xffffff, 3, 200);
mainLight.position.set(5, 5, 10);
scene.add(mainLight);

// ===== ظهور التاج HTML =====
function showHTMLCrown() {
    const fadeInterval = setInterval(() => {
        atoms.material.uniforms.uAlpha.value -= 0.025;
        crownGlowMat.uniforms.uAlpha.value   -= 0.025;
        if (atoms.material.uniforms.uAlpha.value <= 0) {
            clearInterval(fadeInterval);
            scene.remove(atoms);
        }
    }, 30);

    const crown = document.getElementById('intro-crown');
    crown.style.transition = 'opacity 1s ease, transform 1.2s cubic-bezier(0.175,0.885,0.32,1.275)';
    crown.style.opacity    = '1';
    crown.style.transform  = 'scale(1)';

    setTimeout(() => {
        const title = document.getElementById('intro-title');
        title.style.transition    = 'opacity 0.8s ease, letter-spacing 1.2s ease';
        title.style.opacity       = '1';
        title.style.letterSpacing = '6px';
    }, 800);

    setTimeout(() => {
        const intro = document.getElementById('intro-screen');
        intro.style.transition = 'opacity 1.5s ease';
        intro.style.opacity    = '0';
        setTimeout(() => {
            intro.style.display = 'none';
            renderer.dispose();
        }, 1500);
    }, 4200);
}

// ===== المراحل =====
let phase     = 'scatter';
let phaseTime = 0;
let crownDone = false;
const clock   = new THREE.Clock();
let time      = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time      += delta;
    phaseTime += delta;

    stars.material.uniforms.uTime.value  = time;
    stars.material.uniforms.uAlpha.value = Math.min(1, time * 0.3);
    atoms.material.uniforms.uTime.value  = time;

    // scatter
    if (phase === 'scatter') {
        atoms.material.uniforms.uAlpha.value    = Math.min(1, phaseTime * 1.5);
        atoms.material.uniforms.uProgress.value = 0;
        if (phaseTime > 2.0) { phase = 'flash'; phaseTime = 0; }
    }

    // flash
    if (phase === 'flash') {
        flashMat.opacity = Math.max(0, 0.9 - phaseTime * 3.5);
        if (phaseTime > 0.3) { phase = 'gather'; phaseTime = 0; }
    }

    // gather
    if (phase === 'gather') {
        const p = Math.min(1, phaseTime / 2.5);
        atoms.material.uniforms.uProgress.value = p;
        atoms.material.uniforms.uAlpha.value     = 1;
        crownGlowMat.uniforms.uAlpha.value       = p * p;
        camera.position.z = 22 - p * 4;
        if (phaseTime > 2.8) { phase = 'glow'; phaseTime = 0; }
    }

    // glow
    if (phase === 'glow') {
        atoms.material.uniforms.uProgress.value = 1;
        crownGlowMat.uniforms.uAlpha.value = 0.8 + 0.2 * Math.sin(time * 3);
        camera.position.x = Math.sin(phaseTime * 0.4) * 1.5;
        camera.position.y = Math.cos(phaseTime * 0.3) * 0.8;
        camera.lookAt(0, 0, 0);

        if (phaseTime > 1.2 && !crownDone) {
            crownDone = true;
            showHTMLCrown();
        }
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

} // end initIntro