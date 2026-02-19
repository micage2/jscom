// src/app.js
import { DomRegistry as DOM } from './dom-registry.js';
import { bus } from './shared/event-bus.js';
import { uid } from './shared/dom-helper.js';
import LEFT_RIGHT from './dom-comps/vertical-split-mmm.js';
import TOP_BOTTOM from './dom-comps/horizontal-split-mmm.js';
import TOP_BOTTOM_STATIC from './dom-comps/horizontal-static-split.js';
import TESTVIEW from './dom-comps/test-view.js';
import TOOLBAR from './dom-comps/toolbar.js';
import TABBAR from './dom-comps/tab-bar.js';
import DUMMY from './dom-comps/placeholder.js';
import LISTVIEW from './dom-comps/list-view.js';
import LISTITEM from './dom-comps/list-item.js';


const Create = DOM.create; // alias

// TODO: reminder for data binding concept
const modelRoot = {
    P: { name: "Root" },
    children: [
        { P: { name: "Child 1" }, children: [] },
        {
            P: { name: "Child 2" }, children: [
                { P: { name: "Grandchild" }, children: [] }
            ]
        }
    ],
    parent: null
};


bus.on('toolbar:add-item', (a) => {
    const item = listView.add({ label: '' });
    listView.select(item);
});
bus.on('toolbar:add-folder', (a) => {
    const item = listView.add({ type: 'folder', label: '' });
    listView.select(item);
});
bus.on('toolbar:remove-selected', (a) => {
    listView.removeSelected();
});
bus.on("list-view:item-selected", ({item}) => {
    let str = `selected: ${item.text}`;
    dummy.text = str;
});

const tabbar = Create(TABBAR, {});
const listView = Create(LISTVIEW, { itemClassId: LISTITEM });
const toolbar = Create(TOOLBAR);
const dummy = Create(DUMMY, { text: "dummy" });
const dummy2 = Create(DUMMY, { text: "dummy2" });
listView.init();

DOM.mount(
    Create(LEFT_RIGHT, { ratio: 0, minLeft: 200, minRight: 200 })
    .setLeft(Create(TOP_BOTTOM_STATIC)
        .setTop(toolbar)
        .setBottom(Create(TOP_BOTTOM, { ratio: 1, minTop: 120, minBottom: 100 })
            .setTop(listView)
            .setBottom(dummy)
        )
    )
    .setRight(Create(LEFT_RIGHT)
        .setLeft(dummy2)
        .setRight(tabbar)
    )
);

