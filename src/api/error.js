const output = require('./message.js');

/**
 * Check if [obj] is an instance of Error
 * @param obj {Object}
 * @returns {boolean}
 */
exports.is = function(obj){
    return (obj instanceof Error);
};

/**
 * Handle errors
 * @param error
 * @returns {{status, body}} message object containing status, explanation and data
 */
exports.handle = function(error) {
    switch(error.name){
        case 'MongoError' :
            return __handleMongoError(error);
            break;
        case 'MongooseError' :
        case 'ValidationError' :
            return __handleMongooseError(error);
            break;
        default:
            return output.message(400,"[UNDETERMINED_ERROR]",error.message);
    }
};

var MongoErrorFields = {
    code         : 1,
    message      : 2,
    db           : 3,
    collection   : 4,
    type         : 5,
    field        : 6,
    shortMessage : 7,
    value        : 8
};

const MongoErrorRegex = /E([0-9]{5}) ([a-zA-Z0-9\s]*): ([a-zA-Z0-9]*)\.([a-zA-Z0-9]*) ([a-zA-Z0-9\s]*): ([a-zA-Z0-9_$]*) ([a-zA-Z0-9\s]*): \{ : "(.*)" \}/;

function __handleMongoError(error){
    var errorParsed = error.message.match(MongoErrorRegex),
        message = "[MONGO_ERROR]",
        data = error;
    if(errorParsed.length > 1){
        if(errorParsed[MongoErrorFields.code] === '11000'
            || errorParsed[MongoErrorFields.code] === '11001'){
            message = '[DUPLICATE_ENTRY]';
            data = {};data[errorParsed[MongoErrorFields.field]] = errorParsed[MongoErrorFields.value];
        }
    }
    return output.message(400,message,data);
}

function __handleMongooseError(error) {
    var formatError = function (error) {
        if (error.message && (error.kind || error.type)) {
            return {message: error.message || 'no message', type: error.type || error.kind || 'no type'};
        }
        return {message: "no message", type: "no type"};
    };

    var purgedErrors = [];
    if (error && error.errors) {
        if (error.errors instanceof Array) {
            purgedErrors = error.errors.map(function (err) {
                return formatError(err);
            });
        } else if (error.errors instanceof Object) {
            purgedErrors = Object.keys(error.errors).map(function (key) {
                var err = error.errors[key];
                return formatError(err);
            });
        }
    }
    if (purgedErrors.length === 0) purgedErrors = error.message;
    return output.message(400, "[MAYBE_A_VALIDATION_ERROR]", purgedErrors);
}