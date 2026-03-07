import { DomRegistry as DOM } from '../dom-registry.js';
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import TOOLBAR from '../dom-comps/toolbar.js'
import LISTVIEW from '../dom-comps/list-view.js'
import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import BUTTON from '../dom-comps/button.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'TreeView with button and status bar\n\n'
    + 'Each section is its own component communicating via "connections".\n\n'
    + 'Comparable to devices like amplifiers, speakers, phono, tape, ...'
;

const ctor = (args = {}) => {
    const toolbar = $$(TOOLBAR);
    const status = Simple('no selection');
    const listview = $$(LISTVIEW, { itemClassId: LISTITEM });
    DOM.connect(listview, 'selected', status, 'title', item => `selected item: ${item.get_title()}`);
    // listview.init({ root: 'Scene'});

    DOM.connect(toolbar, 'add-item', listview, 'add-item');
    DOM.connect(toolbar, 'add-folder', listview, 'add-folder');
    DOM.connect(toolbar, 'trash-bin', listview, 'remove-selected');

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
    const box = $$(BOX);
    const tabview = $$(TBS)
        .setTop(box)
        .setBottom(only1box)

    // test the new mediator
    listview.on('selected', (listitem) => {
        // console.log('[ListView.on()]: ' + listitem.get_title());

        const button = listitem2button.get(listitem);
        if (!box.has(button)) {
            const button = Button(listitem.get_title());
            DOM.connect(button, 'clicked', box, 'button-select');
            button.on('clicked', (button) => {
                box.select(button);
                const listitem = links_reverse.get(button);
                listview.select(listitem);
            });
            box.add(button);
            box.select(button);
            listitem2button.set(listitem, button);
            links_reverse.set(button, listitem);
        }
        else {
            box.select(button);
        }  
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
