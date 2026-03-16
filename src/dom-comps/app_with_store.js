import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';
import { Tree } from '../shared/Tree.js';
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

/*
    let endIndex = data.length;
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] !== 0) {
            endIndex = i + 1;
            break;
        }
    }
    const trimmed = data.slice(0, endIndex);
    let rgb = trimmed.filter((v, i) => (i + 1) % 4 && v);

*/

function trimTrailingZeros(uint8ClampedArray) {
    let len = uint8ClampedArray.length;
    // Traverse backwards to find the last non-zero
    while (len > 0 && uint8ClampedArray[len - 1] === 0) {
        len--;
    }
    // Return a view of the array up to the last non-zero
    return uint8ClampedArray.subarray(0, len);
}

/** @param {Uint8ClampedArray} data */
function load(imageData) {
    const { data, width, height } = imageData;

    // throw away alpha channel and zeroes
    let rgb = data.filter((v, i) => (i + 1) % 4 && v);

    const decoder = new TextDecoder('utf-8');
    const jsonStr = decoder.decode(rgb);
    // console.log('load: ', jsonStr);

    try {
        const state = JSON.parse(jsonStr);
        this.set_data(state);
        this.emit('file-loaded', this.get_data());
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

function ctor(args) {
    const self = {};
    self.host = document.createElement('div'),
        self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));
    self.upload = self.shadow.querySelector('.store input'),
        self.button = self.shadow.querySelector('.store button'),

        self.project_name = args.project_name ?? 'no-name'

    self.tree = new Tree();
    self.data = { value: 41, bla: 7 };
    // self.data = 'Hello World!';

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
                    load.bind(that)(imageData);
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
        // 1. Serialize JSON to binary:
        const json = self.data;
        const str = JSON.stringify(json);
        const encoder = new TextEncoder('utf-8');
        const uint8array = encoder.encode(str); // UTF-8 Uint8Array
        console.log('save uint8: ', uint8array);

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
        console.log('save imageData.data: ', data);

        // Remaining bytes are auto 0 (padding)

        // 4. Put data and export as image:
        ctx.putImageData(imageData, 0, 0);
        const blob = ctx.canvas.convertToBlob().then((blob) => {
            const link = document.createElement('a');
            link.download = `${self.project_name}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    },
    get_data() { return self.data; },
    set_data(data) { self.data = data; },
});

const clsid = DOM.register(ctor, function (role, action, reaction) {

    role("App", self => IApp(self), true);


}, {
    name: 'App',
    description: 'Container with serialization support'
});
export default clsid;