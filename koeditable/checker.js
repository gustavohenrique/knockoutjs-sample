ko.checker.createBinding = function() {
    ko.bindingHandlers['checker'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            return { 'controlsDescendantBindings': true };
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var input = document.createElement('input'),
                tr = element.parentElement,
                cssClass = 'selected';

            if (viewModel.isSelected === true) {
                input.checked = true;
                $(tr).addClass(cssClass);
            }
            else {
                input.checked = false;
                $(tr).removeClass(cssClass);
            }

            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', valueAccessor()());
            input.onchange = function() {
                 if (this.checked) {
                    viewModel.isSelected = true;
                    $(tr).addClass(cssClass);
                }
                else {
                    viewModel.isSelected = false;
                    $(tr).removeClass(cssClass);
                }
            };

            element.appendChild(input);
        }
    };
};