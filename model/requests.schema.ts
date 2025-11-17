import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRequestByUser extends Document {
  name: string;
  phone: string;
  title: string;
  image?: string;
  timestamp: Date;
}

const UserRequestSchema = new Schema<IRequestByUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now, 
    },
  },
  { timestamps: false }
);

const UserRequest: Model<IRequestByUser> =
  mongoose.models.UserRequest ||
  mongoose.model<IRequestByUser>("UserRequest", UserRequestSchema, "request");

export default UserRequest;
