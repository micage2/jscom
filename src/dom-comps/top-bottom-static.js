// top-bottom-static.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/top-bottom-static.html";
const fragment = await loadFragment(html_file);

// ===          roles/interfaces            ===
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
function ctor(args = {}, call) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    const total = host.offsetHeight;

    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const slot_top = shadow.querySelector('slot[name="top"]');
    const divider = shadow.querySelector('.divider');
    const slot_bottom = shadow.querySelector('slot[name="bottom"]');

    const topHeight = args.top || 32;
    const dividerHeight = args.divider || 1;

    const update = () => {
        const total = host.offsetHeight;

        const topChild = slot_top?.assignedElements?.()[0];
        const bottomChild = slot_bottom?.assignedElements?.()[0];

        if (topChild) topChild.style.height = topHeight + 'px';
        if (bottomChild) bottomChild.style.height = total - topHeight - divider.offsetHeight + 'px';
    };

    new ResizeObserver(update).observe(host);

    return {
        getHost() { return host; },
        getInstance() {
            return {
                top: topHeight,
                slot_top, slot_bottom
            };
        }
    };
}

const class_id = DOM.register(ctor, (role, action, reaction) => {
    role('TopBottom', (self) => ITopBottom(self), true);
});
export default class_id;
