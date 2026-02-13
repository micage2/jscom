// horizontal-split-mmm.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/horizontal-split-mmm.html";
const fragment = await loadFragment(html_file);

// ===          roles/interfaces            ===
const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const IContainerImpl = ({ root, data }) => ({
    setTop(child) {
        DOM.attach(this, child, { slot: 'top' });
        return this;
    },
    
    setBottom(child) {
        DOM.attach(this, child, { slot: 'bottom' });
        return this;
    }
});

const roleMap = new Map([
    ['Component', IComponentImpl],
    ['Container', IContainerImpl],
]);
const roles = (role = 'Container') => roleMap.get(role) ?? null;


// ===          constructor         ===
function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });

    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const slot_top = shadow.querySelector('slot[name="top"]');
    const slot_bottom = shadow.querySelector('slot[name="bottom"]');
    const thumb = shadow.querySelector('.thumb');

    let ratio = args.ratio ?? 0.5;
    let isDragging = false;

    const update = () => {
        const total = host.offsetHeight;
        const dividerSize = 2;
        const topHeight = Math.max(32, Math.round(total * ratio - dividerSize / 2));
        const bottomHeight = Math.max(32, total - topHeight - dividerSize);

        const topChild = slot_top?.assignedElements?.()[0];
        const bottomChild = slot_bottom?.assignedElements?.()[0];

        if (topChild) topChild.style.height = topHeight + 'px';
        if (bottomChild) bottomChild.style.height = bottomHeight + 'px';
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
        const currentY = e.clientY - rect.top;

        // ratio = Math.max(0.1, Math.min(0.9, currentY / rect.height));
        ratio = currentY / rect.height;
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
        getRootNode() { return host; },
        getData() { return { ratio, update }; }
    };
}

const class_id = DOM.register(ctor, roles);
export default class_id;
