// src/dom-comps/tab-bar.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment, uid } from '../shared/dom-helper.js';
import { bus } from '../shared/event-bus.js';

const html_file = "./src/dom-comps/tab-bar.html";
const fragment = await loadFragment(html_file);

/** @implements IDomNode */
class TabBar {
    constructor(args) {
        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));
        this.uid = uid();

        this.row = shadow.querySelector('.tab-bar');

        this.row.addEventListener("click", (e) => {
            bus.emit("tab-bar:selected", { uid: this.uid });
        });
    }
    getHost() { return this.host; }
    getInstance() { return this; }
}

const ctor = (args = {}) => new TabBar(args);

const ITabBar = (self) => {
    return {
        get uid() { return self.uid; },

        addTab(tabElement, panelElement, activate = false) {
            DOM.attach(tabElement, this, { slot: 'tabs' });
            DOM.attach(panelElement, this); // default slot = content area

            // Optional: set panel hidden by default, show when active
            panelElement.hidden = true;

            if (activate) this.activateTab(tabElement);
            return this;
        },

        activateTab(tab) {
            // remove active from all
            root.shadowRoot.querySelectorAll('slot[name="tabs"] ::slotted(*)')
                .forEach(el => el.removeAttribute('active'));

            tab.setAttribute('active', '');

            // find corresponding panel (by index, data-tab-id, or aria-controls)
            // then hide all panels, show the matching one
        }
    };
};

const roleMap = new Map([
    ["TabBar", ITabBar],
]);
const roleProvider = (role = "TabBar") => roleMap.get(role) ?? null;

const cls_id = DOM.register(ctor, roleProvider);
export default cls_id;