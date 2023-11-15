/**
 * A set of functions called "actions" for `main`
 */
import { Context } from 'koa';

module.exports = {
  async getCategories(ctx: Context) {
    try {
      let { page, pageSize } = ctx.query;
      page = typeof page !== 'string' ? '1' : page
      pageSize = typeof pageSize !== 'string' ? '1' : pageSize

      const categories = await strapi.entityService.findMany('api::category.category', {
        populate:['image'],
        fields: ['id', 'name']
      });    
      ctx.send(categories);
    } catch (error) {
      ctx.badRequest(error);
    }
  },
  
 
  async getNews(ctx: Context) {
    try {
      let { page, pageSize, isCategoryFeatured } = ctx.query;
      let category: string = ctx.query.category as string;
      let filters;
      if(category && isNaN(parseInt(category))){
        return ctx.badRequest('Invalid parameters');
      }

      page = typeof page !== 'string' ? '1' : page
      pageSize = typeof pageSize !== 'string' ? '1' : pageSize

      if (!category || isNaN(parseInt(category))) {
        if(isCategoryFeatured){
          filters = {
              isCategoryFeatured: {
                $eq: isCategoryFeatured === 'true',
              }
          }
        }else{
          filters = undefined;
        }
      }else{
        if(typeof isCategoryFeatured !== 'string'){
          filters= {
            categories: {
              id: {
                $eq: parseInt(category)
              }
            } 
          }
        }else {
          filters = {          
            $and:[
            {
                categories: {
                  id: {
                    $eq: parseInt(category)
                  }
                } 
            },
            {
              isCategoryFeatured: {
                $eq: isCategoryFeatured === 'true',
              }
            }
          ]}
        }
  
      }
   

      const newsByCategory = await strapi.entityService.findPage('api::news.news', {
        page: parseInt(page),
        pageSize:parseInt(pageSize),
        filters: filters
      });    
      ctx.send(newsByCategory);
    } catch (error) {
      ctx.badRequest(error);
    }
  },
  async getMainContents(ctx: Context) {
    const homeFeaturedNews = await strapi.entityService.findMany('api::news.news', {
      filters: {
          isHomeFeatured: {
            $eq: true,
          },
      },
      fields:['id','title'],
      populate: ["image"],
    });

    const recentlyAddedNews = await strapi.entityService.findMany('api::news.news', {
      sort: ['createdAt:desc'],
      limit: 5,
    });

    const categories = await strapi.entityService.findMany('api::category.category', {
      fields:["name", "id"],
    })

    const categoryNews = await strapi.entityService.findMany('api::category.category', {
      limit: 5,
      populate: { 
        newses: {
          populate: ["image"],
          fields: ["title", "createdAt"]
        } 
      },
      filters: {
        isFirstToShow: {
          $eq: true,
        },
      },
    })
    return ctx.send({
      homeFeaturedNews,
      categoryNews,
      recentlyAddedNews,
      categories
    })
  },
};