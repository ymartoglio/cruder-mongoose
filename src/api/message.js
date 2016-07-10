/**
 * Message payload formatter
 * @param status {Number}
 * @param explanation {String}
 * @param data {*}
 * @returns {{status: (*|number), body: {success: number, explain: (*|string), data: (*|null)}}}
 */
exports.message = function(status,explanation,data){
    data = data || null;
    explanation = explanation || "[NO_EXPLAINATION]";
    status = status || 200;

    return {
        status : status,
        body : {
            success : (status > 299) ? 0 : 1,
            explain : explanation,
            data    : data
        }
    }
}