import UI from './ui';


window.bootstrap = (dialog, ckeditor, path, config) => {
    let ui = new UI(dialog, ckeditor, path, config);
    ui.run();
};
