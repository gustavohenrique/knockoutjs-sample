ko.editable.Editable = function(myObject) {
    var self = this;
   
    self.myObject = myObject();
    self.key = "object" == typeof(self.myObject) && 'key' in self.myObject ? self.myObject.key : 'id';
    self.value = "object" == typeof(self.myObject) && 'value' in self.myObject ? self.myObject.value : 'value';

    self.configure = function (element) {
        var self = this;

        var addWidget = function(widget, jeditableOptions) {
            // to use a select component with jeditable, the options['data'] must have
            // a string like '{"1": "value1", "2": "value2"}' where the ID is the key and
            // the NAME is the value.
            var data = self.myObject.data,
                formated_json = {};

            for (var i = 0; i < data.length; i++) {
                var id = data[i][self.key], text = data[i][self.value];
                formated_json[id] = text;
            }
            
            jeditableOptions['type'] = widget;
            jeditableOptions['data'] = $.toJSON(formated_json);

            return jeditableOptions;
        };

        var isWidget = function(widget) {
            return (widget == self.myObject.widget && self.myObject.data.length > 0);
        };

        var buildOptions = function() {
            var data = self.myObject.data,
                jeditableOptions = {
                    onblur: 'submit',
                    select: true,
                    cssclass: 'editable',
                    placeholder: '',
                    type: 'custom_input'
                };

            if (isWidget('select')) {
                jeditableOptions = addWidget('select', jeditableOptions);
            }

            return jeditableOptions;
        };
        
        $(element).editable(function(value, params) {
            if ('data' in params === false) {
                self.myObject.attribute(value);
                return value;
            }

            var result = {};
            result[self.key] = value;
            result[self.value] = JSON.parse(params.data)[value];
            
            self.myObject.attribute(result);
            
            return result[self.value];

        }, buildOptions());
    };

     // configure value to display on UI
    self.display = function(element) {
        var self = this,
            attr_value = ko.utils.unwrapObservable(self.myObject.attribute()),
            edit = $(element).editable();

        var text = attr_value;
        if ('object' == typeof(attr_value) && 'id' in attr_value) {
            text = attr_value[self.key];
        }

        if ('data' in self.myObject) {
            var data = self.myObject.data;
            for (var i = 0; i < data.length; i++) {
                if (text == data[i][self.key]) {
                    edit.html(data[i][self.value]);
                }
            }
        } else {
            edit.html(text);
        }
    };
};

ko.editable.createBinding = function() {
    var self = this;
    ko.bindingHandlers['editable'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            new self.Editable(valueAccessor).configure(element);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).editable("destroy");
            });
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            new self.Editable(valueAccessor).display(element);
        }
    };
};