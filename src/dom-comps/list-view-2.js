// list-view.js (internal)
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/list-view.html";
const fragment = await loadFragment(html_file);


function ctor({ props, config = {} }) {
    const self = { props, config, list: [] };
    self.host = document.createElement('div');
    const shadow = self.host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));
    self.slot = shadow.querySelector("slot[name='content']");

    self.selectedItem = null;
    self.prop2item = new WeakMap(); // prop -> item

    self.folderIcons = {
        opened: "▽",
        closed: "▷",
        ...(config.folderIcons || {})
    };    

    return {
        getHost: () => self.host,
        getInstance: () => self,
        postCreate: init
    }
};

function getSubtreeEndIndex(items, index) {
    const depth = items[index].get_depth();
    let end = index;
    for (let i = index + 1; i < items.length; i++) {
        if (items[i].get_depth() > depth) {
            end = i;
        } else {
            break;
        }
    }
    return end;
}

function isFolderOpen(self, item) { return self.folderIcons.opened === item.get_icon(); }

function toggle(self, item) {
    let i = self.list.indexOf(item);
    const end = getSubtreeEndIndex(self.list, i);
    while (i < end) {
        i++; // item after
        const descendant = self.list[i];
        descendant.set_show(descendant.get_show() ? false : true);

        // skip closed subtrees
        if (!isFolderOpen(self, descendant)) {
            i = getSubtreeEndIndex(self.list, i);
            continue;
        }
    }
    item.set_icon(isFolderOpen(self, item) ? self.folderIcons.closed : self.folderIcons.opened );
}

function selectItem(self, item) {
    if (self.selectedItem) self.selectedItem.set_selected(false);
    self.selectedItem = item;
    item.set_selected(true);
}

function findItem(self, prop) {
    let item = self.prop2item.get(prop)
    if (item) return item;

    self.prop.traverse((prop) => {
        if (0) {}
    });

    return item;
}

function scrollIntoView(self, item) {
    const idx = self.list.indexOf(item);
    if (idx > -1) {
        const assignedNodes = self.slot.assignedNodes({ flatten: true });
        assignedNodes[idx].scrollIntoView({
            // behavior: "smooth", 
            block: "nearest",
            container: "nearest"
        });
    }
}

function init(self) {
    const { props, config } = self;
    const that = this;

    // Populate tree by traversing subtree of added prop
    props.on('prop-added', (prop) => {
        prop.traverse((prop, info) => {
            const item = DOM.create(config.item_clsid, {
                prop,
                config: {
                    title: prop.getName() || prop.getType(),
                    depth: info.depth,
                    icon: self.config.folderIcons?.opened || self.folderIcons.opened,
                }
            });
            item.set_depth(info.depth);
            DOM.attach(item, that, { slot: 'content' });
            self.list.push(item);

            // rename root from 'content' to parents name
            if (info.depth === 0) {
                item.set_title(props.getName());
            }

            item.on('selected', () => {
                selectItem(self, item);
                that.emit('selected', item);
            });
    
            item.on('icon-clicked', () => {
                toggle(self, item);
            });

            // cache prop -> item, makes later traversal unnecessary
            self.prop2item.set(prop, item);    
        });

        // select first item (root)
        if (self.list.length) {
            const item = self.list[0];
            selectItem(self, item);
            that.emit('selected', item);
        }
    });
}

const IListViewFactory = (self) => ({
    removeSelected() {},
    select(prop) {
        const item = findItem(self, prop);
        selectItem(self, item);
        scrollIntoView(self, item);
    }
});

// ==================== Registration ======================
//
const info = {
    clsid: 'jscom.dom-comps.list-view-2',
    name: 'ListView',
    description: 'Container for list items. \n' +
                'can be used as a tree view'
};

const res = DOM.register(ctor, (role) => {

    role('ListView2', (self) => IListViewFactory(self), true); // true = default role

}, info);
export default info.clsid;