const merge = require('merge');

var defaultOptions = {
    validators : {},
    projections : {},
    statics : {},
    triggers : []
};

/**
 * Initialize a mongoose schema/model pair
 * @param mongoose {Mongoose} - a valid connection instance
 * @param modelSchema {Object} - data collection description
 * @param modelName {String}
 * @param options {Object} - Custom options to add validators, projections, static methods or properties and triggers
 * @returns {{model, schema: mongoose.Schema}} A mongoose schema and the associated model
 */
module.exports = function(mongoose,modelSchema,modelName,options){
    options = merge({},defaultOptions,options || {});
    var schema = new mongoose.Schema(modelSchema),
        staticPropertu, property,trigger;
    
    _applyStatic(schema,'projection',options.projections);
    
    for(var propertyName in options.statics){
        if(options.statics.hasOwnProperty(propertyName)){
            staticPropertu = options.statics[propertyName];
            _applyStatic(schema,propertyName,staticPropertu);
        }
    }

    //Schema validation
    for(var propertyName in options.validators){
        if(options.validators.hasOwnProperty(propertyName)){
            property = options.validators[propertyName];
            _applyValidator(schema,propertyName,property);
        }
    }

    //Action Triggers
    var triggerCount = options.triggers.length;
    for(var index = 0; index < triggerCount ; index++){
        trigger = options.triggers[index];
        _applyTrigger(schema,trigger.position,trigger.action,trigger.func);
    }

    var model = mongoose.model(modelName,schema);
    return {model:model,schema:schema};
};

function _applyStatic(schema,propertyName,propertyValue){
    if(schema && propertyName && propertyValue){
        schema.statics[propertyName] = propertyValue;
    } else {
        throw  new Error("Something's wrong with the provided 'validate' function");
    }
}

function _applyValidator(schema,field,test){
    test.errorType = test.errorType || '[PLEASE_SPECIFY_EXPLICIT_ERROR_TYPE]';
    test.errorMessage = test.errorMessage  || '[PLEASE_SPECIFY_EXPLICIT_ERROR_MESSAGE]'
    var schemaField = schema.path(field);
    if(schemaField){
        if(test && test.validate && typeof(test.validate) === 'function'){
            schema.path(field).validate(test.validate,test.erroMessage,test.errortype);
        } else {
            throw  new Error("Something's wrong with the provided 'validate' function");
        }
    } else {
        throw new Error("No schema field : " + field);
    }
}

function _applyTrigger(schema,position,action,trigger){
    if(position && action && trigger && typeof(trigger) === 'function'){
        schema[position](action,trigger);
    } else {
        throw  new Error("Something's wrong with the provided arguments");
    }
}
