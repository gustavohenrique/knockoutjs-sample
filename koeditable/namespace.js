jQuery.editable.addInputType('custom_input', {
    element: function(settings, original) {
        var input = $('<input class="input_inline" />');
        input.attr('autocomplete','off');
        $(this).append(input);
        return (input);
    }
});

ko = ko || {};

ko.editable = {
    configuration: {}
};

ko.checker = ko.checker || {};
