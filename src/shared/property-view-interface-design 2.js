class PropertyInterface {
    constructor(node, propertyName, validator = null) {
        this.node = node;
        this.propertyName = propertyName;
        this.validator = validator;
        this.subscribers = new Set();
    }

    get() {
        return this.node.payload[this.propertyName];
    }

    set(newValue) {
        if (this.validator && !this.validator(newValue)) {
            return { success: false, reason: "validation_failed" };
        }

        const oldValue = this.get();
        this.node.payload[this.propertyName] = newValue;

        this.subscribers.forEach(callback => callback(newValue, oldValue));

        return { success: true };
    }

    onChange(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
}


class _PropertyGroup {
    constructor(node) {
        this.node = node;
        this.properties = new Map();
        this.deleteCallbacks = new Set();
    }

    getPropertyInterface(propertyName, validator = null) {
        const key = `${propertyName}:${validator?.name || 'default'}`;
        if (!this.properties.has(key)) {
            this.properties.set(key, new PropertyInterface(this.node, propertyName, validator));
        }
        return this.properties.get(key);
    }

    onDelete(callback) {
        this.deleteCallbacks.add(callback);
    }

    notifyDelete() {
        this.deleteCallbacks.forEach(cb => cb());
    }
}
class PropertyGroup {
    constructor(node) {
        this.node = node;
        this.properties = new Map();
        this.deleteCallbacks = new Set();
    }

    getPropertyInterface(propertyName, validator = null) {
        const key = `${propertyName}:${validator?.name || 'default'}`;
        if (!this.properties.has(key)) {
            this.properties.set(key, new PropertyInterface(this.node, propertyName, validator));
        }
        return this.properties.get(key);
    }

    onDelete(callback) {
        this.deleteCallbacks.add(callback);
    }

    notifyDelete() {
        this.deleteCallbacks.forEach(cb => cb());
    }
}


class Node {
    constructor(payload) {
        this.id = crypto.randomUUID();
        this.payload = payload;
        this.parent = null;
        this.children = [];
    }

    add(payload) {
        const child = new Node(payload);
        child.parent = this;
        this.children.push(child);
        return child;
    }

    delete() {
        if (this.parent) {
            this.parent.children = this.parent.children.filter(c => c !== this);
        }
    }

    traverse(callback) {
        callback(this);
        this.children.forEach(child => child.traverse(callback));
    }
}


class TreeItem {
    constructor(propGroup) {
        this.propGroup = propGroup;
        this.nameProp = propGroup.getPropertyInterface("name");
        this.label = document.createElement('div');
        this.label.textContent = this.nameProp.get();

        this.nameProp.onChange((newVal) => {
            this.label.textContent = newVal;
        });
    }

    getElement() {
        return this.label;
    }
}


class TreeView {
    constructor(propGroup) {
        this.propGroup = propGroup;
        this.treeItems = new Map();
        this.container = document.createElement('div');
        this.container.style.border = '1px solid #ccc';
        this.container.style.padding = '10px';
        this.container.style.marginBottom = '20px';

        this.toolbar = document.createElement('div');
        this.toolbar.style.marginBottom = '10px';

        const newBtn = document.createElement('button');
        newBtn.textContent = 'New Item';
        newBtn.onclick = () => this.onNewItem();

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Item';
        deleteBtn.onclick = () => this.onDeleteItem();

        this.toolbar.appendChild(newBtn);
        this.toolbar.appendChild(deleteBtn);
        this.container.appendChild(this.toolbar);

        this.itemsContainer = document.createElement('div');
        this.container.appendChild(this.itemsContainer);

        this.selectedItem = null;
        this.renderChildren(propGroup.node);
    }

    renderChildren(parentNode) {
        parentNode.children.forEach(childNode => {
            this.addTreeItem(childNode);
        });
    }

    addTreeItem(childNode) {
        const childPropGroup = new PropertyGroup(childNode);
        const treeItem = new TreeItem(childPropGroup.getPropertyInterface("name"));

        childPropGroup.onDelete(() => {
            this.removeTreeItem(childNode.id);
        });

        const itemElement = treeItem.getElement();
        itemElement.style.cursor = 'pointer';
        itemElement.onclick = () => this.selectItem(childNode.id, treeItem);

        this.itemsContainer.appendChild(itemElement);
        this.treeItems.set(childNode.id, { treeItem, node: childNode, propGroup: childPropGroup });
    }

    selectItem(nodeId, treeItem) {
        if (this.selectedItem) {
            this.selectedItem.treeItem.deselect();
        }
        this.selectedItem = this.treeItems.get(nodeId);
        treeItem.select();
    }

    onNewItem() {
        if (!this.selectedItem) {
            alert('Select a parent item first');
            return;
        }

        const newNode = this.selectedItem.node.add({ name: "New Item" });
        this.addTreeItem(newNode);
    }

    onDeleteItem() {
        if (!this.selectedItem) {
            alert('Select an item to delete');
            return;
        }

        const nodeToDelete = this.selectedItem.node;
        this.selectedItem.propGroup.notifyDelete();
        nodeToDelete.delete();
        this.selectedItem = null;
    }

    getElement() {
        return this.container;
    }
}

// Main test
function main() {
    // Create root node
    const root = new Node({ name: "Root" });

    // Add some initial children
    root.add({ name: "Users" });
    root.add({ name: "Settings" });
    root.add({ name: "Data" });

    // Create PropertyGroup for root
    const rootPropGroup = new PropertyGroup(root);

    // Create TreeView
    const treeView = new TreeView(rootPropGroup);

    // Add to page
    document.body.appendChild(treeView.getElement());

    console.log("TreeView initialized with root node");
    console.log("Try: Click 'New Item' to add children, 'Delete Item' to remove");
}

// Run on page load
document.addEventListener('DOMContentLoaded', main);