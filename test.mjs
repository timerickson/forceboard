let initalItems= [
    'foo',
    'bar',
    'baz'
];

let initialRelationships = [
    ['foo', 'bar']
]

let initialCommands = [
    'd foo',
    'd bar',
    'd baz',
    'r foo bar'
]

export function injectTestCommands(injectCommand) {
    initialCommands.forEach(c => injectCommand(c))
}