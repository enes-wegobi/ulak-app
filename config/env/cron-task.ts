import { Expo } from 'expo-server-sdk';

const cronSchedule = process.env.EXPO_CRON_SCHEDULE;

export default {
  sendNotification: {
    task: async ({strapi}) => {
      console.log(`sendNotification started`);


      const expoUsers = await strapi.entityService.findMany('api::expo-user.expo-user', {
        filters: {
          isNotificationAllowed: true
        },
        fields: ['expoPushToken'],
      });

      let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

      let messages = [];
      for (let expoUser of expoUsers) {

        if (!Expo.isExpoPushToken(expoUser.expoPushToken)) {
          console.error(`Push token ${expoUser.expoPushToken} is not a valid Expo push token`);
          continue;
        }

        messages.push({
          to: expoUser.expoPushToken,
          sound: 'default',
          body: 'This is a test notification',
          data: { withSome: 'data' },
        })
      }

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      await (async () => {
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error(error);
          }
        }
      })();
    },
    options: {
      // Every minute
      rule:cronSchedule,
    },
  },

};
