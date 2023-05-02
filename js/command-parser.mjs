export const parseChunks = function(str) {
    const splitter = ' ';
    const quotes = '\'"';
    const chunks = [];
    let escaping = false;
    let quote = '';
    let chunk = '';
    let chars = [...str];
    let lastChar = '';
    let char = '';
    while (chars.length) {
        lastChar = char;
        char = chars.shift();
        if (!escaping && char === '\\') {
            escaping = true;
            continue;
        } else if (escaping) {
            chunk += char;
            escaping = false;
            if (!chars.length) {
                chunks.push(chunk);
            }
            continue;
        }
        if (quotes.includes(char)) {
            quote = !!quote ? '' : char;
            if (!chars.length) {
                chunks.push(chunk);
            }
            continue;
        }
        if (!quote && char === splitter) {
            if (lastChar !== splitter) {
                chunks.push(chunk);
            }
            chunk = '';
            if (!chars.length) {
                chunks.push(chunk);
            }
            continue;
        }
        chunk += char;
        if (!chars.length) {
            chunks.push(chunk);
        }
    }
    return { 'chunks': chunks, 'inQuote': !!quote };
}