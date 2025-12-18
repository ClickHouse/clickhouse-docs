---
title: '通知'
slug: /cloud/notifications
description: 'ClickHouse Cloud 服务通知'
keywords: ['cloud', 'notifications']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud 会发送与你的服务或组织相关的关键事件通知。要理解通知是如何发送和配置的，需要牢记以下几个概念：

1. **通知类别（Notification category）**：指一组通知，例如计费通知、服务通知等。在每个类别中，都有多种通知可以单独配置其投递方式。
2. **通知严重性（Notification severity）**：通知的严重性可以为 `info`、`warning` 或 `critical`，具体取决于该通知的重要程度。此项不可配置。
3. **通知渠道（Notification channel）**：渠道指接收通知的方式，例如用户界面（UI）、电子邮件、Slack 等。对于大多数通知，此项是可配置的。


## 接收通知 {#receiving-notifications}

可以通过多种渠道接收通知。目前，ClickHouse Cloud 支持通过电子邮件、ClickHouse Cloud UI 和 Slack 接收通知。您可以点击左上角菜单中的铃铛图标查看当前通知，这会打开一个侧边弹出面板。点击该面板底部的 **View All** 按钮，即可进入一个页面，查看所有通知的活动日志。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud 通知弹出面板" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud 通知活动日志" border/>

## 自定义通知 {#customizing-notifications}

对于每条通知，你可以自定义接收该通知的方式。你可以通过通知弹出面板，或者在通知活动日志的第二个选项卡中进入设置界面。

你可以自定义通过 Cloud UI 发送的通知，这些自定义设置会针对每个用户单独生效。你也可以自定义发送到自己邮箱的通知，但只有具有管理员权限的用户才能自定义发送到自定义邮箱地址以及 Slack 频道的通知。

要为某条特定通知配置投递方式，点击铅笔图标以修改该通知的投递渠道。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud 通知设置界面" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud 通知投递设置" border/>

:::note
某些**必需的**通知（例如 **Payment failed**）不可配置。
:::

## 支持的通知 {#supported-notifications}

目前，我们会发送与计费相关的通知（支付失败、使用量超过预设阈值等），以及与扩缩容事件相关的通知（扩缩容完成、扩缩容被阻止等）。