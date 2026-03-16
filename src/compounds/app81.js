import { DomRegistry as DOM } from '../dom-registry.js';
import TBS from '../dom-comps/top-bottom-static.js'
import SIMPLE from '../dom-comps/simple-view.js'
import BOX from '../dom-comps/box.js'
import BUTTON from '../dom-comps/button.js'
import SVGVIEW2 from '../dom-comps/svg-view-2.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'Early SVG viewer for inspiration.\n\n' 
    + '... mainly to test concepts. :)'
;

// svg files to load
const SVGFILE = "./assets/wave_packet.svg";
const SVGBUTTON_NEWFILE = "./assets/add-item.svg";
const SVGBUTTON_NEWFOLDER = "./assets/add-folder.svg";

const ctor = (args = {}) => {    
    const box = $$(BOX);
    const simple = Simple('Early SVG viewer for inspiration. ' 
            + 'Demonstrates Pan & Zoom.');
    const svgview = $$(SVGVIEW2).load(SVGFILE);

    // create button and connect to "simple"
    const buttons = [
        { name: "File" },
        { name: "Edit" },
        { name: "New File", svg_file: SVGBUTTON_NEWFILE },
        { name: "New Folder", svg_file: SVGBUTTON_NEWFOLDER },
    ].map(entry => {
        const btn = $$(BUTTON, entry);
        btn.on('clicked', (btn) => {
            simple.set_timed(btn.get_name());        
        });
        return btn;
    });
    box.addMany(buttons);

    return $$(TBS)
        .setTop(box)
        .setBottom($$(TBS, { bottomHeight:32 })
            .setTop(svgview)
            .setBottom(simple)
        )
    ;
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
