// -----------------------------------------------------------------------------------
// -------------------------- BUTTON EXTENSION ---------------------------------------
// -----------------------------------------------------------------------------------
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
// -----------------------------------------------------------------------------------
// -------------------------- PROPERTY EXTENSION -------------------------------------
// -----------------------------------------------------------------------------------
// ---------------------------- create panel -----------------------------------------
class CustomPropertyPanel extends Autodesk.Viewing.Extensions.ViewerPropertyPanel {


    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.options = options;
        this.nodeId = -1; // dbId of the current element showing properties
        Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(this, this.viewer);
    }

    setProperties(properties, options) {
        Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setProperties.call(this, properties, options);

        // add your custom properties here
        // for example, let's show the dbId and externalId
        var _this = this;
        // dbId is right here as nodeId
        this.addProperty('dbId', this.propertyNodeId, 'Custom Properties');
        // externalId is under all properties, let's get it!
        this.viewer.getProperties(this.propertyNodeId, function (props) {
            _this.addProperty('externalId', props.externalId, 'Custom Properties');
        })
    }

    setNodeProperties(nodeId) {
        Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setNodeProperties.call(this, nodeId);
        this.nodeId = nodeId; // store the dbId for later use
    };
}



// ----------------------------create extension -------------------------------------------
class CustomPropertyPanelExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.options = options;
        this.panel = null;
    }

    load() {
        return true
    }

    onToolbarCreated() {
        this.panel = new CustomPropertyPanel(this.viewer, this.options);
        var _this = this;
        this.viewer.addEventListener(Autodesk.Viewing.EXTENSION_LOADED_EVENT, function (e) {
            if (e.extensionId !== 'Autodesk.PropertiesManager') return;
            var ext = _this.viewer.getExtension('Autodesk.PropertiesManager');
            ext.setPanel(_this.panel);
        })
    }

    unload() {
        if (this.panel == null) return;
        var ext = this.viewer.getExtension('Autodesk.PropertiesManager');
        this.panel = null;
        ext.setDefaultPanel();
        return true;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('CustomPropertyPanelExtension', CustomPropertyPanelExtension);