const error = require('./error.js');

/****************************
 DB Calls returning promises
 ***************************/

module.exports = {
    find   : findStuff,
    delete : deleteStuff,
    write  : writeStuff,
    update : updateStuff,
    save   : saveStuff
};

/**
 * Find something in the DB
 * @param model {MongooseModel}
 * @param condition {Object}
 * @param projection {Object}
 * @returns {Promise.<TResult>} - promise to find something that matches
 */
function findStuff(model, condition, projection){
    var method = (condition._id != undefined) ? 'findOne' : 'find';
    return model[method](condition, projection).then(function (stuff) {
        if(error.is(stuff)) throw new Error(stuff);
        return stuff;
    },function (err){
        return err;
    });
}

/**
 * Delete something in the DB that matches the criteria
 * @param model {MongooseModel}
 * @param condition {Object}
 * @returns {Promise.<TResult>} - promise to remove something
 */
function deleteStuff(model,condition){
    condition = condition || {};
    return findStuff(model,condition,null).then(function(stuff){
        if(error.is(stuff)) throw new Error(stuff);
        return stuff.remove();
    },function (err) {
        return err;
    });
}

/**
 * Write something no matter if it is a creation or an update
 * @param model {MongooseModel}
 * @param condition {Object}
 * @param data {Object}
 * @returns {Promise.<TResult>} - promise to write something
 */
function writeStuff(model,condition,data){
    var writePromise;
    if(condition !== null && Object.getOwnPropertyNames(condition).length > 0){
        writePromise = updateStuff(model,condition,data);
    } else {
        writePromise = saveStuff(model,data);
    }
    return writePromise;
}

/**
 * Update something that already exists
 * @param model {MongooseModel}
 * @param condition {Object}
 * @param data {Object}
 * @returns {Promise.<TResult>} - promise to update something
 */
function updateStuff(model,condition,data){
    return findStuff(model,condition,null).then(function(stuff){
        if(error.is(stuff)) throw new Error(stuff);
        return model.update(condition
            , data
            ,{runValidators: true});
    }, function (err){
        return err;
    });
}

/**
 * Save a new instance of [model]
 * @param model
 * @param data
 * @returns {Promise.<TResult>}  - promise to save something
 */
function saveStuff(model,data){
    var stuff = new model(data);
    return stuff.save().then(function(stuff){
        if(error.is(stuff)) throw new Error(stuff);
        return stuff;
    },function(err){
        return err;
    });
}

