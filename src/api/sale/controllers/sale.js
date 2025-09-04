'use strict';

/**
 *  sale controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::sale.sale', ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;
    const { product: productId, quantity } = data || {};

    if (!productId || !quantity) {
      return ctx.badRequest('product and quantity are required');
    }

    const product = await strapi.entityService.findOne('api::product.product', productId, { fields: ['price', 'stock'] });
    if (!product) {
      return ctx.badRequest('Product not found');
    }
    if (product.stock < quantity) {
      return ctx.badRequest('Insufficient stock');
    }

    const total = Number(product.price) * quantity;

    const sale = await strapi.entityService.create('api::sale.sale', {
      data: {
        ...data,
        total,
      },
    });

    await strapi.entityService.update('api::product.product', productId, {
      data: {
        stock: product.stock - quantity,
      },
    });

    const sanitized = await this.sanitizeOutput(sale, ctx);
    return this.transformResponse(sanitized);
  }
}));
