import { html, Component } from 'preact';
import { getCommand, getPossibleCommands } from 'commands';
import { parseChunks } from 'commandParser';
import { initialCommands } from 'test';

const FEEDBACK_VISIBLE_CLASS = 'command-bar__feedback_visible';
const FEEDBACK_VISIBLE_TIME_SECS = 6;
const DEFAULT_PROMPT = 'foo to add';

add 'fullValue' or similar state field to track full value
convert all value refs as appropriate
remove fullText function?
remove chunk.raw?

export class Commander extends Component {
    state = {
        value: '',
        segments: [],
        completions: [],
        prompt: DEFAULT_PROMPT
    }

    componentDidMount() {
        try {
            const cmds = initialCommands.slice();
            const sendCommand = () => {
                if (!cmds.length) {
                    return false;
                }
                const cmd = cmds.shift();
                this.executeCommand(cmd);
                sendCommand();
            };
            sendCommand();
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
                  } else {
                    console.warn('ResizeObserver fallback');
                    this.updateFeedbackDivPosition();
                  }
            }
        });
        resizeObserver.observe(this.base);
        this.resizeObserver = resizeObserver;
        this.updateFeedbackDivPosition();
    }

    componentWilUnmount() {
        console.warn('Commander.componentWillUnmount');
        this.resizeObserver.disconnect();
    }

    updateFeedbackDivPosition() {
        // console.debug('Commander.updateFeedbackDivPosition');
        const inputRect = this.base.getBoundingClientRect();
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

    onKeyUp(e) {
        // console.debug('Commander.onKeyUp', e);
        if (e.key === 'Enter') {
            this.parseCommand(e.target.value, true);
            e.preventDefault();
        }
    }

    getArgs(chunks) {
        const args = [];
        chunks.forEach((c, i) => {
            if (c.text === '') {
                return;
            }
            args.push({
                raw: c.raw,
                text: c.text,
                chunkIndex: i,
                isTerminal: i === (chunks.length - 1)
            })
        });
        return args;
    }

    parseCommand(withValue, andExecute = false) {
        const cmdText = this.fullText(withValue);
        // const cmdText = withValue;
        const chunks = parseChunks(cmdText);
        const args = this.getArgs(chunks);
        console.debug('Commander.parseCommand', `-->${withValue}<--`, cmdText, chunks);
        if (!args.length) {
            console.warn('Commander.parseCommand no text');
            return;
        }
        const data = this.props.data;
        let state = {
            value: withValue,
            completions: [],
            segments: this.state.segments.slice(),
            prompt: DEFAULT_PROMPT
        };
        // const possibleCommands = getPossibleCommands(chunks.map(c => c.raw).join(''));
        // const possibleCommands = getPossibleCommands(state.segments.length ? state.segments[0].raw : cmdText);
        const possibleCommands = getPossibleCommands(args[0].raw);
        console.debug('checking', args, possibleCommands);
        if (!args[0].isTerminal && possibleCommands.length === 1) { // we have typed the first ' ' (space), so we can resolve the command
            const cmd = possibleCommands[0];
            const wasDefaulted = (args[0].raw !== cmd.shortcut);
            const maxSegments = 1 + cmd.parameters.length;
            // const maxSegments = cmd.parameters.length + (wasDefaulted ? 0 : 1);
            // const maxSegments = cmd.parameters.length + (wasDefaulted ? 0 : 1) - 1;
            // const maxSegments = cmd.parameters.length + (wasDefaulted ? -1 : 0);
            console.debug('Commander.parseCommand', 'resolved', wasDefaulted, maxSegments, andExecute, cmd, args);

            if (andExecute && (args.length > maxSegments && !args[args.length - 1].isTerminal)) {
                return this.executeCommand(withValue);
            }

            console.debug('updating', maxSegments, args);
            // state.value = chunks.slice(maxSegments).map(c => c.raw).join('');
            if (wasDefaulted) {
                console.debug('set value defaulted');
                state.value = chunks.slice(0).map(s => s.raw).join('');
                state.segments = args.slice(0, cmd.parameters.length - 1);
            } else {
                console.debug('set value else');
                state.value = args.slice(1).map(s => s.raw).join('');
                state.segments = args.slice(0, wasDefaulted ? args.length : 1);
            }
            // state.value = args.slice(maxSegments).map(s => s.raw).join('');

            const textArgs = args.slice(wasDefaulted ? 0 : 1).map(a => a.text);
            state.completions = cmd.completions(data, textArgs);
            state.prompt = cmd.prompt(data, textArgs);
        } else {
            // console.debug('Commander.parseCommand', 'possible', possibleCommands);
            state.completions = possibleCommands.map(c => ({ value: `${c.shortcut} `, text: `${c.shortcut} | ${c.name}` }));
            state.value = cmdText;
        }
        const lastArg = args[args.length - 1];
        // state.value = chunks.slice(lastArg.chunkIndex + (lastArg.isTerminal ? 0 : 1)).map(s => s.text).join('');
        console.debug('parsed command', state);
        this.setState(state);
    }

    executeCommand(value = this.state.value) {
        // console.debug('processCommand', cmdText);
        const cmdText = this.fullText(value);
        const chunks = parseChunks(cmdText);
        const args = this.getArgs(chunks);
        try {
            const cmd = getCommand(args[0].raw);
            // console.debug('executeCommand', cmd, chunks);
            cmd.exec(this.props.data, args.map(a => a.text));
        } catch (ex) {
            if ('prompt' in ex) {
                return this.setState({ prompt: ex.prompt });
            } else {
                console.error('executeCommand error', ex);
                this.showFeedbackDiv(ex.message);
            }
        }
        this.setState({
            value: '',
            segments: [],
            completions: [],
            prompt: DEFAULT_PROMPT
        });
    }

    id = 0

    toggleCompletion(toggle) {
        if (toggle) {
            this.inputRef.setAttribute('list', 'commander-completion-' + this.id);
        } else {
            this.inputRef.setAttribute('list', 'commander-completion-disabled-' + this.id);
        }
    }

    remove_segment() {
        const newSegments = this.state.segments.slice(0, -1);
        console.debug('remove_segment', this.state.segments, newSegments);
        if (newSegments.length === this.state.segments.length) {
            console.warn(`Commander.remove_segment ${name} not found`);
            return;
        }
        this.setState({
            segments: newSegments
        });
    }

    onClickUl(e) {
        if (e.target.tagName === 'UL') { //Focus new input when clicking in the whitespace of the Tagger instance
            this.inputRef.focus();
        }
    }

    fullText(inputValue = this.state.value) {
        // let segments = this.state.segments.slice();
        // let newSegment = inputValue;
        // segments.push(newSegment);
        // return segments.join(' ');
        return this.state.segments.map(s => s.raw).join('') + inputValue;
    }

    onInput(e) {
        // console.debug('Commander.onInput');
        const value = e.target.value;
        this.parseCommand(value);
    }

    onKeyDownInput(e) {
        const segments = this.state.segments;
        const value = this.state.value;
        // console.debug(`Commander.onKeyDownInput '${e.target.value}' '${this.state.value}' '${!value}'`, e);

        console.debug('keyDownInput value', value);
        if (e.key === 'Backspace' && (value.trim() === '')) {
            if (segments.length > 0) {
                console.debug('Backspace', 'removing segment')
                this.remove_segment();
                e.preventDefault();
            } else {
                console.debug('Backspace', 'ignoring')
            }
        } else if (e.keyCode === 9) { // tab
            // e.preventDefault();
        }
    }

    render(_, { value, segments, completions, prompt }) {
        // console.debug('render segments', segments);
        return html`
            <div class=commander>
                <div class="command-bar__feedback" ref=${e => this.feedbackDiv = e}></div>
                <ul ref=${e => this.ulRef = e} onclick=${e => this.onClickUl(e)}>
                    ${segments.map((s, i) => html`
                        <li key=${`${i}-${s.text}`}>
                            <span class=label>${s.text}</span>
                        </li>
                    `)}
                    <li class=commander-new>
                        <input ref=${e => this.inputRef = e}
                            onInput=${e => this.onInput(e)}
                            onKeyUp=${e => this.onKeyUp(e)}
                            onKeyDown=${e => this.onKeyDownInput(e)}
                            value=${value}
                            placeholder=${prompt}
                            list=commander-completion-1
                            autofocus />
                        <div class=commander-completion>
                            <datalist id=commander-completion-1>
                                ${completions.map((c, i) => html`
                                    <option key=${i} value=${c.value}>${c.text}</option>
                                `)}
                            </datalist>
                        </div>
                    </li>
                </ul>
            </div>
        `;
    }
}