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

function ctor({prop, config = {}}) {
    const name = prop.getName();
    const type = prop.getType();

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));

    const content = shadow.querySelector('.list-item');
    const icon = shadow.querySelector('.expander');
    icon.textContent = config.icon || '□';
    const label = shadow.querySelector('.label');
    label.textContent = config.title || prop.getName();
    const depth = config.depth || 0;

    const click_handler = function (event) {
        this.emit("selected", {
            target: this,
            keys: {
                alt: event.altKey,
                ctrl: event.ctrlKey,
                shift: event.shiftKey,
                meta: event.metaKey,
            },
            wasSelected: this.get_selected()
        });
    };
    content.onclick = click_handler.bind(this);

    const icon_click_handler = function () {
        this.emit("icon-clicked", this);
    };
    icon.onclick = icon_click_handler.bind(this);

    const that = this; // needed for emit(), otherwise 'this' is <span>
    shadow.querySelectorAll('.list-item .label').forEach((span) => {
        span.addEventListener('dblclick', () => makeEditable(that, span));
    });
    
    return {
        getInstance: () => ({ content, icon, label, depth, prop }),
        getHost: () => host,
    }
}

function makeEditable(that, span) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = span.textContent;

    // Optional: match span styling
    input.style.width = span.offsetWidth + 'px';

    span.replaceWith(input);
    input.focus();
    input.select();

    function saveEdit() {
        span.textContent = input.value;
        input.replaceWith(span);
        that.emit('label-changed', that);
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur(); // triggers saveEdit via blur
        if (e.key === 'Escape') {
            input.removeEventListener('blur', saveEdit); // cancel save
            input.replaceWith(span); // restore original span
        }
    });
}


const IListItemFactory = ({ content, icon, label, depth, prop }) => ({

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
    get_selected() { return content.classList.contains("selected"); },
    set_selected(state) {
        state ? content.classList.add("selected")
            : content.classList.remove("selected");
    },

    prop,
});

const info = {
    clsid: 'jscom.dom-comps.list-item-3',
    name: 'ListItem',
    description: 'List item with expander, label and icon.\n' +
                 'has a selected, hidden and depth state.\n' +
                 'for use in lists e.g. ListView.\n'
};

const res = DOM.register(ctor, function (role) {

    role("ListItem", self => IListItemFactory(self), true);

}, info);
export default info.clsid;