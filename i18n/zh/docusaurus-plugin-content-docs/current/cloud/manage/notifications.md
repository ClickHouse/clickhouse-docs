---
title: 通知
slug: /cloud/notifications
description: 您的 ClickHouse Cloud 服务的通知
keywords: ['cloud', 'notifications']
---

import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud 会发送与您的服务或组织相关的关键事件通知。理解通知的发送和配置需要记住几个概念：

1. **通知类别**：指的是账单通知、服务相关通知等通知的分组。在每个类别中，有多个通知可以配置其传递模式。
2. **通知严重性**：通知的严重性可以是 `info`、`warning` 或 `critical`，具体取决于通知的重要性。这不可配置。
3. **通知渠道**：渠道是指接收通知的模式，如 UI、电子邮件、Slack 等。大多数通知对此是可配置的。

## 接收通知 {#receiving-notifications}

可以通过各种渠道接收通知。目前，ClickHouse Cloud 支持通过电子邮件和 ClickHouse Cloud UI 接收通知。您可以点击左上角菜单中的铃铛图标来查看当前通知，打开一个飞出窗口。点击飞出窗口底部的 **查看所有** 按钮将带您到一个显示所有通知活动日志的页面。

<br />

<img src={notifications_1}
    alt="ClickHouse Cloud 通知飞出窗口"
    class="image"
    style={{width: '600px'}}
/>

<br />

<img src={notifications_2}
    alt="ClickHouse Cloud 通知活动日志"
    class="image"
    style={{width: '600px'}}
/>

## 自定义通知 {#customizing-notifications}

对于每个通知，您可以自定义接收通知的方式。您可以从通知飞出窗口或通知活动日志的第二个标签页访问设置屏幕。

要为特定通知配置传递，点击铅笔图标以修改通知传递渠道。

<br />

<img src={notifications_3}
    alt="ClickHouse Cloud 通知设置屏幕"
    class="image"
    style={{width: '600px'}}
/>

<br />

<img src={notifications_4}
    alt="ClickHouse Cloud 通知传递设置"
    class="image"
    style={{width: '600px'}}
/>

<br />

:::note
某些 **必需** 的通知，如 **支付失败** 是不可配置的。
:::

## 支持的通知 {#supported-notifications}

目前，我们发送与账单（支付失败、使用量超过确定阈值等）相关的通知，以及与扩展事件（扩展完成、扩展被阻止等）相关的通知。未来，我们将添加与备份、 ClickPipes 和其他相关类别的通知。
