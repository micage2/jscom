import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
// import TBS from '../dom-comps/top-bottom-static.js'
// import SIMPLE from '../dom-comps/simple-view.js'
// import BOX from '../dom-comps/box.js'
// import BUTTON from '../dom-comps/button.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import SLIDERVIEW from '../dom-comps/prop-slider.js'

const $$ = DOM.create;

const data = {
    circles: {
        'circle1': { x: 0, y: 0, r: 10 },
        'circle2': { x: 0, y: 0, r: 20 },
        // 'circle3': { x: 0, y: 0, r: 30 },
    }
}

const ctor = (args = {}) => {
    const app = $$(APP, { name: 'app101' });
    const root_props = app.from_obj(data);
    const circles = root_props.getChild('circles');
    const circle1 = circles.getChild('circle1');

    app.tree.traverse((P, info) => console.log(P, info));


    const propsview = $$(PROPSVIEW, circle1);

    return app;
};


const clsid = DOM.registerCompound(ctor);
export default clsid;
