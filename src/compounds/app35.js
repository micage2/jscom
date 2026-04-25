import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import LISTVIEW from '../dom-comps/list-view-2.js'
import LISTITEM from '../dom-comps/list-item-2.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import BUTTON from '../dom-comps/button.js'
import TAB from '../dom-comps/tab.js'
import SVGVIEW from '../dom-comps/svg-view-3.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import SLIDERVIEW from '../dom-comps/prop-slider.js'
import BOOLVIEW from '../dom-comps/prop-bool.js'
import {TYPE_SVG_FILE} from '../shared/svg_property.js'
import { TypeRegistry } from '../shared/type-registry.js';
import { Mediator } from '../shared/mediator.js';

const ICON_PATH = './assets/icons/';
const SVG_PATH = './assets/svg/cities.svg';
const path2name = (path) => path.split('/').at(-1);
const strip_ext = (filename) => filename.split('.')[0];

const $$ = DOM.create;

const icons = {
    'script': '⌾',
    'style': '🥝',
    'svg': 's',
    'g': 'g',
    'path': 'p',
    'polygon': '⏢',
    'polyline': '☈',
};

const root = TypeRegistry.create({ name: 'root' });

/*
layout:
app LR.
    left: TBS.
        top: Toolbar
        bottom: TreeView
    right: TB.
        top: SVGView
        bottom: LR.
            left: 
            right:

*/

const views = {
    tb_tree: $$(SIMPLE), // $$(BOX),
    tree: $$(SIMPLE), // $$(TREEVIEW),
    svg: $$(SIMPLE), // $$(SVGVIEW)
    list: $$(SIMPLE), // 
    props: $$(SIMPLE), // 
};

const layout = {
    tree: {
        item_clsid: LISTITEM,
        filter: (prop) => prop.isGroup(),
    },
    circle: {
        cx: { min: -500, max: 500, step: 10 },
        cy: { min: -500, max: 500, step: 10 },
        r: { min: 2, max: 200, step: 1, view: SLIDERVIEW },
        flag: { view: BOOLVIEW },
    },

};

const dispatcher = new Mediator();
dispatcher.on('prop-selected', (prop) => {
    // console.log('[app35:dispatcher]', prop);

    // views.svg.toggleHighLight(prop);
    views.svg.toggleSelect(prop);
    views.tree.select(prop);

    const props = $$(PROPSVIEW, { prop, config: layout.circle });
    views.list.replace(props);
});


const ctor = (args = {}) => {
    const file = root.add({
        name: path2name(SVG_PATH),
        value: SVG_PATH,
        type: TYPE_SVG_FILE
    });
    const tree = $$(LISTVIEW, { prop: file, config: layout.tree });
    const svg = $$(SVGVIEW, { prop: file });
    const list = $$(BOX);
    list.add($$(SIMPLE));
    views.list = list;

    tree.on('selected', ({ prop }) => {
        dispatcher.emit('prop-selected', prop);
    });
    views.tree = tree;

    svg.on('selected', (prop) => {
        dispatcher.emit('prop-selected', prop);
    });
    views.svg = svg;

    const lr = $$(LR, { ratio: .2 })
        .setLeft($$(TBS)
            .setTop(views.tb_tree)
            .setBottom(tree)
        )
        .setRight($$(TB)
            .setTop(svg)
            .setBottom($$(LR)
                .setLeft(list)
                .setRight($$(SIMPLE))
            )
        )
    ;
    return lr;
};


const info = {
    clsid: 'jscom.compounds.app35',
    decription: 'Test SVGProperty and tree view population. \n'
              + 'Essentially a custom data wrapper for the state tree',
    name: '3.5',
};

const clsid = DOM.registerCompound(ctor, info);
export default clsid;
