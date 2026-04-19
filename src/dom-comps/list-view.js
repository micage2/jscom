// list-view.js (internal)
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';
import SIMPLE from './simple-view.js';
import SVG from './svg-view.js';

const html_file = "./src/dom-comps/list-view.html";
const fragment = await loadFragment(html_file);

class ListView {
    constructor(options) {
        this.host = document.createElement('div');
        // this.host.style.class = "list-view"
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));

        this.slot = shadow.querySelector("slot[name='content']");

        this.itemClassId = options.itemClassId;
        this.list = [];
        this.selectedItem = null;
        this.folderIcons = {
            opened: "▽",
            closed: "▷",
            ...(options.folderIcons || {})
        };
    }

    isFolder(item) {
        if (typeof item.get_icon !== 'function') {
            console.log(`[ListView.isFolder()] item needs at least a get_icon() function ${item.uid}`);
            return false;
        }
        return this.folderIcons.opened === item.get_icon() || this.folderIcons.closed === item.get_icon();
    }
    isFolderOpen(item) { return this.folderIcons.opened === item.get_icon(); }
    isFolderClosed(item) { return this.folderIcons.closed === item.get_icon(); }

    toggleFolder(item) {
        if (!this.isFolder(item)) return;
        this.toggleSubtreeOpen(item);
        item.set_icon(this.folderIcons.closed === item.get_icon() ?
            this.folderIcons.opened :
            this.folderIcons.closed);
    }

    // true -> unfold
    fold(item, bool) {
        if (!item || !this.isFolder(item)) return; // only folders can be folded
        
        if (!bool && this.isFolderOpen(item)) return; // already opened
        if (bool && this.isFolderClosed(item)) return; // already closed

        this.toggleSubtreeOpen(item);
        item.set_icon(bool ? this.folderIcons.closed : this.folderIcons.opened);
    }

    selectItem(item) {
        // set select state of previously selected item
        if (this.selectedItem !== item) {
            this.selectedItem.set_selected(false);
            this.selectedItem = item;
            item.set_selected(true);

            this.call('selected', item);
        }
    }

    // item has to be a folder
    toggleSubtreeOpen(item) {
        let i = this.list.indexOf(item) + 1;
        while (i < this.endOfSubtree(item)) {
            const it = this.list[i];
            it.get_show() ? it.set_show(false) : it.set_show(true);

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

        const parentDepth = item.get_depth();
        let i = start + 1;

        while (i < this.list.length) {
            const d = this.list[i].get_depth();
            if (d <= parentDepth) break;
            i++;
        }

        return i;
    }

    // find previous item and index with depth === item.depth - 1
    parent(item) {
        if (typeof item.get_depth !== 'function') {
            console.log('[ListView.parent] We need at least a get_depth function on item.');
            return { index: -1, item: null };
        }

        const start = this.list.indexOf(item);
        let i = this.list.indexOf(item);
        while (i > 0) {
            i--;
            if (this.list[i].get_depth() === item.get_depth() - 1)
                return { index: i, item: this.list[i] };
        }

        return { index: -1, item: null };
    }

    // find previous item with depth === item.depth
    previousSibling(item) {
        const start = this.list.indexOf(item);
        if (start === 0) return { index: -1, item: null, parent: null };

        let i = start;
        while (i > 0) {
            i--;
            if (this.list[i].get_depth() === item.get_depth())
                return { index: i, item: this.list[i], parent: null };

            // item is first child
            if (this.list[i].get_depth() === item.get_depth() - 1)
                return { index: i, item: null, parent: this.list[i] };
        }

        // return first item
        console.warn('[ListView.previous] return list[0].');
        return { index: i, item: null, parent: this.list[0] };
    }

    // find next item with depth === item.depth
    nextSibling(item) {
        const start = this.list.indexOf(item);
        let i = start;
        while (i < this.list.length - 1) {
            i++;
            if (this.list[i].get_depth() === item.get_depth()) {
                return { index: i, item: this.list[i] };
            }

            // item is last child
            if (this.list[i].get_depth() < item.get_depth()) {
                return { index: i, item: null };
            }
        }

        // item is last subtree in list
        return { index: -1, item: null }
    }
}

const IListViewFactory = (self) => ({
    init(args = {}) {
        if (!self.items.size) {
            const root = DOM.create(self.itemClassId, {
                title: args.root || "root",
                depth: 0,
                icon: self.folderIcons.opened
            });
            DOM.attach(root, this, {
                // mode: 'parent',
                slot: 'content'
            });
            self.items.set(root.uid, root);
            self.list.push(root);
            if (typeof root.set_selected === 'function') {
                root.set_selected(true);
            }
            else {
                console.log(`IListItem need at least a set_selected() function. ${root.get_title()}`);
            }
            self.selectedItem = root;

            DOM.connect(root, 'selected', this, 'select');
            DOM.connect(root, 'icon-clicked', this, 'toggle');
            self.call('selected', root);
        }
        return this;
    },

    add(args = {}) {
        let item;
        if (args.type === "folder") {
            item = DOM.create(self.itemClassId, {
                ...args,
                icon: self.folderIcons.closed,
            });
        }
        else {
            item = DOM.create(self.itemClassId, args);
        }

        if (!args.title) item.set_title(item.uid);

        let insertAt = -1;
        let target = null;

        // no selectedItem, so push new items to the end of the list
        if (!self.selectedItem) {
            DOM.attach(item, this, { mode: 'parent', slot: "content" });
            insertAt = self.list.length;
        }
        else {
            // selectedItem is folder
            if (self.isFolder(self.selectedItem)) {
                insertAt = self.endOfSubtree(self.selectedItem);
                target = self.list[insertAt - 1];
                item.set_depth(self.selectedItem.get_depth() + 1);

                if (self.isFolderClosed(self.selectedItem)) {
                    // self.toggleFolder(self.selectedItem);
                    item.set_show(false);
                }
            }

            // selectedItem is not a folder, so find parent folder
            else {
                const parent = self.parent(self.selectedItem);
                if (parent.item) {
                    insertAt = self.endOfSubtree(parent.item);
                    target = self.list[insertAt - 1];
                    item.set_depth(parent.item.get_depth() + 1);
                }
                else {
                    insertAt = self.list.length;
                    target = self.list[insertAt - 1];
                }
            }

            DOM.attach(item, target, { mode: 'after', slot: "content" });
        }

        if (typeof item.set_show === 'function') {
            // item.set_show(true);
        }
        else {
            console.log(`[IListViewFactory.add] IListItem needs at least set_show(). ${item.get_title()}`);
        }

        // self.items.set(item.uid, item);
        self.list.splice(insertAt, 0, item);

        item.on('selected', (listitem) => {
            // console.log('[ListView.ctor] listitem selected: #', listitem.uid);        
            this.emit('selected', listitem);
            this.select(item);
        });

        item.on('icon-clicked', (listitem) => {
            // console.log('[ListView.ctor] listitem icon-clicked: #', listitem.uid);        
            this.toggle(listitem);
        });

        item.on('label-changed', listitem => {
            console.log('[ListView.ctor] label-changed', listitem.get_title());
        });

        return item; // inserted item
    },

    removeSelected() {
        if (!self.list.length) {
            console.log('[IListView.removeSelected] Nothing to remove, list is empty.');
            self.selectedItem = null;
            return;
        }

        if (!self.selectedItem) {
            console.log('[IListView.removeSelected] Nothing selected.');
            return;
        }

        // don't remove root, if its fixed TODO:
        // if (DOM.equals(self.selectedItem, self.list[0])) {
        //     return;
        // }

        // select root
        // or should we select previous sibling
        // an if there is none selects its parent
        const start = self.list.indexOf(self.selectedItem);
        const end = self.endOfSubtree(self.selectedItem);

        if (!this.selectPrevious(self.selectedItem)) {
            self.selectedItem = null;
        }

        const deletedItems = self.list.splice(start, end - start);

        DOM.detachMany(deletedItems);
        this.emit('removed-items', deletedItems);
    },

    toggle(item) {
        self.toggleFolder(item);
    },

    unfoldParent(item) {
        const parent = self.parent(item);
        if (parent.item) self.fold(parent.item)
    },

    foldLevel(depth) {

    },

    select(item, options = { no_emit: false }) {
        if (!item) return;

        if (self.selectedItem !== item) {
            if (self.selectedItem)
                self.selectedItem.set_selected(false);

            self.selectedItem = item;
            item.set_selected(true);

            let parents = [];
            let parent = { item };
            while (true) {
                parent = self.parent(parent.item);
                if (!parent.item) break;
                parents.push(parent);
            }

            // toggle parents in reverse order (like humans do)
            while (parents.length) {
                const parent = parents.pop();
                if (!self.isFolderOpen(parent.item)) {
                    self.toggleFolder(parent.item);
                }
            }

            // scroll into view
            const idx = self.list.indexOf(item);
            if (idx > -1) {
                const assignedNodes = self.slot.assignedNodes({ flatten: true });
                assignedNodes[idx].scrollIntoView({
                    // behavior: "smooth", 
                    block: "nearest",
                    container: "nearest"
                });
            }
            else {
                console.error('[IListView.select] Not in list: #', item.uid);
            }
        }

        if (!options.no_emit) {
            this.emit('selected', item);
        }
    },

    selectPrevious(item) {
        const previous = self.previousSibling(item);
        if (previous.item) {
            // self.selectItem(previous.item);
            this.select(previous.item);
        }
        else {
            const next = self.nextSibling(item);
            if (next.item) {
                this.select(next.item);
            }
            else {
                const parent = self.parent(item);
                if (parent.item) {
                    this.select(parent.item);
                }
                else {
                    // no selection possible, list mus be empty
                    return null;
                }
            }
        }

        return self.selectedItem;
    },

    get_selected() { return self.selectedItem; },
    get_first() { return self.list[0]; },
});

function ctor(options) {
    const self = new ListView(options);

    return {
        getHost: () => self.host,
        getInstance: () => self
    }
};

// ==================== Registration ======================
//
const info = {
    clsid: 'jscom.dom-comps.list-view',
    name: 'ListView',
    description: 'Container for list items. \n' +
                'can be used as a tree view'
};

const res = DOM.register(ctor, (role) => {

    role('ListView', (self) => IListViewFactory(self), true); // true = default role

}, info);
export default info.clsid;