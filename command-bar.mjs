import { html, Component } from 'preact';
import { getCommand } from 'commands';
import { injectTestCommands } from 'test';

const FEEDBACK_VISIBLE_CLASS = 'command-bar__feedback_visible';
const FEEDBACK_VISIBLE_TIME_SECS = 6;

export class CommandBar extends Component {
    state = {
        input: "",
    }

    componentDidMount() {
        // console.log('CommandBar.componentDidMount');
        try {
            injectTestCommands((cmd) => this.processCommand(cmd));
        } catch (error) {
            if (error.message.includes("injectTestCommands is not defined")) {
                console.info("Not injecting test commands");
            } else {
                throw error;
            }
        }
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.borderBoxSize?.length > 0) {
                    this.updateFeedbackDivPosition();
                    // this.updateSvgLayoutAttributes({
                    //   width: entry.borderBoxSize[0].inlineSize,
                    //   height: entry.borderBoxSize[0].blockSize
                    // });
                  } else {
                    console.warn('ResizeObserver fallback');
                    this.updateSvgLayoutAttributes({
                      width: entry.contentRect.width,
                      height: entry.contentRect.height
                    });
                  }
            }
        });
        resizeObserver.observe(this.base);
        this.resizeObserver = resizeObserver;
        this.updateFeedbackDivPosition();
    }

    componentWilUnmount() {
        console.warn('CommandBar.componentWillUnmount');
        this.resizeObserver.disconnect();
    }

    updateFeedbackDivPosition() {
        // console.debug('CommandBar.updateFeedbackDivPosition');
        const inputRect = this.inputDiv.getBoundingClientRect();
        const feedbackRect = this.feedbackDiv.getBoundingClientRect();
        this.feedbackDiv.style.left = inputRect.left + 'px';
        this.feedbackDiv.style.top = (inputRect.top - feedbackRect.height) + 'px';
    }

    showFeedbackDiv(msg) {
        this.feedbackDiv.textContent = msg;
        this.feedbackDiv.classList.add(FEEDBACK_VISIBLE_CLASS);
        setTimeout(() => {
            this.hideFeedbackDiv();
        }, FEEDBACK_VISIBLE_TIME_SECS * 1000);
    }

    hideFeedbackDiv() {
        this.feedbackDiv.classList.remove(FEEDBACK_VISIBLE_CLASS);
    }

    onCommandInput = (ev) => {
        // console.log('onCommandInput', ev.target.value, this);
        this.setState({
            input: ev.target.value
        });
    }

    onKeyUp = ev => {
        if (ev.key === 'Enter') {
            this.processCommand();
        }
        ev.preventDefault();
    }

    processCommand(cmdText = this.state.input) {
        // console.debug('processCommand', cmdText);
        let cmd = getCommand(cmdText);
        if (!cmd) {
            throw new Error(`No command resolved for ${cmdText}`);
        }
        try {
            cmd.exec(this.props.data);
        } catch (ex) {
            console.error('processCommand error', ex);
            this.showFeedbackDiv(ex.message);
        }
        this.setState({
            input: ''
        });
    }

    fileName = 'test.json'

    async save() {
        // https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API#examples

        const json = this.props.data.json();

        // Get handle to draft file in OPFS
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(this.fileName, { create: true });
        // Get sync access handle
        console.debug('save handle', handle);

        const writable = await handle.createWritable();
        writable.truncate(0);

        // Write the contents of the file to the stream.
        await writable.write(json);

        // Close the file and write the contents to disk.
        await writable.close();
    }

    async load() {
        // Get handle to draft file in OPFS
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(this.fileName, { create: false });
        console.debug('load handle', handle);
        let jsonBlob = await handle.getFile();
        let json = await jsonBlob.text();
        this.props.data.json(json);
    }

    render(_, { input }) {
        return html`
            <div class=command-bar>
                <div class="command-bar__feedback" ref=${e => this.feedbackDiv = e}>
                    type 'foo' + [enter] to add an item
                </div>
                <div class=command-bar__elements ref=${e => this.inputDiv = e}>
                    <div class=command-bar__controls>
                        <input type="text" onInput=${this.onCommandInput} onKeyUp=${this.onKeyUp} value=${input} autofocus />
                        <button onClick=${this.processCommand}>Enter</button>
                        <div><input type=button value=save onclick=${() => this.save()} /></div>
                        <div><input type=button value=load onclick=${() => this.load()} /></div>
                    </div>
                </div>
            </div>
        `
    }
}
