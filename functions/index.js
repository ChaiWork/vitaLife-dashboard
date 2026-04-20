const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Triggered when a new notification is added to any user's subcollection.
 * Uses Firebase Functions v2 syntax for better performance and debugging.
 */
exports.sendPushNotification = onDocumentCreated('users/{userId}/notifications/{notificationId}', async (event) => {
    const userId = event.params.userId;
    const snapshot = event.data;
    
    if (!snapshot) {
      console.log("No data associated with the event");
      return null;
    }

    const notification = snapshot.data();

    // 1. Fetch the user profile from the root collection
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`No user doc found for ${userId}`);
      return null;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token found for user ${userId}. Skipping push.`);
      return null;
    }

    // 2. Construct the push message
    const isEmergency = notification.type === 'emergency';
    
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        type: notification.type || 'info',
        notificationId: snapshot.id,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: isEmergency ? 'high' : 'normal',
        notification: {
          channelId: isEmergency ? 'emergency_alerts' : 'general_alerts',
          sound: isEmergency ? 'emergency_siren' : 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.message,
            },
            sound: isEmergency ? 'emergency_siren.caf' : 'default',
            badge: 1,
          },
        },
      },
    };

    // 3. Send the message
    try {
      const response = await admin.messaging().send(message);
      console.log(`Successfully sent push to ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`Error sending push to ${userId}:`, error);
      
      // Clean up invalid tokens
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token') {
        await admin.firestore().collection('users').doc(userId).update({ 
          fcmToken: admin.firestore.FieldValue.delete() 
        });
        console.log(`Removed invalid token for user ${userId}`);
      }
      return null;
    }
  });

/**
 * Technical Implementation Guide for Flutter:
 * 
 * 1. In your Flutter app, use the 'firebase_messaging' package.
 * 2. On app start, request permission and get the token:
 *    FirebaseMessaging.instance.getToken().then((token) => {
 *      // Save this token to your user document in Firestore field 'fcmToken'
 *    });
 * 3. Use 'flutter_local_notifications' to handle foreground display and sound channels.
 */
