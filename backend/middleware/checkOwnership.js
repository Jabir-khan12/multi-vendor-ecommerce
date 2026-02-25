import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Middleware factory to verify resource ownership
 * Usage: app.put('/api/products/:id', authMiddleware, vendorMiddleware, checkOwnership('product'), handler)
 * 
 * Supports:
 * - 'product': Verify vendor owns product
 * - 'order': Verify customer owns order or vendor has items in order
 */
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.resourceId;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID not provided.'
        });
      }

      if (resourceType === 'product') {
        const product = await Product.findById(resourceId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found.'
          });
        }

        // Verify vendor owns this product
        if (product.vendorId.toString() !== req.vendor.vendorId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this product.'
          });
        }

        req.resource = product;
      } else if (resourceType === 'order') {
        const order = await Order.findById(resourceId);

        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found.'
          });
        }

        // For customers: verify they own the order
        if (req.user.role === 'customer') {
          if (order.customerId.toString() !== req.user.userId) {
            return res.status(403).json({
              success: false,
              message: 'You do not have permission to access this order.'
            });
          }
        }
        // For vendors: verify they have items in this order
        else if (req.user.role === 'vendor') {
          const hasItems = order.items.some(
            item => item.vendorId.toString() === req.vendor.vendorId.toString()
          );

          if (!hasItems) {
            return res.status(403).json({
              success: false,
              message: 'You do not have items in this order.'
            });
          }
        }

        req.resource = order;
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying resource ownership.'
      });
    }
  };
};

export default checkOwnership;
