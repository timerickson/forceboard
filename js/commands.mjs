import { Item } from 'data';

const splitter = ' ';

class Command {
    static list = []

    constructor(
        name,
        shortcut,
        description,
        hint
    ) {
        this.name = name;
        this.shortcut = shortcut;
        this.description = description;
        this.hint = hint;

        if (Command.list.filter(x => x.shortcut === this.shortcut).length) {
            throw new Error(`Can't define two commands with same shortcut ${this.letter}`);
        }
        Command.list.push(this);
    }

    validateArgLength(len, args, moreOk = false) {
        if ((!moreOk && args.length !== len) || (moreOk && args.length < len)) {
            // console.debug('validateArgLength', len, args);
            throw new Error(`InvalidArguments: ${this.name} : ${Array.prototype.join.call(args, splitter)}`);
        }
    }

    exec(data) {
        throw new Error(`Not Implemented: ${this.name}.exec(data)`);
    }

    prompt() {
        return this.name;
    }

    completions(data) {
        return [`Not Implemented: ${this.name}.completions(data)`]
    }
}

function promptError(prompt) {
    const error = new Error('command prompt');
    error.prompt = prompt;
    return error;
}

export const Add = new (class extends Command {
    constructor() {
        super('Add', 'a', 'Add an item', 'add hint');
    }

    exec(data, chunks) {
        // console.debug('Add.exec', data, name);
        const name = (chunks.length > 1 && chunks[0] === this.shortcut) ?
            chunks.slice(1).join(splitter) :
            chunks.join(splitter);
        // this.validateArgLength(2, chunks);
        if (name === undefined) {
            throw promptError('name to add');
        }
        data.addItem(new Item(name));
    }

    prompt(data, chunks) {
        return 'name to add';
    }

    completions(data, chunks) {
        return [];
    }

    segments(chunks) {
        return (chunks.length > 1 && chunks[0] === this.shortcut) ?
            [ this.shortcut ] :
            [];
    }
})();

const Relate = new (class extends Command {
    constructor() {
        super('Relate', 'r', 'Relate two items', 'hint for relate');
    }

    exec(data, chunks) {
        this.validateArgLength(3, chunks);
        data.addRelationship(chunks[1], chunks[2]);
    }

    prompt(data, chunks) {
        if (chunks.length > 2) {
            return 'b/to/target name';
        }

        return 'a/from/origin name';
    }

    completions(data, chunks) {
        return data.itemIds();
    }

    segments(chunks) {
        return chunks.slice(0, Math.max(1, chunks.length - 1));
    }
})();

const RemoveItem = new (class extends Command {
    constructor() {
        super('Remove Item', 'rm', 'Remove an item', 'hint for remove item');
    }

    exec(data, chunks) {
        this.validateArgLength(2, chunks);
        data.removeItem(chunks[1]);
    }

    prompt() {
        return 'name to remove';
    }

    completions(data) {
        return data.itemIds();
    }
})();

const RemoveRelationship = new (class extends Command {
    constructor() {
        super('Remove Relationship', 'rmr', 'Remove Relationship', 'hint for remove relatioship');
    }

    exec(data, chunks) {
        this.validateArgLength(2, chunks);
        data.removeRelationship(id);
    }
})();

const Tag = new (class extends Command {
    constructor() {
        super('Tag', 't', 'Tag an item', 'hint for tag item');
    }

    exec(data, chunks) {
        this.validateArgLength(3, chunks);
        data.tagItem(chunks[1], chunks[2]);
    }
})();

const TagRelationship = new (class extends Command {
    constructor() {
        super('Tag Relationship', 'tr', 'Tag a relationship', 'hint for tag relationship');
    }

    exec(data, chunks) {
        this.validateArgLength(4, chunks);
        data.tagRelationship(chunks[1], chunks[2], chunks[3]);
    }
})();

export const list = Command.list;

export const getCommand = (txt) => {
    // console.debug('getCommand', txt);
    if (!(typeof(txt) === 'string')) {
        console.error('not string');
        return;
    }

    let matchingCommands = list.filter(x => x.shortcut === txt);

    let cmd = matchingCommands.shift();
    if (cmd === undefined) {
        cmd = Add;
    }
    console.debug('getCommand', txt, cmd.name);
    return cmd;
}

export const getPossibleCommands = (txt) => {
    if (!(typeof(txt) === 'string')) {
        console.error('not string');
        return;
    }
    console.debug('getPossibleCommands', txt);
    let prefix = '';
    if (txt !== undefined) {
        prefix = txt;
    }
    return list.filter(
        x => (x === '') || x.shortcut.startsWith(prefix)
    );
}