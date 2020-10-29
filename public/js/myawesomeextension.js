class MyAwesomeExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._first_new_button = null;
        this._symb_name = 'MyAwesomeExtensions'
    }

    load() {
        console.log(this._symb_name,' has been loaded');
        return true;
    }

    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._first_new_button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log(this._symb_name, ' has been unloaded');
        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }

        // -------------------- First button ------------------------------------
        this._first_new_button = new Autodesk.Viewing.UI.Button('FirstButton');
        this._first_new_button.onClick = (ev) => {
            // TODO Execute an action here
        };
        this._first_new_button.setToolTip('First Button');
        this._first_new_button.addClass('myAwesomeExtensionIcon');
        this._group.addControl(this._first_new_button);


        // -------------------- Second button ------------------------------------
        // Add a new button to the toolbar group
        this._second_new_button = new Autodesk.Viewing.UI.Button('SecondButton');
        this._second_new_button.onClick = (ev) => {
            // TODO Execute an action here
        };
        this._second_new_button.setToolTip('Second Button');
        this._second_new_button.addClass('myAwesomeExtensionIcon');
        this._group.addControl(this._second_new_button);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);