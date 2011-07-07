
SRC = lib/events.js lib/caustic.js

all: build/caustic.js build/caustic.min.js

build/caustic.js: $(SRC)
	@mkdir -p build
	cat $^ > $@

build/caustic.min.js: build/caustic.js
	uglifyjs $< > $@

clean:
	rm -fr build

.PHONY: clean