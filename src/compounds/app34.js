import { DomRegistry as DOM } from '../dom-registry.js';
import { Mediator } from '../shared/mediator.js';
import APP from '../dom-comps/app_with_store.js'
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
// import LISTVIEW from '../dom-comps/list-view.js'
import LISTVIEW from '../dom-comps/list-view-2.js'
import LISTITEM from '../dom-comps/list-item-2.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import BUTTON from '../dom-comps/button.js'
import TAB from '../dom-comps/tab.js'
import SVGVIEW3 from '../dom-comps/svg-view-3.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import {TYPE_SVG_FILE} from '../shared/svg_property.js'

const ICON_PATH = './assets/icons/';
const SVG_PATH = './assets/svg/world.svg';
// const SVG_PATH = './assets/svg/Eberswalder9_opt2.svg';
// const SVG_PATH = './assets/svg/sample1.svg';
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

const views = {
    treeview: null,
    propsview: null,
    svgview: null,
};


function createToolbar(listview) {
    const lv_toolbar = $$(BOX);
    const btn_newfolder = $$(BUTTON, { name: 'New Folder', svg_file: ICON_PATH + 'add-folder.svg'});
    const b2 = $$(BUTTON, { name: 'c' });
    const b3 = $$(BUTTON, { name: 'r' });
    const b4 = $$(BUTTON, { name: 'p' });
    const del = $$(BUTTON, { name: 'Delete Selected', svg_file: ICON_PATH + 'trash-bin-1.svg'});
    lv_toolbar.addMany([btn_newfolder, b2, b3, b4]);
    lv_toolbar.add(del, { align: 'right' });

    // TODO: need prop of the selected tree item here
    btn_newfolder.on('clicked', b => {
    });
    b2.on('clicked', b=>{
    });
    b3.on('clicked', b=>{
    });
    b4.on('clicked', b=>{
    });
    del.on('clicked', b => {
        listview.removeSelected();
    });

    return lv_toolbar;
}

function createLeftSide(props) {
    views.treeview = $$(LISTVIEW, {
        props, config: { item_clsid: LISTITEM }
    });
    const toolbar = createToolbar(views.treeview);

    let svgviewready = false;
    views.treeview.on('selected', (item) => {
        console.log('[TreeView]', 'selected', item.prop);
        if (svgviewready) {
            views.svgview.toggleHighLight(item.prop);
        }
        else {
            // make sure we don't miss it
            views.svgview.once('ready', (view) => {
                views.svgview.toggleHighLight(item.prop);
                svgviewready = true;
            });
        }

    });

    return $$(TBS).setTop(toolbar).setBottom(views.treeview);
}

function createRightSide(svgprop) {
    views.propsview = $$(PROPSVIEW, { props: svgprop });

    const svgview = $$(SVGVIEW3, {prop: svgprop});
    svgview.on('selected', (prop) => {
        console.log('[SVGView]', 'selected:', prop);
        if (!prop) debugger;

        svgview.toggleHighLight(prop);

        views.treeview.select(prop);
    });
    views.svgview = svgview;
    
    return $$(TB).setTop(svgview).setBottom(views.propsview);
}

const ctor = (args = {}) => {
    const app = $$(APP, { name: 'app34' });

    const svgname = path2name(SVG_PATH);
    const svgprop = app.props.add(
        svgname,
        SVG_PATH,
        TYPE_SVG_FILE,
        {
            protocol: 'local' // ['internal', 'remote']
        }
    );

    // fired after SVG file loaded
    svgprop.on('_prop-added', (prop) => {
        svgprop.traverse((prop, info) => {
            console.log('  '.repeat(info.depth), 
                prop.getType(), 
                prop.getName(),
                `(${info.child_count} : ${info.isLast})`
            );        
        });
    });

    const lr = $$(LR)
        .setLeft(createLeftSide(svgprop))
        .setRight(createRightSide(svgprop))
    ;

    return app.set(lr);
};

const info = {
    clsid: 'jscom.compounds.app34',
    decription: 'Test SVGProperty and tree view population. \n'
              + 'Essentially a custom data wrapper for the state tree',
    name: '3.4',
};

const clsid = DOM.registerCompound(ctor, info);
export default clsid;
