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
import LRTEST from './compounds/app10.js';
import APP30 from './compounds/app30.js';
import APP31 from './compounds/app31.js';
import APP32 from './compounds/app32.js';
import APP33 from './compounds/app33.js';
import APP70 from './compounds/app70.js';
import APP81 from './compounds/app81.js';

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const apps = new Map(); // name -> app root ctor()

apps.set("1.0", {
    name: "1.0",
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
apps.set("3.0", {
    name: "3.0",
    title: "TreeView with Buttonbar",
    root: (args) => DOM.createCompound(APP30, args)
});
apps.set("3.1", {
    name: "3.1",
    title: "TreeView with Buttonbar",
    root: (args) => DOM.createCompound(APP31, args)
});
apps.set("3.2", {
    name: "3.2",
    title: "SVGView 2",
    root: (args) => DOM.createCompound(APP32, args)
});
apps.set("3.3", {
    name: "3.3",
    title: "SVGView 2",
    root: (args) => DOM.createCompound(APP33, args)
});
apps.set("7.0", {
    name: "7.0",
    title: "Testing SVG- amd Text-Buttons. Click on each!",
    root: (args) => DOM.createCompound(APP70, args)
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
    root: (args) => DOM.createCompound(APP81, args)
});

const app = DOM.createCompound(APPROOT, { apps, start: '3.1'});
DOM.mount(app);
