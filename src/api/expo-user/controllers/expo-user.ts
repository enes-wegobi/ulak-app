/**
 * expo-user controller
 */

import {factories} from '@strapi/strapi'

export default factories.createCoreController('api::expo-user.expo-user', ({ strapi }) =>  ({
  async create(data: any) {
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


}));
