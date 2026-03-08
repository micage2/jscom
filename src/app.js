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
import SVGVIEW2 from './dom-comps/svg-view-2.js'
import BUTTON from './dom-comps/button.js'
import BOX from './dom-comps/box.js'
import ONLYONEBOX from './dom-comps/only-one-box.js'

// compounds
import APPROOT from './compounds/app-root.js';
import LRTEST from './compounds/left-right-test.js';
import APP31 from './compounds/app31.js';

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const apps = new Map(); // name -> app root ctor()

apps.set("1", {
    name: "1",
    title: "Test: LeftRight",
    root: (args) => DOM.createCompound(LRTEST, args)
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
        const listview = $$(LISTVIEW, { itemClassId: LISTITEM });
        listview.init();

        DOM.connect(toolbar, 'add-item', listview, 'add-item');
        DOM.connect(toolbar, 'add-folder', listview, 'add-folder');
        DOM.connect(toolbar, 'trash-bin', listview, 'remove-selected');
        
        return $$(TBS)
            .setTop(toolbar)
            .setBottom(listview)
        ;
    }
});
apps.set("3.1", {
    name: "3.1",
    title: "TreeView with Buttonbar",
    root: (args) => DOM.createCompound(APP31, args)
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
    title: "Testing SVG- amd Text-Buttons. Click on each!",
    root: () => {
        const box = $$(BOX);
        const info = Simple('\nSVG- and Text-Buttons. Click on each!\n\n'+
            'Zoom (mouse wheel) and Pan (drag mouse) in lower view');
        const svgview = $$(SVGVIEW2);
        const out = Simple();

        // create button and connect to "simple"
        const buttons_info = [
            { name: "File" },
            { name: "Edit" },
            { name: "New File", svg_file: "./assets/add-item.svg"},
            { name: "New Folder", svg_file: "./assets/add-folder.svg"},
        ];

        const buttons = buttons_info.map(entry => {
            const btn = $$(BUTTON, entry);
            btn.on('clicked', (b) => {
                out.set_timed(b.get_name());
                svgview.load(b.get_svg_file())
            });
            return btn;
        });

        box.addMany(buttons);

        return $$(TBS)
            .setTop(box)
            .setBottom($$(TB, { ratio: .2})
                .setTop(info)
                .setBottom($$(TBS)
                    .setTop(out)
                    .setBottom(svgview)
                )
            )
    }    
});
apps.set("8", {
    name: "8",
    title: "SVGView with PropView",
    root: () => {
        const toolbar = $$(TOOLBAR);
        const svgview = $$(SVGVIEW);
        const propview = $$(PROPVIEW);

        DOM.connect(propview, 'value.1', svgview, 'set-point-x');
        DOM.connect(propview, 'value.2', svgview, 'set-point-y');
        DOM.connect(svgview, 'point-x', propview, 'value.1');
        DOM.connect(svgview, 'point-y', propview, 'value.2');

        return $$(TBS, { topHeight: 100 })
            .setTop(propview)
            .setBottom(svgview)
        ;            
    }        
});
apps.set("8.1", {
    name: "8.1",
    title: "SVG-View (new version).",
    root: () => {
        const box = $$(BOX);
        const simple = Simple('Early SVG editor for inspiration');
        // const svgview = $$(SVGVIEW2, { file: "./assets/half-circle.svg" });
        // const svgview = $$(SVGVIEW2).load("./assets/half-circle.svg");
        const svgview = $$(SVGVIEW2).load("./assets/data-science.svg");

        // create button and connect to "simple"
        const buttons = [
            { name: "File" },
            { name: "Edit" },
            { name: "New File", svg_file: "./assets/add-item.svg"},
            { name: "New Folder", svg_file: "./assets/add-folder.svg"},
        ].map(entry => {
            const btn = $$(BUTTON, entry);
            DOM.connect(btn, 'clicked', simple, 'timed', b=>b.get_name());
            return btn;
        });
        box.addMany(buttons);

        DOM.connect(svgview, 'text', simple, 'title', (args) => {
            console.log(`${args}`);            
        });

        return $$(TBS)
            .setTop(box)
            .setBottom($$(TBS, {bottomHeight:32})
                .setTop(svgview)
                .setBottom(simple)
            )
    }    
});

const app = DOM.createCompound(APPROOT, { apps, start: '3.1'});
DOM.mount(app);
