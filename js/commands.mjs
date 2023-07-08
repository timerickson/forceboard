import { Item } from 'data';

const splitter = ' ';

class Parameter {
    constructor(name, description, required, defaultValue) {
        this.name = name;
        this.description = description;
        this.required = required;
        this.defaultValue = defaultValue;
    }
}

class Command {
    static list = []

    constructor(
        name,
        shortcut,
        description,
        hint,
        parameters = []
    ) {
        this.name = name;
        this.shortcut = shortcut;
        this.description = description;
        this.hint = hint;
        this.parameters = parameters;

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
        return this.hint;
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
        super('Add', 'a', 'Add an item', 'add hint', [
            new Parameter('name', 'name of item (must be unique)', true)
        ]);
    }

    exec(data, args) {
        // console.debug('Add.exec', data, name);
        const name = (args.length > 1 && args[0] === this.shortcut) ?
            args.slice(1).join(splitter) :
            args.join(splitter);
        // this.validateArgLength(2, args);
        if (name === undefined) {
            throw promptError('name to add');
        }
        data.addItem(new Item(name));
    }

    prompt(data, args) {
        return 'name to add';
    }

    completions(data, args) {
        return [];
    }
})();

const Relate = new (class extends Command {
    constructor() {
        super('Relate', 'r', 'Relate two items', 'hint for relate', [
            new Parameter('a', 'name of source/origin related item', true),
            new Parameter('b', 'name of target/destination related item', true)
        ]);
    }

    exec(data, args) {
        this.validateArgLength(3, args);
        data.addRelationship(args[1], args[2]);
    }

    prompt(data, args) {
        if (args.length > 2) {
            return 'b/to/target name';
        }

        return 'a/from/origin name';
    }

    completions(data, args) {
        return data.itemIds();
    }
})();

const RemoveItem = new (class extends Command {
    constructor() {
        super('Remove Item', 'rm', 'Remove an item', 'hint for remove item', [
            new Parameter('name', 'name of item to remove', true)
        ]);
    }

    exec(data, args) {
        this.validateArgLength(2, args);
        data.removeItem(args[1]);
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
        super('Remove Relationship', 'rmr', 'Remove Relationship', 'hint for remove relatioship', [
            new Parameter('name', 'name or id of relationship to remove', true)
        ]);
    }

    exec(data, args) {
        this.validateArgLength(2, args);
        data.removeRelationship(id);
    }
})();

const Tag = new (class extends Command {
    constructor() {
        super('Tag', 't', 'Tag an item', 'hint for tag item', [
            new Parameter('name', 'name of item to tag', true),
            new Parameter('tag', 'name of tag to apply to item', true)
        ]);
    }

    exec(data, args) {
        this.validateArgLength(3, args);
        data.tagItem(args[1], args[2]);
    }
})();

const TagRelationship = new (class extends Command {
    constructor() {
        super('Tag Relationship', 'tr', 'Tag a relationship', 'hint for tag relationship', [
            new Parameter('name', 'name or id of relationship to tag', true),
            new Parameter('tag', 'name of tag to apply to relationship')
        ]);
    }

    exec(data, args) {
        this.validateArgLength(4, args);
        data.tagRelationship(args[1], args[2], args[3]);
    }
})();

export const list = Command.list;

export const DefaultCommand = Add;

export const getCommand = (txt) => {
    // console.debug('getCommand', txt);
    if (!(typeof(txt) === 'string')) {
        console.error('not string');
        return;
    }

    let matchingCommands = list.filter(x => x.shortcut === txt);

    let cmd = matchingCommands.shift();
    if (cmd === undefined) {
        cmd = DefaultCommand;
    }
    // console.debug('getCommand', txt, cmd.name);
    return cmd;
}

export const getPossibleCommands = (args) => {
    const txt = args[0];
    if (args.length > 1) {
        return [ getCommand(txt) ];
    }
    // console.debug('getPossibleCommands', txt);
    let prefix = '';
    if (txt !== undefined) {
        prefix = txt;
    }
    const matches = list.filter(
        x => (x === '') || x.shortcut.startsWith(prefix)
    );
    return matches.length ? matches : [ DefaultCommand ];
}