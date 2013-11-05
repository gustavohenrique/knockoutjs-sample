ko.editable.configure = function(configuration) {
    var self = this;
    self.configuration = configuration;

    var addUpdateModelNotifier = function(model, jsonObject) {
        model.isModified = false;
        model.isSelected = false;
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

    var parseToModel = function(response) {
        try {
            var json = JSON.parse(response),
                list = [];
            for( var i = 0; i < json.length; i += 1) {
                var model = new self.models.GenericModel();
                model = addUpdateModelNotifier(model, json[i]);
                list.push(model);
            }
            return list;
            
        } catch(e) {
            console.log('Parsing error: ' + e.message);
        }
    };

    var addPagination = function(viewModel) {

        viewModel.pageSize = ko.observable(configuration.pageSize),
        viewModel.pageIndex = ko.observable(0),
        
        viewModel.first = function() {
            viewModel.pageIndex(0);
        };
        
        viewModel.previous = function() {
            viewModel.pageIndex(viewModel.pageIndex() - 1);
        };
        
        viewModel.next = function() {
            viewModel.pageIndex(viewModel.pageIndex() + 1);
        };
        
        viewModel.last = function() {
            viewModel.pageIndex(viewModel.maxPageIndex());
        };

        viewModel.maxPageIndex = ko.dependentObservable(function() {
            return Math.ceil(this.list().length / this.pageSize()) - 1;
        }, viewModel);
        
        viewModel.dataList = ko.dependentObservable(function() {
            var size = this.pageSize();
            var start = this.pageIndex() * size;
            return this.list.slice(start, start + size);
        }, viewModel);

        return viewModel;
    };

    var addExtraListForSelectBox = function(viewModel) {
        for (var key in configuration.extra) {
            //response = getRemoteData(configuration.extraLists[key]);
            response = '[{"id": "1", "name": "categoria1"}, {"id": "2", "name": "categoria2"}]';
            viewModel.addExtraList(key, JSON.parse(response));
        }
        return viewModel;
    };

    var main = function() {
        //var response = getRemoteData(configuration);
        var response = '[{"id": "1", "date": "2012-03-28", "desc": "Tall Hat", "amount": "39.95", "category": {"id": "1", "name": "categ1"}}, ' +
                       '{"id": "2", "date": "2012-02-10", "desc": "Long Cloak", "amount": "120.00", "category": {"id": "2", "name": "categ2"}}]';
        var list = parseToModel(response),
            viewModel = new self.models.MainModel(list);

        viewModel = addExtraListForSelectBox(viewModel);
        viewModel = addPagination(viewModel);
        ko.applyBindings(viewModel);
    };
    
    main();
};


