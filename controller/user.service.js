const moment = require("moment");
const database = require('../helper/db.js');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const user = database.users;
const admin = database.admin;
const food = database.food;
const orders = database.orders;
const bcrypt = require("bcrypt");
const mailTransport = nodemailer.createTransport({
	"service" : "gmail",
	"auth": {
		user : "baladummyemail@gmail.com",
		pass: "balabala1324"
	}
});

module.exports = {
	   registerUser,
	   loginUser,
	   logout,
       forgetPassword,
       resetPassword,
	   getTheFoodDetails,
	   createOrder,
	   cancelOrder
}

// register user
async function registerUser(req,res) {
	let email = req.body.email;
	let details = {
		from: "baladummyemail@gmail.com",
		to: email,
		subject: "Wellcome to Food Park",
		text: "Wellcome to food Park, You have successfullly registered...."
	}
	let name = req.body.name;
	let password1 = req.body.password;
	const email_detail = await user.find({"email": email}).exec();
	if(email_detail.length>0){
		throw res.json({"status": "Failed", "message": "email already exists"});
	}
	const name_Availab = await user.find({"name": name}).exec()
	if(name_Availab.length>0){
		throw res.json({"status": "Failed", "message": "Name already exists"});
	}
	let users = new user(req.body);
	if(password1){
		let password = req.body.password;
		let salt = await bcrypt.genSalt(10);
		users.password = bcrypt.hashSync(password, salt);
		users.save();
		console.log(users);
		sendMail(details);
		res.json({"status": "Success", "message": "Register successfully","data":users});
	}else{
		res.json({"status": "Failed", "message": "Please Provide password"});
	}
};


//Login user
async function loginUser(req,res) {
	let email = req.body.email;
	let password = req.body.password;
	let users = await user.findOne({"email": email}).exec();
	console.log(users);
	let pass = users.password
	console.log(pass);
	let match = await bcrypt.compare(password, pass);
	if(match){
		const data  = await user.findOneAndUpdate({email: email}, {loginstatus: "true"}, {new: true}).exec()
		res.json({"status": "Success", "message": "Login successfully","data":data});
	}else{
		res.json({"status": "Failed", "message": "Username or password wrong"});
	}
}




// forget password
async function forgetPassword(req,res) {
	try{
		let email = req.body.email;
		let NewPassword = req.body.password;
		let users = await user.findOne({"email": email}).exec();
		let salt = await bcrypt.genSalt(10);
		let pass = bcrypt.hashSync(NewPassword, salt);
		const data  = await user.findOneAndUpdate({email: email}, {password: pass}, {new: true}).exec()
		res.json({"status": "Success", "message": "Password changed", "data": data});
	}catch(err){
		res.json({"status": "Failed", "message": err.message});
	}

};

// Reset Password
async function resetPassword(req,res) {
	
	let email = req.body.email;
	let oldpassword = req.body.password;
	let NewPassword = req.body.new_password;
	let users = await user.findOne({"email": email}).exec();
	let pass = users.password;
	let match = await bcrypt.compare(oldpassword, pass);
	if(!match){
		res.json({"status": "Failed", "message": "Please enter the correct password"});
	}else{
		let salt = await bcrypt.genSalt(10);
		let pass = bcrypt.hashSync(NewPassword, salt);
		const data  = await user.findOneAndUpdate({email: email}, {password: pass}, {new: true}).exec()
		res.json({"status": "Success", "message": "Password changed", "data": data});
	}
}

// logout
async function logout(req,res,next) {
	let email = req.body.email;
	let data = await user.findOneAndUpdate({email: email}, {loginstatus: "false"}, {new: true}).exec();
	res.json({"status": "Success", "message": "logout successfully","data":data});
}

///get food
async function getTheFoodDetails(req,callback) {
	await food.find().exec().then((data)=>{
		callback(data);
	})
}

//create a order
async function createOrder(req,res) {

		 let email = req.body.user_email;
		 let uuid = req.body.uuid;
		 let dish_count = req.body.dish_count;
		 let users = await user.findOne({"email": email}).exec();
		 console.log(users);
		 let userData = {
			"user_email": users.email,
			"user_name": users.name,
			"user_uuid" : users.uuid
		 }
		let foodDetail = await food.findOne({ "uuid" : uuid});
		console.log(foodDetail)
		let foodData ={
		    "Food_category": foodDetail.category,
			"Food_uuid" :foodDetail.uuid,
			"dish_name": foodDetail.dish_name,
			"dish_price":foodDetail.dish_price,
			"dish_image_uri":foodDetail.image_uri
		}
		// let dishName = foodDetail.dish_name;
		// let dishPrice =foodDetail.dish_price;
		// let dishId =  foodDetail._id;
		// let imageUri = foodDetail.image_uri;
		let datas = {
			"email_id": users.email,
			"user_detail": userData,
			"food_detail": foodData,
			"dish_count": dish_count,
			"approve_status" :"false" 
		};
		
		if(!users){

			res.json({"status": "Failed", "message": "You are not authorised user!"});
		}else{

			if(!foodDetail){
				res.json({"status": "Failed", "message": "Food not available"});
	
			  }else{
				//console.log(foodDtetail);
				let placeOrder = new orders(datas);
				placeOrder.save().then((data)=>{
				   console.log(data);
				   let details = {
					from: email,
					to: "baladummyemail@gmail.com",
					subject: "Recieved an order from Food Park",
					text: "Order recived"+"\nOrderId: "+data.uuid+"\nUser Name: "+ users.name+"\nUser Email: "+users.email+"\n\nDish Category: "+ foodDetail.category +"\nDish Name: "+foodDetail.dish_name+"\nDish Price: "+ foodDetail.dish_price
				}
				let detailuser = {
					from: "baladummyemail@gmail.com",
					to: email,
					subject: "Order registred",
					text: "Your order successfully recived"+"\nOrderId: "+data.uuid+"\nThank you. Regards Food park"
			
				}
				   sendMail(details);
				   sendMail(detailuser);
				   res.json({"status": "Success", "message": "Your order registered successfully","data":data});
			   })
			  
		
			}
		}
		  
	}	

//cancel a order
	async function  cancelOrder(req,res){
		let email = req.body.user_email;
		let uuid = req.body.order_uuid;
		const order_detail = await orders.find({"uuid": uuid}).exec();
		console.log(order_detail)
		let details = {
			from: "baladummyemail@gmail.com",
			to: email,
			subject: "Order Canceled",
			text: "Your order is Canceled.."
		}
		if(!order_detail){
        	res.json({"status": "Failed", "message": "order does not exist"});
		}else{
			let email1 = order_detail[0].user_detail.user_email;
			console.log(email1)
			if(email1==email){
				 let remove = await orders.findOneAndRemove(uuid)
				 if(remove){
					sendMail(details);
					res.json({"status": "Success", "message": "sucessss","data":remove});
				 }else{
					res.json({"status": "Failed", "message": "failed"});
				 }
				
			}else{
				res.json({"status": "Failed", "message": " you Can't canceled the order"});

			}
		   
		}

	}

	//mail function
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