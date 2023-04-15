import { makeItem } from 'data';

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

    exec(data) {
        throw new Error(`Not Implemented: ${this.name}.exec(data)`);
    }

}

const Add = new (class extends Command {
    constructor() {
        super('Add', 'a', 'Add an item', 'add hint');
    }

    exec(data, name) {
        // console.debug('Add.exec', data, name);
        if (arguments.length !== 2) {
            console.error('InvalidArguments: a', arguments);
            return;
        }
        data.addItem(makeItem(name));
    }
})();

const Relate = new (class extends Command {
    constructor() {
        super('Relate', 'r', 'Relate two items', 'hint for relate');
    }

    exec(data, idA, idB) {
        if (arguments.length !== 3) {
            console.error('InvalidArguments: r', arguments);
            return;
        }
        data.addRelationship(idA, idB);
    }
})();

const RemoveItem = new (class extends Command {
    constructor() {
        super('Remove Item', 'rm', 'Remove an item', 'hint for remove item');
    }
})();

const RemoveRelationship = new (class extends Command {
    constructor() {
        super('Remove Relationship', 'rmr', 'Remove Relationship', 'hint for remove relatioship');
    }
})();

const Tag = new (class extends Command {
    constructor() {
        super('Tag', 't', 'Tag an item', 'hint for tag item');
    }
})();

const TagRelationship = new (class extends Command {
    constructor() {
        super('Tag Relationship', 'tr', 'Tag a relationship', 'hint for tag relationship');
    }
})();

export const getCommand = (txt) => {
    // console.debug('in getCommand', txt);
    if (!(typeof(txt) === 'string')) {
        console.error('not string');
        return;
    }
    const splitter = ' ';
    const chunks = txt.split(splitter);
    const chunk0 = chunks.shift();
    if (chunk0 === undefined) {
        return;
    }

    let matchingCommands = Command.list.filter(x => x.shortcut === chunk0);

    let cmd = matchingCommands.shift();
    if (cmd === undefined) {
        cmd = Add;
        chunks.unshift(chunk0);
    }
    return {
        "command": cmd,
        "remainingText": chunks.join(splitter),
        "args": chunks,
        "exec": (data) => cmd.exec.apply(cmd, [data, ...chunks])
    };
}