import { html, Component } from 'preact'
import { Types } from 'data';
import { Click } from 'events'
import { list } from 'commands';

export class HelpOverlay extends Component {
    constructor() {
        super();

        Click.subscribe((d, e) => this.onClick(d, e));
    }

    componentDidMount() {
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyUp(ev) {
        // console.debug('HelpOverlay.onKeyUp', ev);
        if (ev.key === 'Escape') {
            this.show(false);
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }
        if (ev.key === '?') {
            console.debug('ev', ev);
            this.show(true);
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }
    }

    show(test) {
        test ?
            this.base.parentNode.classList.add('visible') :
            this.base.parentNode.classList.remove('visible');
    }

    onClick(d, e) {
        if (d.type !== Types.WINDOW) {
            return;
        }
        this.show(false);
    }

    render() {
        return html`
            <table>
                <thead>
                    <tr>
                        <th>name</th>
                        <th>shortcut</th>
                        <th>description</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(c => html`
                        <tr>
                            <td>${c.name}</td>
                            <td>${c.shortcut}</td>
                            <td>${c.description}</td>
                        </tr>
                    `)}
                </tbody>
            </table>
        `;
    }
}