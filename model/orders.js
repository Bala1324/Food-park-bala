const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const ordersSchema = new Schema({
    uuid: {type: String, required: false, unique: true},
            // user_email: {type: String, required: false},
            // user_name: {type: String, required: false},
            // user_uuid: {type: String, required: false},
            // Food_category: {type: String, required: false},
            // Food_uuid: {type: String, required: false},
            // dish_name: {type: String, required: false},
            // dish_price: {type: String, required: false},
            // dish_image_uri: {type: String, required: false},
            user_detail: {type: Object, required: true},
            food_detail: {type: Object, required: true},
            dish_count: {type: String, required: true},
            approve_status:{type: String, required: true},
            order_uuid: {type: String, required: false},
            user_email: {type: String, required: false},
            email_id: {type: String, required: false},
            foodId: {type: String, required: false}
},{
	timestamps: true
});

ordersSchema.pre("save", function(next){
	this.uuid = "order"+ crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
	next();
})


module.exports = mongoose.model('orders', ordersSchema);