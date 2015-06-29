var StockProvider = require('./common/FinanceDataProvider');
var req = require('./NodeRequestHelper');
StockProvider.setRequestHelper(req);

module.exports = StockProvider;
