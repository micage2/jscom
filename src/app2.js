// src/app.js
import { DomRegistry as DOM } from './dom-registry.js';
import { bus } from './shared/event-bus.js';
import { uid } from './shared/dom-helper.js';
import V_SPLIT from './dom-comps/vertical-split-mmm.js';
import H_SPLIT from './dom-comps/horizontal-split-mmm.js';
import TESTVIEW from './dom-comps/test-view.js';
import TESTVIEW2 from './dom-comps/test-view-2.js';
import DUMMY from './dom-comps/placeholder.js';
import LISTVIEW from './dom-comps/list-view.js';
import LISTITEM from './dom-comps/list-item.js';

DOM.configureClass(LISTVIEW, { itemClassId: LISTITEM });

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
const leftSplit = DOM.create(H_SPLIT, {
    ratio: 0.0, minTop: 120, minBottom: 200
});

const listView = DOM.create(LISTVIEW, { itemClassId: LISTITEM }).init();
const testView = DOM.create(TESTVIEW);
const dummy = DOM.create(DUMMY, { text: "dummy" });

leftSplit.setTop(testView);
leftSplit.setBottom(listView);

mainSplit.setLeft(leftSplit);
mainSplit.setRight(dummy);

DOM.mount(mainSplit);

bus.on('test:add-item', (a) => {
    listView.add({ label: uid() });
    console.log(`add item (${a ?? 0})`);    
});
bus.on('test:remove-selected', (a) => {
    console.log(`remove selected (${a ?? 0})`);
    // dummy.as("Text").text = `remove selected`;  
    dummy.text = `remove selected`; 
});
bus.on("test:pointer-y", msg => {
    let str = `y: ${msg.y??"n.a."}\ntop: ${msg.h1}\nbottom: ${msg.h2}`;
    testView.text = str;
});

