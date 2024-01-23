import cronTasks from "../cron-task";

export default ({ env }) => ({
    proxy: true,
    url: env('APP_URL'), // Sets the public URL of the application.
    app: {
      keys: env.array('APP_KEYS')
    },
    admin: {
        // ...
        path: '/admin',
        build: {
          backend: env('ADMIN_BUILD_BACKEND', 'https://ulak-app-ja5wx.ondigitalocean.app'),
        },
    }
});
