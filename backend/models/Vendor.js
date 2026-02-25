import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeName: { type: String, required: true },
    description: { type: String },
    logo: { type: String }, // URL or path
    coverImage: { type: String },
    category: { type: String },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    verificationNotes: { type: String },
    rejectionReason: { type: String },
    isSuspended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for common queries
vendorSchema.index({ userId: 1 });
vendorSchema.index({ verificationStatus: 1 });

export default mongoose.model('Vendor', vendorSchema);
