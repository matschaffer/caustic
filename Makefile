
SRC = lib/events.js lib/caustic.js

build/caustic.js: $(SRC)
	@mkdir -p build
	cat $^ > $@

clean:
	rm -fr build

.PHONY: clean