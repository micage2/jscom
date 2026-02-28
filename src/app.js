// app.js (usage demo)
import { DomRegistry as DOM } from './dom-registry.js';
import TB from './dom-comps/top-bottom.js'
import TBS from './dom-comps/top-bottom-static.js'
import LR from './dom-comps/left-right.js'
import TOOLBAR from './dom-comps/toolbar.js'
import LISTVIEW from './dom-comps/list-view.js'
import LISTITEM from './dom-comps/list-item.js'
import SIMPLE from './dom-comps/simple-view.js'
import PROPVIEW from './dom-comps/prop-view.js'
import SVGVIEW from './dom-comps/svg-view.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });

const APP = 4;

if (APP == 1) {
    const TITLE = "Test: LeftRight";
    DOM.mount($$(LR)
        .setLeft(Simple("Left"))
        .setRight(Simple("Right"))
    );
}
if (APP == 1.1) {
    const TITLE = "LeftRight with Titlebar";
    DOM.mount($$(LR)
        .setLeft($$(TBS)
            .setTop(Simple(TITLE))
            .setBottom(Simple("Left"))
        )
        .setRight($$(TBS)
            .setTop(Simple(TITLE))
            .setBottom(Simple("Right"))
        )
    );
}
if (APP == 2) {
    DOM.mount($$(TB)
        .setTop(Simple("Top"))
        .setBottom(Simple("Bottom"))
    );
}
if (APP == 2.1) {
    const TITLE = "TopBottom with Titlebar";
    DOM.mount($$(TB)
        .setTop($$(TBS)
            .setTop(Simple(TITLE))
            .setBottom(Simple("Top"))
        )
        .setBottom($$(TBS)
            .setTop(Simple(TITLE))
            .setBottom(Simple("Bottom"))
        )
    );
}
if (APP == "3") {
    const toolbar = $$(TOOLBAR);
    const listView = $$(LISTVIEW, { itemClassId: LISTITEM });
    listView.init();

    DOM.connect(toolbar, 'add-item', listView, 'add-item');
    DOM.connect(toolbar, 'add-folder', listView, 'add-folder');
    DOM.connect(toolbar, 'trash-bin', listView, 'remove-selected');
    DOM.mount($$(TBS)
        .setTop(toolbar)
        .setBottom(listView)
    );
}
if (APP == "4") {
    const toolbar1 = $$(TOOLBAR);
    const listview1 = $$(LISTVIEW, { itemClassId: LISTITEM });
    listview1.init({ root: 'items are root capable'});
    DOM.connect(toolbar1, 'add-item', listview1, 'add-item');
    DOM.connect(toolbar1, 'add-folder', listview1, 'add-folder');
    DOM.connect(toolbar1, 'trash-bin', listview1, 'remove-selected');

    const toolbar2 = $$(TOOLBAR);
    const listview2 = $$(LISTVIEW, { itemClassId: SIMPLE });
    listview2.init({ root: 'not root capable'});
    DOM.connect(toolbar2, 'add-item', listview2, 'add-item');
    DOM.connect(toolbar2, 'add-folder', listview2, 'add-folder');
    DOM.connect(toolbar2, 'trash-bin', listview2, 'remove-selected');

    const info1 = 
    `The below com is a TreeView because of what?
    `;

    const info2 = 
    `The below com is a NOT TreeView because of what?
    \nWhat makes a ListView a TreeView?
    `;

    DOM.mount(
        // $$(LR, { ratio: 0, minLeft: 200, minRight: 200 })
        $$(LR)
        .setLeft($$(TB)
            .setTop(Simple(info1))
            .setBottom($$(TBS)
                .setTop(toolbar1)
                .setBottom(listview1)
            )
        )

        // replacement for the below comp tree
        // .setRight($$(TBS)
        //     .setTop(toolbar2)
        //     .setBottom(listview2)
        // )

        // TODO: strange things are happening with the LR divider
        .setRight($$(TB)
            .setTop(Simple(info2))
            .setBottom($$(TBS)
                .setTop(toolbar2)
                .setBottom(listview2)
            )
        )
    );
}
if (APP == "5") {
    const toolbar = $$(TOOLBAR);
    const listview = $$(LISTVIEW, { itemClassId: LISTITEM });
    listview.init();
    DOM.connect(toolbar, 'add-item', listview, 'add-item');
    DOM.connect(toolbar, 'add-folder', listview, 'add-folder');
    DOM.connect(toolbar, 'trash-bin', listview, 'remove-selected');

    const toolbar2 = $$(TOOLBAR);
    const listview2 = $$(LISTVIEW, { itemClassId: SIMPLE });
    listview2.init({ root: 'no root'});
    DOM.connect(toolbar2, 'add-item', listview2, 'add-item');

    DOM.mount(
        $$(LR, { ratio: 0, minLeft: 200, minRight: 200 })
        .setLeft($$(TBS)
            .setTop(toolbar)
            .setBottom($$(TB, { ratio: .6, minTop: 120, minBottom: 0 })
                .setTop(listview)
                .setBottom($$(TBS, { top: 60 })
                    .setTop(Simple('fixed top'))
                    .setBottom(Simple('fixed bottom overflow hidden -------->'))
                )
            )
        )
        .setRight($$(LR)
            .setLeft($$(TB)
                .setTop(Simple('dfgdgd'))
                .setBottom($$(TBS, { top: 30 })
                    .setTop(toolbar2)
                    .setBottom(listview2)
                )
            )
            .setRight(Simple('kjklj56'))
        )
    );
}
if (APP == "9") {
    const svgview = $$(SVGVIEW);
    const propview = $$(PROPVIEW);

    DOM.connect(propview, 'value.1', svgview, 'set-point-x');
    DOM.connect(propview, 'value.2', svgview, 'set-point-y');
    DOM.connect(svgview, 'point-x', propview, 'value.1');
    DOM.connect(svgview, 'point-y', propview, 'value.2');

    DOM.mount($$(TBS)
        .setTop(toolbar)
        .setBottom($$(TBS, { top: 100 })
            .setTop(propview)
            .setBottom(svgview)
        )
    );
}
