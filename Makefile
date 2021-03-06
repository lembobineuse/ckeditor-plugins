PACKAGE := "embo-ckeditor-plugins"
VERSION := $(shell git describe --dirty --always)

release="$(PACKAGE)_$(VERSION)"

all: clean dist

.PHONY: all clean dist

dist:
	mkdir $(release)
	cp -R fullscreeniframedialog $(release)
	cp -R nolinebreaks $(release)
	cd sourceeditor && gulp dist
	cp -R sourceeditor/dist/sourceeditor $(release)
	zip -r -9 "$(release).zip" "$(release)" -x \*.map
	rm -rf "$(release)"


clean:
	cd sourceeditor && gulp clean
	rm -f "$(release).zip"
	rm -rf "$(release)"
