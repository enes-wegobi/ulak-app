import { Expo } from 'expo-server-sdk';

const cronSchedule = process.env.EXPO_CRON_SCHEDULE;

export default {
  sendNotification: {
    task: async ({strapi}) => {
      console.log(`Checking eligible news for notification`);

      const notificationNewses = await strapi.entityService.findMany('api::news.news', {
        filters: {
          isEligibleForNotification: true,
        },
        fields:['id','title'],
        publicationState: 'live'
      })

      if(notificationNewses.length > 0){
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
          for (let news of notificationNewses){
            messages.push({
              to: expoUser.expoPushToken,
              sound: 'default',
              body: news.title,
              data: { news: news.id },
            })
          }
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
        await strapi.db.query("api::news.news").updateMany({
          where: {
            isEligibleForNotification: true,
          },
          data: {
            isEligibleForNotification: false,
          },
        });


      }else {
        console.log(`There is no eligible news for notification`);
      }

    },
    options: {
      // Every minute
      rule:cronSchedule,
    },
  },

};
