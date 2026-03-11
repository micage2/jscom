import { DomRegistry as DOM } from '../dom-registry.js';
import SIMPLE from '../dom-comps/simple-view.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import LR from '../dom-comps/left-right.js'
import LISTVIEW from '../dom-comps/list-view.js'
import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
import BUTTON from '../dom-comps/button.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'The star in this layout is the\n\n' 
    + 'list-/tree-view component in the middle.'
;

const ctor = (args = {}) => {    
    const listview = $$(LISTVIEW, { itemClassId: LISTITEM });
    // listview.init();

    const toolbar = $$(BOX);
    
    const add_item_button = Button('New Item', { svg_file: './assets/add-item.svg'});
    add_item_button.on('clicked', b=>{
        const item = listview.add();
        listview.unfoldParent(item);
    });
    toolbar.add(add_item_button);
    
    const add_folder_button = Button('New Folder', { svg_file: './assets/add-folder.svg'});
    add_folder_button.on('clicked', b => {
        const item = listview.add({ type: 'folder' });
        listview.unfoldParent(item);
    });
    toolbar.add(add_folder_button);
    
    const delete_button = Button('Delete Selected', { svg_file: './assets/trash-bin-1.svg'});
    delete_button.on('clicked', b => {
        listview.removeSelected();
    });
    toolbar.add(delete_button, { align: 'right'});

    const out = Simple();
    const treeview = $$(TBS)
        .setTop(toolbar)
        .setBottom($$(TBS, { bottomHeight:32 })
            .setTop(listview)
            .setBottom(out)
        )
    ;
    listview.on('selected', (item) => { out.set_timed('selected: ' + item.get_title())});
    listview.on('removed-items', (listitems) => {
        for (const li of listitems) {
            console.log('[app30.ctor] removed listitem: ', li.uid);
        }     
    });

    const lrlr = $$(LR, {ratio:.3})
        .setLeft(Simple())
        .setRight($$(LR, {ratio:.5})
            .setLeft(treeview)
            .setRight(Simple())
        )
    ;
    
    return $$(TB, { ratio: 0.0 })
        .setTop(Simple(info))
        .setBottom(lrlr)
    ;
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
