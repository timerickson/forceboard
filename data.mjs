export var makeItem = function(val) {
    return { "id": val.toString(), "item": val };
}

function itemId(item) {
    if (!item['id']) {
        throw new Error(`item must have an id (prop or fn): ${item}`);
    }
    var ref = item['id'];
    return (typeof(ref) === 'function') ? ref.apply(item) : ref.toString();
}

export class Data {
    items = []
    itemMap = {}
    itemRelationships = {}
    relationships = []
    stateId = 0
    addItem(item) {
        const id = itemId(item);

        this.items.push(item);
        this.itemMap[id] = item;
        this.itemRelationships[id] = [];
        this.stateId++;
    }
    addRelationship(idA, idB) {
        const a = this.itemMap[idA]
        if (idA === idB) {
            throw new Error(`ids must be different (${idA}, ${idB})`);
        }
        if (!a) {
            throw new Error(`item with idA ${idA} not found`);
        }
        if (!b) {
            throw new Error(`item with idB ${idB} not found`);
        }
        const relationship = { "a": a, "b": b };
        this.itemRelationships[idA].push(relationship);
        this.itemRelationships[idB].push(relationship);
        this.relationships.push(relationship);
        this.stateId++;
    }
}