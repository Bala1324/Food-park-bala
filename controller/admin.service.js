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
	// approveOrder,
	cancelOrder,
	aproveOrder
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

// async function approveOrder(req,callback){
// 	let email = req.body.email_id;
// 	console.log(email);
// 	 let condition =req.body.foodId;
// 	 console.log(condition);
	 
// 	// let update = {
//     //     "approve_status": "true"
//     // };
// 	// //console.log(update)
// 	// let option = {new : true}
// 	// await orders.findOneAndUpdate({"uuid" :condition}, update, option).exec().then((data)=>{
// 	// 	callback(data);
// 	// })
// };


// async function cancelOrder(req,callback){
// 	await orders.findByIdAndRemove(req).exec().then((data)=>{
// 		callback(data);
// 	})
// };

async function aproveOrder(req,res) {
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
		text: "Your order is Aproved by Admin.."+"\n OrderId: "+orderId
	}
	console.log(result)
    if(result){
		sendMail(details);

		res.json({"status": "Success", "message": "order aproved"});
	}else{
		res.json({"status": "Success", "message": "order not aproved"});
	}
		

}
	
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

