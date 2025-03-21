---
title: 'Notifications'
slug: /cloud/notifications
description: 'Notifications for your ClickHouse Cloud service'
keywords: ['cloud', 'notifications']
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud sends notifications about critical events related to your service or organization. There are a few concepts to keep in mind to understand how notifications are sent and configured:

1. **Notification category**: Refers to groups of notifications such as billing notifications, service related notifications etc. Within each category, there are multiple notifications for which the delivery mode can be configured.
2. **Notification severity**: Notification severity can be `info`, `warning`, or `critical` depending on how important a notification is. This is not configurable.
3. **Notification channel**: Channel refers to the mode by which the notification is received such as UI, email, Slack etc. This is configurable for most notifications.

## Receiving Notifications {#receiving-notifications}

Notifications can be received via various channels. For now, ClickHouse Cloud supports receiving notifications through email, ClickHouse Cloud UI, and Slack.  You can click on the bell icon in the top left menu to view current notifications, which opens a flyout. Clicking the button **View All** the bottom of the flyout will take you to a page that shows an activity log of all notifications.

<Image img={notifications_1} size="md" alt="ClickHouse Cloud notifications flyout" border/>


<Image img={notifications_2} size="md" alt="ClickHouse Cloud notifications activity log" border/>


## Customizing Notifications {#customizing-notifications}

For each notification, you can customize how you receive the notification. You can access the settings screen from the notifications flyout or from the second tab on the notifications activity log.

Cloud users can customize notifications delivered via the Cloud UI, and these customizations are reflected for each individual user. Cloud users can also customize notifications delivered to their own emails, but only users with admin permissions can customize notifications delivered to custom emails and notifications delivered to Slack channels.

To configure delivery for a specific notification, click on the pencil icon to modify the notification delivery channels.

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
Certain **required** notifications such as **Payment failed** are not configurable.
:::

## Supported Notifications {#supported-notifications}

Currently, we send out notifications related to billing (payment failure, usage exceeded ascertain threshold, etc.) as well as notifications related to scaling events (scaling completed, scaling blocked etc.).
