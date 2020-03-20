"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");
module.exports = {
  async find(ctx) {
    let entities;
    let perPage = ctx.query._limit || 3;
    let currentPage = ctx.query.page || 1;
    ctx.query._limit = perPage * ctx.query.page;
    if (ctx.query.page) {
      delete ctx.query.page;
      delete ctx.query.limit;
    }
    if (ctx.query._q) {
      entities = await strapi.services.smartphones.search(ctx.query);
    } else {
      entities = await strapi.services.smartphones.find(ctx.query.params);
    }

    let res = entities.map(entity => {
      return sanitizeEntity(entity, { model: strapi.models.smartphones });
    });

    let total = res.length;
    let totalPages = Math.ceil(total / perPage);

    if (currentPage == 0 || currentPage < 0 || currentPage > totalPages) {
      return ctx.throw(404, "page not found");
    } else {
      ctx.set({
        "Access-Control-Expose-Headers": "X_TotalPages",
        X_TotalPages: totalPages
      });
      let end = perPage * currentPage;
      let start = end - perPage;
      return res.slice(start, end);
    }
  },
  async filter() {
    let filter_values = {
      display_sizes: [],
      series: [],
      memory_models: [],
      brands: []
    };
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    let entities = await strapi.services.smartphones.find();

    let res = entities.map(entity => {
      return sanitizeEntity(entity, { model: strapi.models.smartphones });
    });
    res.map(item => {
      filter_values.display_sizes.push(item.display_size);
      filter_values.series.push(item.series);
      filter_values.memory_models.push(item.internal_memory);
      filter_values.brands.push(item.brand);
      return filter_values;
    });
    let filter = {
      display_sizes: filter_values.display_sizes.filter(onlyUnique),
      series: filter_values.series.filter(onlyUnique),
      memory_models: filter_values.memory_models.filter(onlyUnique),
      brands: filter_values.brands.filter(onlyUnique)
    };
    return filter;
  }
};
