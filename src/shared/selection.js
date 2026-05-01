export class Selection {
    #set = new Set();

    has() {}

    add(prop) { this.#set.add(prop); }
    addMany(props) { props.forEach((prop) => this.#set.add(prop)); }
    remove(prop) { this.#set.delete(prop); }
    clear() { this.#set = new Set(); }
}