(function (CKEDITOR) {
'use strict';

function IFrameElement (dialog, definition, htmlList)
{
    var _ = (this._ || (this._ = {})),
        contentLoad = definition.onContentLoad && CKEDITOR.tools.bind(definition.onContentLoad, this),
        cssWidth = CKEDITOR.tools.cssLength(definition.width),
        cssHeight = CKEDITOR.tools.cssLength(definition.height)
    ;

    _.frameId = CKEDITOR.tools.getNextId() + '_iframe';

    // IE BUG: Parent container does not resize to contain the iframe automatically.
    dialog.on('load', function() {
        var iframe = CKEDITOR.document.getById(_.frameId),
            parentContainer = iframe.getParent()
        ;
        parentContainer.setStyles({
            width: cssWidth,
            height: cssHeight
        });
    });

    var attributes = {
        src: '%2',
        id: _.frameId,
        frameborder: 0,
        allowtransparency: true,
        seamless: true
    };
    if (definition.allowfullscreen) {
        attributes.allowfullscreen = true;
        ['moz', 'webkit', 'ms'].forEach(function (prefix) {
            attributes[prefix + 'AllowFullscreen'] = true;
        });
    }

    var myHtml = [];

    if (typeof definition.onContentLoad === 'function') {
        attributes.onload = 'CKEDITOR.tools.callFunction(%1);';
    }

    CKEDITOR.ui.dialog.uiElement.call(this, dialog, definition, myHtml, 'iframe', {
        width: cssWidth,
        height: cssHeight
    }, attributes, '');

    // Put a placeholder for the first time.
    htmlList.push('<div style="width:' + cssWidth + ';height:' + cssHeight + ';" id="' + this.domId + '"></div>');

    // Iframe elements should be refreshed whenever it is shown.
    myHtml = myHtml.join('');

    dialog.on('show', function() {
        var iframe = CKEDITOR.document.getById(_.frameId),
            parentContainer = iframe.getParent(),
            callIndex = CKEDITOR.tools.addFunction(contentLoad),
            html = myHtml.replace('%1', callIndex).replace('%2', CKEDITOR.tools.htmlEncode(definition.src))
        ;
        parentContainer.setHtml(html);
    });
}

IFrameElement.prototype = Object.create(CKEDITOR.ui.dialog.uiElement.prototype);

IFrameElement.prototype.getContentWindow = function ()
{
    return this.getElement().$.contentWindow;
};


CKEDITOR.plugins.add('fullscreeniframedialog',
{
	requires: 'dialog',
	onLoad: function ()
    {
        CKEDITOR.dialog.addUIElement('fullscreeniframe', {
            build: function (dialog, definition, output) {
                return new IFrameElement(dialog, definition, output);
            }
        });
	}
});



}(this.CKEDITOR));
