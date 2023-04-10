var clientData = {};

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
});