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
    delete ctx.query._limit;
    if (ctx.query.page) {
      delete ctx.query.page;
      delete ctx.query._limit;
    }

    if (ctx.query._q) {
      entities = await strapi.services.laptops.search(ctx.query);
    } else {
      /* console.log(ctx.query); */
      entities = await strapi.services.laptops.find(ctx.query);
    }

    let res = entities.map((entity) => {
      return sanitizeEntity(entity, { model: strapi.models.laptops });
    });

    let total = res.length;
    let totalPages = Math.ceil(total / perPage);

    if (currentPage == 0 || currentPage < 0 || currentPage > totalPages) {
      return ctx.throw(404, "page not found");
    } else {
      ctx.set({
        "Access-Control-Expose-Headers": "X_TotalPages",
        X_TotalPages: totalPages,
      });
      let end = perPage * currentPage;
      let start = end - perPage;
      return res.slice(start, end);
    }
  },
  async filter() {
    let filter_values = [
      {
        title: "Размер дисплея",
        param: "display_size",
        values: [],
      },
      {
        title: "Серия процессора",
        param: "processor_series",
        values: [],
      },
      {
        title: "Разрешение экрана",
        param: "resolution",
        values: [],
      },
      {
        title: "Бренд",
        param: "brand",
        values: [],
      },
    ];
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    let entities = await strapi.services.laptops.find();

    entities.map((item) => {
      filter_values[0].values.push(item.display_size);
      filter_values[1].values.push(item.processor_series);
      filter_values[2].values.push(item.resolution);
      filter_values[3].values.push(item.brand);
      return filter_values;
    });

    for (let i = 0; i < filter_values.length; i++) {
      filter_values[i].values = filter_values[i].values.filter(onlyUnique);
      /*  console.log(filter_values[i].values); */
    }

    return filter_values;
  },
};
