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
      path: '/main/latest-news',
      handler: 'main.getLatestNews',
     },
    {
      method: 'POST',
      path: '/main/expo-users',
      handler: 'main.createExpoUser',
    },
    {
      method: 'GET',
      path: '/main/expo-users/:expoPushToken',
      handler: 'main.getExpoUserByToken',
    },
    {
      method: 'GET',
      path: '/main/devices',
      handler: 'main.getDevices',
    },
  ],
};
