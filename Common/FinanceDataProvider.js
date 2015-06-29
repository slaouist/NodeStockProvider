var FinanceDataProvider = (function () {
    var requestHelper;
    var realTimeExchangeId = 126;
    var realTimeSecurityType = 1;
    var langLocale = "EN-US";

    var serviceBaseURL = "http://finance.services.appex.bing.com/Market.svc/";
    var realTimeRequestTemplate = "realTimeQuotes?symbols={{symbols}}";
    var stockEntityDetailsTemplate = "StockEntityDetailsV2?symbols={{symbols}}&lang=EN-US&isEOD=false&isOTC=false&localizeFor=en-us";
    var chartAndQuotesTemplate = "ChartAndQuotes?symbols={{symbols}}&chartType={{charttype}}&isETF=false&iseod=false&lang=EN-US";
    var chartTemplate = "ChartDataV5?symbols={{symbols}}&chartType={{charttype}}&isEOD=false";
    var autocompleteTemplate = "Autocomplete?q={{query}}&locale=en%3Aus&count={{count}}";
    var moversTemplate = "Movers?rtexchanges=19.1.MSTATS_NAS_L_MS&lang=EN-US&locale=en-us";
    var indexMovementTemplate = "TodayEquityV3?rtSymbols=126.10.!DJI.126.%24INDU%2C126.10.%40CCO.126.COMP%2C126.10.SPX&iseod=false&lang=EN-US&localizeFor=en-us";

    function getRequestHelper() {
        return requestHelper;
    }

    function setRequestHelper(helper) {
        requestHelper = helper;
    }

    function getTopMovers(numMovers, callback) {
        var url = composeURL(moversTemplate);
        requestData(url, function (result) {
             if (result) {
                var stockExhangeData = result[0].A;
                if (stockExhangeData) {
                    var length = Math.min(stockExhangeData.length, numMovers)
                    processMoversResult(stockExhangeData.splice(0, length), callback);
                    return;
                }
            }
            callback({});
        });
    }

    function getIndexMovement(callback) {
        var url = composeURL(indexMovementTemplate);
        requestData(url, function (result) {
            if (result) {
                 if (result.Rtd) {
                    var quotes = new quoteCollection(result.Rtd);
                    callback(quotes);
                    return;
                }
            }
            callback({})
        });
    }

    function getRealTimeQuote(tickerSymbols, callback) {
        /// <summary>Get real time stock quotes.</summary>
        /// <param name="tickerSymbols" type="Array">Array of ticker symbols to retrieve</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>
        /// <returns value='callback(quoteCollection())' ></returns>

        var qualifiedSybolsList = composeListOfSymbols(tickerSymbols);
        var url = composeURL(realTimeRequestTemplate, { symbols: qualifiedSybolsList });

        requestData(url, function(result) { 
            processRealTimeQuoteResult(result, callback); 
        });
    }

    function getStockEntityDetails(tickerSymbols, callback) {
        /// <summary>Get stock entity details.</summary>
        /// <param name="tickerSymbols" type="Array">Array of ticker symbols to retrieve</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>

        var qualifiedSybolsList = composeListOfSymbols(tickerSymbols);
        var url = composeURL(stockEntityDetailsTemplate, { symbols: qualifiedSybolsList });
        requestData(url, callback);
    }

    function getChartAndQuotes(tickerSymbols, chartType, callback) {
        /// <summary>Get charts and quotes for symbols.</summary>
        /// <param name="tickerSymbols" type="Array">Array of ticker symbols to retrieve</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>

        var qualifiedSybolsList = composeListOfSymbols(tickerSymbols);
        var url = composeURL(chartAndQuotesTemplate, { symbols: qualifiedSybolsList, charttype: chartType });
        requestData(url, callback);
    }

    function getChart(tickerSymbols, chartType, callback) {
        /// <summary>Get charts symbols.</summary>
        /// <param name="tickerSymbols" type="Array">Array of ticker symbols to retrieve</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>
        /// <returns value='callback(chartCollection())' ></returns>

        var qualifiedSybolsList = composeListOfSymbols(tickerSymbols);
        var url = composeURL(chartTemplate, { symbols: qualifiedSybolsList, charttype: chartType });
        requestData(url, function (result) {
            processChartResult(result, callback);
        });
    }

    function getAutocomplete(query, count, callback) {
        /// <summary>Get symbols matching the supplied query</summary>
        /// <param name="query" type="string">Search text</param>
        /// <param name="count" type="string">Max number of responses</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>
        /// <returns value='callback(autocompleteCollection())' ></returns>

        var url = composeURL(autocompleteTemplate, { query: query, count: count });
        requestData(url, function (result) {
            processAutocompleteResult(result, callback);
        });
    }

    function requestData(url, callback) {
        requestHelper.get(url, callback);
    }

    function processRealTimeQuoteResult(result, callback) {
        /// <param name="result" type="string">Result from the data provider</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>
        /// <returns type="quoteCollection">Collection of quotes</returns>

        var quotes = new quoteCollection(result);
        callback(quotes);
    }

    function processMoversResult(result, callback) {
        var quotes = new quoteCollection(result);
        callback(quotes);
    }

    function processAutocompleteResult(result, callback) {
        /// <param name="result" type="string">Result from the data provider</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>
        /// <returns type="autocompleteCollection">Collection of autocomplete entities</returns>

        var entities = new autocompleteCollection(result);
        callback(entities);
    }

    function processChartResult(result, callback) {
        /// <param name="result" type="string">Result from the data provider</param>
        /// <param name="callback" type="Function">Callback made when the request is complete.</param>
        /// <returns type="chartCollection">Collection of chart entities</returns>

        var entities = new chartCollection(result);
        callback(entities);
    }

    function composeURL(requestTemplate, requestData) {
        var url = serviceBaseURL + requestTemplate;
        url = url.replace(/\{\{(.*?)\}\}/g, function ($0, $1) { return requestData[$1]; })
        return url;
    }

    function composeListOfSymbols(symbols) {
        // List of symbols matches this format
        // realTimeExchangeId.realTimeSecurityType.TickerSymbol1,realTimeExchangeId.realTimeSecurityType.TickerSymbol2...

        var qualifiedSymbols = new Array();
        symbols.map(function (value, index, array) {
            qualifiedSymbols.push(realTimeExchangeId + "." + realTimeSecurityType + "." + value);
        });

        return qualifiedSymbols.join();
    }

    function quoteCollection(realTimeQuoteResponse) {
        /// <signature>
        ///     <summary>Create quoteCollection from an realtime quote service response</summary>
        ///     <param name="realTimeQuoteResponse" type="String">Realtime quote service response</param>
        ///     <returns type="Array" elementType="quoteData">Collection of quotes</returns>
        /// </signature>

        var quotes = {};

        if (realTimeQuoteResponse != null) {
            for (i = 0; i < realTimeQuoteResponse.length; i++) {
                var quote = new quoteData();
                quote.parseQuote(realTimeQuoteResponse[i]);
                quotes[quote.symbol] = quote;
            }
        }

        return quotes;
    }

    function quoteData() {
        var companyName;
        var lastTradeTimestamp;
        var lastTradeDate;
        var lastPrice;
        var changePrice;
        var changePercentage;
        var dayHigh;
        var dayLow;
        var symbol;
        var afterHoursPrice;
        var afterHoursChangePrice;
        var afterHoursChangePercentage;

        var keyMap = {
            companyName: "Cmp",
            lastTradeTimestamp: "Lt",
            lastTradeDate: "Ld",
            lastPrice: "Lp",
            changePrice: "Ch",
            changePercentage: "Chp",
            dayHigh: "Dh",
            dayLow: "Dl",
            symbol: "Sym",
            afterHoursPrice: "post",                    // After Hours Price - not included while market is open
            afterHoursChangePrice: "postCh",            // After Hours Price Change - not included while market is open
            afterHoursChangePercentage: "postChp",       // After Hours Percentage Change - not included while market is open
            exchangeId: "E2",
            friendlyName: "LocShtName",
        }

        function parseQuote(raw) {
            /// <summary>Parses quote data out of raw response data.</summary>
            /// <param name="raw" type="Object">JSON that is the raw response data.</param>
            for (var key in keyMap) {
                if (keyMap.hasOwnProperty(key)) {
                    this[key] = raw[keyMap[key]];
                }
            }
        }

        return {
            parseQuote: parseQuote,
            companyName: companyName,
            lastTradeTimestamp: lastTradeTimestamp,
            lastTradeDate: lastTradeDate,
            lastPrice: lastPrice,
            changePrice: changePrice,
            changePercentage: changePercentage,
            dayHigh: dayHigh,
            dayLow: dayLow,
            symbol: symbol,
            afterHoursPrice: afterHoursPrice,
            afterHoursChangePrice: afterHoursChangePrice,
            afterHoursChangePercentage: afterHoursChangePercentage,
        }
    }

    function autocompleteEntity() {
        var id,
            companyName,
            exchangeId,
            symbol,
            rtExchangeId,
            rtSecurityType

        var keyMap = {
            companyName: "OS01W",
            exchangeId: "LS01Z",
            symbol: "RT00S",
            rtExchangeId: "RT00E",
            rtSecurityType: "RT00T"
        }

        function parseEntity(raw) {
            /// <summary>Parses quote data out of raw response data.</summary>
            /// <param name="raw" type="Object">JSON that is the raw response data.</param>
            for (var key in keyMap) {
                if (keyMap.hasOwnProperty(key)) {
                    this[key] = raw[keyMap[key]];
                }
            }

            this.id = '' + this.symbol + '.' + this.exchangeId;
        }

        return {
            parseEntity: parseEntity,
            id: id,
            /// <field name='companyName' type="String">The company name</field>
            companyName: companyName,
            exchangeId: exchangeId,
            symbol: symbol,
            rtExchangeId: rtExchangeId,
            rtSecurityType: rtSecurityType,
        }
    }

    function autocompleteCollection(autocompleteResponse) {
        /// <signature>
        ///     <summary>Create autocompleteCollection from an autocomplete service response</summary>
        ///     <param name="autocompleteResponse" type="String">Autocomplete service response</param>
        ///     <returns type="Array" elementType="autocompleteEntity">Collection of autocomplete entities</returns>
        /// </signature>

        var entities = {};
        if (autocompleteResponse != null) {
            var data = autocompleteResponse.data;

            for (i = 0; i < data.length; i++) {
                var entity = new autocompleteEntity();
                entity.parseEntity(data[i]);
                entities[entity.id] = entity;
            }
        }

        return entities;
    }

    function chartData() {
        var chartType,
            symbol,
            startTime,
            seriesData;

        function getSeriesData() {
            /// <summary>Get chart series data</summary>
            /// <returns type="Array">Array of prices and times</returns>
            return seriesData;
        }

        function setSeriesData(val) {
            seriesData = val;
        }

        var keyMap = {
            chartType: "Ct",
            symbol: "EqTkr",
            startTime: "St"
        };

        function parseChart(raw) {
            /// <summary>Parses quote data out of raw response data.</summary>
            /// <param name="raw" type="Object">JSON that is the raw response data.</param>
            for (var key in keyMap) {
                if (keyMap.hasOwnProperty(key)) {
                    this[key] = raw[keyMap[key]];
                }
            }

            parseSeries(raw.Series);
        }

        function parseSeries(responseSeries) {
            var seriesData = new Array();
            tZero = responseSeries[0].T;

            responseSeries.map(function (value, index, array) {
                var time;
                if (index > 0) {
                    time = new Date(((tZero + value.T) * 60 * 1000) + 946684800000);
                }
                else {
                    time = new Date(((value.T) * 60 * 1000) + 946684800000);
                }

                seriesData.push({ "Price": value.P, "Time": time });
            });

            setSeriesData(seriesData);
       }

        return {
            parseChart: parseChart,
            chartType: chartType,
            symbol: symbol,
            startTime: startTime,
            getSeries: getSeriesData
        }
    }

    function chartCollection(chartResponse) {
        /// <signature>
        ///     <summary>Create autocompleteCollection from an autocomplete service response</summary>
        ///     <param name="chartResponse" type="String">Chart service response</param>
        ///     <returns type="Array" elementType="chartData">Collection of chart entities</returns>
        /// </signature>

        var charts = {};

        for (i = 0; i < chartResponse.length; i++) {
            var chart = new chartData();
            chart.parseChart(chartResponse[i]);
            charts[chart.symbol] = chart;
        }

        return charts;
    }

    return {
        setRequestHelper: setRequestHelper,
        getRealTimeQuote: getRealTimeQuote,
        getStockEntityDetails: getStockEntityDetails,
        getChartAndQuotes: getChartAndQuotes,
        getChart: getChart,
        getAutocomplete: getAutocomplete,
        quote: quoteData,
        quoteCollection: quoteCollection,
        autocompleteEntity: autocompleteEntity,
        autocompleteCollection: autocompleteCollection,
        chart: chartData,
        chartCollection: chartCollection,
        requestHelper: getRequestHelper,
        getIndexMovement: getIndexMovement,
        getTopMovers: getTopMovers
    }
});

FinanceDataProvider.ChartType = {
    Day: "1d",
    Week: "5d",
    Month: "1m",
    Year: "1y",
    FiveYear: "5y",
    All: "max"
};

if(typeof module !== 'undefined' && module.hasOwnProperty("exports")) {
    module.exports = new FinanceDataProvider();
}
