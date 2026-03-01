// app.js (usage demo)
import { DomRegistry as DOM } from './dom-registry.js';
import TB from './dom-comps/top-bottom.js'
import TBS from './dom-comps/top-bottom-static.js'
import LR from './dom-comps/left-right.js'
import TABBAR from './dom-comps/tab-bar.js'
import TOOLBAR from './dom-comps/toolbar.js'
import LISTVIEW from './dom-comps/list-view.js'
import LISTITEM from './dom-comps/list-item.js'
import SIMPLE from './dom-comps/simple-view.js'
import PROPVIEW from './dom-comps/prop-view.js'
import SVGVIEW from './dom-comps/svg-view.js'
import BUTTON from './dom-comps/button.js'
import BOX from './dom-comps/box.js'
import ONLYONEBOX from './dom-comps/only-one-box.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });

const apps = new Map();

apps.set("1", {
    name: "1",
    title: "Test: LeftRight",
    root: () => $$(LR)
        .setLeft(Simple("Left"))
        .setRight(Simple("Right"))
});
apps.set("1.1", {
    name: "1.1",
    title: "LeftRight with Titlebar",
    root: () => $$(LR)
        .setLeft($$(TBS)
            .setTop(Simple('Title: Left'))
            .setBottom(Simple("Left"))
        )
        .setRight($$(TBS)
            .setTop(Simple('Title: Right'))
            .setBottom(Simple("Right"))
        )
});
apps.set("2", {
    name: "2",
    title: "Test: TopBottom",
    root: () => $$(TB)
        .setTop(Simple("Top"))
        .setBottom(Simple("Bottom"))
});
apps.set("2.1", {
    name: "2.1",
    title: "TopBottom with Titlebar",
    root: () => $$(TB)
        .setTop($$(TBS)
            .setTop(Simple("TopBottom with Titlebar"))
            .setBottom(Simple("Top"))
        )
        .setBottom($$(TBS)
            .setTop(Simple("TopBottom with Titlebar"))
            .setBottom(Simple("Bottom"))
        )
});
apps.set("3", {
    name: "3",
    title: "TreeView with Buttonbar",
    root: () => {
        const toolbar = $$(TOOLBAR);
        const listView = $$(LISTVIEW, { itemClassId: LISTITEM });
        listView.init();

        DOM.connect(toolbar, 'add-item', listView, 'add-item');
        DOM.connect(toolbar, 'add-folder', listView, 'add-folder');
        DOM.connect(toolbar, 'trash-bin', listView, 'remove-selected');
        
        return $$(TBS)
            .setTop(toolbar)
            .setBottom(listView)
        ;
    }
});
apps.set("4", {
    name: "4",
    title: "Experiments with List-/TreeView",
    root: () => {
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

        const info1 = "This is experimental !!!";

        const info2 = 
        `The below component is not a TreeView.\n` +
        `What makes a ListView a TreeView?`

        // return $$(LR, { ratio: 0, minLeft: 200, minRight: 200 })
        return $$(LR)
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

        // TODO: strange things are happening with overflow
        .setRight($$(TB)
            .setTop(Simple(info2))
            .setBottom($$(TBS)
                .setTop(toolbar2)
                .setBottom(listview2)
            )
        )
    }
});
apps.set("5", {
    name: "5",
    title: "Testing complex layouts",
    root: () => {
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

        return $$(LR, { ratio: 0, minLeft: 200, minRight: 200 })
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
    }        
});
apps.set("6", {
    name: "6",
    title: "Tabbar development, work in progress",
    root: () => {
        const tabbar = $$(TABBAR, { tab_clsid: LISTITEM });
        const toolbar = $$(TOOLBAR);
        const listview = $$(LISTVIEW, { itemClassId: LISTITEM });

        DOM.connect(toolbar, 'add-item', listview, 'add-item');
        DOM.connect(toolbar, 'trash-bin', listview, 'remove-selected');
        DOM.connect(listview, 'selected', tabbar, 'add-tab');

        return $$(LR, {ratio:.3})
            .setLeft($$(TBS)
                .setTop(toolbar)
                .setBottom(listview)
            )
            .setRight(tabbar)
    }
});
apps.set("7", {
    name: "7",
    title: "Testing my SVG-Buttons",
    root: () => {
        const box = $$(BOX);
        const simple = Simple('');

        // create button and connect to "simple"
        const buttons = [
            { name: "File" },
            { name: "Edit" },
            { name: "New File", svg_file: "./assets/add-item.svg"},
            { name: "New Folder", svg_file: "./assets/add-folder.svg"},
        ].map(entry => {
            const btn = $$(BUTTON, entry);
            DOM.connect(btn, 'clicked', simple, 'timed');
            return btn;
        });

        box.addMany(buttons);

        return $$(TBS)
            .setTop(box)
            .setBottom(simple)
    }    
});
apps.set("9", {
    name: "9",
    title: "SVG View",
    root: () => {
        const toolbar = $$(TOOLBAR);
        const svgview = $$(SVGVIEW);
        const propview = $$(PROPVIEW);

        DOM.connect(propview, 'value.1', svgview, 'set-point-x');
        DOM.connect(propview, 'value.2', svgview, 'set-point-y');
        DOM.connect(svgview, 'point-x', propview, 'value.1');
        DOM.connect(svgview, 'point-y', propview, 'value.2');

        return $$(TBS, { top: 100 })
            .setTop(propview)
            .setBottom(svgview)
            
    }        
});

// prepare all apps and put them into an 'OnlyOneBox'
if (1) {
    const btn_app = $$(BUTTON, { name: "1" });
    const btn_file = $$(BUTTON, { name: "2" });
    const btn_add_file = $$(BUTTON, { name: "New File", svg_file: "./assets/add-item.svg"});
    const btn_add_folder = $$(BUTTON, { name: "New Folder", svg_file: "./assets/add-folder.svg"});
    const simple = Simple('');

    const box = $$(BOX, { mode: 'radio' });
    const only_one_box = $$(ONLYONEBOX);

    // TODO: idea, just for convenience
    // DOM.connectManyToOne()
    // DOM.connectOneToMany()
    // DOM.connectManyToMany()

    const buttons = apps.values().map(app => {
        const btn = $$(BUTTON, { name: app.name, mode: '2-state' });
        DOM.connect(btn, 'activated', only_one_box, 'select');
        DOM.connect(btn, 'activated2', box, 'button-select');
        return btn;
    });
    box.addMany([...buttons]);
    
    const views = [...apps.values().map(app => ({
        name: app.name,
        root: app.root()
    }))];
    only_one_box.addMany([...views]);

    const first = apps.get(apps.keys().next().value);
    // only_one_box.select(first.name);

    DOM.mount($$(TBS)
        .setTop(box)
        .setBottom(only_one_box)
    );
}

