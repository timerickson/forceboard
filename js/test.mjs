import { parseChunks } from 'commandParser';

export const initialCommands = [
    'a a',
    'b',
    'c',
    'd',
    'r a b',
    'foo',
    // 'r a c',
    // 'r a d',
    // 'r b c',
    // 'r c d',
    // 'r d b',
    // 'e',
    // 'f',
    // 'g',
    // 'h',
    // 'i',
    // 'j',
    // 'k',
    // 'l',
    // 'm',
    // 't a apple',
    // 't c cat',
    // 't e eagle',
    // 't g green',
    // 't i indigo',
    // 't k kilo',
    // 't m mary',

//     'n',
//     'o',
//     'p',
//     'q',
//     'a r',
//     's',
//     'a t',
//     'u',
//     'v',
//     'w',
//     'x',
//     'y',
//     'z',
]

function assertArrayEquals(expected, actual) {
    if (expected.length !== actual.length)
        throw { 'message': `expected ${expected.length} but got ${actual.length}`, 'actual': actual };
    expected.forEach((exptectedItem, i) => {
        let actualItem = actual[i];
        if (exptectedItem !== actualItem)
            throw { 'message': `expected item ${i} to be -->${exptectedItem}<-- but was -->${actualItem}<--`, 'actual': actual };
    });
}

function assertEquals(expected, actual) {
    if (expected !== actual)
        throw { 'message': `expected ${expected} but got ${actual}` };
}

const parseChunkTests = {
    'foo': ['foo'],
    'foo ': ['foo', ''],

    "'foo '": ['foo '],
    "'foo ' ": ['foo ', ''],
    "'foo '  ": ['foo ', ''],
    "'foo \\'": ["foo '"],
    "'foo \\''": ["foo '"],

    '"foo "': ['foo '],
    '"foo " ': ['foo ', ''],
    '"foo \\"': ['foo "'],
    '"foo \\""': ['foo "'],

    'foo bar': ['foo', 'bar'],
    'foo  bar': ['foo', 'bar'],
    'foo  bar ': ['foo', 'bar', '']
}

const parseInQuoteTests = {
    'foo ': false,

    "'foo '": false,
    "'foo \\'": true,
    "'foo \\''": false,

    '"foo "': false,
    '"foo \\"': true,
    '"foo \\""': false,

    'foo bar': false,
    'foo  bar': false,
    'foo  bar ': false
}

function runParseChunkTest(name) {
    try {
        let expected = parseChunkTests[name];
        let actual = parseChunks(name).chunks;
        assertArrayEquals(expected, actual);
        // console.info(`Pass :: -->${name}<--`);
    } catch (error) {
        // console.error(error);
        return console.error(`Fail :: -->${name}<-- :: ${error.message}`, '::', error.actual);
    }
}

function runParseInQuoteTest(name) {
    try {
        let expected = parseInQuoteTests[name];
        let actual = parseChunks(name).inQuote;
        assertEquals(expected, actual);
    } catch (error) {
        return console.error(`Fail :: -->${name}<-- :: ${error.message}`); }
}

export function runTests() {
    for (let testValue in parseChunkTests) {
        runParseChunkTest(testValue);
    }
    for (let testValue in parseInQuoteTests) {
        runParseInQuoteTest(testValue);
    }
}