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
    'r foo bar',
    'd a',
    'd b',
    'd c',
    'd d',
    'd e',
    'd f',
    'd g',
    'd h',
    'd i',
    'd j',
    'd k',
    'd l',
    'd m',
    'd n',
    'd o',
    'd p',
    'd q',
    'd r',
    'd s',
    'd t',
    'd u',
    'd v',
    'd w',
    'd x',
    'd y',
    'd z',
]

export function injectTestCommands(injectCommand) {
    initialCommands.forEach(c => injectCommand(c))
}