---
title: 'Notifications'
slug: /cloud/notifications
description: 'Notifications for your ClickHouse Cloud service'
keywords: ['cloud', 'notifications', 'alerts', 'service notifications', 'billing notifications']
sidebar_label: 'Notifications'
sidebar_position: 3
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

# Notifications

ClickHouse Cloud sends notifications about critical events related to your service or organization. There are a few concepts to keep in mind to understand how notifications are sent and configured:

1. **Notification category**: Refers to groups of notifications such as billing notifications, service related notifications etc. Within each category, there are multiple notifications for which the delivery mode can be configured.
2. **Notification severity**: Notification severity can be `info`, `warning`, or `critical` depending on how important a notification is. This isn't configurable.
3. **Notification channel**: Channel refers to the mode by which the notification is received such as UI, email, Slack etc. This is configurable for most notifications.

## Receiving notifications {#receiving-notifications}

Notifications can be received via various channels. ClickHouse Cloud supports receiving notifications through email, ClickHouse Cloud UI, and Slack. You can click on the bell icon in the top left menu to view current notifications, which opens a flyout. Clicking the button **View All** at the bottom of the flyout will take you to a page that shows an activity log of all notifications.

<Image img={notifications_1} size="md" alt="ClickHouse Cloud notifications flyout" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud notifications activity log" border/>

## Customizing notifications {#customizing-notifications}

For each notification, you can customize how you receive the notification. You can access the settings screen from the notifications flyout or from the second tab on the notifications activity log.

You can customize notifications delivered via the Cloud UI, and these customizations are reflected for each individual user. You can also customize notifications delivered to your own emails, but only users with admin permissions can customize notifications delivered to custom emails and notifications delivered to Slack channels.

To configure delivery for a specific notification, click on the pencil icon to modify the notification delivery channels.

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
Certain **required** notifications such as **Payment failed** aren't configurable.
:::

## Service notifications {#service-notifications}

ClickHouse sends service notifications when a certain alert condition is triggered. See below for more information on service notifications for ClickHouse Cloud:

| Notify when | Specific alert condition | Default notification channels | Resolution steps |
|---|---|---|---|
| Cluster can not be scaled up | When recommended cluster size exceeds vertical scaling maximum limit. New notification is generated when recommended cluster size changes. | | Consider raising maximum size per replica autoscaling limit. See [scaling](/cloud/manage/scaling). |
| Too many parts error | When 'too many parts' error is detected. Notification will only trigger once per calendar day. | Administrator users will receive an email. | Consider batching inserts. See [Exception: Too many parts](/knowledgebase/exception-too-many-parts). |
| Failed mutations | When a mutation is in a failed state for 15 mins. Notification will only trigger once per calendar day. | Administrator users will receive an email. | Kill failed mutation. See [Avoid mutations](/best-practices/avoid-mutations). |
| High query concurrency | When query concurrency exceeds 1,000 per replica. Notification will only trigger once per calendar day. | Administrator users will receive an email. | Consider adding replicas. |
| Cluster scaling completed | When a cluster's size changes. | | N/A |
| Cluster can not be scaled down | When recommended cluster size exceeds vertical scaling maximum limit. New notification is generated when recommended cluster size changes. | | Consider lowering minimum size per replica autoscaling limit. See [scaling](/cloud/manage/scaling). |
| ClickHouse version changed | When ClickHouse service version update is beginning, and when it has completed. | | N/A |

## ClickPipes notifications {#clickpipes-notifications}

ClickHouse sends ClickPipes notifications when a certain alert condition is triggered. See below for more information on ClickPipes notifications for ClickHouse Cloud:

| Notify when | Specific alert condition | Default notification channels | Resolution steps |
|---|---|---|---|
| … | … | … | … |

## Billing notifications {#billing-notifications}

ClickHouse sends billing notifications when a certain alert condition is triggered. See below for more information on billing notifications for ClickHouse Cloud:

| Notify when | Specific alert condition | Default notification channels | Resolution steps |
|---|---|---|---|
| … | … | … | … |

## Supported notifications {#supported-notifications}

Currently, we send out notifications related to billing (payment failure, usage exceeded a certain threshold, etc.) as well as notifications related to scaling events (scaling completed, scaling blocked etc.).

## Related pages {#related}

- [Cloud Console monitoring](/cloud/monitoring/cloud-console) — Built-in dashboards for service health, resources, and query performance
- [Monitoring overview](/cloud/monitoring) — Compare all monitoring approaches for ClickHouse Cloud
