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
		batchStart: {
			type: Date,
			required: true,
		},
		batchEnd: {
			type: Date,
			required: true,
		},
		address: {
			type: String,
			trim: true,
		},
		aadhaarNumber: {
			type: String,
			trim: true,
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
// Ensure aadhaarNumber is unique only when it is actually provided
// and is a non-empty string. Documents without Aadhaar (or with
// null/empty) will not participate in this index.
studentSchema.index(
	{ aadhaarNumber: 1 },
	{
		unique: true,
		partialFilterExpression: {
			aadhaarNumber: { $type: "string", $ne: "" },
		},
	},
);

// Ensure mobileNo is always unique (mobile number is required).
studentSchema.index({ mobileNo: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);

// Best-effort migration: drop any legacy non-partial Aadhaar index
// that may still be present, so our partial unique index can take effect.
// This runs on startup and is safe if the index does not exist.
Student.collection
	.dropIndex("aadhaarNumber_1")
	.catch(() => {})
	.finally(() => {
		// Ensure indexes match the schema definitions.
		Student.syncIndexes().catch(() => {});
	});

module.exports = Student;

