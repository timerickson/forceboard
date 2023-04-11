import { html, render, Component } from 'preact';
import { Graph } from 'graph';
import { Data } from 'data';
import { ControlPanel } from 'controlPanel';
import { CommandBar } from 'commandBar';
import { DataChanged } from 'events';

class App extends Component {
    constructor(props) {
        super(props);

        this.data = new Data(() => DataChanged.fire());
    }

    render() {
        // console.log('App.render', arguments);
        const data = this.data;
        return html`
            <div class=app>
                <${Graph} data=${data}><//>
                <div class=bottom-pane>
                    <${CommandBar} data=${data} />
                    <${ControlPanel} data=${data} />
                </div>
            </div>
        `;
    }
}

render(html`<${App}/>`, document.body.getElementsByTagName('main')[0]);