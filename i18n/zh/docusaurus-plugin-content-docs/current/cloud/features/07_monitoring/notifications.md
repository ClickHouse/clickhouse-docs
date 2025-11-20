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

1. **通知类别（Notification category）**：指一组通知，例如计费通知、服务通知等。在每个类别中，有多种通知可以单独配置其投递方式。
2. **通知严重性（Notification severity）**：通知严重性可以是 `info`、`warning` 或 `critical`，具体取决于通知的重要程度。该属性不可配置。
3. **通知渠道（Notification channel）**：通知渠道指接收通知的方式，例如 UI、电子邮件、Slack 等。对于大多数通知，该项是可配置的。


## 接收通知 {#receiving-notifications}

通知可以通过多种渠道接收。目前,ClickHouse Cloud 支持通过电子邮件、ClickHouse Cloud UI 和 Slack 接收通知。您可以点击左上角菜单中的铃铛图标查看当前通知,这将打开一个弹出面板。点击弹出面板底部的 **查看全部** 按钮将跳转到显示所有通知活动日志的页面。

<Image
  img={notifications_1}
  size='md'
  alt='ClickHouse Cloud 通知弹出面板'
  border
/>

<Image
  img={notifications_2}
  size='md'
  alt='ClickHouse Cloud 通知活动日志'
  border
/>


## 自定义通知 {#customizing-notifications}

对于每个通知,您可以自定义接收通知的方式。您可以从通知弹出面板或通知活动日志的第二个选项卡访问设置界面。

Cloud 用户可以自定义通过 Cloud UI 接收的通知,这些自定义设置针对每个用户单独生效。Cloud 用户还可以自定义发送到自己邮箱的通知,但只有具有管理员权限的用户才能自定义发送到自定义邮箱和 Slack 频道的通知。

要配置特定通知的发送方式,请点击铅笔图标修改通知发送渠道。

<Image
  img={notifications_3}
  size='md'
  alt='ClickHouse Cloud 通知设置界面'
  border
/>

<Image
  img={notifications_4}
  size='md'
  alt='ClickHouse Cloud 通知发送设置'
  border
/>

:::note
某些**必需**通知(如**付款失败**)不可配置。
:::


## 支持的通知 {#supported-notifications}

目前，我们会发送与账单相关的通知（如支付失败、使用量超过特定阈值等），以及与扩缩容事件相关的通知（如扩缩容完成、扩缩容受阻等）。
