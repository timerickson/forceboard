import { html, Component } from 'preact';
import { Commander } from 'commander';

export class CommandBar extends Component {
    state = {
        input: ""
    }

    fileName = 'test.json'

    async save() {
        // https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API#examples

        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(this.fileName, { create: true });

        const writable = await handle.createWritable();
        writable.truncate(0);

        const json = this.props.data.json();
        await writable.write(json);
        await writable.close();
    }

    async load() {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(this.fileName, { create: false });
        const jsonBlob = await handle.getFile();
        const json = await jsonBlob.text();
        this.props.data.json(json);
    }

    clear() {
        this.props.data.clear();
    }

    render() {
        return html`
            <div class=command-bar>
                <div class=command-bar__elements>
                    <div class=command-bar__controls>
                        <${Commander} data=${this.props.data} ref=${e => this.commander = e} />
                        <button onClick=${() => this.commander.processCommand()}>Enter</button>
                        <button onclick=${() => this.clear()}>Clear</button>
                        <button onclick=${() => this.save()}>Save</button>
                        <button onclick=${() => this.load()}>Load</button>
                    </div>
                </div>
            </div>
        `
    }
}
