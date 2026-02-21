// src/dom-comps/list-view.js
/** @import { IListItem } from './InterfaceTypes.js' */

import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment, uid } from '../shared/dom-helper.js';
import { bus } from '../shared/event-bus.js';

const html_file = "./src/dom-comps/list-view.html";
const fragment = await loadFragment(html_file);

/**
 * emits:
 *      "list-view:item-expanded", msg: { item }
 *      "list-view:item-selected", msg: { item }
*/


/** @implements IDomNode */
class ListView {
    constructor(args) {
        this.msg_sources = new Set();

        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));

        this.itemClassId = args.itemClassId;
        this.items = new Map();
        this.list = [];
        this.selectedItem = "";
        this.folderIcons = { open: "▽", closed: "▷", ...(args.folderIcons || {}) };

        bus.on('list-item:icon-clicked', ({uid, label, icon}) => {
            const item = this.items.get(uid);

            // this can also come from other instances of ListView
            // so better check if this message belongs to us
            if (item) this.toggleFolder(item);
        });

        bus.on('list-item:selected', ({uid}) => {
            const item = this.items.get(uid);
            if (!item) {
                // console.error(`Item does not exist. ${item}`);                
            }
            else this.selectItem(item);
        });
    }

    isFolder(item) {
        return this.folderIcons.open === item.icon || this.folderIcons.closed === item.icon;
    }

    isFolderOpen(item) { return this.folderIcons.open === item.icon; }
    isFolderClosed(item) { return this.folderIcons.closed === item.icon; }

    toggleFolder(item) {
        if (!this.isFolder(item)) return;
        this.toggleSubtreeOpen(item);
        item.icon = this.folderIcons.closed === item.icon ?
            this.folderIcons.open : 
            this.folderIcons.closed;
}

    selectItem(item) {
        // set select state of previously selected item
        if (this.selectedItem) {
            this.selectedItem.selected = false;
        }
        item.selected = true;
        this.selectedItem = item;            

        // console.log(`${item.text} (${item.depth})`);
        bus.emit('list-view:item-selected', { item });
    }

    // item has to be a folder
    toggleSubtreeOpen(item) {
        let i = this.list.indexOf(item) + 1;
        while(i < this.endOfSubtree(item)) {
            const it = this.list[i];
            it.show = !it.show;

            // skip closed subtrees
            if (this.isFolderClosed(it)) {
                i = this.endOfSubtree(it);
                continue;
            }            
            i++;
        }
    }

    endOfSubtree(item) {
        const start = this.list.indexOf(item);
        if (start < 0) return this.list.length;

        const parentDepth = item.depth;
        let i = start + 1;

        while (i < this.list.length) {
            const d = this.list[i].depth;
            if (d <= parentDepth) break;
            i++;
        }

        return i;
    }

    // find previous item with depth === item.depth - 1
    parent(item) {
        const start = this.list.indexOf(item);
        if (start === 0) return null; // item is root

        let i = start;
        while (i > 0) {
            i--;
            if(this.list[i].depth === item.depth - 1)
                return { index: i, item: this.list[i] };
        }
        return null; // impossible
    }
    // find previous item with depth === item.depth
    previous(item) {
        const start = this.list.indexOf(item);
        if (start === 0) return null;

        let i = start;
        while (i > 0) {
            i--;
            if(this.list[i].depth === item.depth)
                return { index: i, item: this.list[i] };
            if(this.list[i].depth === item.depth - 1)
                return { index: i, item: null, parent: this.list[i] };
        }
        return { index: i, item: null, parent: this.list[0] };
    }
    // find next item with depth === item.depth
    next(item) {        
    }

    // IDomNode impl
    getHost() {
        return this.host;
    }
    getInstance() {
        return this;
    }
}

function ctor(args = {}) { return new ListView(args); }

// called by DomRegistry, "self" is what ctor returns
// default interface
const IListView = (self) => {
    const selItem = self.selectedItem;
    return {
        // sadly we need this init step.
        // We need a registered role to call DOM.attach()
        init() {
            if (!self.items.size) {
                const root = DOM.create(self.itemClassId, {
                    label: "root", uid: uid(), depth: 0, icon: self.folderIcons.open
                });
                DOM.attach(root, this, {
                    mode: 'parent',
                    slot: 'content'
                });
                self.items.set(root.uid, root);
                self.list.push(root);
                root.selected = true;
                self.selectedItem = root;
                bus.emit('list-view:item-selected', { item: root })
            }
            return this;
        },

        add(args = {}) {
            let item = null;
            if (args.type === "folder") {
                item = DOM.create(self.itemClassId, {
                    icon: self.folderIcons.open
                });
            }
            else {
                item = DOM.create(self.itemClassId, args);
            }

            let insertAt = -1;
            let target = null;
            if (self.isFolder(self.selectedItem)) {
                insertAt = self.endOfSubtree(self.selectedItem);
                target = self.list[insertAt-1];
                item.depth = self.selectedItem.depth + 1;

                if (self.isFolderClosed(self.selectedItem)) {
                    self.toggleFolder(self.selectedItem);
                }
            }
            else {
                // find parent folder
                const parent = self.parent(self.selectedItem);
                insertAt = self.endOfSubtree(parent.item);
                target = self.list[insertAt-1];
                item.depth = parent.item.depth + 1;
            }

            DOM.attach(item, target, { mode: 'after', slot: "content" });
            
            item.show = true; // TODO:

            self.items.set(item.uid, item);
            self.list.splice(insertAt, 0, item);

            // update selection listners
            bus.emit('list-view:item-selected', { item: self.selectedItem });

            return item; // inserted item
        },

        removeSelected() {
            // don't remove root
            if (DOM.equals(self.selectedItem, self.list[0])) {
                return;
            }

            // select root
            // or should we select previous sibling
            // an if there is none selects its parent
            const start = self.list.indexOf(self.selectedItem);
            const end = self.endOfSubtree(self.selectedItem);

            // self.selectItem(self.list[0]); // TODO: select previous sibling
            const previous = self.previous(self.selectedItem);
            if(previous.item) {
                self.selectItem(previous.item);
            }
            else {
                self.selectItem(previous.parent);
            }

            const deletedItems = self.list.splice(start, end-start);
            for(const it of deletedItems)
                self.items.delete(it.uid);

            DOM.detachMany(deletedItems);
        },

        select: (item) => self.selectItem(item),
    };
};

const IMsgTarget = (self) => {
    return {
        connect(source_uid) {
            self.msg_sources.add(source_uid);
        },
        disconnect(source_uid) {
            self.msg_sources.delete(source_uid);
        },
        isConnected(source_uid) {
            return self.msg_sources.has(source_uid);
        }
    }
};

const roleMap = new Map([
    ["ListView", IListView],
    ["MsgTarget", IMsgTarget],

]);
const roleProvider = (role = "ListView") => roleMap.get(role) ?? null;


const LIST_VIEW_CLSID = DOM.register(ctor, roleProvider);
export default LIST_VIEW_CLSID;