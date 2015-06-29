function get(url, callback) {
    var req = require('request');
    req(url, function (error, response, body) {
        requestHandler(error, response, body, callback);
    });
}

function requestHandler(error, response, body, requestCallback) {
    if (!error && response.statusCode == 200) {
        try {
            result = JSON.parse(body);
            requestCallback(result);
        }
        catch (ex) {
            requestCallback(null);
        }
    }
}

exports.get = get;