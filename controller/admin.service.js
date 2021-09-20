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
	approveOrder,
	cancelOrder,
	getOrdersDetails
}


// add the food details;
async function addFoodDetails(req,callback) {
	let food_detail = new food(req);
	await food_detail.save().then((data)=>{
		callback(data);
	})
};

//get the food details
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

//delete a food detail
async function deleteTheFoodDetails(req,callback){
	let uuid = req.uuid;
	await food.findOneAndRemove(uuid).exec().then((data)=>{
		callback(data);
	})
};


// async function fetchOrdersDetails(req,callback){
// 	await orders.find().exec().then((data)=>{
// 		callback(data);
// 	})
// };

// admin aprove a order
async function approveOrder(req,res) {
	let orderId = req.body.orderId;
	console.log(orderId)
	let update = {
		"approve_status": "true"
	};
	let option = {new : true}
	
	let result = await orders.findOneAndUpdate({"uuid" :orderId}, update, option).exec();
	let details = {
		from: "baladummyemail@gmail.com",
		to: result.user_detail.user_email,
		subject: "Order Aproved",
		text: "Your order is Approved by Admin.."+"\n OrderId: "+orderId
	}
	console.log(result)
    if(result){
		sendMail(details);
		res.json({"status": "Success", "message": "order approved","data":result});
	}else{
		res.json({"status": "Success", "message": "order not approved"});
	}
		

}
	
//admin cancel a order
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
				res.json({"status": "Success", "message": "sucessss","data": remove});
			 }else{
				res.json({"status": "Failed", "message": "failed"});
			 }
	}
	
}

//get the food details
async function getOrdersDetails(req,res) {
	let result = await orders.find().exec()
	if(result){
		res.json({"status": "Success", "message": "Success","data":result});
	}else{
		res.json({"status": "Failed", "message": "Failed"});
	}
		
}

// mail function
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

