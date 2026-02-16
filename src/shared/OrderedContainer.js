class OrderedContainer {
    constructor() {
        this.itemsByUid = new Map();
        this.orderedUids = [];

        const root = this.#createItem({ name: "root" }, 0);
        this.orderedUids.push(root.uid);
        this.itemsByUid.set(root.uid, root);

        this._selected = root;
    }

    get selected() {
        return this._selected;
    }

    select(item) {
        if (!this.itemsByUid.has(item.uid)) {
            throw new Error(`Item ${item.uid} does not belong to this container`);
        }
        this._selected = item;
    }

    /**
     * Inserts a new item as the **last child** of the currently selected item.
     *
     * - Always becomes a child of whatever is selected right now
     * - Depth = selected.depth + 1
     * - Position = immediately after the whole subtree of the selected item
     * - Does **not** change which item is selected
     *
     * @param   {Object} data           - fields for the new item
     * @param   {string} data.name      - required
     * @returns {Object} the new item
     */
    insert(data) {
        if (!data || typeof data.name !== 'string') {
            throw new Error("insert() expects an object with at least { name: string }");
        }

        const parent = this._selected;
        const depth = parent.depth + 1;
        const insertAt = this.#endOfSubtree(parent);

        const newItem = this.#createItem(data, depth);

        this.orderedUids.splice(insertAt, 0, newItem.uid);
        this.itemsByUid.set(newItem.uid, newItem);

        return newItem;
    }

    // ────────────────────────────────────────────────

    #uidCounter = 0;

    #createItem(data, depth) {
        const uid = `n${this.#uidCounter++}_${Date.now().toString(36)}`;

        return {
            uid,
            name: data.name,
            depth,
            ...data   // pass through any other fields (notes, due, tags, checked, etc.)
        };
    }

    #endOfSubtree(item) {
        const start = this.orderedUids.indexOf(item.uid);
        if (start < 0) return this.orderedUids.length;

        const parentDepth = item.depth;
        let i = start + 1;

        while (i < this.orderedUids.length) {
            const d = this.itemsByUid.get(this.orderedUids[i]).depth;
            if (d <= parentDepth) break;
            i++;
        }

        return i;
    }
}