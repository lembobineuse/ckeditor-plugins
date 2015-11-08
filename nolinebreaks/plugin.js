(function (CKEDITOR) {
'use strict';

    CKEDITOR.plugins.add('nolinebreaks', {

        init: function (editor)
        {
            editor.addCommand('noop', {
                exec: function () {
                    return;
                }
            });
            editor.setKeystroke([
                [13, 'noop'],
                [CKEDITOR.SHIFT + 13, 'noop']
            ]);
        }
    });

}(this.CKEDITOR));