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
  ],
};
