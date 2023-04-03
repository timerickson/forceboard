var initalItems= [
    'foo',
    'bar',
    'baz'
];

var initialRelationships = [
    ['foo', 'bar']
]

var initialCommands = [
    'a foo',
    'a bar',
    'a baz',
    'r foo bar'
]

export function injectTestCommands(injectCommand) {
    initialCommands.forEach(c => injectCommand(c))
}