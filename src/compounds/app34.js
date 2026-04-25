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
import SVGVIEW3 from '../dom-comps/svg-view-3.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import {TYPE_SVG_FILE} from '../shared/svg_property.js'

const ICON_PATH = './assets/icons/';
// const SVG_PATH = './assets/svg/world.svg';
// const SVG_PATH = './.private/eberswalder1.svg';
// const SVG_PATH = './assets/svg/Eberswalder9_opt2.svg';
const SVG_PATH = './assets/svg/sample1.svg';
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
    svg: null,
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

function createTabsView() {
    const only1box = $$(ONLYONEBOX);
    const tabsbar = $$(BOX);
    const tabsview = $$(TBS)
        .setTop(tabsbar)
        .setBottom(only1box)
    ;
    return tabsview;
}

function createLeftSide(prop) {
    views.treeview = $$(LISTVIEW, {
        prop, 
        config: {
            item_clsid: LISTITEM,
            filter: (prop) => prop.isGroup(), 
        }
    });
    const toolbar = createToolbar(views.treeview);

    let svgviewready = false;
    views.treeview.on('selected', (item) => {
        console.log('[TreeView]', 'selected', item.prop);
        if (svgviewready) {
            views.svg.toggleHighLight(item.prop);
        }
        else {
            // make sure we don't miss it
            views.svg.once('ready', (view) => {
                views.svg.toggleHighLight(item.prop);
                svgviewready = true;
            });
        }
    });

    return $$(TBS).setTop(toolbar).setBottom(views.treeview);
}

function createRightSide(svgfile) {
    views.propsview = $$(PROPSVIEW, { props: svgfile });

    const svgview = $$(SVGVIEW3, {prop: svgfile});
    svgview.on('selected', (prop) => {
        console.log('[SVGView]', 'selected:', prop);
        if (!prop) debugger;

        svgview.toggleHighLight(prop);

        views.treeview.select(prop);
    });
    views.svg = svgview;
    
    return $$(TB, { ratio: .7 })
        .setTop(svgview)
        .setBottom(views.propsview)
    ;
}

const ctor = (args = {}) => {
    const app = $$(APP, { name: 'app34' });

    const svgname = path2name(SVG_PATH);
    const svgfile = app.props.add({
        name: svgname,
        value: SVG_PATH,
        type: TYPE_SVG_FILE, 
        config: {
            protocol: 'local' // ['internal', 'remote']
        }
    });

    // fired after SVG file loaded
    svgfile.on('NA child-added', (prop) => {
        svgfile.traverse((prop, info) => {
            console.log('  '.repeat(info.depth), 
                prop.getType(), 
                prop.getName(),
                `(${info.child_count} : ${info.isLast})`
            );        
        });
    });

    const lr = $$(LR, { ratio: .2 })
        .setLeft(createLeftSide(svgfile))
        .setRight(createRightSide(svgfile))
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
