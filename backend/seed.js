import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Vendor from './models/Vendor.js';
import User from './models/User.js';

dotenv.config();

const PRODUCTS = [
    {
        name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
        description: "Leading noise cancellation with two processors controlling 8 microphones, and ultra-comfortable lightweight design.",
        price: 398.00,
        oldPrice: 420.00,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"],
        stock: 50,
        rating: 4.8,
        reviewsCount: 1245,
        featured: true
    },
    {
        name: "Minimalist Ceramic Coffee Dripper",
        description: "Handcrafted ceramic pour-over coffee dripper for the perfect morning brew.",
        price: 45.00,
        category: "Home & Kitchen",
        images: ["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800"],
        stock: 100,
        rating: 4.9,
        reviewsCount: 86,
        featured: true
    },
    {
        name: "Pro Series DSLR Camera Backpack",
        description: "Waterproof, shock-absorbent backpack for professional photographers.",
        price: 129.99,
        oldPrice: 159.99,
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"],
        stock: 30,
        rating: 4.6,
        reviewsCount: 342,
        featured: true
    },
    {
        name: "Organic Cotton Relaxed Fit Sweater",
        description: "Sustainable, soft, and breathable organic cotton sweater.",
        price: 85.00,
        category: "Fashion",
        images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"],
        stock: 75,
        rating: 4.7,
        reviewsCount: 128,
        featured: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for seeding...');

        // Clear existing data
        await Product.deleteMany({});
        await Vendor.deleteMany({});
        await User.deleteMany({});

        // Create a test Vendor User
        const vendorUser = new User({
            name: 'Aiden Tech',
            email: 'vendor@example.com',
            password: 'password123',
            role: 'vendor'
        });
        await vendorUser.save();

        const vendor = new Vendor({
            userId: vendorUser._id,
            storeName: 'Tech Haven',
            category: 'Electronics',
            description: 'Your one-stop shop for premium gadgets.',
            logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
            coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
            isVerified: true
        });
        await vendor.save();

        // Add products with vendor reference
        const productsWithVendor = PRODUCTS.map(p => ({ ...p, vendorId: vendor._id }));
        await Product.insertMany(productsWithVendor);

        console.log('✅ Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }

};

seedDB();
