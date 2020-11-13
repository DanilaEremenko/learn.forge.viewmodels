/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewer;

function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, () => {
      viewer = new Autodesk.Viewing.GuiViewer3D(
          document.getElementById('forgeViewer'),
          {extensions: ['MyAwesomeExtension', 'CustomPropertyPanelExtension']}
      );
    viewer.start();
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
    var viewables = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, viewables).then(i => {
        // documented loaded, any action?

        // ---------------------------------------------------------------------------------------------------
        // ----------------------------- receive all tree elements info --------------------------------------
        // ---------------------------------------------------------------------------------------------------
        viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function (event) {
            const instanceTree = viewer.model.getInstanceTree();
            const rootNodeId = instanceTree.getRootId();
            const traverseRecursively = true;
            let categ_set = new Set();

            function callback(dbid) {
                dbid_properties = viewer.model.getProperties(
                    dbid,
                    function (data) {
                        console.log(data)
                        data.properties.forEach(function (curr_prop) {
                                categ_set.add(curr_prop.displayCategory);
                            }
                        )
                    }
                )
            }

            instanceTree.enumNodeChildren(rootNodeId, callback, traverseRecursively);
            console.log(categ_set);

        });

        // ---------------------------------------------------------------------------------------------------
        // ----------------------------- receive current selected element info -------------------------------
        // ---------------------------------------------------------------------------------------------------
        viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, function (curr_object) {
            curr_dbid = curr_object.selections[0].dbIdArray[0];//TODO could be selection.length > 1?
            viewer.model.getProperties(curr_dbid, function (curr_prop) {
                console.log(curr_prop);
            });
        });

    });

}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}