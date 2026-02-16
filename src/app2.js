// src/app.js
import { DomRegistry as DOM } from './dom-registry.js';
import { bus } from './shared/event-bus.js';
import { uid } from './shared/dom-helper.js';
import V_SPLIT from './dom-comps/vertical-split-mmm.js';
import H_SPLIT from './dom-comps/horizontal-split-mmm.js';
import H_STATIC_SPLIT from './dom-comps/horizontal-static-split.js';
import TESTVIEW from './dom-comps/test-view.js';
import TESTVIEW2 from './dom-comps/toolbar.js';
import DUMMY from './dom-comps/placeholder.js';
import LISTVIEW from './dom-comps/list-view.js';
import LISTITEM from './dom-comps/list-item.js';


// Sample model
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

const mainSplit = DOM.create(V_SPLIT, {
    ratio: 0.0, minLeft: 200, minRight: 200
});
const leftSplit = DOM.create(H_STATIC_SPLIT, { top: 120 });

const listView = DOM.create(LISTVIEW, {
    itemClassId: LISTITEM
});
const testView = DOM.create(TESTVIEW2);
const dummy = DOM.create(DUMMY, { text: "dummy" });
const vstatic = DOM.create(H_STATIC_SPLIT, { top: 32 });

bus.on('toolbar:add-item', (a) => {
    listView.add({ label: '' });
});
bus.on('toolbar:remove-selected', (a) => {
    listView.removeSelected();
});
bus.on("list-view:item-selected", ({item}) => {
    let str = `selected: ${item.text}`;
    str += `\nopen: ${item.open ? "true" : "false"}`;
    str += `\nparent: ${item.isParent ? "true" : "false"}`;
    dummy.text = str;
});

leftSplit.setTop(testView);
leftSplit.setBottom(listView);

mainSplit.setLeft(leftSplit);
mainSplit.setRight(dummy);

listView.init(); // make it late, so bus is on
DOM.mount(mainSplit);

