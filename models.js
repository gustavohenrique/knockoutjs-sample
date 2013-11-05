var TransactionModel = function(transaction) {
    this.date = ko.observable(transaction.date);
    this.desc = ko.observable(transaction.desc);
    this.amount = ko.observable(transaction.amount);
    this.category = ko.observable(transaction.category);
};

var MainModel = function(transactions, categories) {
    var self = this;
    self.transactions = ko.observableArray(transactions);
    self.categories = categories;

 
    self.add = function() {
        var transaction = new TransactionModel({
            date: "2012-01-02",
            desc: "",
            amount: "",
            category: ""
        });
        self.transactions.push(transaction);
    };
 
    self.remove = function(transaction) {
        self.transactions.remove(transaction);
    };
 
    self.save = function(form) {
        //alert("Could now transmit to server: " + ko.utils.stringifyJson(self.transactions));
       console.log(ko.toJSON(self.transactions));
        // To actually transmit to server as a regular form post, write this: ko.utils.postJson($("form")[0], self.transactions);
    };

};

var transactions = [
    new TransactionModel({date: "2012-03-28", desc: "Tall Hat", amount: "39.95", category: {"id": "1", "name": "categ1"}}),
    new TransactionModel({date: "2012-02-10", desc: "Long Cloak", amount: "120.00", category: {"id": "2", "name": "categ2"}})
];

var categories = [{"id": "1", "name": "categoria1"}, {"id": "2", "name": "categoria2"}];
var viewModel = new MainModel(transactions, categories);




ko.applyBindings(viewModel);