export const parseChunks = function(str) {
    const splitter = ' ';
    const quotes = '\'"';
    const chunks = [];
    const chars = [...str];

    let escaping = false;
    let quote = '';
    let chunk = '';
    let printableChunk = '';
    let lastChar = '';
    let char = '';
    let printable = true;

    const pushChunk = () => {
        chunks.push({
            raw: chunk,
            text: printableChunk,
            inQuote: !!quote
        });
        chunk = '';
        printableChunk = '';
    }

    while (chars.length) {
        lastChar = char;
        char = chars.shift();
        printable = true;
        let endQuote = false;
        if (!escaping && char === '\\') {
            escaping = true;
            printable = false;
        } else if (escaping) {
            escaping = false;
            printable = true; // redundant but explicit
        } else {
            if (quotes.includes(char)) {
                if (!quote) {
                    quote = char;
                    printable = false;
                } else if (char === quote) {
                    endQuote = true;
                    printable = false;
                }
            }
            if (!quote && (char === splitter)) {
                if ((lastChar !== splitter) && lastChar.length) {
                    pushChunk();
                }
                printable = false;
            } else if (!quote && (char !== splitter) && (lastChar === splitter)) {
                pushChunk();
            }
        }
        chunk += char;
        printableChunk += (printable ? char : '');
        if (!chars.length) {
            pushChunk();
        }
        if (endQuote) {
            quote = '';
        }
    }
    return chunks;
}