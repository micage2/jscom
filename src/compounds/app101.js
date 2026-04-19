import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
// import SIMPLE from '../dom-comps/simple-view.js'
import BOX from '../dom-comps/dialog-box.js'
// import BUTTON from '../dom-comps/button.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import SLIDERVIEW from '../dom-comps/prop-slider.js'
import BOOLVIEW from '../dom-comps/prop-bool.js'

const $$ = DOM.create;

const { ceil, random, floor, round } = Math;
const RR = (max = 100, min = 0, step = 1) => {
    const range = max - min;
    const val = min + random() * range;
    return step * floor(val/step);
};

// test data, normally this would come from outside
const data = {
    circles: {
        // shared config for all circles
        __config: {
            title: 'Circle',
            cx: { min: -500, max: 500, step: 10 },
            cy: { min: -500, max: 500, step: 10 },
            r: { min: 2, max: 200, step: 1, view: SLIDERVIEW },
            flag: { view: BOOLVIEW },
        },
        'circle1': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
        'circle2': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
        'circle3': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
        'circle3': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
    },
    rects: {
        __config: {
            title: 'Rect',
            x: { min: -500, max: 500, step: 10 },
            y: { min: -500, max: 500, step: 10 },
            height: { min: 2, max: 200, step: 1, view: SLIDERVIEW },
            width: { min: 2, max: 200, step: 1, view: SLIDERVIEW },
        },
        'rect1': {
            x: RR(300, -300, 10),
            y: RR(300, -300, 10),
            height: RR(300, -300, 10),
            width: RR(100)
        },
    }
}

const ctor = (args = {}) => {
    const app = $$(APP, { name: 'app101' });
    const root = app.from_obj(data); // build tree from data

    // data for a collection of 'Circle' dialogs
    const circles = root.getChild('circles');
    const config = data.circles.__config;

    const box = $$(BOX); // dialog container

    // create 'Circle' dialogs, in fact it's a generic container
    const circles_children = circles.getChildren();
    circles_children.forEach((props) => {
        const view = $$(PROPSVIEW, { props, config });
        box.add(view);
    });
    
    app.set(box);

    return app;
};


const clsid = 'jsom.compounds.app101';
const description = 'App using PropsView';
const res = DOM.registerCompound(ctor, {
    clsid, description, name: '10.1'
});
if (!res) console.log('[app101] Registration failed', clsid, name);
export default clsid;
