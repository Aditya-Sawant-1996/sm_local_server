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
			trim: true,
		},
		aadhaarNumber: {
			type: String,
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
			trim: true,
		},
		dateOfBirth: {
			type: Date,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
		},
		handicapped: {
			type: String,
			enum: ["Yes", "No"],
		},
		latestEducation: {
			type: String,
			trim: true,
		},
		previousSchoolName: {
			type: String,
			trim: true,
		},
		photo: {
			type: String,
			required: true,
			trim: true,
		},
		selectedSubjects: [
			{
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Subject",
					required: true,
				},
				name: {
					type: String,
					required: true,
					trim: true,
				},
			},
		],
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Student", studentSchema);

