import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  actionThread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
  },
  status: {
    type: String,
    enum: ["delete", "active"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;
