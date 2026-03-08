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

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'TreeView with button and status bar\n\n'
    + 'Each section is its own component communicating via "connections".\n\n'
    + 'Comparable to devices like amplifiers, speakers, phono, tape, ...'
;


function ready(svg) {
}

const ctor = (args = {}) => {
    const status = Simple('no selection');
    const listview = $$(LISTVIEW, { itemClassId: LISTITEM });
    // DOM.connect(listview, 'selected', status, 'title', item => `selected item: ${item.get_title()}`);
    // listview.init({ root: 'Scene'});

    const toolbar = $$(BOX);
    const add_item_button = Button('New Item', { svg_file: './assets/add-item.svg'});
    const add_folder_button = Button('New Folder', { svg_file: './assets/add-folder.svg'});
    // const delete_button = Button('Delete Selected', { svg_file: './assets/trash-bin-1.svg'});
    const delete_button = Button('Delete Selected', { svg_file: './assets/close.svg'});

    toolbar.addMany([add_item_button, add_folder_button, delete_button]);
    add_item_button.on('clicked', b=>{
        listview.add();
    });
    add_folder_button.on('clicked', b => {
        listview.add({ type: 'folder' });
    });
    delete_button.on('clicked', b => {
        listview.removeSelected();
    });


    const toolbar_with_controls = $$(TBS)
        .setTop(toolbar)
        .setBottom(listview)
    ;

    // TabView is just a link collection for the ListView
    // It does not manage the associated view. The ListView does.

    // Q: What do I want to know from Box?
    // A: Is there an entry for a given listitem?
    // if yes: select it
    // if no: create one and select it

    const listitem2button = new WeakMap(); // listitem -> button
    const links_reverse = new WeakMap(); // button -> listitem
    const only1box = $$(ONLYONEBOX);
    const svgview = $$(SVGVIEW2);
    svgview.load('./assets/Eberswalder9_opt2.svg');
    only1box.add('view1', svgview).select('view1');
    const tabbar = $$(BOX);
    const tabview = $$(TBS)
        .setTop(tabbar)
        .setBottom(only1box)

    svgview.on('svg-node', (node) => {
        if (node.type === 'g') {
            listview.add({ type: "folder", title: node.name })
        }
        // console.log('svg: ', node);      
    });

    

    // test the new mediator
    listview.on('selected', (listitem) => {
        // console.log('[ListView.on()]: ' + listitem.get_title());

        const button = listitem2button.get(listitem);
        if (!tabbar.has(button)) {
            // const button = Button(listitem.get_title());
            const tab = $$(TAB, { title: listitem.get_title() });

            tab.on('clicked', (button) => {
                tabbar.select(button);
                const listitem = links_reverse.get(button);
                listview.select(listitem);
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

    return $$(TB, { ratio: .12})
        .setTop(Simple(info))
        .setBottom($$(TBS, { bottomHeight: 32 })
            .setTop($$(LR, {minLeft: 140, ratio: 0})
                .setLeft(toolbar_with_controls)
                .setRight(tabview)
            )
            .setBottom(status)
        )
    ;
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
