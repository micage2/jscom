import { DomRegistry as DOM } from '../dom-registry.js';
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });

const clsid = 'jsom.compounds.app1.0';
const description = 'Dynamic left-right split.\n\n' 
    + 'The layout always consumes the entire screen.'
;

const ctor = (args = {}) => {    
    const main = $$(LR)
        .setLeft(Simple("Left"))
        .setRight(Simple("Right")
    );

    return $$(TB, { ratio: 0.0 })
        .setTop(Simple(description))
        .setBottom(main)
};

const res = DOM.registerCompound(ctor, { clsid, description });
if (!res) console.log('[app10] Registration failed', clsid);
export default clsid;
