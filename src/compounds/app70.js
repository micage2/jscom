import { DomRegistry as DOM } from '../dom-registry.js';
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import SIMPLE from '../dom-comps/simple-view.js'
import LISTVIEW from '../dom-comps/list-view.js'
import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
import BUTTON from '../dom-comps/button.js'
import SVGVIEW2 from '../dom-comps/svg-view-2.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'Dynamic left-right split.\n\n' 
    + 'The layout always consumes the entire screen.'
;

const ctor = (args = {}) => {    
    const box = $$(BOX);
    const info = Simple('\nSVG- and Text-Buttons. Click on each!\n\n'+
        'Zoom (mouse wheel) and Pan (drag mouse) in lower view');
    const svgview = $$(SVGVIEW2);
    const out = Simple();

    const buttons_info = [
        { name: "File" },
        { name: "Edit" },
        { name: "New File", svg_file: "./assets/add-item.svg"},
        { name: "New Folder", svg_file: "./assets/add-folder.svg"},
        // { name: "Delete", svg_file: "./assets/close.svg"},
        { name: "Delete", svg_file: "./assets/trash-bin-1.svg"},
    ];

    const buttons = buttons_info.map(entry => {
        const btn = $$(BUTTON, entry);
        btn.on('clicked', (b) => {
            out.set_timed(b.get_name());
            svgview.load(b.get_svg_file())
        });
        return btn;
    });

    const delete_btn = buttons.pop();
    box.addMany(buttons);
    box.add(delete_btn, { align: 'right' });

    return $$(TBS)
        .setTop(box)
        .setBottom($$(TB, { ratio: 0})
            .setTop(info)
            .setBottom($$(TBS, {bottomHeight:32})
                .setTop(svgview)
                .setBottom(out)
            )
        )
    ;
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
