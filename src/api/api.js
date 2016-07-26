/**
 * @module api
 */

//checks right (simple manner : does user and creator are the same person ?)
//TODO check apikey, allow custom validation for data access ()

const merge = require('merge'),
      Promise = require('promise'),
      Response = require('./response.js'),
      output = require('./message.js'),
      STATUS_CODES = require('http').STATUS_CODES,
      READ = 'read',
      WRITE = 'write',
      DELETE = 'delete';


var defaultOptions = {
    mongooseConnection : null,
    checkRightsHooks:null,
    userMinimumLevelRole:null,
    userRoles : {anonymous:0,api:1,member:2,admin:3},
    language : 'en-GB'
};

const CRUDER_VERSION = '0.1';

function CRUDer(options){
    this.version = CRUDER_VERSION;

    options = options || {};
    this.options = merge({},defaultOptions,options);
    
    if(this.options.mongooseConnection === null){
        console.error("No mongoose connection");
    }
}

//Export CRUDer class
module.exports = CRUDer;

CRUDer.prototype.answers = function(user,action,somethingParticular){
    try{
        var somethingModel = this.options.mongooseConnection.model(somethingParticular.criteria.collection),
            answer;
        if(somethingModel) {
            switch(action){
                case READ :
                    answer = Response.read(somethingModel,somethingParticular,user);
                    break;
                case WRITE :
                    answer = Response.write(somethingModel,somethingParticular,user);
                    break;
                case DELETE :
                    answer = Response.delete(somethingModel,somethingParticular,user);
                    break;
                default:
                    answer = null;
            }
        }else{
            //console.log("somethingModel does not exists");
            return Promise.reject(output.message(500,"Something goes wrong with : "+somethingParticular.criteria.collection+" get out of the BOAT NOOOOOW !!!!!",null));
        }
        if(answer === null) throw new Error("[NO_ANSWER]");
        return answer;
    } catch (error){
        return Promise.reject(output.message(500,"[SERVER_ERROR]",error.toString()));
    }
};
