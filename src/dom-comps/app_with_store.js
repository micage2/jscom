import { Create, Register } from '../registry.js';
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';
import TREE from '../shared/Tree-mmm.js';
import { Node, IPropertyGroup } from '../shared/mediator.js';
// import { junk } from '../shared/TreeTestData.js';
import BUTTON from './button.js'

const fragment = makeFragment(`
<style>
:host {
    display: flex;
    height: 100%;
    width: 100%;

    background: var(--color-bg);
}
.container {
    display: flex;
    height: 100%;
    width: 100%;
}
.store {
    display: none;
}
</style>
<div class="container">
    <slot name="content"></slot>
    <div class="store">
        <input type="file" accept="image/*" />
        <button></button>
    </div>
</div>
`);

function load(tree, imageData) {
    const { data, width, height } = imageData;

    // throw away alpha channel and zeroes
    let rgb = data.filter((v, i) => (i + 1) % 4 && v);

    const decoder = new TextDecoder('utf-8');
    const jsonStr = decoder.decode(rgb);

    try {
        const state = JSON.parse(jsonStr);
        obj2tree(tree, state);
        this.emit('loaded', tree);
    }
    catch (error) {
        console.log(error);
    }
}

function save(filename, data) {
    console.log(data);
}

function get_extension(filename) {
    return filename.split('.').pop();
}

function obj2ctx(obj) {
    // 1. Serialize JSON to binary:
    const str = JSON.stringify(obj);
    const encoder = new TextEncoder('utf-8');
    const uint8array = encoder.encode(str); // UTF-8 Uint8Array
    // console.log('save uint8: ', uint8array);

    // 2. Determine canvas dimensions:
    const totalBytes = uint8array.length;
    // 4 channels per pixel (RGBA), Alpha set to 255
    const pixelsNeeded = Math.ceil(totalBytes / 3);
    const width = Math.ceil(Math.sqrt(pixelsNeeded));
    const height = width;

    // 3. Create ImageData and fill pixels:
    const ctx = new OffscreenCanvas(width, height).getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Write bytes (pad with 0 if needed)
    for (let i = 0; i < pixelsNeeded; i++) {
        data[i * 4] = uint8array[i * 3];
        data[i * 4 + 1] = uint8array[i * 3 + 1];
        data[i * 4 + 2] = uint8array[i * 3 + 2];
        data[i * 4 + 3] = 255;
    }
    // console.log('save imageData.data: ', data);

    // Remaining bytes are auto 0 (padding)

    // 4. Put data and export as image:
    ctx.putImageData(imageData, 0, 0);

    return ctx;
}

function obj2tree(tree, obj) {
    const stack = [{
        key: 'root',
        val: obj,
        tree,
    }];

    while (stack.length) {
        const entry = stack.pop();
        const obj = entry.val;

        // Infer type if not provided
        let type = obj.__type;
        if (!type) {
            if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                type = 'group';
            } else {
                type = 'property';
            }
        }

        // add child payload, skip root obj but iterate its children
        if (entry.key !== 'root') {
            tree = entry.tree.add({
                name: entry.key,
                type,
                value: obj,
                data: obj.__data,
                config: obj.__config,
            });
        }
        
        // iterate children, exclude non-parents
        if (type !== 'group') continue;

        const entries = Object.entries(entry.val);
        // for(let i = entries.length - 1; i >= 0; i--) {
        for (let i = 0; i < entries.length; i++) {
            const [key, val] = entries[i];

            // skip metadata
            if (key.startsWith('__')) continue;

            stack.push({ key, val, tree });
        }
    }
}

function obj2node(obj, name = 'root', type = null, config = {}) {
    // Infer type if not provided
    if (type === null) {
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            type = 'group';
            console.warn(`⚠️  Type not specified for node "${name}". Assuming "group". Consider adding explicit type.`);
        } else {
            type = 'property';
        }
    }

    // Reject arrays
    if (Array.isArray(obj)) {
        console.error(`❌ Arrays not supported: "${name}". Use objects instead.`);
        return null;
    }

    const node = new Node({
        name,
        type,
        data: type === 'group' ? {} : { value: obj },
        config
    });

    // Recurse into children if group
    if (type === 'group' && typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
            // Skip metadata fields
            if (key.startsWith('__')) return;

            const childType = value?.__type || null; // explicit type if provided
            const childConfig = value?.__config || {};
            const childValue = value?.__value !== undefined ? value.__value : value;

            const child = obj2node(childValue, key, childType, childConfig);
            if (child) node.add(child);
        });
    }

    return node;
}

function tree2obj(self) {
    let obj = self.tree.to_obj();

    return obj;
}

function ctor(args) {
    const self = {};
    self.host = document.createElement('div'),
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));
    self.upload = self.shadow.querySelector('.store input');
    self.button = self.shadow.querySelector('.store button');

    self.project_name = args.name ?? 'no-name'

    self.tree = Create(TREE, 'AppNode', { name: self.project_name });
    self.prop = new IPropertyGroup(self.tree);

    const that = this;
    self.upload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // sanity check
            const parts = file.name.split('.');
            const ext = parts.at(-1);
            if (!ext || ext.toLowerCase() !== 'png') {
                that.emit('bad-file', { comp: that, filename: file.name });
                return;
            }
            parts.pop(); // strip extension
            self.project_name = parts.join();

            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = () => {
                    const canvas = new OffscreenCanvas(img.width, img.height);
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(
                        0, 0, canvas.width, canvas.height
                    );
                    load.bind(that)(self.tree, imageData);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    return {
        getInstance: () => self,
        getHost: () => self.host,
    }
}

const IApp = (self) => ({
    set(content) {
        DOM.attach(content, this, { slot: 'content' });
        return this;
    },
    load: () => {
        self.upload.click(); // starts user upload
    },
    save: () => {
        const mydata = tree2obj(self);
        const ctx = obj2ctx(mydata);

        const blob = ctx.canvas.convertToBlob().then((blob) => {
            const link = document.createElement('a');
            link.download = `${self.project_name}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    },
    from_obj(obj) {
        obj2tree(self.tree, obj);
        return self.prop;
    },

    prop: self.prop,
    tree: self.tree,
});


const clsid = DOM.register(ctor, function (role, action, reaction) {
    role("App", self => IApp(self), true);
}, {
    name: 'App',
    description: 'Container with serialization support'
});
export default clsid;