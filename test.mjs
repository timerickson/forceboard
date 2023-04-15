let initalItems= [
    'foo',
    'bar',
    'baz'
];

let initialRelationships = [
    ['foo', 'bar']
]

let initialCommands = [
    // 'a foo',
    // 'a bar',
    // 'a baz',
    // 'r foo bar',
    'a a',
    'a b',
    'a c',
    'a d',
    'r a b',
    'r a c',
    'r a d',
    'r b c',
    'r c d',
    'r d b',
    // 'a e',
    // 'a f',
    // 'a g',
    // 'a h',
    // 'a i',
    // 'a j',
    // 'a k',
    // 'a l',
    // 'a m',
    // 'a n',
    // 'a o',
    // 'a p',
    // 'a q',
    // 'a r',
    // 'a s',
    // 'a t',
    // 'a u',
    // 'a v',
    // 'a w',
    // 'a x',
    // 'a y',
    // 'a z',
]

export function injectTestCommands(injectCommand) {
    initialCommands.forEach(c => injectCommand(c))
}