const express = require("express");
const router = express.Router();
const adminService = require("./admin.service.js");

//routers
router.post('/addFoodDetails', addFoodDetails);
router.get("/getTheFoodDetails", getTheFoodDetails);
router.put("/updateTheFoodDetails", updateTheFoodDetails);
router.delete("/deleteTheFoodDetails", deleteTheFoodDetails);
router.get("/getOrdersDetails", adminService.getOrdersDetails);
router.put("/approveOrder", adminService.approveOrder);
router.delete("/cancelOrder", adminService.cancelOrder);

module.exports = router;

// add the food 
function addFoodDetails(req,res,next) {
	adminService.addFoodDetails(req.body, function(result){
		res.json({"status": "Success", "message": "Food details successfully stored", "data": result})
	})
};

// get the user detail
function getTheFoodDetails(req,res,next) {
	adminService.getTheFoodDetails(req.body, function(result){
		res.json({"status": "Success", "message": "Food details fetched successfully", "data": result});
	})
}

// update the food details
function updateTheFoodDetails(req,res, next) {
	adminService.updateTheFoodDetails(req.body, function(result){
		if(result){
			res.json({"status": "Success", "message": "Food details updated successfully", "data": result})

		}else{
			res.json({"status": "Failed", "message": "id Missing", "data": result})

		}
	})
}

//Delete the Food details
function deleteTheFoodDetails(req,res, next) {
	adminService.deleteTheFoodDetails(req.body, function(result){
		if(result){
			res.json({"status": "Success", "message": "food details deleted successfully","data":result});

		}else{
			res.json({"status": "Failed", "message": "Missing uuid"});

		}
	})
}
