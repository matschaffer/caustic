
SRC = lib/events.js lib/caustic.js
OUT = $(SRC:.js=.out)

all: build/caustic.js build/caustic.min.js
	du build/*

build/caustic.js: $(OUT)
	@mkdir -p build
	cat $^ > $@

%.out: %.js
	cat head $< tail > $@ 

build/caustic.min.js: build/caustic.js
	uglifyjs $< > $@

clean:
	rm -fr build $(OUT)

.PHONY: clean