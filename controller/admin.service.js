const moment = require("moment");
const database = require('../helper/db.js');

const admin = database.admin;
const food = database.food;
const orders = database.orders;

const nodemailer = require("nodemailer");

const mailTransport = nodemailer.createTransport({
	"service" : "gmail",
	"auth": {
		user : "baladummyemail@gmail.com",
		pass: "balabala1324"
	}
});


module.exports = {
	addFoodDetails,
	getTheFoodDetails,
	updateTheFoodDetails,
    deleteTheFoodDetails,
    // listOrdersByUserDetails,
    fetchOrdersDetails,
	approveOrder,
    cancelOrder
}


// add the food details;
async function addFoodDetails(req,callback) {
	let food_detail = new food(req);
	await food_detail.save().then((data)=>{
		callback(data);
	})
};

async function getTheFoodDetails(req,callback) {
	await food.find().exec().then((data)=>{
		callback(data);
	})
}

// update the food details
async function updateTheFoodDetails(req,callback) {
	let condition = req.uuid;
	let update = req.updateObj;
	console.log(update)
	let option = {new : true}
	await food.findOneAndUpdate({uuid: condition}, update, option).exec().then((data)=>{
		callback(data);
	})

}

async function deleteTheFoodDetails(req,callback){
	let uuid = req.uuid;
	await food.findOneAndRemove(uuid).exec().then((data)=>{
		callback(data);
	})
};

// async function listOrdersByUserDetails(req,callback){
// 	await food.findByIdAndRemove(req).exec().then((data)=>{
// 		callback(data);
// 	})
// };
	
async function fetchOrdersDetails(req,callback){
	await orders.find().exec().then((data)=>{
		callback(data);
	})
};

async function approveOrder(req,callback){
	// let condition =req.order_uuid;
    //  console.log(condition);
	let update = {
        "approve_status": "true"
    };
	//console.log(update)
	let option = {new : true}
	await orders.findOneAndUpdate({"uuid" :req.order_uuid}, update, option).exec().then((data)=>{
		callback(data);
	})
};

async function cancelOrder(req,callback){
	await orders.findByIdAndRemove(req).exec().then((data)=>{
		callback(data);
	})
};

async function  cancelOrder(req,res){
	// let email = req.body.user_email;
	let uuid = req.body.order_uuid;
	const order_detail = await orders.find({"uuid": uuid}).exec();
	console.log(order_detail[0].user_detail.user_email);
	let details = {
		from: "baladummyemail@gmail.com",
		to: order_detail[0].user_detail.user_email,
		subject: "Order Canceled",
		text: "Your order is Canceled by Admin.."
	}
	if(!order_detail){
		res.json({"status": "Failed", "message": "order does not exist"});
	}else{
	
			 let remove = await orders.findOneAndRemove(uuid)
			 if(remove){
				sendMail(details);
				res.json({"status": "Success", "message": "sucessss"});
			 }else{
				res.json({"status": "Failed", "message": "failed"});
			 }
	}
	
	
	
	

}
function sendMail(details){
		
	let mailData;
	mailData = {
		from: details.from,
		to: details.to,
		subject: details.subject,
		text: details.text
	}
	mailTransport.sendMail(mailData, function(err,data){
		if(err){
			console.log(err)
		}else{
			console.log("Email sent");
		}
	})
}
