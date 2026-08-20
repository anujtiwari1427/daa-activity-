/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Algorithm Visualizer — SVG Heap Tree with Animations           ║
 * ║                                                                  ║
 * ║  Renders the Max Heap as a binary tree using SVG.               ║
 * ║  Animates insert (heapify-up) and extract (heapify-down).       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const NODE_RADIUS = 28;
const LEVEL_HEIGHT = 80;
const SVG_PADDING = 40;

async function loadVisualizerHeap() {
    try {
        const res = await fetch(`${API}/api/visualizer/heap`);
        const data = await res.json();
        renderHeapTree(data.heap);
        renderHeapArray(data.heap);
    } catch (err) {
        console.error('Visualizer load error:', err);
    }
}

// ─── SVG Tree Rendering ────────────────────────────────────────

function renderHeapTree(heap) {
    const svg = document.getElementById('heap-tree-svg');
    const emptyMsg = document.getElementById('heap-empty-msg');

    if (!heap || heap.length === 0) {
        svg.innerHTML = '';
        emptyMsg.style.display = '';
        return;
    }
    emptyMsg.style.display = 'none';

    const n = heap.length;
    const depth = Math.floor(Math.log2(n)) + 1;
    const width = Math.max(600, svg.parentElement.clientWidth - SVG_PADDING * 2);
    const height = depth * LEVEL_HEIGHT + SVG_PADDING * 2;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.height = `${height}px`;

    // Calculate positions for each node
    const positions = [];
    for (let i = 0; i < n; i++) {
        const level = Math.floor(Math.log2(i + 1));
        const indexInLevel = i - (Math.pow(2, level) - 1);
        const nodesInLevel = Math.pow(2, level);
        const levelWidth = width - SVG_PADDING * 2;
        const x = SVG_PADDING + (levelWidth / (nodesInLevel + 1)) * (indexInLevel + 1);
        const y = SVG_PADDING + level * LEVEL_HEIGHT + NODE_RADIUS;
        positions.push({ x, y });
    }

    let svgContent = '';

    // Draw edges first (so they appear behind nodes)
    for (let i = 1; i < n; i++) {
        const parentIndex = Math.floor((i - 1) / 2);
        const { x: px, y: py } = positions[parentIndex];
        const { x: cx, y: cy } = positions[i];
        svgContent += `<line class="heap-edge" x1="${px}" y1="${py}" x2="${cx}" y2="${cy}" />`;
    }

    // Draw nodes
    for (let i = 0; i < n; i++) {
        const { x, y } = positions[i];
        const patient = heap[i];
        const color = getPriorityColor(patient.priority);

        svgContent += `
            <g class="heap-node" data-index="${i}">
                <circle class="heap-node-circle" cx="${x}" cy="${y}" r="${NODE_RADIUS}"
                        fill="${color}" stroke="${color}" stroke-width="2"
                        opacity="0.9" />
                <text class="heap-node-text" x="${x}" y="${y + 1}"
                      dominant-baseline="middle">${patient.priority}</text>
                <text class="heap-node-name" x="${x}" y="${y + NODE_RADIUS + 14}"
                      dominant-baseline="middle">${truncateName(patient.name)}</text>
            </g>`;
    }

    svg.innerHTML = svgContent;
}

function truncateName(name) {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0].substring(0, 8);
    }
    return name.substring(0, 8);
}

// ─── Heap Array Display ────────────────────────────────────────

function renderHeapArray(heap) {
    const container = document.getElementById('heap-array-display');

    if (!heap || heap.length === 0) {
        container.innerHTML = '<span class="heap-array-empty">[ ] — Empty heap</span>';
        return;
    }

    container.innerHTML = heap.map((p, i) => `
        <div class="heap-array-item" data-index="${i}">
            <span class="ha-index">${i}</span>
            <span class="ha-priority">${p.priority}</span>
            <span class="ha-name">${truncateName(p.name)}</span>
        </div>
    `).join('');
}

// ─── Operation Steps Display ───────────────────────────────────

function renderSteps(steps) {
    const container = document.getElementById('viz-steps');

    if (!steps || steps.length === 0) {
        container.innerHTML = '<p class="viz-step-empty">Perform an operation to see the steps.</p>';
        return;
    }

    container.innerHTML = steps.map((step, i) => `
        <div class="viz-step-item">
            <span class="viz-step-num">${i + 1}</span>
            <span class="viz-step-text">${step.description}</span>
        </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// ─── Animate Node Highlight ────────────────────────────────────

function animateNodes(steps, heap) {
    let delay = 0;
    const STEP_DELAY = 600;

    steps.forEach((step, i) => {
        setTimeout(() => {
            // Highlight the array items
            document.querySelectorAll('.heap-array-item').forEach(el => el.classList.remove('highlight-node'));

            if (step.action === 'swap') {
                const a = document.querySelector(`.heap-array-item[data-index="${step.index_a}"]`);
                const b = document.querySelector(`.heap-array-item[data-index="${step.index_b}"]`);
                if (a) a.classList.add('highlight-node');
                if (b) b.classList.add('highlight-node');

                // Also highlight SVG nodes
                const nodeA = document.querySelector(`.heap-node[data-index="${step.index_a}"] circle`);
                const nodeB = document.querySelector(`.heap-node[data-index="${step.index_b}"] circle`);
                if (nodeA) nodeA.classList.add('swap-glow');
                if (nodeB) nodeB.classList.add('swap-glow');
            } else if (step.action === 'insert' || step.action === 'extract') {
                const el = document.querySelector(`.heap-array-item[data-index="${step.index}"]`);
                if (el) el.classList.add('highlight-node');
            }

            // On the last step, re-render the full tree
            if (i === steps.length - 1) {
                setTimeout(() => {
                    renderHeapTree(heap);
                    renderHeapArray(heap);
                }, STEP_DELAY);
            }
        }, delay);
        delay += STEP_DELAY;
    });
}

// ─── Visualizer Actions ────────────────────────────────────────

async function vizInsertDemo() {
    try {
        const priority = Math.floor(Math.random() * 10) + 1;
        const res = await fetch(`${API}/api/visualizer/insert-demo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority })
        });
        const data = await res.json();
        showToast(data.message);
        renderSteps(data.steps);
        renderHeapTree(data.heap);
        renderHeapArray(data.heap);
        animateNodes(data.steps, data.heap);
    } catch (err) {
        showToast('Error inserting demo patient.', 'error');
    }
}

async function vizExtractMax() {
    try {
        const res = await fetch(`${API}/api/visualizer/extract-max`, { method: 'POST' });
        const data = await res.json();
        if (data.error && data.size === 0) {
            showToast('Heap is empty.', 'error');
            return;
        }
        showToast(data.message);
        renderSteps(data.steps);
        renderHeapTree(data.heap);
        renderHeapArray(data.heap);
        animateNodes(data.steps, data.heap);
    } catch (err) {
        showToast('Error extracting max.', 'error');
    }
}

async function vizReset() {
    try {
        const res = await fetch(`${API}/api/visualizer/reset`, { method: 'POST' });
        const data = await res.json();
        showToast(data.message);
        renderHeapTree([]);
        renderHeapArray([]);
        renderSteps([]);
    } catch (err) {
        showToast('Error resetting.', 'error');
    }
}
