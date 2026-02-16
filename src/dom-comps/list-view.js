// src/dom-comps/list-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment, uid } from '../shared/dom-helper.js';
import { bus } from '../shared/event-bus.js';

const html_file = "./src/dom-comps/list-view.html";
const fragment = await loadFragment(html_file);

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

        bus.on('list-item:expander', ({uid}) => {
            const item = this.items.get(uid);
            console.log(`expand ${uid}, open: ${item.open}`);
            item.open = item.open ? false : true;
            this.toggleSubtreeOpen(item);
        });
        bus.on('list-item:selected', ({uid}) => {
            if (this.selectedItem) {
                this.selectedItem.selected = false;
            }
            const item = this.items.get(uid);
            console.log(`${item.text}, d: ${item.depth}`);
            item.selected = true;
            this.selectedItem = item;            
        });
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
                const root = DOM.create(self.itemClassId, { label: "root (0)", uid: uid(), depth: 0 });
                DOM.attach(this, root, { slot: "content" });
                self.items.set(root.uid, root);
                self.list.push(root);
                root.selected = true;
                self.selectedItem = root;
            }
            return this;
        },

// Note: when adding we have to find the last child of the
// selected item. This is done by walking down the list of items,
// starting with the next item after the selected item, and
// check for each item if it has item.depth == selectedItem.depth.
// If it has, we insert a new item before this item and set
// the new items depth to selectedItem.depth + 1.

        add(args = {}) {
            const insertAt = self.endOfSubtree(self.selectedItem);
            const sibl = self.list[insertAt-1];
            self.selectedItem.isParent = true;

            const item = DOM.create(self.itemClassId, args);
            item.depth = self.selectedItem ? self.selectedItem.depth + 1 : 0
            DOM.after(item, sibl, { slot: "content" });
            item.show = !self.selectedItem.open;

            self.items.set(item.uid, item);
            self.list.splice(insertAt, 0, item);

            return this; // this IListView
        },
        select(uid) {

        }
    };
};

const roleMap = new Map([
    ["ListView", IListView],
]);
const roleProvider = (role = "ListView") => roleMap.get(role) ?? null;


const LIST_VIEW_CLSID = DOM.register(ctor, roleProvider); // no roles needed
export default LIST_VIEW_CLSID;