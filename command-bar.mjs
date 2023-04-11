import { html, Component } from 'preact';
import { makeItem } from 'data';
import { injectTestCommands } from 'test';

export class CommandBar extends Component {
    state = {
        input: ""
    }
    
    // constructor(props) {
    //     super(props);
    // }

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

    onCommandInput = (ev) => {
        // console.log('onCommandInput', ev.target.value, this);
        this.setState({
            input: ev.target.value
        });
    }

    onKeyUp = ev => {
        // this.textInput = ev.target;
        if (ev.key === 'Enter') {
            this.processCommand();
        }
        ev.preventDefault();
    }

    processCommand(cmdText = this.state.input) {
        // console.debug('processCommand', cmdText);
        let parts = cmdText.split(' ');
        let cmd = parts[0];
        let args = parts.slice(1);
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
    }

    unknownCommand(cmd, args) {
        console.error('InvalidCommand: ', cmd, args);
    }

    declareItem(args) {
        if (args.length !== 1) {
            console.error('InvalidArguments: d', args);
            return;
        }
        this.props.data.addItem(makeItem(args[0]));
    }

    relateItems(args) {
        if (args.length !== 2) {
            console.error('InvalidArguments: r', args);
            return;
        }
        this.props.data.addRelationship(args[0], args[1]);
    }

    render(_, { input }) {
        return html`
            <div>
                <input type="text" onInput=${this.onCommandInput} onKeyUp=${this.onKeyUp} value=${input} autofocus/>
                <button onClick=${this.processCommand}>Enter</button>
            </div>
        `
    }
}
