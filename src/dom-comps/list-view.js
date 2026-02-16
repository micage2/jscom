// src/dom-comps/list-view.js
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
        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));

        this.itemClassId = args.itemClassId;
        this.items = new Map();
        this.list = [];
        this.selectedItem = "";

        bus.on('list-item:expanded', ({uid}) => {
            const item = this.items.get(uid);
            item.open = item.open ? false : true;
            this.toggleSubtreeOpen(item);

            console.log(`expanded ${uid}, open: ${item.open}`);
            bus.emit('list-view:item-expanded', { item })
        });

        bus.on('list-item:selected', ({uid}) => {
            const item = this.items.get(uid);
            this.selectItem(item);
        });
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

    toggleSubtreeOpen(item) {
        let i = this.list.indexOf(item) + 1;
        while(i < this.endOfSubtree(item)) {
            const it = this.list[i];
            it.show = !it.show;

            // skip closed subtrees
            if (it.isParent && !it.open) {
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

    getHost() {
        return this.host;
    }
    getInstance() {
        return this;
    }
}

function ctor(args = {}) { return new ListView(args); }

const IListView = ({ host, instance: self }) => {
    return {
        // sadly we need this init step.
        init() {
            if (!self.items.size) {
                const root = DOM.create(self.itemClassId, { label: "root", uid: uid(), depth: 0 });
                DOM.attach(this, root, { slot: "content" });
                self.items.set(root.uid, root);
                self.list.push(root);
                root.selected = true;
                self.selectedItem = root;
                bus.emit('list-view:item-selected', { item: root })
            }
            return this;
        },
        add(args = {}) {
            const insertAt = self.endOfSubtree(self.selectedItem);
            const sibl = self.list[insertAt-1];
            self.selectedItem.isParent = true;
            if (!self.selectedItem.open) {
                self.toggleSubtreeOpen(self.selectedItem);
                self.selectedItem.open =! self.selectedItem.open;
            }

            const item = DOM.create(self.itemClassId, args);
            item.depth = self.selectedItem ? self.selectedItem.depth + 1 : 0
            DOM.after(item, sibl, { slot: "content" });
            item.show = !self.selectedItem.open;

            self.items.set(item.uid, item);
            self.list.splice(insertAt, 0, item);

            // update selection listners
            bus.emit('list-view:item-selected', { item: self.selectedItem });

            return this; // this IListView
        },
        remove(uid) {
            const item = self.items.get(uid);
            const idx = self.list.indexOf(item);

        },
        select(uid) {
            const item = self.items.get(uid);
            self.selectItem(item);
        }
    };
};

const roleMap = new Map([
    ["ListView", IListView],
]);
const roleProvider = (role = "ListView") => roleMap.get(role) ?? null;


const LIST_VIEW_CLSID = DOM.register(ctor, roleProvider); // no roles needed
export default LIST_VIEW_CLSID;