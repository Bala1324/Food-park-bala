const express = require("express");
const router = express.Router();
const userService = require("./user.service.js"); 

// router
router.post("/register", userService.registerUser);
router.get("/login", userService.loginUser);
 router.put("/forgetPassword", userService.forgetPassword);
 router.put("/resetPassword", userService.resetPassword);
 router.put("/logout", userService.logout);
 router.get("/getFoodDetails",getTheFoodDetails);
 router.post("/createOrder",userService.createOrder);
 router.delete("/cancelOrder",userService.cancelOrder);


module.exports = router;

// get the user detail
function getTheFoodDetails(req,res,next) {
	userService.getTheFoodDetails(req.body, function(result){
		if(result){
			res.json({"status": "Success", "message": "Food details fetched successfully", "data": result});
		}else{
			res.json({"status": "Failed", "message": "Failed to get the food details"});
		}
	

	})
}

