function uid() {
    return Math.random().toString(36).slice(2, 11);
    // return crypto.randomUUID();
}

function fitChildDimensions(parent, child) {
    child.width = parent.offsetWidth;
    child.height = parent.offsetHeight;
}

function logobj(obj, indent = 0) {
    let result = '';
    const spaces = ' '.repeat(indent * 2);
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            result += `${spaces}${key}: {\n${logobj(value, indent + 1)}${spaces}}\n`;
        } else {
            result += `${spaces}${key}: ${value}\n`;
        }
    }
    return result;
}

export function CSSRules(rules = {}) {
    const map = new Map([...Object.entries(rules)]);
    return {
        toString: () => map.entries().reduce((acc, [k, v]) => (acc + ` ${k}: ${v};`), ""),
        add(prop, value) {
            map.set(prop, value);
            return this;
        },
        visit(fn) {
            if (fn) map.forEach((v, k, m) => fn(k, v));
            return this;
        },
        log() { console.log(`${this.toString()}`); },
    };
};

export function create_sheet(code) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(code);
    return sheet;
}

export async function load_sheet(file) {
    const sheet = new CSSStyleSheet();

    const response = await fetch(file);
    const cssText = await response.text();

    await sheet.replace(cssText);

    return sheet;
}

export async function load_file(file) {
    const sheet = new CSSStyleSheet();

    const response = await fetch(file);
    const cssText = await response.text();

    return cssText;
}

export async function loadFragment(file) {
    const resp = await fetch(file);
    if (!resp.ok)
        throw new Error(`Failed to load template: ${file}`);

    const html = await resp.text();

    return makeFragment(html);
}

export function makeFragment(str) {
    const div = document.createElement('div');
    const fragment = document.createDocumentFragment();

    div.innerHTML = str;

    while (div.firstChild) {
        fragment.appendChild(div.firstChild);
    }

    return fragment;
}

export function getDimensions(N) {
    // Check if a number is prime
    const isPrime = (num) => {
        if (num < 2) return false;
        if (num === 2) return true;
        if (num % 2 === 0) return false;
        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            if (num % i === 0) return false;
        }
        return true;
    };

    // Use N+1 if N is prime
    let M = isPrime(N) ? N + 1 : N;

    // Find the largest factor pair
    for (let i = Math.floor(Math.sqrt(M)); i >= 1; i--) {
        if (M % i === 0) {
            return [i, M / i]; // [width, height]
        }
    }
}

export {
    fitChildDimensions, logobj, uid,
}

export function bindMouse(element, handlers) {
    const MOVE_THRESHOLD = 2;
    let startX, startY, hasMoved, realTarget = null;

    element.addEventListener('pointerdown', (event) => {
        hasMoved = false;
        realTarget = event.target;

        startX = event.clientX;
        startY = event.clientY;

        if (event.buttons !== 1) return;

        event.preventDefault();
        event.stopPropagation();

        window.addEventListener('pointermove', handleMouseMove);
        window.addEventListener('pointerup', handleMouseUp);
    });

    function handleMouseMove(event) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;

        if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
            hasMoved = true;
        }
        if (!hasMoved) return;

        startX = event.clientX;
        startY = event.clientY;

        const { altKey: alt, ctrlKey: ctrl, shiftKey: shift, metaKey: meta } = event;
        
        handlers.onMove(dx, dy, {
            alt: event.altKey, 
            ctrl: event.ctrlKey, 
            shift: event.shiftKey,
            meta: event.metaKey,
        });
    }

    function handleMouseUp() {
        if (!hasMoved) {
            handlers.onClick(realTarget);
        }

        window.removeEventListener('pointermove', handleMouseMove);
        window.removeEventListener('pointerup', handleMouseUp);
    }
}

