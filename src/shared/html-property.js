import { TypeRegistry } from "./type-registry.js"
import { Property, GroupProperty } from "./property.js"


const tag2klass = {
    div: {
        klass: HTMLDivElement, 
        type: 'html.div',
    },
    span: {
        klass: HTMLSpanElement,
        type: 'html.span', 
    },
    a: {
        klass: HTMLAnchorElement,
        type: 'html.a', 
    },
    input: {
        klass: HTMLInputElement,
        type: 'html.input',
    },
};

function initChildren(elem, prop) {
    const children = [...elem.children]
    .filter((elem) => Object.keys(tag2klass)[elem.tagName])
    .map((elem, i) => {
        const name = elem.name || elem.id || elem.tagName + i;
        const type = allowedTags[elem.tagName];
        return prop.add({ name, value: elem, type, config: prop.config });
    });
}

function getTypeByTag(tag) {
    switch (tag) {
        case 'div': return HtmlDivProperty
    }
}

function processConfig(elem, cfg) {
    if (cfg.id) elem.id = cfg.id;
    if (cfg.class) {
        cfg.class.trim().split(/\s+/).forEach(word => {
            elem.classList.add(word);               
        });;
    };
    if(cfg.text) { elem.textContent = cfg.text; }
}

function HtmlProperty(Tag, DomClass) {
    return class HtmlProperty extends GroupProperty {
        #elem;
    
        constructor(params) {
            super(params);
            let elem = params.value;
            if (!(elem instanceof DomClass)) {
                if (elem) console.warn('[HtmlProperty].ctor', 'Invalid argument: ', elem);
                elem = document.createElement(Tag);
                const cfg = params.config ?? params.config?.[params.name];
                if (cfg) {
                    processConfig(elem, cfg);
                }
            } else {
                initChildren(elem, this);
            }

            this.on('child-added', (child) => {
                // console.log('[HtmlDivProperty.ctor]', 'child: ', child);
                const elem = child.get();
                if (elem) {
                    this.#elem.appendChild(elem);
                }
            });
            this.on('child-removed', (child) => {
                const elem = child.get();
                if (elem) {
                    elem.remove();
                }
            });
    
            this.#elem = elem;
        }
    
        get() { return this.#elem; } // TODO: unsafe!
        getType() { return 'html.' + Tag; }
    }
}

// class HtmlProperty extends GroupProperty {
class _HtmlProperty extends GroupProperty {
    #elem;

    constructor(params) {
        super(params);
        let elem = params.value;
        if (!(elem instanceof HTMLElement)) {
            if (elem) console.warn('[HtmlProperty].ctor', 'Invalid argument: ', elem);
            elem = document.createElement('div');
            const cfg = params.config ?? params.config?.[params.name];
            if (cfg) {
                processConfig(elem, cfg);
            }
        }
        initChildren(elem, this);
        this.on('child-added', (child) => {
            // console.log('[HtmlDivProperty.ctor]', 'child: ', child);
            const elem = child.get();
            if (elem instanceof HTMLElement) {
                this.#elem.appendChild(elem);
            }
        });
        this.on('child-removed', (child) => {
            const elem = child.get();
            if (elem instanceof HTMLElement) {
                elem.remove();
            }
        });

        this.#elem = elem;
    }

    get() { return this.#elem; } // TODO: unsafe!
    getType() { return TYPE_HTML_DIV; }
}
const HtmlDivProperty = HtmlProperty('div', HTMLDivElement);
const HtmlSpanProperty = HtmlProperty('span', HTMLSpanElement);

export const TYPE_HTML_DIV = TypeRegistry.register('html.div', HtmlDivProperty);
export const TYPE_HTML_SPAN = TypeRegistry.register('html.span', HtmlSpanProperty);


class _HtmlDivProperty extends GroupProperty {
    #div;

    #processConfig = (div, cfg) => {
        if (cfg.id) this.#div.id = cfg.id;
    }

    constructor(params) {
        super(params);
        let div = params.value;
        if (!(div instanceof HTMLDivElement)) {
            if (div) console.warn('[HtmlDivProperty].ctor', 'Invalid argument: ', div);
            div = document.createElement('div');
            const cfg = params.config[params.name];
            if (cfg) {
                this.#processConfig(div, cfg);
            }
        }
        initChildren(g, this);
        this.on('child-added', (child) => {
            // console.log('[HtmlDivProperty.ctor]', 'child: ', child);
            const elem = child.get();
            if (elem instanceof HTMLElement) {
                div.appendChild(elem);
            }
        });
        this.on('child-removed', (child) => {
            const elem = child.get();
            if (elem instanceof HTMLElement) {
                elem.remove();
            }
        });

        this.#div = div;
    }

    get() { return this.#div; } // TODO: unsafe!
    getType() { return TYPE_HTML_DIV; }
}
// export const TYPE_HTML_DIV = TypeRegistry.register('html.div', HtmlDivProperty);


// test
import { create_sheet } from "../shared/dom-helper.js"
if (1) {
    const sheet = create_sheet(`
        :host, body {
            background-color: #111;
            color: #fee;
        }
        .itembox {
            border: 1px solid gray;
            margin: 4px;
            padding: 4px;
            color: #fee;
        }
        .label { margin: 0px 10px; }
    `);
    document.adoptedStyleSheets.push(sheet);

    class Item1 {
        constructor({name, config = {}}) {
            const div1 = TypeRegistry.create({
                name, 
                type: TYPE_HTML_DIV,
                config: { ...config, class: `${config.class} itembox` }
            });

            const div11 = div1.add({
                type: TYPE_HTML_SPAN, name: "icon", 
                config: { text: '❌', ...config.icon, class: 'icon' }
            });

            const div12 = div1.add({
                type: TYPE_HTML_SPAN, name: "label", 
                config: { text: 'label', ...config.label, class: 'label' }
            });

            return div1;
        }
    }
    const TYPE_ITEM1 = TypeRegistry.register('view.item1', Item1);
    const item1 = TypeRegistry.create({
        name: 'item1', 
        type: TYPE_ITEM1, 
        config: {
            icon: { text: '🥝' },
            label: { text: 'Kiwi' },
        }});
    const div2 = TypeRegistry.create({ name: 'item2', type: TYPE_ITEM1 });

    document.body.appendChild(item1.get());
    document.body.appendChild(div2.get());


    
}