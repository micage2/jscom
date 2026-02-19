// horizontal-static-split.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/horizontal-static-split.html";
const fragment = await loadFragment(html_file);

// ===          roles/interfaces            ===
const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const IContainerImpl = (self) => ({
    setTop(child) {
        DOM.attach(child, this, {
            mode: 'parent',
            slot: 'top'
        });

        return this;
    },
    
    setBottom(child) {
        DOM.attach(child, this, {
            slot: 'bottom'
        });
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
    const total = host.offsetHeight;

    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const slot_top = shadow.querySelector('slot[name="top"]');
    const slot_bottom = shadow.querySelector('slot[name="bottom"]');

    const topHeight = args.top || 32;
    if (slot_top) slot_top.style.height = topHeight + 'px !important';
    if (slot_bottom) slot_bottom.style.height = total - topHeight + 'px';

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

const class_id = DOM.register(ctor, roles);
export default class_id;
