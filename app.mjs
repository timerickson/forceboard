import { html, Component, render } from './standalone.module.js';
import { Graph } from './graph.mjs'

var initalItems= [
    'foo',
    'bar',
    'baz'
];

var initialRelationships = [
    ['foo', 'bar']
]

class App extends Component {
    constructor(props) {
        super();
        console.log('App', props)
        this.state = {
            items: initalItems.map(makeItem) || [],
            relationships: initialRelationships.map(makeRelationship) || [],
            graphSize: {
                height: props['width'] || 400,
                width: props['height'] || 400
            },
            dataStateId: 0,
        }
    }
    focusInput = () => {
        this.textInput.focus();
    }
    addItem(newItem) {
        // console.log('addItem', newItem, this.state.input);
        newItem ||= makeItem(this.state.input);
        this.setState({
            input: "",
            dataStateId: this.state.dataStateId + 1,
            items: this.state.items.concat(newItem)
        });
        this.focusInput();
    }
    onClickAdd = () => {
        this.addItem();
    }
    textInput = null
    onInput = (ev) => {
        // console.log('onInput', ev.target.value, this);
        this.textInput = ev.target;
        this.setState({
            input: ev.target.value
        });
    }
    onKeyUp = ev => {
        this.textInput = ev.target;
        if (ev.key === 'Enter') {
            this.addItem();
        }
        ev.preventDefault();
    }
    render({ page }, { items, relationships, dataStateId, input, graphSize }) {
        const data = {
            items: items,
            relationships: relationships,
            dataStateId: dataStateId
        };
        return html`
        <div class="app">
            <${Header} name="ToDo's (${page})" />
            <ul>
            ${items.map(item => html`
                <li key=${item.id}>${item.id}</li>
            `)}
            </ul>
            <${Graph} data=${data} size=${graphSize}><//>
            <input type="text" onInput=${this.onInput} onKeyUp=${this.onKeyUp} value=${input} autofocus/>
            <button onClick=${this.addItem}>Add Todo</button>
            <${Footer}>footer content here<//>
        </div>
        `;
    }
}

const Header = ({ name }) => html`<h1>${name} List</h1>`

const Footer = props => html`<footer ...${props} />`

function makeItem(name) {
    // console.log('makeItem', name);
    return {
        "id": name
    };
}

function makeRelationship(rel) {
    return {
        "a": rel[0],
        "b": rel[1]
    }
}

render(html`<${App} width=640 height=400 page="All" />`, document.body, { items: initalItems });