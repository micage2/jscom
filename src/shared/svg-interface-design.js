{
    Element: {
        get_type: () => { }, // {'svg' | 'g' | 'p'}
            getBBox() => { } // Rect
        getCTM() => { } // matrix
        getSCreenCTM() => { } // matrix
        set_matrix(M) => { }
    },

    // inherits Element
    Group: {
        get_type: () => 'g',
            get_items: (member) => { },
                add_item: (name, type, isvg_item) => { }, // prepend, append, after, before
                    remove_item: (name) => { },
    },

    // inherits Group
    Document: {
        get_type: () => 'svg',
    },

    // inherits Element
    Path: {
        get_type: () => 'p',
            get_segments: () => { }, // returns Segment[]
                add_segment: (index, mode, points) => { },
                    remove_segment: (index) => { },
                        open: () => { },
                            close: () => { },
    },

    Segment: {
        set_mode: (mode, points[]) => { }, // mode: {'h' | 'v' | 'l' | 's' | 'c'}
            get_mode: () => { }, // returns { mode: {'h' | 'v' | 'l' | 's' | 'c'}, points:[] }
    },

    Point: {
        get_pos: () => { },
            set_pos: (x, y?) => { },
    }
}


/*
Step 3: 
    Implement the Node Views and Path HandlesAdd this new function to handle
    selection. It clears prior overlays and sets up type-specific views. 
    For paths, it adds draggable handles.

    Assume you have a <div id="properties"></div> in your HTML for text-based 
    props. Handles are added as <circle> elements in a group on the main svg.

*/

let handlesGroup = null;  // Reusable group for handles
let pointsMap = [];  // Maps handle indices to path data positions

function showNodeView(elem) {
    // Clear previous handles
    if (handlesGroup) {
        handlesGroup.remove();
    }
    handlesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    handlesGroup.id = 'handles';
    elem.ownerSVGElement.appendChild(handlesGroup);  // Add to root SVG
    pointsMap = [];

    // Clear properties panel
    const propsPanel = document.getElementById('properties');
    propsPanel.innerHTML = '';

    if (!['svg', 'g', 'path'].includes(elem.nodeName)) {
        return;  // Ignore other types
    }

    // Highlight the selected element visually
    elem.classList.add('selected-node');  // Add CSS: .selected-node { stroke: yellow; stroke-width: 2; }
    setTimeout(() => elem.classList.remove('selected-node'), 2000);  // Optional flash

    // Type-specific views
    if (elem.nodeName === 'svg') {
        // Simple properties view for svg (e.g., viewBox)
        const viewBox = elem.viewBox.baseVal;
        propsPanel.innerHTML = `
            <label>ViewBox: <input type="text" value="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}" onchange="updateSvgViewBox(this.value, elem)"></label>
        `;
    } else if (elem.nodeName === 'g') {
        // Simple properties for g (e.g., transform)
        const transform = elem.getAttribute('transform') || '';
        propsPanel.innerHTML = `
            <label>Transform: <input type="text" value="${transform}" onchange="elem.setAttribute('transform', this.value)"></label>
        `;
    } else if (elem.nodeName === 'path') {
        // Properties for path (e.g., fill/stroke)
        const fill = elem.getAttribute('fill') || 'none';
        const stroke = elem.getAttribute('stroke') || 'black';
        propsPanel.innerHTML = `
            <label>Fill: <input type="color" value="${fill}" onchange="elem.setAttribute('fill', this.value)"></label>
            <label>Stroke: <input type="color" value="${stroke}" onchange="elem.setAttribute('stroke', this.value)"></label>
        `;

        // Add draggable handles for positions/tangents
        addPathHandles(elem);
    }
}

function updateSvgViewBox(value, elem) {
    const [x, y, w, h] = value.split(' ').map(Number);
    elem.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
}

function addPathHandles(pathElem) {
    const pathData = pathElem.getPathData({ normalize: true });  // Absolute coords
    let handleIndex = 0;

    for (let segIndex = 0; segIndex < pathData.length; segIndex++) {
        const seg = pathData[segIndex];
        const vals = seg.values;
        const type = seg.type;

        let kind;
        switch (type) {
            case 'M':
            case 'L':
                kind = 'anchor';  // Position/anchor
                break;
            case 'C':
                kind = ['control', 'control', 'anchor'];  // Tangent1, tangent2, anchor
                break;
            case 'Q':
                kind = ['control', 'anchor'];  // Tangent, anchor
                break;
            default:
                continue;  // Skip unsupported for simplicity
        }

        for (let valIndex = 0; valIndex < vals.length; valIndex += 2) {
            const x = vals[valIndex];
            const y = vals[valIndex + 1];
            const currentKind = Array.isArray(kind) ? kind[valIndex / 2] : kind;

            const circle = createDraggableHandle(x, y, handleIndex, currentKind, pathElem.ownerSVGElement);
            handlesGroup.appendChild(circle);

            pointsMap.push({ segIndex, valIndex });
            handleIndex++;
        }
    }

    // Update path data on drag end (or real-time if preferred)
    function updatePath() {
        pathElem.setPathData(pathData);
    }

    function createDraggableHandle(x, y, index, kind, svg) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 5);  // Fixed size; adjust with zoom if needed
        circle.setAttribute('fill', kind === 'control' ? 'red' : 'blue');  // Diff colors for tangents vs positions
        circle.classList.add('handle');
        circle.dataset.index = index;

        let dragging = false;
        let startX, startY;

        circle.addEventListener('pointerdown', (e) => {
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const ctm = svg.getScreenCTM().inverse();
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgPt = pt.matrixTransform(ctm);

            circle.setAttribute('cx', svgPt.x);
            circle.setAttribute('cy', svgPt.y);

            // Update path data real-time
            const p = pointsMap[index];
            pathData[p.segIndex].values[p.valIndex] = svgPt.x;
            pathData[p.segIndex].values[p.valIndex + 1] = svgPt.y;
            updatePath();
        });

        document.addEventListener('pointerup', () => {
            dragging = false;
        });

        return circle;
    }
}


// edit list view item labels in-place
function makeEditable(span) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent;

    // Optional: match span styling
    input.style.width = span.offsetWidth + 'px';

    span.replaceWith(input);
    input.focus();
    input.select();

    function saveEdit() {
        const newSpan = document.createElement('span');
        newSpan.textContent = input.value;

        // Re-attach the same listener for future edits
        newSpan.addEventListener('dblclick', () => makeEditable(newSpan));

        input.replaceWith(newSpan);
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur(); // triggers saveEdit via blur
        if (e.key === 'Escape') {
            input.removeEventListener('blur', saveEdit); // cancel save
            input.replaceWith(span); // restore original span
        }
    });
}

// Attach to all list spans initially
document.querySelectorAll('.list-item span').forEach((span) => {
    span.addEventListener('dblclick', () => makeEditable(span));
});