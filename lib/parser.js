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

            if (!loopIterator.next()) return this.createStringToken('');

            if (loopIterator.currentChar() == '{' || loopIterator.currentChar() == '(') {
                return this.parseRazorSection(loopIterator);
            } else {
                var start = loopIterator.pos;
                do {
                    if (!loopIterator.currentChar().match(/[A-Za-z\.\@]/)) {
                        break;
                    }
                } while (loopIterator.next());

                var token = loopIterator.contents.substr(start, loopIterator.pos - start);
                if (token == '@') {
                    return this.createStringToken('@');
                } else {
                    return this.createRazorToken(token);
                }
            }
        },

        parseRazorSection: function(loopIterator) {
            var startingChar = loopIterator.currentChar();
            var endingChar;
            var openSectionsCount = 1;
            var startPosition = loopIterator.pos;

            switch (startingChar) {
                case '{': endingChar = '}'; break;
                case '(': endingChar = ')'; break;
                default: throw new Error('Unable to start a Razor section using ' + startingChar);
            }

            while (loopIterator.next() && openSectionsCount > 0) {
                if (loopIterator.currentChar() == startingChar) {
                    openSectionsCount++;
                } else if (loopIterator.currentChar() == endingChar) {
                    openSectionsCount--;
                }
            }

            var section = loopIterator.contents.substr(startPosition, loopIterator.pos - startPosition);
            if (startingChar == '(') {
                return this.createRazorToken(section.substr(1, section.length - 2));
            } else if (startingChar == '{') {
                return this.createRazorSection(section);
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
        },

        createRazorSection: function(section) {
            return {
                type: 'razor section',
                section: section
            }
        }
    };
}