import UI from './ui';


window.bootstrap = (dialog, ckeditor, path, config) => {
    const ui = new UI(dialog, ckeditor, path, config);
    ui.run();
};
