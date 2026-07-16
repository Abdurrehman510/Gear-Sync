import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IService } from './Service';

export interface IAppointment extends Document {
  customer: mongoose.Types.ObjectId | IUser;
  service: mongoose.Types.ObjectId | IService;
  mechanic?: mongoose.Types.ObjectId | IUser;
  date: Date;
  timeSlot: string; // e.g., '09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must belong to a customer'],
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Appointment must be for a service'],
    },
    mechanic: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      required: [true, 'Please select a date for the appointment'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
      enum: {
        values: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        message: 'Invalid time slot selected. Choose from: 09:00 AM, 11:00 AM, 02:00 PM, 04:00 PM',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compounding unique index to ensure a client can't book the same slot twice,
// and preventing double-booking of a single slot for the same service (optional limit)
// For simplicity, we check this in the route handler so we can give friendly validation errors.

const Appointment: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
