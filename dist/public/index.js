var clientData = {};

var outputData = [];

function fillClientOptions() {
    var output = "";
    for(var client in clientData) {
        output += "<option value='" + client + "'>" + clientData[client].name + "</option>";
    }
    $("#client-select").html(output);
    $("#client-select").select2({
        placeholder: 'Select a Client'
    });

    fillMatterOptions();
    $("#client-select").on('change', fillMatterOptions);
}

function fillMatterOptions() {
    var output = "";
    var selClient = $('#client-select :selected').val();
    var matters = clientData[selClient].matters;
    for(var matter in matters) {
        output += "<option value='" + matter + "'>" + matters[matter] + "</option>";
    }
    $("#matter-select").html(output);
    $("#matter-select").select2({
        placeholder: 'Select a Matter'
    });
}

function buildLinesForNode(nodeId, isTopLevel) {
    var output = [];
    var node = $.jstree.reference('#filetree').select_node(nodeId);
    var selClientId = $('#client-select :selected').val();
    var selMatterId = $('#matter-select :selected').val();

    var isRecursive = $("#recursive").attr('checked');

    var isFolder = node.icon == 'jstree-folder';

    if(isFolder) {
        if(is)
    } else {
        var lastSlash = nodeId.lastIndexOf('/');
        if(lastSlash == -1) lastSlash = nodeId.lastIndexOf('\\');
        var shortPath = nodeId.slice(lastSlash + 1);

        var dotLocation = shortPath.lastIndexOf('.');
        var documentName = nodeId.slice()
    }

    var selDocType = $('#doctype-select :selected').val();

    var lineData = [
        nodeId,           //filepath
        selClientId,    //Client ID
        selMatterId,    //Matter ID

    ];
}

$(function() {
    const socket = io();

    $("#doctype-select").select2();
    $("#matter-select").select2({
        placeholder: 'Select a Matter'
    });

    socket.on('client_data', function(data) {
        clientData = data;
        fillClientOptions();
    });

    socket.on('folder_data', function(data) {
        console.log(data);
        $('#filetree').jstree({ 'core': {
            'data': data
        } });

        $('#filetree').on('changed.jstree', (e, data) => {
            console.log(data.selected);
        });
    });

    $("#apply-settings").on('click', function(event) {
        var selectedItems = $("#filetree").jstree("get_selected");
        console.log(selected);

        for(var item of selectedItems) {
            
        }
    });
});