import { html, Component, render } from './standalone.module.js';
import { Graph } from './graph.mjs'
import { Data, makeItem } from './data.mjs';
import { injectTestCommands } from './test.mjs'

class App extends Component {
    constructor(props) {
        super();
        console.log('App', props)
        this.state = {
            graphSize: {
                height: props['width'] || 400,
                width: props['height'] || 400
            },
            data: new Data(),
        };
    }
    componentDidMount() {
        try {
            injectTestCommands((cmd) => this.processCommand(cmd));
        } catch (error) {
            if (error.message.includes("injectTestCommands is not defined")) {
                console.info("Not injecting test commands");
            } else {
                throw error;
            }
        }
    }
    processCommand(cmdText = this.state.input) {
        console.log('processCommand', cmdText);
        var parts = cmdText.split(' ');
        var cmd = parts[0];
        var args = parts.slice(1);
        switch (cmd) {
            case 'd':
                this.declareItem(args);
                break;
            case 'r':
                this.relateItems(args);
                break;
            default:
                this.unknownCommand(cmd, args);
        }
        this.setState({
            input: "",
        }, () => this.focusInput());
    }
    unknownCommand(cmd, args) {
        console.error('InvalidCommand: ', cmd, args);
    }
    declareItem(args) {
        if (args.length !== 1) {
            console.error('InvalidArguments: d', args);
            return;
        }
        const newItem = makeItem(args[0]);
        this.state.data.addItem(newItem);
    }
    relateItems(args) {
        if (args.length !== 2) {
            console.error('InvalidArguments: r', args);
            return;
        }
        this.state.data.addRelationship(args[0], args[1]);
    }
    focusInput = () => {
        if (this.textInput) {
            this.textInput.focus();
        } else {
            console.warn("unable to focusInput");
        }
    }
    textInput = null
    onCommandInput = (ev) => {
        // console.log('onCommandInput', ev.target.value, this);
        this.textInput = ev.target;
        this.setState({
            input: ev.target.value
        });
    }
    onKeyUp = ev => {
        this.textInput = ev.target;
        if (ev.key === 'Enter') {
            this.processCommand();
        }
        ev.preventDefault();
    }
    render({ page }, { data, input, graphSize }) {
        // console.log('App.render', arguments);
        var graphData = Object.assign({}, data);
        return html`
        <div class="app">
            <h1>Diagram</h1>
            <${Graph} data=${graphData} size=${graphSize}><//>
            <input type="text" onInput=${this.onCommandInput} onKeyUp=${this.onKeyUp} value=${input} autofocus/>
            <button onClick=${this.processCommand}>Enter</button>
            <ul>
            ${data.items.map(item => html`
                <li key=${item.id}>${item.id}</li>
            `)}
            </ul>
        </div>
        `;
    }
}

render(html`<${App} width=640 height=400 />`, document.body);