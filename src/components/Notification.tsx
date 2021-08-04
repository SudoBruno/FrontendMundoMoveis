import { notification } from 'antd';

interface notificationType {
  type: 'success' | 'error';
  title:string;
  description: string;
}

export function Notification(notificationBody:notificationType) {
  notification[notificationBody.type]({
    message: notificationBody.title,
    description:
        notificationBody.description,
  });
}
