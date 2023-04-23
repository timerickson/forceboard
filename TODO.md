- default relationship length
- Selection panel (item)
  - charge
  - relationshps
  - treeview
- Selection panel (rlationship)
  - length
  - arrows
- hosted example
- font size
- fix viewArea (or just min?)
  - set min viewArea from/to current?
- s (search) item/relationship/tag
- t (tag) relationship
- favicon
- control to toggle graph node labels
- directional relationships (arrows)
- default item (size, charge, color)
- default relationship (length, color)
- virtual relationships (no force) can be done with custom rel mods (forceFactor 0)

BUGS:

TECH_DEBT:
- move inline styles to stylesheet
- peg preact/htm version (standalone)
- make buffer value dynamic in Graph.componentDidMount.updateSvgLayoutAttributes
- move per-node handlers in graph to parent element handlers using event.target (??)

NICE_TO_HAVE:
- node image library
- custom node shape
- custom node image
- default item (node) charge/size
- default relationship (link) force/length/style
- custom (stronger) forceX/Y
- custom (variable) forceLink
- pan/zoom
- highlight item (in list) on mouseover (on graph)
- highlight relationship (in list) on mouseover (on graph)
- highlight relationship (on graph) on mouseover (in list)

FUTURE
- NRT (data feed a la dynamic monitoring of traffic)
- how to render many (thousands, millions?) of items/rels -- aggregation?