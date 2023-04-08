- hover text
- draggable items
- highlight relationship (on graph) on mouseover (in list)
- highlight item (in list) on mouseover (on graph)
- highlight relationship (in list) on mouseover (on graph)
- default item
- default relationship
- t (tag) item
- t (tag) relationship
- pan/zoom
- directional relationships (arrows)
- virtual relationships (no force) can be done with custom rel mods (forceFactor 0)
- props view of items (treeview)
- s (search) item/relationship/tag
- peg preact/htm version (standalone)
- import data
- export data
- re-center (or change center)
- node image library
- hosted example
- favicon

TECH_DEBT:
- refactor app to more components
- make buffer value dynamic in Graph.componentDidMount.updateSvgLayoutAttributes
- Update Graph layout via https://preactjs.com/guide/v10/hooks#uselayouteffect
- move inline styles to stylesheet
- move per-node handlers in graph to parent element handlers using event.target (??)

NICE_TO_HAVE:
- custom node shape
- custom node image
- default item (node) charge/size
- default relationship (link) force/length/style
- custom (stronger) forceX/Y
- custom (variable) forceLink

FUTURE
- NRT (data feed a la dynamic monitoring of traffic)
- how to render many (thousands, millions?) of items/rels -- aggregation?