import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import LISTVIEW from '../dom-comps/list-view-2.js'
import LISTITEM from '../dom-comps/list-item-2.js'
import DIALOG from '../dom-comps/dialog-box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import BUTTON from '../dom-comps/button.js'
import TAB from '../dom-comps/tab.js'
import SVGVIEW from '../dom-comps/svg-view-3.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import SLIDERVIEW from '../dom-comps/prop-slider.js'
import BOOLVIEW from '../dom-comps/prop-bool.js'
import { TYPE_SVG_FILE, TYPE_SVG_SVG, TYPE_SVG_G } from '../shared/svg_property.js'
import { TypeRegistry } from '../shared/type-registry.js';
import { Mediator } from '../shared/mediator.js';
import { Selection } from '../shared/selection.js';

const ICON_PATH = './assets/icons/';
const SVG_PATH = './assets/svg/cities.svg';
const path2name = (path) => path.split('/').at(-1);
const strip_ext = (filename) => filename.split('.')[0];

const $$ = DOM.create;

const icons = {
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
    tb_tree: $$(SIMPLE), // $$(DIALOG),
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


const ctor = (args = {}) => {
    const file = root.add({
        name: path2name(SVG_PATH),
        value: SVG_PATH,
        type: TYPE_SVG_FILE
    });
    const treeview = $$(LISTVIEW, {
        prop: file, 
        config: layout.tree,
    });

    const svgview = $$(SVGVIEW, { prop: file });
    const list = $$(DIALOG);
    list.add($$(SIMPLE));
    views.list = list;

    treeview.on('selected', ({ prop }) => {
        dispatcher.emit('prop-selected', prop);
        selected = prop;
    });
    views.tree = treeview;

    let svgProp = null;
    let selected = null;
    $$$.selected = selected;

    // save to access svgview
    svgview.once('ready', ({ view, prop }) => {
        // prop is always a leaf or the svg prop (since we cannot click groups)

        view.on('selected', (prop) => {
            dispatcher.emit('prop-selected', prop);
        });

        view.on('move-selected', ({ prop, dx, dy }) => {
            if (prop.getType() === 'svg.svg') {
                view.pan(dx, dy);
            }
            else if (prop === selected) {
                view.move(prop, dx, dy);
            }
            else if (svgview.isSelected(prop)) {
                view.move(selected, dx, dy);
            }
            else {
                view.pan(dx, dy);
            }
        });

        view.on('scale-selected', ({ prop, delta, x, y }) => {
            if (prop.getType() === 'svg.svg') view.zoom(delta, {x, y});
            else { view.scale(prop, delta, dx, dy); }
        });
        
        svgProp = prop;
        views.svg = view;
        dispatcher.emit('prop-selected', svgProp);
    });
    const selection = new Selection();

    dispatcher.on('prop-selected', (prop) => {
        // console.log('[app35:dispatcher]', prop);
        let rebuild = selected !== prop;

        if (views.svg.toggleSelected(prop)) {
            selected = prop;
        }
        else {
            selected = svgProp;
        };

        views.tree.select(prop);
    
        if (rebuild) { // prevent rebuild if no change
            views.list.removeAll();
            const type = prop.getType();
            if (type !== TYPE_SVG_G && type !== TYPE_SVG_SVG) {
                const propsview = $$(PROPSVIEW, { prop, config: layout.circle });
                views.list.add(propsview);
                const frame = prop.getChild('frame');
                const frameView = $$(PROPSVIEW, { prop: frame, config: layout.circle });
                views.list.add(frameView);
            }
            else {
                prop.getChildren().forEach(childProp => {
                    if (!childProp.isGroup() || childProp.getName() === 'SSS') return;
                    const propsview = $$(PROPSVIEW, { prop: childProp, config: layout.circle });
                    views.list.add(propsview);
                });
            }
        }
    });
    
    const lr = $$(LR, { ratio: .2 })
        .setLeft($$(TBS)
            .setTop(views.tb_tree)
            .setBottom(treeview)
        )
        .setRight($$(TB, {ratio:1})
            .setTop($$(LR, { ratio: .8 })
                .setLeft(svgview)
                .setRight(list)
            )
            .setBottom($$(SIMPLE))
        )
    ;
    return lr;
};


const info = {
    clsid: 'jscom.compounds.app36',
    decription: 'Test SVGProperty and tree view population. \n'
              + 'Essentially a custom data wrapper for the state tree',
    name: '3.6',
};

const clsid = DOM.registerCompound(ctor, info);
export default clsid;
