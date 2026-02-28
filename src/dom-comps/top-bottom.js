// horizontal-split-mmm.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';


const html_file = "./src/dom-comps/top-bottom.html";
const fragment = await loadFragment(html_file);

// ===          roles         ===
const ITopBottom = (self) => ({
    setTop(child) {
        DOM.attach(child, this, {
            mode: 'parent',
            slot: 'top'
        });
        return this;
    },

    setBottom(child) {
        DOM.attach(child, this, {
            mode: 'parent',
            slot: 'bottom'
        });
        return this;
    }
});


// ===          constructor         ===
function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });

    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const slot_top = shadow.querySelector('slot[name="top"]');
    const slot_bottom = shadow.querySelector('slot[name="bottom"]');
    const divider = shadow.querySelector('.divider');
    const dividerHeight = divider.offsetHeight;
    const thumb = shadow.querySelector('.thumb');

    const minTop = args.minTop || 2;
    const minBottom = args.minBottom || 2;

    let ratio = args.ratio ?? 0.5;
    let isDragging = false;

    const update = () => {
        const total = host.offsetHeight;
        const topHeight = Math.min(total - minBottom, Math.max(minTop, total * ratio - dividerHeight / 2));
        const bottomHeight = total - topHeight - dividerHeight / 2;

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
        const pointerY = e.clientY - rect.top; // relative pointer pos-Y
        // ratio = Math.max(0.0, Math.min(1.0, pointerY / rect.height));
        ratio = pointerY / rect.height;
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
        getInstance() { return {}; }
    };
}

const class_id = DOM.register(ctor, (role, action, reaction) => {
    role('TopBottom', (self) => ITopBottom(self), true);
});
export default class_id;
