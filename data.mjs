import { scaleOrdinal, schemeTableau10 } from "d3";

export const Types = {
    WINDOW: 'window',
    ITEM: 'item',
    RELATIONSHIP: 'relationship'
};

export class Item {
    constructor(val) {
        this.id = (typeof(val) === 'string') ?
            val :
            itemId(val);
        this.value = val;
    }

    static defaults = {
        size: 10,
        color: scaleOrdinal(schemeTableau10)
    }

    clone() {
        const clone = new Item(this.value);
        clone.x = this.x;
        clone.y = this.y;
        clone.vx = this.vx;
        clone.vy = this.vy;
        clone.fx = this.fx;
        clone.fy = this.fy;
        clone.tags = this.tags;
        clone._anchored = this._anchored;
        clone.size(this.size());
        clone.color(this.color());
        return clone;
    }

    id = undefined

    value = undefined
    
    tags = []

    _size = undefined
    size(s) {
        if (s !== undefined) {
            this._size = s;
            return;
        }
        if (this._size === undefined) {
            return Item.defaults.size;
        }
        return (typeof(this._size) === 'function') ? this._size.apply(this) : this._size;
    }

    _color = undefined
    color(c) {
        if (c !== undefined) {
            this._color = c;
            return;
        }
        if (this._color === undefined) {
            return Item.defaults.color(this.id);
        }
        return (typeof(this._color) === 'function') ? this._color.apply(this) : this._color;
    };

    _anchored = false
    anchored(a) {
        if (a !== undefined) {
            this._anchored = !!a;
            if (this._anchored) {
                this.fx = this.x;
                this.fy = this.y;
            } else {
                delete this.fx;
                delete this.fy;
            }
            return;
        }
        // console.debug('get anchored', (this._anchored), this);
        return this._anchored;
    };
}

function relationshipId(a, b) {
    if (!(a)) {
        throw new Error('a is required');
    } else if (!(b)) {
        throw new Error('b is required');
    }
    return `${itemId(a)}-${itemId(b)}`;
}

class Relationship {
    constructor(itemA, itemB) {
        this.a = itemA;
        this.source = itemA;
        this.b = itemB;
        this.target = itemB;

        this.id = relationshipId(itemA, itemB);
    }

    clone() {
        // console.debug('Relationship.clone', this);
        const clone = Object.assign({}, this);
        clone.a = clone.a.id;
        clone.b = clone.b.id;
        clone.source = clone.source.id;
        clone.target = clone.target.id;
        return clone;
    }

    a = undefined
    source = undefined

    b = undefined
    target = undefined
}

function itemId(item) {
    if (!item['id']) {
        throw new Error(`item must have an id (prop or fn): ${item}`);
    }
    const id = item['id'];
    return (typeof(id) === 'function') ? id.apply(item) : id.toString();
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

    json(j) {
        if (j !== undefined) {
            return this.init(j);
        }
        return JSON.stringify({
            "items": this.items.map(i => i.clone()),
            "relationships": this.relationships.map(r => r.clone())
        });
    }

    init(json) {
        // console.debug('data.init', json);
        let d = JSON.parse(json);
        d.items.forEach(i => {
            const item = new Item('Item.fromObject');
            Object.assign(item, i);
            this.addItem(item);
        });

        d.relationships.forEach(r => {
            // console.debug('revive relationsihp', r);
            const relationship = this.addRelationship(r.a, r.b);
            const {a, b, source, target} = relationship;
            Object.assign(relationship, r);
            relationship.a = a;
            relationship.source = source;
            relationship.b = b;
            relationship.target = target;
        });
        // console.debug('Data.init done');
    }

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

    tagItem(id, tag) {
        // console.debug('tagItem', id, tag);
        const item = this.getItem(id);
        item.tags.push(tag);
    }

    addItem(item) {
        // console.debug('addItem', item);
        const id = itemId(item);
        if (id in this.itemMap) {
            throw new Error(`item ${id} already exists`);
        }

        this.items.push(item);
        this.itemMap[id] = item;
        this.itemRelationships[id] = [];
        this.onChanged();
    }

    addRelationship(idA, idB) {
        // console.debug('addRelationship', idA, idB);
        if (idA === idB) {
            throw new Error(`ids must be different (${idA}, ${idB})`);
        }
        const a = this.itemMap[idA];
        if (!a) {
            throw new Error(`addRelationship: item ${idA} not found`);
        }
        const b = this.itemMap[idB];
        if (!b) {
            throw new Error(`addRelationship: item ${idB} not found`);
        }
        const relationship = new Relationship(a, b);

        this.itemRelationships[idA].push(relationship);
        this.itemRelationships[idB].push(relationship);
        this.relationships.push(relationship);
        this.relationshipMap[relationship.id] = relationship;
        this.onChanged();
        return relationship;
    }

    removeItem(id) {
        // console.debug('removeRelationship', id);
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
        this.onChanged();
    }
}