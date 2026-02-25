import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentIntentId: String,
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed', 'refunded'],
        default: 'unpaid'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for common queries
orderSchema.index({ customerId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

// Update updatedAt on save
orderSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.model('Order', orderSchema);
