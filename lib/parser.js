module.exports = function(config) {
    return {
        parseRazorContents: function(contents) {
            var tokens = [];
            var loopIterator = {
                contents: contents,
                pos: -1,
                next: function() {
                    return ++this.pos < this.contents.length;
                },
                currentChar: function() {
                    return this.contents[this.pos];
                }
            }

            var start = 0;
            while (loopIterator.next()) {
                if (loopIterator.currentChar() == '@') {
                    // If we have any content, let's add that to "tokens" first.
                    if (start != loopIterator.pos) {
                        tokens.push(this.createStringToken(loopIterator.contents.substr(start, loopIterator.pos - start)));
                    }

                    tokens.push(this.parseRazorToken(loopIterator));
                    start = loopIterator.pos;
                }
            }

            // Add the content after the last token.
            if (start != loopIterator.pos) {
                tokens.push(this.createStringToken(loopIterator.contents.substr(start, loopIterator.pos - start)));
            }

            return tokens;
        },

        parseRazorToken: function(loopIterator) {
            if (loopIterator.currentChar() != '@') {
                throw new Error('The first character for a Razor token must be the @ symbol.');
            }

            var start = loopIterator.pos + 1;
            while (loopIterator.next()) {
                if (!loopIterator.currentChar().match(/[A-Za-z\.\@]/)) {
                    break;
                }
            }

            var token = loopIterator.contents.substr(start, loopIterator.pos - start);
            if (token == '@') {
                return this.createStringToken('@');
            } else {
                return this.createRazorToken(token);
            }
        },

        createStringToken: function(contents) {
            return {
                type: 'string',
                contents: contents
            };
        },

        createRazorToken: function(token) {
            return {
                type: 'razor',
                token: token
            }
        }
    };
}