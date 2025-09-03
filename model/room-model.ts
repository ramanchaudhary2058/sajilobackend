import mongoose from "mongoose";
import { room } from "../types";

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  hostelName: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  location: {
    type: String,
  },
  price: {
    type: String,
  },
  frequency: {
    type: String,
  },
  peopleNumber: {
    type: Number,
  },
  totalbed: {
    type: Number,
  },
  email: {
    type: String,
  },
  contact: {
    type: Number,
  },
  ownerEmail: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const roomModel = mongoose.model<room & mongoose.Document>(
  "hostel",
  roomSchema
);

export default roomModel;
