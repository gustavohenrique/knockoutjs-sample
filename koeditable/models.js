ko.editable.models = {

    list: [],

    GenericModel: function() {},

    MainModel: function(list) {
        var that = this;
        that.list = ko.observableArray(list);

        

        that.attributes = [];
        for(var key in list[0]) {
            that.attributes.push(key);
        }

        // this.sortByName = function() { //plus any custom functions I would like to perform
        //     this.list.sort(function(a, b) {
        //         return a.Name < b.Name ? -1 : 1;
        //     });
        // },

        this.addExtraList = function(key, list) {
            this[key] = list;
        };
        
        this.add = function() {
            var model = new ko.editable.models.GenericModel(),
                list = that.list,
                keys = that.attributes;
                
            for (var index in keys) {
                var key = keys[index];
                model[key] = ko.observable('');
                model[key].subscribe(function() { model.isModified = true; });
            }
            
            list.push(model);
        };
     
        this.remove = function(model) {
            var list = that.list;
            list.remove(model);
            if (list().length === 0) {
                that.add();
            }
        };
     
        this.save = function(form) {
            //alert("Could now transmit to server: " + ko.utils.stringifyJson(self.transactions));
            // To actually transmit to server as a regular form post, write this: ko.utils.postJson($("form")[0], self.transactions);
            var list = this.list(),
                onlyModified = getModelsByAttr('isModified', list);

            if (onlyModified.length > 0) {
                console.log(ko.toJSON(onlyModified));
            }
            else {
                console.log('nada novo pra enviar');
            }
        };

        this.sendTo = function(url, viewModel) {
            if (url !== '' && 'dataList' in viewModel && viewModel.dataList().length > 0 ) {
                var list = this.list(), //viewModel.dataList(),
                    onlySelected = getModelsByAttr('isSelected', list);

                if (onlySelected.length > 0) {
                    console.log(ko.toJSON(onlySelected));
                }

            }
        };

        var getModelsByAttr = function(field, list) {
            var result = [];

            for (var i = 0; i < list.length; i += 1) {
                var model = list[i];
                if (field in model && model[field] === true) {
                    var clone = cloneObject(model);
                    delete clone.isModified;
                    delete clone.isSelected;
                    result.push(clone);
                }
            }
            return result;
        };

        var cloneObject = function(oldObject) {
            return jQuery.extend(true, {}, oldObject);
        };
    }

};