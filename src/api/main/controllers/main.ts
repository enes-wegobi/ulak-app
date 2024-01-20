/**
 * A set of functions called "actions" for `main`
 */
import { Context } from 'koa';
import { DateTime } from 'luxon';

module.exports = {
  async getLatestNews(ctx){
    try {
      const featuredNews = await strapi.entityService.findMany('api::news.news', {
        filters:{
          publishedAt: {
            $gte: DateTime.now().minus({ days: 1 }).toISO()
          }
        },
        sort: 'publishedAt:desc',
        fields: ["id", "title", "publishedAt", "sourceBrand"],
        populate: ["image"],
      });
      ctx.send(featuredNews);
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
    //sourceBrand
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
          $and :[{isHomeFeatured: {$eq: true, },}, {$not: {publishedAt: null}}]
      },
      limit:15,
      sort: ['publishedAt:desc'],
      fields:['id','title', 'sourceBrand'],
      populate: ["image"],
    });

    const recentlyAddedNews = await strapi.entityService.findMany('api::news.news', {
      filters:{ $not:
          {
            publishedAt: null
          }
        },
      sort: ['publishedAt:desc'],
      fields:['id', 'title', 'publishedAt', 'sourceBrand'],
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
          filters: {$not: {publishedAt: null}},
          populate: ["image"],
          fields: ["title", "createdAt", "sourceBrand"],
          sort: ['publishedAt:desc'],
        }
      }
    })
    return ctx.send({
      homeFeaturedNews,
      categoryNews,
      recentlyAddedNews,
      categories
    })
  },
  async createExpoUser(data: any) {
    // @ts-ignore
    const {expoPushToken} = data.request.body.data

    if(expoPushToken){
      const expoUser = await strapi.db.query('api::expo-user.expo-user').findOne({
        select: ["id"],
        where: { expoPushToken: expoPushToken },
        populate: { id: true},
      });
      if(expoUser){
        return await strapi.entityService.update('api::expo-user.expo-user', expoUser.id, {
          data: data.request.body.data
        });
      }

    }
    return await strapi.entityService.create('api::expo-user.expo-user', {
      data: data.request.body.data
    });
  },
  async getExpoUserByToken(ctx) {
    const {expoPushToken} = ctx.params;
    if(expoPushToken){
      const expoUser = await strapi.db.query('api::expo-user.expo-user').findOne({
        select: ["id","isNotificationAllowed","expoPushToken"],
        where: { expoPushToken: expoPushToken },
      });
      return ctx.send(expoUser);
    }
    ctx.badRequest();
  }
};
