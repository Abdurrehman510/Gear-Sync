import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IService } from './Service';

export interface IReview extends Document {
  customer: mongoose.Types.ObjectId | IUser;
  service: mongoose.Types.ObjectId | IService;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a customer reference'],
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Review must reference a service'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating between 1 and 5'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
  },
  comment: {
    type: String,
    required: [true, 'Please provide feedback comments'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
