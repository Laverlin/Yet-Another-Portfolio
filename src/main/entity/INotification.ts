export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

export interface INotification {
  message: string;
  vriant: NotificationVariant;
  time: Date;
  source: string;
}

export const createNotification = (
  message: string, variant: NotificationVariant = 'success', source = ''): INotification => {
    return {
      message: message,
      vriant: variant,
      time: new Date(),
      source: source
    };
}
