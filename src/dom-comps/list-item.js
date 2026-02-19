// src/dom-comps/list-item.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment, uid } from '../shared/dom-helper.js';
import { bus } from '../shared/event-bus.js';

/**
 * emits:
 *      "list-item:selected"
 *      "list-item:expanded"
 */


const html_file = "./src/dom-comps/list-item.html";

/** @type {DocumentFragment} */
const fragment = await loadFragment(html_file);

/** @implements {IDomNode} */
class ListItem {
    constructor(args = {}) {
        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));
        this.uid = uid();
    
        this.content = shadow.querySelector('.list-item');
        this.icon = shadow.querySelector('.expander');
        this.icon.textContent = args.icon || '□';
        this.label = shadow.querySelector('.label');
        this.label.textContent = args.label || this.uid;
        this.depth = args.depth || 0;

        this.content.addEventListener("click", (e) => {
            bus.emit("list-item:selected", { uid: this.uid });
        });    
        this.icon.addEventListener("click", (e) => {
            bus.emit("list-item:icon-clicked", {
                uid: this.uid,
                label: this.label.textContent,
                icon: this.icon.textContent
            });
        });    
    }

    // IDomNode impl
    getHost() { return this.host; }
    getInstance() { return this; }
}

/**
 * @param {Object} args
 * @property {number} [args.depth]
 * @property {string} [args.label]
 * @returns {ListItem}
 */
function ctor(args = {}) {
    return new ListItem(args);
}

/** 
 * @param {ListItem}
 * @returns {IListItem}
 */
const IListItem = (item) => ({
    get uid() { return item.uid; },
    
    // determines indentation of item content
    get depth() { return item.depth; },
    set depth(d) {
        item.icon.style.marginLeft = `${d * 14}px`;
        item.depth = d;
    },

    // show/hide item
    get show() { return !item.content.classList.contains('hidden'); },
    set show(state) {
        state ? item.content.classList.remove('hidden')
                : item.content.classList.add('hidden');
    },

    // icon
    get icon() { return item.icon.textContent; },
    set icon(code) { item.icon.textContent = code; },
    
    // label text
    get text() { return item.label.textContent; },
    set text(str) { item.label.textContent = str; },

    // select/deselect state
    get selected() { item.content.classList.contains("selected"); },
    set selected(state) {
        state ? item.content.classList.add("selected")
                : item.content.classList.remove("selected");
    },

});

const roleMap = new Map([
    ["ListItem", IListItem],
]);
const roleProvider = (role = "ListItem") => roleMap.get(role) ?? null;

const LIST_ITEM_CLSID = DOM.register(ctor, roleProvider);
export default LIST_ITEM_CLSID;