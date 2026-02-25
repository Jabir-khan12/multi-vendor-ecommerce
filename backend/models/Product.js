import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { 
        type: Number, 
        required: true,
        min: [0, 'Price must be positive']
    },
    oldPrice: { type: Number },
    category: { type: String, required: true },
    images: [{ type: String }],
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    stock: { 
        type: Number, 
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for common queries
productSchema.index({ vendorId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: 1 });

export default mongoose.model('Product', productSchema);
