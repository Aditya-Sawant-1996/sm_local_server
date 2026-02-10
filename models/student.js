const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		middleName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		fullNameMarathi: {
			type: String,
			trim: true,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Other"],
			required: true,
		},
		dateOfBirth: {
			type: Date,
			required: true,
		},
		age: {
			type: Number,
			required: true,
			min: 1,
		},
		bloodGroup: {
			type: String,
			trim: true,
		},
		nationality: {
			type: String,
			trim: true,
			default: "Indian",
		},
		class: {
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

