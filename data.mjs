export const makeItem = function(val) {
    return { "id": val.toString(), "item": val };
}

function itemId(item) {
    if (!item['id']) {
        throw new Error(`item must have an id (prop or fn): ${item}`);
    }
    let ref = item['id'];
    return (typeof(ref) === 'function') ? ref.apply(item) : ref.toString();
}

export class Data {
    items = []
    itemMap = {}
    itemRelationships = {}
    relationships = []
    relationshipMap = {}
    stateId = 0

    addItem(item) {
        const id = itemId(item);

        this.items.push(item);
        this.itemMap[id] = item;
        this.itemRelationships[id] = [];
        this.stateId++;
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
        const id = `${idA}-${idB}`;
        const relationship = { "a": a, "b": b, "id": `${id}` };
        this.itemRelationships[idA].push(relationship);
        this.itemRelationships[idB].push(relationship);
        this.relationships.push(relationship);
        this.relationshipMap[id] = relationship;
        this.stateId++;
    }

    removeItemRelationship(itemId, relationshipId) {
        if (!(itemId in this.itemRelationships)) {
            console.error('relMap', this.itemRelationships);
            throw new Error(`removeItemRelationship : id ${itemId} not found in relationshipMap`);
        }
        const relationships = this.itemRelationships[itemId];
        console.debug(`item ${itemId} relationships`, relationships);
        const idx = relationships.findIndex(r => r.id === relationshipId);
        if (idx === -1) {
            throw new Error(`removeItemRelationship : relationship ${relationshipId} not found in item ${itemId} relationships`);
        }
        relationships.splice(idx, 1);
    }

    removeRelationship(id) {
        if (!(id in this.relationshipMap)) {
            throw new Error(`removeRelationship : id ${id} not found`);
        }
        const relationship = this.relationshipMap[id];
        this.removeItemRelationship(relationship.a.id, relationship.id);
        this.removeItemRelationship(relationship.b.id, relationship.id);
        const idx = this.relationships.findIndex(r => r.id === id);
        if (idx === -1) {
            throw new Error(`removeRelationship : relationship ${id} not found`);
        }
        this.relationships.splice(idx, 1);
        this.stateId++;
    }
}