// src/controller/tree-controller.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { bus } from '../shared/event-bus.js';
import LIST_VIEW_CLSID from '../dom-comps/list-view.js';
import LIST_ITEM_CLSID from '../dom-comps/list-item.js';

export class TreeController {
    constructor() {
        this.listView = DOM.create(LIST_VIEW_CLSID);
        this.visibleItems = [];
        this.selectedItem = null;
        this.expanded = new WeakMap();
        this.itemCache = new WeakMap();
    }

    attach(modelRoot) {
        this.modelRoot = modelRoot;
        this._setupListeners();
        this._renderRoot();
    }

    _setupListeners() {
        bus.on(`${LIST_ITEM_CLSID}:select-request`, ({ item }) => {
            if (this.selectedItem) {
                this.selectedItem.setDisplayState({ isSelected: false });
            }
            this.selectedItem = item;
            item.setDisplayState({ isSelected: true });
            bus.emit('tree:selection-changed', { node: item.getModelNode() });
        });

        bus.on(`${LIST_ITEM_CLSID}:toggle-request`, ({ item }) => {
            const node = item.getModelNode();
            const isExpanded = this.expanded.get(node) ?? false;

            if (isExpanded) {
                this._collapse(item, node);
            } else {
                this._expand(item, node);
            }
        });
    }

    _renderRoot() {
        const rootItem = this._getOrCreateItem(this.modelRoot, 0);
        this.visibleItems = [rootItem];
        DOM.attachMany(this.listView, [rootItem], { slot: 'content' });
        rootItem.setDisplayState({ isSelected: true });
        this.selectedItem = rootItem;
    }

    _getOrCreateItem(node, depth) {
        let item = this.itemCache.get(node);
        if (!item) {
            item = DOM.create(LIST_ITEM_CLSID, { payload: node.P });

            item.setOnSelect(() => bus.emit(`${LIST_ITEM_CLSID}:select-request`, { item }));
            item.setOnToggle(() => bus.emit(`${LIST_ITEM_CLSID}:toggle-request`, { item }));

            this.itemCache.set(node, item);
        }

        item.setDisplayState({
            depth,
            isExpanded: this.expanded.get(node) ?? false,
            isSelected: node === this.selectedItem?.getModelNode(),
            hasChildren: (node.children?.length ?? 0) > 0,
            payload: node.P ?? {}
        });

        return item;
    }

    _expand(parentItem, parentNode) {
        this.expanded.set(parentNode, true);
        parentItem.setDisplayState({ isExpanded: true });

        const children = parentNode.children ?? [];
        if (children.length === 0) return;

        const childItems = children.map(childNode =>
            this._getOrCreateItem(childNode, parentItem.depth + 1)
        );

        const idx = this.visibleItems.indexOf(parentItem);
        this.visibleItems.splice(idx + 1, 0, ...childItems);

        DOM.attachMany(this.listView, childItems, { slot: 'content' });
    }

    _collapse(parentItem, parentNode) {
        this.expanded.set(parentNode, false);
        parentItem.setDisplayState({ isExpanded: false });

        const idx = this.visibleItems.indexOf(parentItem);
        let count = 0;
        let i = idx + 1;
        while (i < this.visibleItems.length) {
            const next = this.visibleItems[i];
            if (next.depth <= parentItem.depth) break;
            DOM.detach(next);
            count++;
            i++;
        }

        this.visibleItems.splice(idx + 1, count);
    }

    getListView() {
        return this.listView;
    }
}