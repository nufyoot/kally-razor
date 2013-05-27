var tokenizer = require('./tokenizer.js');

module.exports = function(config) {
    return {
        parseRazorContents: function(contents) {
            var tokens = [];
            var loopIterator = this.createIterator(contents);

            var tokenStart;
            while ((tokenStart = loopIterator.nextToken()) != -1) {
                // If we have any content, let's add that to "tokens" first.
                if (loopIterator.pos != tokenStart) {
                    tokens.push(this.createStringToken(loopIterator.contents.substr(loopIterator.pos, tokenStart - loopIterator.pos)));
                    loopIterator.pos = tokenStart;
                }

                tokens.push(this.parseRazorToken(loopIterator));
            }

            // Add the content after the last token.
            if (loopIterator.pos != loopIterator.contents.length) {
                tokens.push(this.createStringToken(loopIterator.contents.substr(loopIterator.pos, loopIterator.contents.length - loopIterator.pos)));
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
            } else if (loopIterator.currentChar() == '@') {
                return this.createStringToken('@');
            } else {
                var token = tokenizer.getNextIdentifier(loopIterator);
                if (token == 'renderBody') {
                    loopIterator.skipWhiteSpace();
                    if (loopIterator.currentChar() != '(') {
                        throw new Error('Expected "(" after "renderBody".');
                    }
                    loopIterator.next();
                    loopIterator.skipWhiteSpace();
                    if (loopIterator.currentChar() != ')') {
                        throw new Error('Expected ")" after "renderBody".');
                    }
                    loopIterator.next();
                    return this.createRazorSection("r += renderBody();");
                } else if (token == 'section') {
                    var sectionName = tokenizer.getNextIdentifier(loopIterator);
                    loopIterator.skipWhiteSpace();
                    if (loopIterator.currentChar() != '{') {
                        throw new Error('Expected "{" to begin a section.');
                    }
                    loopIterator.next();
                    loopIterator.skipWhiteSpace();
                    var start = loopIterator.pos;
                    do {
                        if (loopIterator.currentChar() == '}') {
                            loopIterator.next();
                            break;
                        }
                    } while (loopIterator.next());
                    return this.createLayoutSection(sectionName, this.parseRazorContents(loopIterator.contents.substr(start, loopIterator.pos - start - 2)));
                } else if (token == 'renderSection') {
                    loopIterator.skipWhiteSpace();
                    if (loopIterator.currentChar() != '(') {
                        throw new Error('Expected "(" after "renderSection".');
                    }
                    loopIterator.next();
                    loopIterator.skipWhiteSpace();
                    var sectionName = tokenizer.getNextStringLiteral(loopIterator);
                    loopIterator.skipWhiteSpace();
                    if (loopIterator.currentChar() != ')') {
                        throw new Error('Expected ")" after "renderSection".');
                    }
                    loopIterator.next();
                    return this.createRazorToken("renderSection(" + sectionName  + ")");
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

        createIterator: function(contents) {
            return {
                contents: contents,
                pos: 0,
                next: function() {
                    return ++this.pos < this.contents.length;
                },
                nextToken: function() {
                    return this.contents.indexOf('@', this.pos);
                },
                currentChar: function() {
                    return this.contents[this.pos];
                },
                currentCharAndNext: function() {
                    return this.contents[this.pos++];
                },
                skipWhiteSpace: function() {
                    if (this.pos >= this.contents.length) return;

                    do {
                        if (!this.currentChar().match(/\s/)) break;
                    } while (this.next());
                }
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
        },

        createLayoutSection: function(name, tokens) {
            return {
                type: 'layout section',
                name: name,
                tokens: tokens
            }
        }
    };
}