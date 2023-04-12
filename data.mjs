export const makeItem = function(val) {
    return { "id": val.toString(), "item": val };
}

function itemId(item) {
    if (!item['id']) {
        throw new Error(`item must have an id (prop or fn): ${item}`);
    }
    const ref = item['id'];
    return (typeof(ref) === 'function') ? ref.apply(item) : ref.toString();
}

function relationshipId(a, b) {
    if (!(a)) {
        throw new Error('a is required');
    } else if (!(b)) {
        throw new Error('b is required');
    }
    return `${itemId(a)}-${itemId(b)}`;
}

export class Data {
    constructor(changeCallback) {
        const changed = changeCallback || (() => console.log('Data changed'));
        this.onChanged = changed;
    }

    items = []
    itemMap = {}
    itemRelationships = {}
    relationships = []
    relationshipMap = {}
    // stateId = 0

    getItem(id) {
        if (!id) {
            throw new Error('id is required');
        }
        if (!(id in this.itemMap)) {
            throw new Error(`item ${id} not found`);
        }
        return this.itemMap[id];
    }

    getRelationship(id) {
        if (!id) {
            throw new Error('id is required');
        }
        if (!(id in this.relationshipMap)) {
            throw new Error(`relationship ${id} not found`);
        }
        return this.relationshipMap[id];
    }

    addItem(item) {
        const id = itemId(item);
        if (id in this.itemMap) {
            throw new Error(`item ${id} already exists`);
        }

        this.items.push(item);
        this.itemMap[id] = item;
        this.itemRelationships[id] = [];
        // this.stateId++;
        this.onChanged();
    }

    addRelationship(idA, idB) {
        if (idA === idB) {
            throw new Error(`ids must be different (${idA}, ${idB})`);
        }
        const a = this.itemMap[idA];
        if (!a) {
            throw new Error(`item with idA ${idA} not found`);
        }
        const b = this.itemMap[idB];
        if (!b) {
            throw new Error(`item with idB ${idB} not found`);
        }
        const id = relationshipId(a, b);;
        if (id in this.relationshipMap) {
            throw new Error(`relationship ${id} already exists`);
        }
        const relationship = { "a": a, "b": b, "id": `${id}` };
        this.itemRelationships[idA].push(relationship);
        this.itemRelationships[idB].push(relationship);
        this.relationships.push(relationship);
        this.relationshipMap[id] = relationship;
        // this.stateId++;
        this.onChanged();
    }

    removeItem(id) {
        if (!id) {
            throw new Error('id is required');
        }
        if (!(id in this.itemMap)) {
            throw new Error(`item ${id} not found`);
        }
        const idx = this.items.findIndex(i => i.id === id);
        if (idx === -1) {
            throw new Error(`item ${id} not found in items`);
        }
        if (!(id in this.itemRelationships)) {
            throw new Error(`relationships not found for item ${id}`);
        }

        this.itemRelationships[id].slice().forEach(relationship => {
            this.removeRelationship(relationship.id);
        });
        this.items.splice(idx, 1);
        delete this.itemMap[id];
        // this.stateId++;
        this.onChanged();
    }

    removeItemRelationship(itemId, relationshipId) {
        // console.debug('removeItemRelationship', itemId, relationshipId);
        if (!(itemId in this.itemRelationships)) {
            console.error('relMap', this.itemRelationships);
            throw new Error(`removeItemRelationship : id ${itemId} not found in relationshipMap`);
        }
        const relationships = this.itemRelationships[itemId];
        const idx = relationships.findIndex(r => r.id === relationshipId);
        if (idx === -1) {
            throw new Error(`removeItemRelationship : relationship ${relationshipId} not found in item ${itemId} relationships`);
        }

        relationships.splice(idx, 1);
        // this.stateId++;
    }

    removeRelationship(id) {
        if (!(id in this.relationshipMap)) {
            throw new Error(`removeRelationship : id ${id} not found`);
        }
        const idx = this.relationships.findIndex(r => r.id === id);
        if (idx === -1) {
            throw new Error(`removeRelationship : relationship ${id} not found`);
        }
        const relationship = this.relationshipMap[id];

        this.removeItemRelationship(relationship.a.id, relationship.id);
        this.removeItemRelationship(relationship.b.id, relationship.id);
        this.relationships.splice(idx, 1);
        delete this.relationshipMap[id];
        // this.stateId++;
        this.onChanged();
    }
}