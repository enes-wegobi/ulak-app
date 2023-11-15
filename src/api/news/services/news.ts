/**
 * news service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::news.news', ({ strapi }) =>  ({
      async findOne(entityId, params) {

        if(params.populate){
            if (!params.populate.includes("categories")) {
                params.populate += ",categories";
              }
        }else{
            params.populate = "categories";
        }

        const result = await super.findOne(entityId, params);
        if(result){
            this.increaseNewsViewCount(result.id, result.viewCount);
            result.categories.forEach(async category => {
                this.increaseCategoryViewCount(category.id, category.viewCount);
            });
        }
        return result;
      },
      increaseNewsViewCount(newsId, oldViewCount){
        strapi.entityService.update('api::news.news', newsId, {
            data: {
              viewCount: parseInt(oldViewCount) + 1,
            },
        });
      },
      increaseCategoryViewCount(categoryId, oldViewCount){
        strapi.entityService.update('api::category.category', categoryId, {
            data: {
              viewCount: parseInt(oldViewCount) + 1,
            },
        });
      }
})
);
