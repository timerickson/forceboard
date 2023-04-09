import { html } from 'preact';
import {
    EventSubscribingComponent,
    ItemSelected,
    ItemDeselected
} from './events.mjs';
import * as d3 from "d3";

/*
Large portions of the D3 elements here were taken from
https://observablehq.com/@d3/modifying-a-force-directed-graph

ISC License
Copyright 2020 Observable, Inc.
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

export class Graph extends EventSubscribingComponent {
    // https://github.com/preactjs/preact/wiki/External-DOM-Mutations

    constructor(props) {
        super(props);
        // console.debug('Graph', arguments)
    }

    shouldComponentUpdate(newProps = {}, _) {
        let oldStateId = this.state.dataStateId;
        let newStateId = newProps.data.stateId;
        const changed = (oldStateId != newStateId);

        // console.debug('shouldComponentUpdate changed', changed, newStateId, oldStateId, arguments);
        if (changed) {
            this.setState({
                dataStateId: newStateId
            }, () => this.updateGraph());
        }

        // https://github.com/preactjs/preact/wiki/External-DOM-Mutations
        // do not re-render via diff:
        return false;
    }

    // includes the buffer/padding so we don't have to worry about that latter
    contentExtent = { xMin: -100, xMax: 100, yMin: -75, yMax: 75 }

    collectContentExtent(node) {
        let xMin = 0;
        let xMax = 0;
        let yMin = 0;
        let yMax = 0;
        node.data().forEach((d, _) => {
            xMin = Math.min(xMin, d.x);
            xMax = Math.max(xMax, d.x);
            yMin = Math.min(yMin, d.y);
            yMax = Math.max(yMax, d.y);
        });
        const halfBuffer = this.buffer / 2.0;
        this.contentExtent = {
            xMin: xMin - halfBuffer,
            xMax: xMax + halfBuffer,
            yMin: yMin - halfBuffer,
            yMax: yMax + halfBuffer
        };
        // console.debug('set contentExtent', this.contentExtent);
        this.updateSvgLayoutAttributes();
    }

    // TODO: This should be 2 * (border-width)
    buffer = 6;

    getScale(avlSize) {
        const widthPx = avlSize.width;
        const heightPx = avlSize.height;
        const widthUnits = this.contentExtent.xMax - this.contentExtent.xMin;
        const heightUnits = this.contentExtent.yMax - this.contentExtent.yMin;
        const widthScale = (widthPx * 1.0) / widthUnits;
        const heightScale = (heightPx * 1.0) / heightUnits;
        // console.log(widthPx, heightPx, widthUnits, heightUnits, widthScale, heightScale);
        return Math.min(widthScale, heightScale);
    }

    updateSvgLayoutAttributes() {
        const width = this.base.clientWidth - this.buffer;
        const height = this.base.clientHeight - this.buffer;
        const size = { width, height };
        let scale = this.getScale(size);
        scale = Math.min(scale, 1.0);
        const scaledWidth = Math.ceil(width / scale);
        const scaledHeight = Math.ceil(height / scale);
        // console.debug('scale', scale, this.contentExtent, { width: scaledWidth, height: scaledHeight });
        this.svg.setAttribute('width', `${width}`);
        this.svg.setAttribute('height', `${height}`);
        this.svg.setAttribute('viewBox', `-${scaledWidth/2},-${scaledHeight/2},${scaledWidth},${scaledHeight}`);
    }

    componentDidMount() {
        // now mounted, can freely modify the DOM:
        // console.debug('componentDidMount', arguments);
        this.svg = this.initSimulation();
        this.base.appendChild(this.svg);

        const svg = this.svg;
        const resizeObserver = new ResizeObserver((entries) => {
            let resizes = 0;
            for (const entry of entries) {
                if (entry.borderBoxSize?.length > 0) {
                    if (++resizes > 1) {
                        console.warn('ResizeObserver multiple calls');
                    }
                    this.updateSvgLayoutAttributes();
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

        this.updateGraph();
    }

    initSimulation() {
        let invalidation = new Promise((res, rej)=>{});
        // let nodeTitle = undefined;

        // const nodeId = (d) => d.id;
        // const N = d3.map(nodes)
        // if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
        // const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);

        let color = d3.scaleOrdinal(d3.schemeTableau10);

        const svg = d3.create("svg");

        const simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("link", d3.forceLink().id(d => d.id).distance(200))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", ticked);

        let link = svg.append("g")
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .selectAll("line");

        let node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle");

        function ticked() {
            node.attr("cx", d => d.x)
                .attr("cy", d => d.y)

            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        function drag(simulation) {    
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        setInterval(() => {
            this.collectContentExtent(node);
        }, 2000);

        ItemSelected.subscribe((id) => {
            node.filter((d) => d.id === id).transition().duration(100).attr('r', '20');
        });

        ItemDeselected.subscribe((id) => {
            node.filter((d) => d.id === id).transition().duration(100).attr('r', '10');
        });

        invalidation.then(() => simulation.stop());

        // let instance = this;
        return Object.assign(svg.node(), {
            update({nodes, links}) {
                // console.log('svg.update', arguments);

                // Make a shallow copy to protect against mutation, while
                // recycling old nodes to preserve position and velocity.
                const old = new Map(node.data().map(d => [d.id, d]));
                nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
                links = links.map(d => Object.assign({}, d));

                simulation.nodes(nodes);
                simulation.force("link").links(links);
                simulation.alpha(1).restart();

                node = node
                    .data(nodes, d => d.id)
                    .join(enter => enter.append("circle")
                        .attr("r", 10)
                        .attr("fill", d => color(d.id))
                        .on('mouseenter', function (e, item) {
                            ItemSelected.fire(item.id);
                        })
                        .on('mouseleave', function (e, item) {
                            ItemDeselected.fire(item.id);
                        })
                        .call(drag(simulation))
                    );

                // if (true) node.append("title").text(({index: i}) => T[i]);

                link = link
                    .data(links, d => `${d.source.id}\t${d.target.id}`)
                    .join("line");
            }
        });
    }

    render() {
        return html`
            <div id="d3target" style="flex: 1; line-height: 0;"></div>
        `;
    }

    updateGraph() {
        console.debug('Graph.updateGraph');
        const { items, relationships } = this.props.data;
        this.svg.update({
            "nodes": items.map((i) => ({ id: i.id })),
            "links": relationships.map((r) => ({ source: r.a.id, target: r.b.id }))
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.debug('componentDidUpdate', prevProps, this.props, prevState, snapshot);
        this.updateGraph();
    }
}