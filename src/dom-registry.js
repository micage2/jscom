// dom-registry.js

let klasses = new Map(); // clsid → { domFactory, roleProvider }

let privateNodes = new WeakMap(); // iface → idomNode (private)

export const DomRegistry = {
    register(domFactory, roleProvider) {
        const clsid = "CLS_" + Math.random().toString(36).slice(2, 11);
        klasses.set(clsid, { domFactory, roleProvider });
        return clsid;
    },

    create(clsid, args = {}, role) {
        const klass = klasses.get(clsid);
        if (!klass) throw new Error(`No component registered for ${clsid}`);

        const idomNode = klass.domFactory(args);
        if (!idomNode?.getRootNode) throw new Error(`Invalid IDomNode for ${clsid}`);

        const roleFactory = klass.roleProvider(role);
        if (!roleFactory)
            throw new Error(`No role factory for "${role}" on ${clsid}`);

        const iface = roleFactory({
            root: idomNode.getRootNode(),
            data: idomNode.getData?.() ?? {}
        });

        privateNodes.set(iface, idomNode);

        return iface;
    },

    attach(parentIface, childIface, options = {}) {
        const parentNode = privateNodes.get(parentIface);
        const childNode = privateNodes.get(childIface);

        if (!parentNode || !childNode) return false;

        const parentHost = parentNode.getRootNode();
        if (!parentHost) return false;

        const childRoot = childNode.getRootNode();
        if (!childRoot) return false;

        // Assign slot name BEFORE appending
        childRoot.slot = options.slot || '';

        // Append to the shadow HOST (light DOM position)
        // Browser will distribute childRoot into the matching <slot name="...">
        parentHost.appendChild(childRoot);

        return true;
    },

    mount(rootIface) {
        let rootEl = document.getElementById('app-root');
        if (!rootEl) {
            rootEl = document.createElement('div');
            rootEl.id = 'app-root';
            rootEl.style.cssText = 'height:100vh;width:100vw;margin:0;overflow:hidden;';
            document.body.appendChild(rootEl);
        }

        const rootNode = privateNodes.get(rootIface)?.getRootNode();
        if (rootNode) rootEl.appendChild(rootNode);
    }
};