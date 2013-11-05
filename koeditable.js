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

    configuration: {},

    models: {

        list: [],

        GenericModel: function() {},

        MainModel: function(list) {
            var that = this;
            this.list = ko.observableArray(list);
            ko.editable.models.list = this.list;

            this.sortByName = function() { //plus any custom functions I would like to perform
                this.list.sort(function(a, b) {
                    return a.Name < b.Name ? -1 : 1;
                });
            },
            this.pageSize = ko.observable(1),
            this.pageIndex = ko.observable(0),
            this.firstPage = function() {
                this.pageIndex(0);
            };
            this.previousPage = function() {
                this.pageIndex(this.pageIndex() - 1);
            };
            this.nextPage = function() {
                this.pageIndex(this.pageIndex() + 1);
            };
            this.lastPage = function() {
                this.pageIndex(this.maxPageIndex());
            };


            this.add = function() {
                var model = new ko.editable.models.GenericModel(),
                    list = that.list,
                    listData = list();

                if (listData.length > 0) {
                    var first = listData[0];
                    for (var key in first) {
                        model[key] = ko.observable('');
                        model[key].subscribe(function() { model.isModified = true; });
                    }
                }
                
                list.push(model);
            };
         
            this.remove = function(model) {
                var list = ko.editable.models.list;
                list.remove(model);
            };
         
            this.save = function(form) {
                //alert("Could now transmit to server: " + ko.utils.stringifyJson(self.transactions));
                // To actually transmit to server as a regular form post, write this: ko.utils.postJson($("form")[0], self.transactions);
                var list = this.list(),
                    onlyModified = [];

                for (var i = 0; i < list.length; i += 1) {
                    var model = list[i];
                    if ('isModified' in model && model.isModified === true) {
                        onlyModified.push(model);
                    }
                }

                if (onlyModified.length > 0) {
                    console.log(ko.toJSON(onlyModified));
                }
                else {
                    console.log('nada novo pra enviar');
                }
            };

            this.addExtraList = function(key, list) {
                this[key] = list;
            };
        }

    },

    start: function(configuration) {
        var self = this;
        self.configuration = configuration;

        var addUpdateNotifier = function(model, jsonObject) {
            model.isModified = false;
            for (var field in jsonObject) {
                model[field] = ko.observable(jsonObject[field]);
                model[field].subscribe(function(newValue) {
                    if (newValue) {
                        this.isModified = true;
                    }
                }, model);
            }
            return model;
        };

        var convertToModel = function(response) {
            try {
                var json = JSON.parse(response),
                    list = [];
                for( var i = 0; i < json.length; i += 1) {
                    var model = new self.models.GenericModel();
                    model = addUpdateNotifier(model, json[i]);
                    list.push(model);
                }
                return list;
                
            } catch(e) {
                console.log(e);
            }
        };

        var loadData = function() {
            //var response = getRemoteData(configuration);
            var response = '[{"date": "2012-03-28", "desc": "Tall Hat", "amount": "39.95", "category": {"id": "1", "name": "categ1"}}, ' +
                           '{"date": "2012-02-10", "desc": "Long Cloak", "amount": "120.00", "category": {"id": "2", "name": "categ2"}}]';
            var list = convertToModel(response),
                viewModel = new self.models.MainModel(list);

            for (var key in configuration.extraLists) {
                //response = getRemoteData(configuration.extraLists[key]);
                response = '[{"id": "1", "name": "categoria1"}, {"id": "2", "name": "categoria2"}]';
                viewModel.addExtraList(key, JSON.parse(response));
            }
            
            viewModel.maxPageIndex = ko.dependentObservable(function() {
                return Math.ceil(this.list().length / this.pageSize()) - 1;
            }, viewModel);
            
            
            viewModel.pagedRows = ko.dependentObservable(function() {
                var size = this.pageSize();
                var start = this.pageIndex() * size;
                return this.list.slice(start, start + size);
            }, viewModel);
            ko.applyBindings(viewModel);
        };
        loadData();
    },

    Editable: function(myObject) {
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
    },

    createBinding: function() {
        var self = this;
        ko.bindingHandlers['textEdit'] = {
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
    }
};


