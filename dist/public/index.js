var clientData = {};
var clientIdByMatter = {};

var outputData = {};

var socket;

var docTypeColors = {
    "": "#d3d3d3",
    "CORRES": "#64ea74",
    "DISC": "#5bebc5",
    "DRAFT": "#5aa0e6",
    "EXECUTED": "#b678ec",
    "PLEADING": "#f5a453",
    "NOTES": "#e4e05d",
    "SOURCE DOCS": "#ea71b5"
};

var docStatusColors = {
    "full": "#0ce313",
    "partial": "#27ffff",
    "error": "#fd5a5a"
};

function buildGradient(docTypes, docStatus) {
    var output = "linear-gradient(110deg, ";
    var statusColor = docStatusColors(docStatus);
    var typeWidth = (0.75 / docTypes.length);
    
    for(var i=0; i < docTypes.length; i++) {
        var typeColor = docTypeColors(docTypes[i]);
        var startWidth = (i) * typeWidth;
        var endWidth = (i+1) * typeWidth;
        if(i == 0) {
            output += typeColor + " " + endWidth.toFixed(3) + "%, ";
        } else {
            output += typeColor + " " + startWidth.toFixed(3) + "%, " + typeColor + " " + endWidth.toFixed(3) + "%, ";
        }
    }
    
    var statusWidth = docTypes.length * typeWidth;
    output += statusColor + " " + statusWidth.toFixed(2) + "%)";
    return output;
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
    var node = $.jstree.reference('#filetree').get_node(nodeId);
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
        var comments = "OneDrive File Path: " + nodeId;

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