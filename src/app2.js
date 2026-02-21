// src/app.js
import { DomRegistry as DOM } from './dom-registry.js';
import { bus } from './shared/event-bus.js';
import { uid } from './shared/dom-helper.js';
import LEFT_RIGHT from './dom-comps/vertical-split.js';
import TOP_BOTTOM from './dom-comps/horizontal-split.js';
import TOP_BOTTOM_STATIC from './dom-comps/horizontal-static-split.js';
import TESTVIEW from './dom-comps/test-view.js';
import TOOLBAR from './dom-comps/toolbar.js';
import TABBAR from './dom-comps/tab-bar.js';
import DUMMY from './dom-comps/simple-text-panel.js';
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

// register events first
bus.on('toolbar:add-item', (msg) => {
    if (listView.as("MsgTarget").isConnected(msg.from)) {
        const item = listView.add({ label: '' });
    }
    else if (listView2.as("MsgTarget").isConnected(msg.from)) {
        const item = listView2.add({ label: '' });
    }
});
bus.on('toolbar:add-folder', (msg) => {
    if (listView.as("MsgTarget").isConnected(msg.from)) {
        const item = listView.add({ type: 'folder', label: '' });
        listView.select(item);
    }
    else if (listView2.as("MsgTarget").isConnected(msg.from)) {
        const item = listView2.add({ type: 'folder', label: '' });
    }
});
bus.on('toolbar:thrash-bin', (msg) => {
    if (listView.as("MsgTarget").isConnected(msg.from)) {
        listView.removeSelected();
    }
});
bus.on("list-view:item-selected", ({item}) => {
    let str = `${item.text}`;
    dummy1.text = str;
});

const tabbar = Create(TABBAR, {});
const listView = Create(LISTVIEW, { itemClassId: LISTITEM });
const listView2 = Create(LISTVIEW, { itemClassId: LISTITEM });
const toolbar = Create(TOOLBAR);
const toolbar2 = Create(TOOLBAR);
const dummy1 = Create(DUMMY, { text: "1" });
const dummy2 = Create(DUMMY, { text: "2" });
const dummy3 = Create(DUMMY, { text: "3" });
const dummy4 = Create(DUMMY, { text: "4" });
const dummy5 = Create(DUMMY, { text: "5" });
listView.init();
listView2.init();

listView.as("MsgTarget").connect(toolbar.uid);
listView2.as("MsgTarget").connect(toolbar2.uid);

DOM.mount(
    Create(LEFT_RIGHT, { ratio: 0, minLeft: 200, minRight: 200 })
    .setLeft(Create(TOP_BOTTOM_STATIC)
        .setTop(toolbar)
        .setBottom(Create(TOP_BOTTOM, { ratio: .6, minTop: 120, minBottom: 0 })
            .setTop(listView)
            .setBottom(Create(TOP_BOTTOM_STATIC, { top: 40 })
                .setTop(dummy1)
                .setBottom(dummy2)
            )
        )
    )
    .setRight(Create(LEFT_RIGHT)
        .setLeft(Create(TOP_BOTTOM)
            .setTop(dummy3)
            .setBottom(Create(TOP_BOTTOM_STATIC, { top: 40 })
                .setTop(toolbar2)
                // .setTop(dummy5)
                .setTop(listView2)
            )
        )
        .setRight(dummy4)
    )
);

