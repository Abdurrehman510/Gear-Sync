import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema<IService> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide service description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide service price'],
      min: [0, 'Price must be a positive number'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide service duration (minutes)'],
      min: [10, 'Duration must be at least 10 minutes'],
      default: 60,
    },
    category: {
      type: String,
      required: [true, 'Please provide service category'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide service image path'],
      default: '/assets/images/services-1.png',
    },
  },
  {
    timestamps: true,
  }
);

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
