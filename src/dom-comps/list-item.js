// src/dom-comps/list-item.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';

/**
 * actions:
 *      "selected"
 *      "icon-clicked"
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
    
        this.content = shadow.querySelector('.list-item');
        this.icon = shadow.querySelector('.expander');
        this.icon.textContent = args.icon || '□';
        this.label = shadow.querySelector('.label');
        this.label.textContent = args.title;
        this.depth = args.depth || 0;
    }

    // IDomNode impl
    getHost() { return this.host; }
    getInstance() { return this; }
}

/** 
 * @param {ListItem}
 * @returns {IListItem}
 */
const IListItemFactory = (item) => ({
    // determines indentation of item content
    get_depth() { return item.depth; },
    set_depth(d) {
        item.icon.style.marginLeft = `${d * 14}px`;
        item.depth = d;
    },

    // show/hide item
    get_show() { return !item.content.classList.contains('hidden'); },
    set_show(state) {
        state ? item.content.classList.remove('hidden')
                : item.content.classList.add('hidden');
    },

    // icon
    get_icon() { return item.icon.textContent; },
    set_icon(code) { item.icon.textContent = code; },
    
    // label text
    get_title() { return item.label.textContent; },
    set_title(str) { item.label.textContent = str; },

    // select/deselect state
    get_selected() { item.content.classList.contains("selected"); },
    set_selected(state) {
        state ? item.content.classList.add("selected")
                : item.content.classList.remove("selected");
    },

});

function ctor(args = {}, call) {

    const item = new ListItem(args);

    const click_handler = function(e) {
        call("selected", this.uid);
    };
    item.content.onclick = click_handler.bind(this); // impportant!

    const icon_click_handler = function() {
        call("icon-clicked", this.uid);
    };
    item.icon.onclick = icon_click_handler.bind(this); // impportant!

    return item;
}

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("ListItem", self => IListItemFactory(self), true);

    action('selected');
    action('icon-clicked');
}, {
    name: 'ListItem'
});
export default clsid;