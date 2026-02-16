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
const fragment = await loadFragment(html_file);

class ListItem {
    constructor(args) {
        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));
        this.uid = uid();
    
        this.row = shadow.querySelector('.list-item');
        this.expander = shadow.querySelector('.expander');
        this.label = shadow.querySelector('.label');
        this.label.textContent = args.label || this.uid;
        this.depth = args.depth || 0;

        this.row.addEventListener("click", (e) => {
            bus.emit("list-item:selected", { uid: this.uid });
        });    
        this.expander.addEventListener("click", (e) => {
            bus.emit("list-item:expanded", { uid: this.uid });
        });    
    }
    getHost() { return this.host; }
    getInstance() { return this; }
}

function ctor(args = {}) {
    return new ListItem(args);
}

const IListItem = ({ host, instance: self }) => {
    return {
        get uid() { return self.uid; },
        
        // determines indentation of item content
        get depth() { return self.depth; },
        set depth(d) {
            self.expander.style.marginLeft = `${d * 14}px`;
            self.depth = d;
        },

        // show/hide item
        get show() { return self.row.classList.contains('hidden'); },
        set show(state) {
            state ? self.row.classList.add('hidden')
                  : self.row.classList.remove('hidden');
        },
        
        // label text
        get text() { return self.label.textContent; },
        set text(str) { self.label.textContent = str; },

        // expand/collape state
        get open() { return self.expander.textContent === "▷" ? false : true },
        set open(state) {
            self.expander.textContent = state ? "▽" : "▷";
        },
        
        // select/deselect state
        get selected() { self.row.classList.contains("selected"); },
        set selected(state) {
            state ? self.row.classList.add("selected")
                  : self.row.classList.remove("selected");
        },

        // isParent state - display down/right arrow
        get isParent() { return self.row.classList.contains("has-children"); },
        set isParent(state) {
            state ? self.row.classList.add("has-children") 
                  : self.row.classList.remove("has-children");
        },
    };
};

const roleMap = new Map([
    ["ListItem", IListItem],
]);
const roleProvider = (role = "ListItem") => roleMap.get(role) ?? null;

const LIST_ITEM_CLSID = DOM.register(ctor, roleProvider);
export default LIST_ITEM_CLSID;