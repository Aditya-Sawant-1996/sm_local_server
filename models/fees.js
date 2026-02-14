const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
  {
    selectedStudent: {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      aadhaarNumber: {
        type: String,
        required: true,
        trim: true,
      },
      mobileNo: {
        type: String,
        required: true,
        trim: true,
      },
      subjects: {
        type: [String],
        required: true,
      },
    },
    subjects: {
      type: [String],
      required: true,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    totalFees: {
      type: Number,
      required: true,
      min: 0,
    },
    totalInstallments: {
      type: Number,
      required: true,
      min: 1,
    },
    monthlyInstallments: {
      type: Number,
      required: true,
      min: 0,
    },
    instalmentNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    feesPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Fees", feesSchema);
