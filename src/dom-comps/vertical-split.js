// vertical-split-mmm.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/vertical-split.html";
const fragment = await loadFragment(html_file);


// ===          roles/interfaces            ===
const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const IContainerImpl = ({ root, data }) => ({
    setLeft(child) {
        DOM.attach(child, this, { mode: 'parent', slot: 'left' });
        return this;
    },

    setRight(child) {
        DOM.attach(child, this, { mode: 'parent', slot: 'right' });
        return this;
    }
});

const roleMap = new Map([
    ['IComponent', IComponentImpl],
    ['Container', IContainerImpl],
]);
const roles = (role = 'Container') => roleMap.get(role) ?? null;


// ===          constructor         ===
function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });

    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const leftSlot = shadow.querySelector('slot[name="left"]');
    const rightSlot = shadow.querySelector('slot[name="right"]');
    const thumb = shadow.querySelector('.thumb');
    const divider = shadow.querySelector('.divider');
    const dividerWidth = divider.offsetWidth;

    const minLeft = args.minLeft || 2;
    const minRight = args.minRight || 2;

    let ratio = args.ratio ?? 0.5;
    let isDragging = false;

    // original, not working b/o dividerSize
    const __update = () => {
        const total = host.offsetWidth;
        const dividerSize = 6;
        const leftWidth = Math.max(50, Math.round(total * ratio - dividerSize / 2));
        const rightWidth = total - leftWidth - dividerSize;

        const leftChild = leftSlot?.assignedElements?.()[0];
        const rightChild = rightSlot?.assignedElements?.()[0];

        if (leftChild) leftChild.style.width = leftWidth + 'px';
        if (rightChild) rightChild.style.width = rightWidth + 'px';
    };

    const update = () => {
        const total = host.offsetWidth;
        const dividerSize = 2;
        const leftWidth = Math.min(total - minRight, Math.max(minLeft, total * ratio - dividerWidth / 2));
        const rightWidth = Math.round(total - leftWidth - dividerWidth / 2);

        const leftChild = leftSlot?.assignedElements?.()[0];
        const rightChild = rightSlot?.assignedElements?.()[0];

        if (leftChild) leftChild.style.width = leftWidth + 'px';
        if (rightChild) rightChild.style.width = rightWidth + 'px';
    };

    thumb.addEventListener('pointerdown', e => {
        e.preventDefault();
        isDragging = true;
        thumb.classList.toggle("dragging");
        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    });

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const rect = host.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        ratio = currentX / rect.width;

        update();
    }

    function onUp() {
        isDragging = false;
        thumb.classList.toggle("dragging");
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
    }

    new ResizeObserver(update).observe(host);

    return {
        getHost() { return host; },
        getInstance() { return { ratio, update }; }
    };
}

const class_id = DOM.register(ctor, roles);
export default class_id;