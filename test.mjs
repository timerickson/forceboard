var initalItems= [
    'foo',
    'bar',
    'baz'
];

var initialRelationships = [
    ['foo', 'bar']
]

var initialCommands = [
    'd foo',
    'd bar',
    'd baz',
    'r foo bar'
]

export function injectTestCommands(injectCommand) {
    initialCommands.forEach(c => injectCommand(c))
}