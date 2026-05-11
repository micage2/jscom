import { DomRegistry as DOM } from '../dom-registry.js';
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import LISTVIEW from '../dom-comps/list-view.js'
import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import BUTTON from '../dom-comps/button.js'
import TAB from '../dom-comps/tab.js'
import SVGVIEW2 from '../dom-comps/svg-view-2.js'

// const SVG_PATH = './assets/worldUltra.svg';
const SVG_FILE = './assets/svg/world.svg';
const ICON_PATH = './assets/icons/';

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'TreeView with button and status bar\n\n'
    + 'Each section is its own component communicating via "connections".\n\n'
    + 'Comparable to devices like amplifiers, speakers, phono, tape, ...'
;

const ctor = (args = {}) => {
    const status = Simple('no selection');
    const listview = $$(LISTVIEW, { itemClassId: LISTITEM });

    const lv_toolbar = $$(BOX);
    const lv_add_item_button = Button('New Item', { svg_file: ICON_PATH + 'add-item.svg'});
    const lv_add_folder_button = Button('New Folder', { svg_file: ICON_PATH + 'add-folder.svg'});
    const lv_delete_button = Button('Delete Selected', { svg_file: ICON_PATH + 'trash-bin-1.svg'});

    lv_toolbar.addMany([lv_add_item_button, lv_add_folder_button]);
    lv_toolbar.add(lv_delete_button, { align: 'right' });
    lv_add_item_button.on('clicked', b=>{
        const item = listview.add();
        listview.unfoldParent(item);
    });
    lv_add_folder_button.on('clicked', b => {
        const item = listview.add({ type: 'folder' });
        listview.unfoldParent(item);
    });
    lv_delete_button.on('clicked', b => {
        listview.removeSelected();
    });

    const toolbar_with_controls = $$(TBS)
        .setTop(lv_toolbar)
        .setBottom(listview)
    ;

    const listitem2button = new WeakMap(); // listitem -> button
    const links_reverse = new WeakMap(); // button -> listitem
    const only1box = $$(ONLYONEBOX);

    const svgview = $$(SVGVIEW2);
    svgview.load(SVG_FILE, { mode: 'isolate'});
    const iface2item = new WeakMap();
    
    only1box.add('view1', svgview).select('view1');

    const tabbar = $$(BOX);
    const tabview = $$(TBS)
        .setTop(tabbar)
        .setBottom(only1box)
    ;

    const icons = {
        'script': '⌾',
        'style': '🥝',
        'svg': 's',
        'g': 'g',
        'path': 'p',
        'polygon': '⏢',
        'polyline': '☈',
    }

    let parents = [];
    svgview.on('svg-node', (node) => {

        // TODO: type mapping svg.nodeName -> { type, view }
        const type = ['g', 'svg'].includes(node.type)
            ? 'folder' : 'item';

        const item = listview.add({
            type,
            title: node.name,
            icon: icons[node.type] || '༜',
            iface: node.iface,
        });
        iface2item.set(node.iface, item);

        if (!node.name) node.iface.setName(item.get_title());

        if (node.num_children) {
            listview.select(item, {no_emit: true}); // mark item as insert target
            parents.push({item, node});
        }
        else if (node.is_last) {
            while (parents.length && parents.pop().is_last) {}
            const last = parents.at(-1);
            if (last) listview.select(last.item, {no_emit: true});
        }
    });
    svgview.on('svg-loaded', () => {
        console.log('[app33] SVG loaded');
        
        listview.select(listview.get_first());
    });

    svgview.on('selected', (iface) => {
        console.log('svgview.on("selected")', iface.getName(), iface.getType());

        svgview.select(iface);

        // TODO: iface2item needed
        const item = iface2item.get(iface);
        listview.select(item);

        status.set_timed(iface.getName());
    });

    listview.on('selected', (listitem) => {

        const button = listitem2button.get(listitem);
        if (!tabbar.has(button)) {
            // const button = Button(listitem.get_title());
            const tab = $$(TAB, {
                title: listitem.get_title(),
                icon: listitem.get_icon(),
            });

            tab.on('clicked', (button) => {
                tabbar.select(button);
                const listitem = links_reverse.get(button);
                listview.select(listitem);
                svgview.select(listitem.iface);
            });

            tab.on('closed', (tab) => {
                tabbar.remove(tab.get_title());
            });

            tabbar.add(tab);
            tabbar.select(tab);
            listitem2button.set(listitem, tab);
            links_reverse.set(tab, listitem);
        }
        else {
            tabbar.select(button);
        }

        svgview.select(listitem.iface);
    });

    listview.on('removed-items', (listitems) => {
        // remove related buttons from tabbar
        for (const li of listitems) {
            tabbar.remove(li.get_title());
            console.log('[app31.ctor] removed listitem: ', li.uid);
        }
    });

    tabbar.on('removed', (tab) => {
        console.log(`[app31.ctor] removed tab: #${tab.get_title()}`);
    });
    tabbar.on('clicked', (tab) => {
        console.log('tab selected', tab);
    });
    

    return $$(TB, { ratio: 0 })
        .setTop(Simple(info))
        .setBottom($$(TBS, { bottomHeight: 32 })
            .setTop($$(LR, {minLeft: 0, ratio: 0.1})
                .setLeft(toolbar_with_controls)
                .setRight(tabview)
            )
            .setBottom(status)
        )
    ;
};

const clsid = 'jsom.compounds.app33';
const description = 'App using PropsView';
const res = DOM.registerCompound(ctor, {
    clsid, description, name: '3.3'
});
export default clsid;
