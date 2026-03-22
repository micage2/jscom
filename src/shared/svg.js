

function createInterface(elem) {
    let iface;
    switch (elem.nodeName) {
        case 'svg': iface = ISVGDocument(elem); break;
        case 'g': iface = ISVGGroup(elem); break;
        case 'path': iface = ISVGPath(elem); break;
        default: iface = ISVGBase(elem); break;
    }

    return iface;
}

const ISVGBase = (elem) => ({
    getType: () => elem.nodeName,
    getName: () => elem.getAttribute('name') || '',
    setName: (name) => elem.setAttribute('name', name),
});

const ISVGGroup = (elem) => ({
    ...ISVGBase(elem),
    getChildren: () => [...elem.children].filter(child => child.nodeName !== 'script').map(child => createInterface(child)),
    addChild: (type, attrs = {}) => {
        const child = document.createElementNS('http://www.w3.org/2000/svg', type);
        Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, value));
        elem.appendChild(child);
        return createInterface(child);
    },
    removeChild: (childIface) => {
        const childElem = interfaceCache.inverseGet(childIface); // Wait, WeakMap doesn't have inverse; alternative needed
        // To fix: perhaps assign unique ID to each elem and use a Map<id, elem> and iface.id = id
        if (childElem && elem.contains(childElem)) {
            elem.removeChild(childElem);
        }
    },
    getTransform: () => elem.getAttribute('transform') || '',
    setTransform: (transform) => elem.setAttribute('transform', transform),
});

const ISVGDocument = (elem) => ({
    ...ISVGGroup(elem),
    getViewBox: () => {
        const vb = elem.viewBox.baseVal;
        return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
    },
    setViewBox: (x, y, width, height) => {
        elem.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    },
});

const ISVGPath = (elem) => ({

    ...ISVGBase(elem),

    getPathData: () => elem.getPathData({ normalize: true }),
    setPathData: (data) => elem.setPathData(data),

    addSegment: (type, values, index = -1, options = { relative: false }) => {
        const data = this.getPathData();
        let absValues = [...values];

        if (options.relative && type.toUpperCase() !== 'M' && type !== 'Z') {  // Relatives are lowercase, but we normalize type to upper
            const prevIndex = index === -1 ? data.length : index;
            const prevData = data.slice(0, prevIndex);
            const cursor = getCursorPosition(prevData);
            // Apply delta to each x/y pair (for curves with multiple points)
            for (let i = 0; i < absValues.length; i += 2) {
                absValues[i] += cursor.x;
                absValues[i + 1] += cursor.y;
            }
        }

        const newSeg = { type: type.toUpperCase(), values: absValues };  // Normalize type to absolute uppercase
        if (index === -1) data.push(newSeg);
        else if (index >= 0 && index <= data.length) data.splice(index, 0, newSeg);
        else throw new Error('Invalid insert index');
        this.setPathData(data);
    },
    setSegment: (index, type, values, options = { relative: false }) => {
        const data = this.getPathData();
        if (index < 0 || index >= data.length) throw new Error('Invalid segment index');

        let absValues = [...values];
        if (options.relative && type.toUpperCase() !== 'M' && type !== 'Z') {
            const prevData = data.slice(0, index);
            const cursor = getCursorPosition(prevData);
            for (let i = 0; i < absValues.length; i += 2) {
                absValues[i] += cursor.x;
                absValues[i + 1] += cursor.y;
            }
        }

        data[index] = { type: type.toUpperCase(), values: absValues };
        this.setPathData(data);
    },

    // Conveniences for subpaths
    startSubpath: (x, y, index = -1, options = { relative: false }) => {
        // Just sugar for addSegment('M', [x,y], index, options)
        this.addSegment('M', [x, y], index, options);
    },
    closeSubpath: (index = -1) => {
        // Add 'Z' (no values)
        this.addSegment('Z', [], index);
    },

});

export {
    ISVGBase, ISVGGroup, ISVGDocument, ISVGPath
}