const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
	{
		// Derived full name for listings/search (e.g. "FirstName SurName")
		name: {
			type: String,
			required: true,
			trim: true,
		},
		surName: {
			type: String,
			required: true,
			trim: true,
		},
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		guardianName: {
			type: String,
			required: true,
			trim: true,
		},
		mothersName: {
			type: String,
			required: true,
			trim: true,
		},
		subject: {
			type: [String],
			required: true,
		},
		batch: {
			type: String,
			trim: true,
		},
		address: {
			type: String,
			required: true,
			trim: true,
		},
		aadhaarNumber: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		mobileNo: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			trim: true,
		},
		birthPlace: {
			type: String,
			required: true,
			trim: true,
		},
		dateOfBirth: {
			type: Date,
			required: true,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
			required: true,
		},
		handicapped: {
			type: String,
			enum: ["Yes", "No"],
			required: true,
		},
		latestEducation: {
			type: String,
			required: true,
			trim: true,
		},
		previousSchoolName: {
			type: String,
			required: true,
			trim: true,
		},
		photo: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Student", studentSchema);

