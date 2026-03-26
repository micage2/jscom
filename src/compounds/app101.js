import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
// import SIMPLE from '../dom-comps/simple-view.js'
import BOX2 from '../dom-comps/box2.js'
// import BUTTON from '../dom-comps/button.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import SLIDERVIEW from '../dom-comps/prop-slider.js'

const $$ = DOM.create;

const data = {
    circles: {
        // shared config for all circles
        __config: {
            title: 'Circle',
            view: SLIDERVIEW,
            cx: { min: -500, max: 500, step: 10 },
            cy: { min: -500, max: 500, step: 10 },
            r: { min: 2, max: 200, step: 1 },
        },
        'circle1': { cx:  20, cy: 0, r: 10 },
        'circle2': { cx: -20, cy: 0, r: 20 },
        'circle3': { x: 0, y: 0, r: 30 },
        'circle4': {
            __config: { type: 'circle', view: 'CirclePropsView' },
            cx: 20, cy: 50, r: 25, fill: 'red'
        },
    },
    users: {
        __config: {
            title: 'User',
            view: SLIDERVIEW,
            age: {}
        },
        'Heinz': { age: 42, email: 'heinz@gmail.com' },

    }

}

const ctor = (args = {}) => {
    const app = $$(APP, { name: 'app101' });
    const app_props = app.from_obj(data); // build tree from data

    const circles = app_props.getChild('circles'); // root props group
    const config = circles.getConfig(); // shared config

    const circle1 = circles.getChild('circle1');
    const circle2 = app_props.getByPath('circles.circle2');
    const circle3 = circles.getChild('circle3');

    // app.tree.traverse((P, info) => console.log(P, info));


    // same property group
    const propsview = $$(PROPSVIEW, { props: circle1, config });
    const propsview2 = $$(PROPSVIEW, { props: circle2, config });
    const propsview3 = $$(PROPSVIEW, { props: circle1, config });
    // TODO: circle1.addChild('z', 'property');


    const box = $$(BOX2).addMany([propsview, propsview2, propsview3]);

    app.set(box);

    return app;
};


const clsid = DOM.registerCompound(ctor);
export default clsid;
