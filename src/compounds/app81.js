import { DomRegistry as DOM } from '../dom-registry.js';
import TBS from '../dom-comps/top-bottom-static.js'
import SIMPLE from '../dom-comps/simple-view.js'
import BOX from '../dom-comps/box.js'
import BUTTON from '../dom-comps/button.js'
import SVGVIEW2 from '../dom-comps/svg-view-2.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

const info = 'Early SVG editor for inspiration.\n\n' 
    + '... very early. Mainly to text concepts. :)'
;

const ctor = (args = {}) => {    
    const box = $$(BOX);
    const simple = Simple('Early SVG editor for inspiration');
    // const svgview = $$(SVGVIEW2, { file: "./assets/half-circle.svg" });
    // const svgview = $$(SVGVIEW2).load("./assets/half-circle.svg");
    const svgview = $$(SVGVIEW2).load("./assets/wave_packet.svg");

    // create button and connect to "simple"
    const buttons = [
        { name: "File" },
        { name: "Edit" },
        { name: "New File", svg_file: "./assets/add-item.svg"},
        { name: "New Folder", svg_file: "./assets/add-folder.svg"},
    ].map(entry => {
        const btn = $$(BUTTON, entry);
        DOM.connect(btn, 'clicked', simple, 'timed', b=>b.get_name());
        return btn;
    });
    box.addMany(buttons);

    DOM.connect(svgview, 'text', simple, 'title', (args) => {
        console.log(`${args}`);            
    });

    return $$(TBS)
        .setTop(box)
        .setBottom($$(TBS, {bottomHeight:32})
            .setTop(svgview)
            .setBottom(simple)
        )
    ;
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
