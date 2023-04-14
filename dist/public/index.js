var clientData = {};
var clientIdByMatter = {};

var displayData = {};
var outputData = {};
var rootFolderPath = "";

var socket;

var docTypeColors = {
    "": "#f0f0f0",
    "CORRES": "#afffc0",
    "DISC": "#aee6d7",
    "DRAFT": "#97badd",
    "EXECUTED": "#cfb4e7",
    "PLEADING": "#e9c8a8",
    "NOTES": "#e0dfb2",
    "SOURCE DOCS": "#e2c1d4"
};

var docStatusColors = {
    "empty": "#dfdd6d",
    "full": "#0ead13",
    "partial": "#206db4",
    "error": "#b83939"
};

function buildGradient(docTypes, docStatus) {
    var output = "linear-gradient(90deg, ";
    var statusColor = docStatusColors[docStatus];
    var typeWidth = (0.9 / docTypes.length) * 100;
    
    for(var i=0; i < docTypes.length; i++) {
        var typeColor = docTypeColors[docTypes[i]];
        var startWidth = (i) * typeWidth;
        var endWidth = (i+1) * typeWidth;
        if(i == 0) {
            output += typeColor + " " + endWidth.toFixed(2) + "%, ";
        } else {
            output += typeColor + " " + startWidth.toFixed(2) + "%, " + typeColor + " " + endWidth.toFixed(2) + "%, ";
        }
    }
    
    var statusWidth = docTypes.length * typeWidth;
    output += statusColor + " " + statusWidth.toFixed(2) + "%)";
    console.log(output);
    return output;
}

function setDisplayColors(node) {
    var docTypes = node.original.docType;
    if(typeof(docTypes) == "string") docTypes = [docTypes];

    displayData[node.id] = buildGradient(docTypes, node.original.docStatus);
}

function drawDisplayColors() {
    for(var nodeId in displayData) {
        if(Object.prototype.hasOwnProperty.call(displayData, nodeId)) {
            idNoApostrophe = nodeId.replace(/'/g, "\"");
            $("a[id='" + idNoApostrophe + "_anchor']").css('width', "min(30em, 90%)");
            $("a[id='" + idNoApostrophe + "_anchor']").css('border-radius', "0 0.75em 0.5em 0");
            $("a[id='" + idNoApostrophe + "_anchor']").css('background', displayData[nodeId]);
        }
    }
}

var numByStatus = {
    "empty": 0,
    "full": 1,
    "partial": 2,
    "error": 3
};

function chooseDominantStatus(status1, status2) {
    return numByStatus[status1] > numByStatus[status2] ? status1 : status2;
}

function updateNodeDisplayData(nodeId) {
    var selDocType = $("#doctype-select").val();

    var tree = $.jstree.reference("#filetree");
    var node = tree.get_node(nodeId);

    if(node.icon == "jstree-folder") {
        if(typeof(node.children) == "boolean" || node.children.length == 0) {
            console.log("Found empty folder: '" + node.id + "'");
            node.original.docType = [selDocType];
            node.original.docStatus = node.original.empty ? "empty" : "error";
            setDisplayColors(node);
            return;
        }

        var allChildrenProfiled = true;
        var childDocTypes = [];
        var dominantStatus = "full";

        for(var childId of node.children) {
            var childNode = tree.get_node(childId);
            if(childNode.original.docType == undefined || childNode.original.docStatus == undefined) {
                allChildrenProfiled = false;
                continue;
            }

            if(childNode.icon == 'jstree-folder') {
                childDocTypes.push(...childNode.original.docType);
            } else {
                childDocTypes.push(childNode.original.docType);
            }

            dominantStatus = chooseDominantStatus(dominantStatus, childNode.original.docStatus);
        }

        if(dominantStatus == "full" && !allChildrenProfiled) {
            dominantStatus = "partial";
        }

        var docTypesOut = [];
        for(var type in docTypeColors) {
            if(Object.prototype.hasOwnProperty.call(docTypeColors, type)) {
                if(childDocTypes.includes(type)) {
                    docTypesOut.push(type);
                }
            }
        }

        node.original.docType = docTypesOut;
        node.original.docStatus = dominantStatus;
        setDisplayColors(node);
    } else {
        node.original.docType = selDocType;
        node.original.docStatus = "full";
        setDisplayColors(node);
    }

    if(node.parent != "#") {
        updateNodeDisplayData(node.parent);
    }
}

function nodeHasSettings(nodeId) {
    return outputData.hasOwnProperty(nodeId);
}

function generateClientIdByMatter() {
    for(var clientId in clientData) {
        for(var matterId in clientData[clientId].matters) {
            clientIdByMatter[matterId] = clientId;
        }
    }
}

function fillClientOptions(autoTriggered = false) {
    var output = "";
    for(var client in clientData) {
        output += "<option value='" + client + "'>" + clientData[client].name + "</option>";
    }
    $("#client-select").html(output);
    $("#client-select").select2({
        placeholder: 'Select a Client'
    });

    fillMatterOptions();
    $("#client-select").on('change', data = { keepSelection: autoTriggered }, fillMatterOptions);
}

function fillMatterOptions(event, data) {
    var prevSelection = $("#matter-select :selected").val();
    
    var output = "<optgroup label=\"Selected Client\">";
    var selClient = $('#client-select :selected').val();
    var matters = clientData[selClient].matters;
    
    for(var matter in matters) {
        output += "<option value='" + matter + "'>" + matters[matter] + "</option>";
    }
    
    output += "</optgroup><optgroup label=\"All Clients\">";

    for(var client in clientData) {
        for(var matter in clientData[client].matters) {
            output += "<option value='" + matter + "'>" + clientData[client].matters[matter] + "</option>";
        }
    }

    output += "</optgroup>";

    $("#matter-select").off('change');

    $("#matter-select").html(output);

    $("#matter-select").select2({
        placeholder: 'Select a Matter'
    });

    if((event && event.data.keepSelection) || (data && data.keepSelection)) {
        $("#matter-select").val(prevSelection);
        $("#matter-select").trigger('change');
    }

    $("#matter-select").on('change', function (e) {
        var matterId = $("#matter-select :selected").val();
        var clientId = clientIdByMatter[matterId];

        if($("#client-select").val() != clientId) {
            $("#client-select").val(clientId);
            $("#client-select").trigger('change', { keepSelection: true });
        }
    });
}

function buildLinesForNode(nodeId, isTopLevel = true) {
    var fileTree = $.jstree.reference('#filetree');
    var node = fileTree.get_node(nodeId);
    var selClientId = $('#client-select').val();
    var selMatterId = $('#matter-select').val();
    var selDocType = $('#doctype-select').val();

    var isRecursive = $("#recursive").prop('checked');

    var isFolder = node.icon == 'jstree-folder';

    if(isFolder) {
        if(isRecursive || isTopLevel)  {

            var output = [];
            for(var childId of node.children) {
                var childLines = buildLinesForNode(childId, false);
                output.push(...childLines);
            }

            updateNodeDisplayData(nodeId);

            return output;
        } else {
            return [];
        }
    } else {
        var lastSlash = nodeId.lastIndexOf('/');
        if(lastSlash == -1) lastSlash = nodeId.lastIndexOf('\\');
        var shortPath = nodeId.slice(lastSlash + 1);

        var dotLocation = shortPath.lastIndexOf('.');
        var documentName = shortPath.slice(0, dotLocation);
        var documentExtension = shortPath.slice(dotLocation + 1);
        var comments = "Pre-NetDocs File Path: " + nodeId;

        var nodeLine = [
            nodeId,
            selClientId,
            selMatterId,
            selDocType,
            comments,
            documentName,
            documentExtension,
            node.original.author,
            node.original.created_date,
            node.original.author,
            node.original.modified_date
        ];

        updateNodeDisplayData(nodeId);

        return [nodeLine];
    }
}

async function getFileNodeChildren(currentNode, callback) {
    var me = this;
    //Get node from socket
    socket.emit('get_file_node', currentNode.id, (response) => {
        callback.call(me, response.nodes);
    });
}

$(function() {
    $collapsibles = $(".collapsible");
    $collapsibles.on('click', function(event) {
        var $content = $(this.nextElementSibling);

        $(this).toggleClass("collapsible-active");
        if($(this).hasClass("collapsible-active")) {
            $content.css('max-height', $content[0].scrollHeight + "px");
        } else {
            $content.css('max-height', "0");
        }
    });

    socket = io();

    $("#doctype-select").select2();
    $("#matter-select").select2({
        placeholder: 'Select a Matter'
    });

    socket.on('client_data', function(data) {
        clientData = data;
        generateClientIdByMatter();
        fillClientOptions();
    });

    socket.on('root_folder_path', function(pathIn) {
        rootFolderPath = pathIn;
    });

    /*socket.on('folder_data', function(data) {
        $('#filetree').jstree({ 'core': {
            'data': data
        } });

        $('#filetree').on('changed.jstree', (e, data) => {
            $("#num-selected").html(data.selected.length);
        });
    });*/

    $('#filetree').jstree({ 'core': {
        'data': getFileNodeChildren
    } });

    $('#filetree').on('changed.jstree', (e, data) => {
        $("#num-selected").html(data.selected.length);
    });

    $('#filetree').on('after_open.jstree', (e, data) => {
        drawDisplayColors();
    });

    $("#apply-settings").on('click', function(event) {
        var selectedItems = $("#filetree").jstree("get_selected");

        for(var item of selectedItems) {
            var newLines = buildLinesForNode(item);
            for(var line of newLines) {
                if(outputData.hasOwnProperty(line[0])) {
                    delete outputData[line[0]];
                }
                
                outputData[line[0]] = line;
            }
        }

        drawDisplayColors();

        $("#num-files").html("" + Object.keys(outputData).length);
    });

    $("#save-file").on('click', function(event) {
        var filename = $("#filename-out").val();
        filename = (filename == "") ? "ImportDescription.csv" : filename + ".csv";
        var outputArr = [];
        for(var line in outputData) {
            if(Object.prototype.hasOwnProperty.call(outputData, line)) {
                outputArr.push(outputData[line]);
            }
        }
        socket.emit("save_new", outputArr, filename);
    });
});