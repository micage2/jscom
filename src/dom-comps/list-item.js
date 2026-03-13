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

function ctor(args = {}) {

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));

    const content = shadow.querySelector('.list-item');
    const icon = shadow.querySelector('.expander');
    icon.textContent = args.icon || '□';
    const label = shadow.querySelector('.label');
    label.textContent = args.title;
    const depth = args.depth || 0;

    const click_handler = function(e) {
        this.emit("selected", this);
    };
    content.onclick = click_handler.bind(this);

    const icon_click_handler = function() {
        this.emit("icon-clicked", this);
    };
    icon.onclick = icon_click_handler.bind(this);

    const label_dblclick_handler = function() {
        this.emit("double-clicked", this);
    };
    label.ondblclick = label_dblclick_handler.bind(this);

    const iface = args.iface;
    if (!args.iface) {
        console.log('[ListItem.ctor] No interface for: ', this.uid);        
    }

    return {
        getInstance: () => ({content, icon, label, depth, iface}),
        getHost: () => host,
    }
}

const IListItemFactory = ({content, icon, label, depth, iface}) => ({
    // determines indentation of item content
    get_depth() { return depth; },
    set_depth(d) {
        icon.style.marginLeft = `${d * 14}px`;
        depth = d;
    },

    // show/hide item
    get_show() { return !content.classList.contains('hidden'); },
    set_show(state) {
        state ? content.classList.remove('hidden')
                : content.classList.add('hidden');
    },

    // icon
    get_icon() { return icon.textContent; },
    set_icon(code) { icon.textContent = code; },
    
    // label text
    get_title() { return label.textContent; },
    set_title(str) { label.textContent = str; },

    // select/deselect state
    get_selected() { content.classList.contains("selected"); },
    set_selected(state) {
        state ? content.classList.add("selected")
                : content.classList.remove("selected");
    },
    iface,
});

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("ListItem", self => IListItemFactory(self), true);

    action('selected');
    action('icon-clicked');
}, {
    name: 'ListItem',
    description: 'ListItem for use in lists e.g. ListView.\n' +
        'It has an icon and a label.\n' +
        'It also has a select, hidden and depth state.'
});
export default clsid;