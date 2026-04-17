import mongoose from 'mongoose';

const tripShareSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    carpoolRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CarpoolRoute',
      default: null,
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes expired documents
tripShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('TripShare', tripShareSchema);