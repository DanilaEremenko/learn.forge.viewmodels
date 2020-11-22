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

function parse_json(json_path) {
    return {
        "Вертикальные элементы": {
            "Фундаменты": [
                "Revit фундамент несужей конструкции"
            ],
            "Стены": [
                "Revit стены"
            ],
            "Перекрытия": [
                "Revit Перекрытия",
                "Revit ребра плит"
            ],
            "Колонны": [
                "Revit Несущие колонны"
            ],
            "Крыши": [
                "Revit Крыши"
            ],
            "Лестницы": [
                "Revit лестницы",
                "Revit марши",
                "Revit Площадки"
            ],
            "Окна": [
                "Revit Окна"
            ],
            "Витражи": [
                "Revit панели витража",
                "Revit импосты витража"
            ],
            "Двери": [
                "Revit двери"
            ],
            "Инженерные сети": [
                "Revit Осветительные приборы",
                "Revit Кабельные лотки",
                "Revit соединительные детали кабельных лотков",
                "Revit Выключатели",
                "Revit Электрические приборы",
                "Revit короба",
                "Revit Сантехнические приборы",
                "Revit воздухораспределители"
            ],
            "Монтируемое оборудование": [
                "Revit ограждение",
                "Revit пандус"
            ],
            "Немонтируемое оборудование": [],
            "Декоративные детали": [
                "Revit обобщенные модели"
            ]
        },
        "Горизонтальные элементы": {
            "ЭОМ": [
                "Revit Осветительные приборы",
                "Revit Кабельные лотки",
                "Revit соединительные детали кабельных лотков",
                "Revit Выключатели",
                "Revit Электрические приборы"
            ],
            "ОВ": [
                "Revit короба",
                "Revit воздухораспределители"
            ],
            "ВК": [
                "Revit Сантехнические приборы"
            ],
            "Отделка": [
                "Revit Потолки"
            ]
        }
    }


}


function onDocumentLoadSuccess(doc) {
    var viewables = doc.getRoot().getDefaultGeometry();
    viewer.loadDocumentNode(doc, viewables).then(i => {
        // documented loaded, any action?
        // ---------------------------------------------------------------------------------------------------
        // ----------------------------- receive all tree elements and categories info -----------------------
        // ---------------------------------------------------------------------------------------------------
        let categ_set = new Set();
        const filter_dict = parse_json('../filters.json')
        let res_filter_dict = {};
        for (const key_panel of Object.keys(filter_dict)) {
            res_filter_dict[key_panel] = {}
            for (const key_button of Object.keys(filter_dict[key_panel])) {
                res_filter_dict[key_panel][key_button] = []
            }
        }
        console.log('getting category set')
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function (event) {
            const instanceTree = viewer.model.getInstanceTree();
            const rootNodeId = instanceTree.getRootId();
            const traverseRecursively = true;

            function all_elements_cb(dbid) {
                dbid_properties = viewer.model.getProperties(
                    dbid,
                    function (curr_element) {
                        // console.log(data)

                        const curr_category = curr_element.properties[0]['displayValue']
                        for (const key_panel of Object.keys(filter_dict)) {
                            for (const key_button of Object.keys(filter_dict[key_panel])) {
                                if (filter_dict[key_panel][key_button].includes(curr_category)) {
                                    res_filter_dict[key_panel][key_button].push(dbid);
                                }

                            }
                        }
                        categ_set.add(curr_category);

                    }
                )
            }

            instanceTree.enumNodeChildren(rootNodeId, all_elements_cb, traverseRecursively);
            console.log('Категории:')
            console.log(categ_set);

            console.log('Мапа с отфильтрованными id:')
            console.log(res_filter_dict);


            // ---------------------------------------------------------------------------------------------------
            // ----------------------------- receive leaf and view nodes -----------------------------------------
            // ---------------------------------------------------------------------------------------------------
            let view3d_node = undefined
            let leaf_node = undefined

            function recurs_node_finding(curr_bubble_node) {
                if (curr_bubble_node !== undefined) {
                    if (curr_bubble_node.data.children !== undefined && curr_bubble_node.data.name !== undefined
                        && view3d_node === undefined && leaf_node === undefined//TODO nice bone
                    ) {
                        if (curr_bubble_node.data.name === 'Simple2.rvt')//TODO replace with project name
                            curr_bubble_node.data.children.forEach(function (child_node) {
                                if (child_node.name === 'Виды') {
                                    view3d_node = child_node
                                } else if (child_node.name === 'Листы') {
                                    leaf_node = child_node
                                }
                            })
                        recurs_node_finding(curr_bubble_node.parent)

                    } else {
                        recurs_node_finding(curr_bubble_node.parent)
                    }
                }
            }

            viewer.model.getDocumentNode().traverse(recurs_node_finding)

            console.log('Виды:')
            console.log(view3d_node)

            console.log('Листы:')
            console.log(leaf_node)


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