import {
  LocalNotificationsPluginWeb,
  WebPlugin,
  LocalNotificationsPlugin,
  NotificationChannel,
  LocalNotification,
  LocalNotificationScheduleResult,
  LocalNotificationActionType,
  LocalNotificationPendingList,
  NotificationChannelList,
  LocalNotificationEnabledResult,
  NotificationPermissionResponse,
} from "@capacitor/core";

export class LocalNotificationsPluginElectron extends WebPlugin
  implements LocalNotificationsPlugin {
  localNotificationsPluginWeb: LocalNotificationsPlugin;

  constructor() {
    super({
      name: "LocalNotifications",
      platforms: ["electron"],
    });

    this.localNotificationsPluginWeb = new LocalNotificationsPluginWeb();
  }

  schedule(options: {
    notifications: LocalNotification[];
  }): Promise<LocalNotificationScheduleResult> {
    return this.localNotificationsPluginWeb.schedule(options);
  }

  getPending(): Promise<LocalNotificationPendingList> {
    return this.localNotificationsPluginWeb.getPending();
  }

  registerActionTypes(options: {
    types: LocalNotificationActionType[];
  }): Promise<void> {
    return this.localNotificationsPluginWeb.registerActionTypes(options);
  }

  cancel(pending: LocalNotificationPendingList): Promise<void> {
    return this.localNotificationsPluginWeb.cancel(pending);
  }

  areEnabled(): Promise<LocalNotificationEnabledResult> {
    return this.localNotificationsPluginWeb.areEnabled();
  }

  createChannel(channel: NotificationChannel): Promise<void> {
    return this.localNotificationsPluginWeb.createChannel(channel);
  }

  deleteChannel(channel: NotificationChannel): Promise<void> {
    return this.localNotificationsPluginWeb.deleteChannel(channel);
  }

  listChannels(): Promise<NotificationChannelList> {
    return this.localNotificationsPluginWeb.listChannels();
  }

  requestPermission(): Promise<NotificationPermissionResponse> {
    return this.localNotificationsPluginWeb.requestPermission();
  }
}

const LocalNotifications = new LocalNotificationsPluginElectron();

export { LocalNotifications };
