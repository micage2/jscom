import { DomRegistry as DOM } from '../dom-registry.js';
import TBS from '../dom-comps/top-bottom-static.js'
import LISTVIEW from '../dom-comps/list-view.js'
import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
import BUTTON from '../dom-comps/button.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'Dynamic left-right split.\n\n' 
    + 'The layout always consumes the entire screen.'
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
    
    return $$(TBS)
        .setTop(toolbar)
        .setBottom(listview)
    ;
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
