var AjaxHelper = (function () {

    function XHRGet(url, callback) {
        var request = new XMLHttpRequest();
        var requestCallback = callback;

        function requestHandler(event) {
            /*
            console.log("requestHandler:");
            console.log("   request.readyState: " + request.readyState);
            console.log("   request.status: " + request.status);
            */

            if (request.readyState == 4) {
                if (request.status == 200) {
                    try {
                        result = JSON.parse(request.responseText);
                        requestCallback(result);
                    }
                    catch (ex) {
                        requestCallback(null);
                    }
                }
            }
        }

        request.open("GET", url);
        request.onreadystatechange = requestHandler;
        request.send();
    }


    return {
        get: XHRGet
    }
});