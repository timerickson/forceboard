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
            console.debug('validateArgLength', len, args);
            throw new Error(`InvalidArguments: ${this.name} : ${Array.prototype.join.call(args, splitter)}`);
        }
    }

    exec(data) {
        throw new Error(`Not Implemented: ${this.name}.exec(data)`);
    }

}

const Add = new (class extends Command {
    constructor() {
        super('Add', 'a', 'Add an item', 'add hint');
    }

    exec(cmdInfo, data, name) {
        // console.debug('Add.exec', cmdInfo, data, name);
        this.validateArgLength(3, arguments, true);
        data.addItem(new Item(cmdInfo.remainingText));
    }
})();

const Relate = new (class extends Command {
    constructor() {
        super('Relate', 'r', 'Relate two items', 'hint for relate');
    }

    exec(cmdInfo, data, idA, idB) {
        this.validateArgLength(4, arguments);
        data.addRelationship(idA, idB);
    }
})();

const RemoveItem = new (class extends Command {
    constructor() {
        super('Remove Item', 'rm', 'Remove an item', 'hint for remove item');
    }

    exec(cmdInfo, data, id) {
        this.validateArgLength(3, arguments);
        data.removeItem(cmdInfo.remainingText);
    }
})();

const RemoveRelationship = new (class extends Command {
    constructor() {
        super('Remove Relationship', 'rmr', 'Remove Relationship', 'hint for remove relatioship');
    }

    exec(cmdInfo, data, id) {
        this.validateArgLength(3, arguments);
        data.removeRelationship(cmdInfo.remainingText);
    }
})();

const Tag = new (class extends Command {
    constructor() {
        super('Tag', 't', 'Tag an item', 'hint for tag item');
    }

    exec(cmdInfo, data, id, tag) {
        this.validateArgLength(4, arguments);
        data.tagItem(id, tag);
    }
})();

const TagRelationship = new (class extends Command {
    constructor() {
        super('Tag Relationship', 'tr', 'Tag a relationship', 'hint for tag relationship');
    }

    exec(cmdInfo, data, id, tag, val) {
        this.validateArgLength(5, arguments);
        data.tagRelationship(id, tag, val);
    }
})();

export const getCommand = (txt) => {
    // console.debug('in getCommand', txt);
    if (!(typeof(txt) === 'string')) {
        console.error('not string');
        return;
    }
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
    const info = {
        "command": cmd,
        "remainingText": chunks.join(splitter),
        "args": chunks,
        "exec": (data) => cmd.exec.apply(cmd, [info, data, ...chunks])
    };
    return info;
}