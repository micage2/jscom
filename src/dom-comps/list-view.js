// list-view.js (internal)
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';
import SIMPLE from './simple-view.js';
import SVG from './svg-view.js';

const html_file = "./src/dom-comps/list-view.html";
const fragment = await loadFragment(html_file);

class ListView {
    constructor(options, call) {
        this.call = call;
        
        this.host = document.createElement('div');
        // this.host.style.class = "list-view"
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));

        this.itemClassId = options.itemClassId;
        this.items = new Map();
        this.list = [];
        this.selectedItem = null;
        this.folderIcons = {
            open: "▽",
            closed: "▷",
            ...(options.folderIcons || {})
        };
    }

    isFolder(item) {
        if (typeof item.get_icon !== 'function') {
            console.log(`[ListView.isFolder()] item needs alt least a get_icon() function ${item.uid}`);            
            return false;
        }
        return this.folderIcons.open === item.get_icon() || this.folderIcons.closed === item.get_icon();
    }
    isFolderOpen(item) { return this.folderIcons.open === item.get_icon(); }
    isFolderClosed(item) { return this.folderIcons.closed === item.get_icon(); }

    toggleFolder(item) {
        if (!this.isFolder(item)) return;
        this.toggleSubtreeOpen(item);
        item.set_icon(this.folderIcons.closed === item.get_icon() ?
            this.folderIcons.open :
            this.folderIcons.closed);
    }

    selectItem(item) {
        // set select state of previously selected item
        if (this.selectedItem && this.selectedItem !== item) {
            this.selectedItem.set_selected(false);
            this.selectedItem = item;
            item.set_selected(true);                
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

    // find previous item with depth === item.depth - 1
    parent(item) {
        if (typeof item.get_depth !== 'function') return;

        const start = this.list.indexOf(item);
        if (start === 0) return null; // item is root

        let i = start;
        while (i > 0) {
            i--;
            if (this.list[i].get_depth() === item.get_depth() - 1)
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
            if (this.list[i].get_depth() === item.get_depth())
                return { index: i, item: this.list[i] };
            if (this.list[i].get_depth() === item.get_depth() - 1)
                return { index: i, item: null, parent: this.list[i] };
        }
        return { index: i, item: null, parent: this.list[0] };
    }
    // find next item with depth === item.depth
    next(item) {
    }

    __addItem(item) {
        console.log('ListView added:', item);
        return 'added';
    }

    addFolder() {
        return addItem({type: "folder"});
    }

    addItem(args = {}) {
        debugger;
        if (!this.selectedItem) return "not possible";

        let item = null;
        if (args.type === "folder") {
            item = DOM.create(self.itemClassId, {
                icon: this.folderIcons.open
            });
        }
        else {
            item = DOM.create(this.itemClassId, args);
        }

        let insertAt = -1;
        let target = null;
        if (this.isFolder(this.selectedItem)) {
            insertAt = this.endOfSubtree(this.selectedItem);
            target = this.list[insertAt - 1];
            item.set_depth(this.selectedItem.get_depth() + 1);

            if (this.isFolderClosed(this.selectedItem)) {
                this.toggleFolder(this.selectedItem);
            }
        }
        else { // find parent folder            
            const parent = this.parent(this.selectedItem);
            insertAt = this.endOfSubtree(parent.item);
            target = this.list[insertAt - 1];
            item.set_depth(parent.item.get_depth() + 1);
        }

        DOM.attach(item, target, { mode: 'after', slot: "content" });

        item.set_show(true); // TODO:

        this.items.set(item.uid, item);
        this.list.splice(insertAt, 0, item);

        // update selection listners
        this.call('item-selected', { item: this.selectedItem });

        return item; // inserted item
    }
}


const IListViewFactory = (self) => {
    const selItem = self.selectedItem;
    return {
        // sadly we need this init step.
        // We need a registered role to call DOM.attach()
        init(args = {}) {
            if (!self.items.size) {
                const root = DOM.create(self.itemClassId, {
                    title: args.root || "root", depth: 0, icon: self.folderIcons.open
                });
                DOM.attach(root, this, {
                    mode: 'parent',
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
                self.call('item-selected', root);
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

            item.set_title(args.title || item.uid);

            let insertAt = -1;
            let target = null;
            if (!self.selectedItem) {
                self.selectedItem = item;
                target = this;

                DOM.attach(item, target, { mode: 'parent', slot: "content" });
            }
            else {
                if (self.isFolder(self.selectedItem)) {
                    insertAt = self.endOfSubtree(self.selectedItem);
                    target = self.list[insertAt - 1];
                    item.set_depth(self.selectedItem.get_depth() + 1);

                    if (self.isFolderClosed(self.selectedItem)) {
                        self.toggleFolder(self.selectedItem);
                    }
                }
                else {
                    // find parent folder
                    const parent = self.parent(self.selectedItem);
                    if (parent) {
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
                item.set_show(true);
            }
            else {
                console.log(`IListItem needs at least set_show(). ${item.get_title()}`);                
            }

            self.items.set(item.uid, item);
            self.list.splice(insertAt, 0, item);

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
            if (previous.item) {
                self.selectItem(previous.item);
            }
            else {
                self.selectItem(previous.parent);
            }

            const deletedItems = self.list.splice(start, end - start);
            for (const it of deletedItems)
                self.items.delete(it.uid);

            DOM.detachMany(deletedItems);
        },

        toggle(item_uid) {
            const item = self.items.get(item_uid);
            self.toggleFolder(item);
        },

        select(item_uid) {
            const item = self.items.get(item_uid);
            self.selectItem(item);

            
            // TODO:
            // get view data and view's clsid
            // create a view with view's data
            let that = this;
            setTimeout(() => {
                that.call('selected', {
                    title: item.get_title(),
                    view: DOM.create(SVG, { title: item.get_title() })
                });
            });
        }
    };
};


const ctor = (options, call) => {
    const self = new ListView(options, call);
    return {
        getHost: () => self.host,
        getInstance: () => self
    }
};

// 'this' in 'reaction()' is IListView object
const clsid = DOM.register(ctor, (role, action, reaction) => {
    
    role('ListView', (self) => IListViewFactory(self), true); // true = default role

    action('selected');    

    reaction('add-item', function(args) {
        const item = this.add(args);
        if (!item) {
            console.log(`[ListView DOM:reaction('add-item')] No item added.`);
            return false;            
        }
        if (!DOM.connect(item, 'selected', this, 'select')) {
            console.log(`[ListView DOM:reaction('add-item')] 
                Could not connect item ${item.uid} with action 'selected'.`);
            return false;            
        }
        if (!DOM.connect(item, 'icon-clicked', this, 'toggle')) {
            console.log(`[ListView DOM:reaction('add-item')] Could not connect item ${item.uid}.`);
            return false;            
        }
        
    });

    reaction('add-folder', function(args = {}) {
        const item = this.add({...args, type: 'folder'});
        DOM.connect(item, 'selected', this, 'select');
        DOM.connect(item, 'icon-clicked', this, 'toggle');
    });

    reaction('remove-selected', function() {
        this.removeSelected();
    });

    reaction('select', function(item_uid) {
        this.select(item_uid)
    });

    reaction('toggle', function(item_uid) {
        this.toggle(item_uid)
    });
}, {
    name: 'ListView'
});
export default clsid;