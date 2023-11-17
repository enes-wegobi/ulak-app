export default {
  routes: [
     {
      method: 'GET',
      path: '/main/contents',
      handler: 'main.getMainContents',
     },
     {
      method: 'GET',
      path: '/main/news',
      handler: 'main.getNews',
     },
     {
      method: 'GET',
      path: '/main/categories',
      handler: 'main.getCategories',
     },
     {
      method: 'GET',
      path: '/main/news/:id',
      handler: 'main.getNewsById',
     },
     {
      method: 'GET',
      path: '/main/featured-news',
      handler: 'main.getFeaturedNewsByCategory',
     }
  ],
};
