(function (CKEDITOR) {
'use strict';

CKEDITOR.plugins.add('source-editor',
{
    requires: 'iframedialog2',
	icons: 'source-editor,source-editor-rtl',
	hidpi: true,
    version: 0.1,

    init: function (editor) {
        var path = this.path
            , config = editor.config.sourceeditor || {}
        ;
        editor.addCommand('source-editor-dialog', new CKEDITOR.dialogCommand('sourcEditorDialog')); // eslint-disable-line new-cap
        CKEDITOR.dialog.add('sourcEditorDialog', function()
        {
            return {
                title: editor.lang.sourcearea.toolbar,
                minWidth: 280,
                minHeight: 200,
                onShow: function ()
                {
                    var winsize = CKEDITOR.document.getWindow().getViewPaneSize()
                        , width = Math.min(800, winsize.width * 0.8)
                        , height = Math.min(600, winsize.height * 0.8)
                    ;
                    this.resize(width, height);
                    this.move(winsize.width / 2 - width / 2, winsize.height / 2 - height / 2);
                    //
                    this.setupContent();
                },
                contents: [{
                    id: 'main',
                    label: editor.lang.sourcearea.toolbar,
                    expand: true,
                    style: 'width: 100%; height: 100%; min-height:640px;',
                    elements: [
                        {
                            id: 'editor-frame',
                            type: 'iframe2',
                            src: path + 'dialogs/editor.html',
                            width: '100%',
                            height: '100%',
                            allowfullscreen: true,
                            onContentLoad: function () {
                                var element = this.getElement()
                                    , childWindow = element.$.contentWindow
                                ;
                                this.focus();
                                childWindow.bootstrap(this.getDialog(), editor, path, config);
                            }
                        }
                    ]
                }]
            };

        });

        if (editor.ui.addButton) {
            editor.ui.addButton('SourceEditor', {
                label: 'Source Editor', //editor.lang.sourcearea.toolbar,
                command: 'source-editor-dialog',
                toolbar: 'mode,10'
            });
        }
    }

});

}(this.CKEDITOR));

