/**
 * A set of functions called "actions" for `main`
 */
import { Context } from 'koa';

module.exports = {
  async getFeaturedNewsByCategory(ctx){
    try {
      const page: string = ctx.query.page as string;
      const pageSize: string = ctx.query.pageSize as string;
      const category: string = ctx.query.category as string;
      if (category && isNaN(parseInt(category))) {
        return ctx.badRequest('Invalid category id');
      }
      const parsedPage = parseInt(page || '1');
      const parsedPageSize = parseInt(pageSize || '5');

      let filters: any = {};
      if (category) {
        filters.categories = {
          id: {
            $eq: parseInt(category)
          }
        };
      }

      const featuredNewsByCategory = await strapi.entityService.findPage('api::news.news', {
        page: parsedPage,
        pageSize: parsedPageSize,
        populate: ['image'],
        fields:['id', 'title'],
        filters,
        sort: 'publishedAt:desc'
      });
      ctx.send(featuredNewsByCategory);
    } catch (error) {
      ctx.badRequest();
    }
  },
  async getNewsById(ctx) {
    try {
      const { id } = ctx.params;
      if (id && isNaN(parseInt(id))) {
        return ctx.badRequest('Invalid category id');
      }
      const news = await strapi.entityService.findOne('api::news.news', id, {
        populate: ['image','categories'],
      });   

      if (!news) {
        return ctx.notFound('News not found');
      }
      this.increaseNewsViewCount(news.id, news.viewCount);
      news.categories.forEach(async category => {
          this.increaseCategoryViewCount(category.id, category.viewCount);
      });
      ctx.send(news);
    } catch (error) {
      ctx.badRequest();
    }
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
  },
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
      const { isCategoryFeatured } = ctx.query;
      const category: string = ctx.query.category as string;
      const page: string = ctx.query.page as string;
      const pageSize: string = ctx.query.pageSize as string;
      const search: string = ctx.query.search as string;

      const parsedPage = parseInt(page || '1');
      const parsedPageSize = parseInt(pageSize || '5');
      const isFeatured = isCategoryFeatured === 'true';
      let filters: any = {};
      if(search){
        filters.title = {
            $containsi: search
        };
      }else {
        if (category && isNaN(parseInt(category))) {
          return ctx.badRequest('Invalid category id');
        }
    
        if (category) {
          filters.categories = {
            id: {
              $eq: parseInt(category)
            }
          };
    
          if (isCategoryFeatured) {
            filters.isCategoryFeatured = {
              $eq: isFeatured
            };
          }
        } else if (isCategoryFeatured) {
          filters.isCategoryFeatured = {
            $eq: isFeatured
          };
        }
      }

      const newsByCategory = await strapi.entityService.findPage('api::news.news', {
        page: parsedPage,
        pageSize: parsedPageSize,
        populate: ['image'],
        filters,
        sort: 'publishedAt:desc'
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
      sort: ['publishedAt:desc'],
      fields:['id', 'title', 'publishedAt'],
      populate: ['categories', 'image'],
      limit: 5,
    });

    const categories = await strapi.entityService.findMany('api::category.category', {
      fields:["name", "id"],
      populate: ["image"]
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