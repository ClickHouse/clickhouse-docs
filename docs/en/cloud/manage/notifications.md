---
title: Notifications
slug: /en/cloud/notifications
description: Notifications for your ClickHouse Cloud service
keywords: [cloud, notifications]
---

ClickHouse Cloud sends notifications about critical events related to your service or organization. There are a few concepts to keep in mind to understand how notifications are sent and configured:

1. **Notification category**: Refers to groups of notifications such as billing notifications, service related notifications etc. Within each category, there are multiple notifications for which the delivery mode can be configured.
2. **Notification severity**: Notification severity can be `info`, `warning`, or `critical` depending on how important a notification is. This is not configurable.
3. **Notification channel**: Channel refers to the mode by which the notification is received such as UI, email, Slack etc. This is configurable for most notifications.

## Receiving Notifications

Notifications can be received via various channels. For now, ClickHouse Cloud supports receiving notifications through email and ClickHouse Cloud UI.  You can click on the bell icon in the top left menu to view current notifications, which opens a flyout. Clicking the button **View All** the bottom of the flyout will take you to a page that shows an activity log of all notifications.

<br />

<img src={require('./images/notifications-1.png').default}    
  class="image"
  alt="Configure backup settings"
  style={{width: '600px'}} />

<br />

<img src={require('./images/notifications-2.png').default}    
  class="image"
  alt="Configure backup settings"
  style={{width: '600px'}} />

## Customizing Notifications

For each notification, you can customize how you receive the notification. You can access the settings screen from the notifications flyout or from the second tab on the notifications activity log.

To configure delivery for a specific notification, click on the pencil icon to modify the notification delivery channels.  

<br />

<img src={require('./images/notifications-3.png').default}    
  class="image"
  alt="Configure backup settings"
  style={{width: '600px'}} />

<br />

<img src={require('./images/notifications-4.png').default}    
  class="image"
  alt="Configure backup settings"
  style={{width: '600px'}} />

<br />

:::note
Certain **required** notifications such as **Payment failed** are not configurable.
:::

## Supported Notifications

Currently, we send out notifications related to billing (payment failure, usage exceeded ascertain threshold, etc.) as well as notifications related to scaling events (scaling completed, scaling blocked etc.). In future, we will add notifications for backups, ClickPipes, and other relevant categories.
