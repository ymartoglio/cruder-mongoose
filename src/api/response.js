const mongooseProxy = require('./mongoose.js'),
      output = require('./message.js'),
      error  = require('./error.js');

/****************************
 Responses making layer
 ***************************/

/**
 * Look for data that matches the user request
 * @param model {MongooseModel}
 * @param something {Object}
 * @param user {Object} - Must contain at least an _id property (corresponding to a _creator property available in the mongoose's model)
 * @returns {Promise|NULL} - promise and in the end a [message] object
 */
exports.read = function(model,something,user){
    var promiseStuff = mongooseProxy.find(model,
        _setDefaultAccessCondition(something.request.condition,user,something.criteria),
        _setDefaultProjection(model,something.request.fields,user));
    if(promiseStuff){
        return promiseStuff.then(function(stuff){
            if(error.is(stuff)){
                return error.handle(stuff);
            } else {
                if (stuff) {
                    return output.message(200, "[STUFF_FOUND]", stuff);
                } else {
                    return output.message(404, "[NOTHING_FOUND_FOR_ID]" + something.criteria.collectionId);
                }
            }
        },function(err){
            return output.message(404,"[NOTHING_FOUND_FOR_ID]"+something.criteria.collectionId,err);
        });
    }
    return null;
}

function _setDefaultAccessCondition(condition,user,criteria){
    if(condition){
        condition._creator = user._id;
        if(criteria && criteria.collectionId != ""){
            condition._id = criteria.collectionId;
        }
    }
    return condition;
}

function _setDefaultProjection(model,projection,user){
    var roleFieldFilter = (model.projection && model.projection[user.role]) ? model.projection[user.role] : {},
        projection      = (projection) ? projection : roleFieldFilter;
    return projection;
}

/**********************************************************************************************************************/

/**
 *
 * @param model
 * @param something
 * @param user
 * @returns {Promise|NULL} - promise and in the end a [message] object
 */
exports.write =function(model,something,user){
    var promiseStuff = mongooseProxy.write(model,
        _setDefaultCondition(something.request.condition,something.criteria),
        _setDefaultDataWrite(something.request.data,user),
        user);
    if(promiseStuff){
        return promiseStuff.then(function(stuff){
            if(error.is(stuff)){
                return error.handle(stuff);
            } else{
                //console.log("saved",stuff);
                var isUpdate = (stuff.nModified && stuff.nModified > 0) ? 'updated' : 'created';
                var message = "Your `" + something.criteria.collection + "` is " + isUpdate;
                return output.message(201,message,{
                    _id : stuff._id
                });
            }
        },function(err){
            return error.handle(err);
        });
    }
    return null;
};

function _setDefaultCondition(condition,criteria){
    if(condition && criteria.collectionId != ""){
        condition._id = criteria.collectionId;
    }
    return condition;
}

function _setDefaultDataWrite(stuff,user){
    if(stuff){
        stuff._creator = user._id;
    }
    return stuff;
}

/**********************************************************************************************************************/
/**
 * Delete something that matches
 * @param model
 * @param something
 * @param user
 * @returns {Promise.<TResult>} - promise and in the end a [message] object
 */
exports.delete = function(model,something,user){
    var promiseStuff = mongooseProxy.delete(model,
        _setDefaultCondition(something.request.condition,something.criteria),
        user);
    if(promiseStuff){
        return promiseStuff.then(function(stuff){
            if(error.is(stuff)){
                return error.handle(stuff);
            } else{
                return output.message(200,"Your `"+something.criteria.collection+"` is deleted",{_id : something.criteria.collectionId});
            }
        },function(err){
            return output.message(400,"Your `"+something.criteria.collection+"` is not deleted",{_id : something.criteria.collectionId},err);
        })
    }
}
