---
'title': '通知'
'slug': '/cloud/notifications'
'description': '您在 ClickHouse Cloud 服务的通知'
'keywords':
- 'cloud'
- 'notifications'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud 发送与您的服务或组织相关的重要事件通知。理解通知的发送和配置有几个概念需要牢记：

1. **通知类别**：指通知的组，例如账单通知、服务相关通知等。在每个类别内，有多个通知可以配置传递方式。
2. **通知严重性**：通知严重性可以是 `info`、`warning` 或 `critical`，这取决于通知的重要性。这是不可配置的。
3. **通知渠道**：渠道指接收通知的方式，例如 UI、电子邮件、Slack 等。大多数通知可配置此项。

## 接收通知 {#receiving-notifications}

通知可以通过各种渠道接收。目前，ClickHouse Cloud 支持通过电子邮件、ClickHouse Cloud UI 和 Slack 接收通知。您可以点击左上角菜单中的铃铛图标查看当前通知，这将打开一个弹出窗口。点击弹出窗口底部的 **查看所有** 按钮将带您访问显示所有通知活动日志的页面。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud notifications flyout" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud notifications activity log" border/>

## 自定义通知 {#customizing-notifications}

对于每个通知，您可以自定义接收通知的方式。您可以通过通知弹出窗口或通知活动日志的第二个选项卡访问设置界面。

Cloud 用户可以自定义通过 Cloud UI 发送的通知，这些自定义反映在每个用户身上。Cloud 用户还可以自定义发送到自己电子邮件的通知，但只有具备管理员权限的用户才能自定义发送到自定义电子邮件地址的通知和发送到 Slack 渠道的通知。

要为特定通知配置传递方式，请点击铅笔图标以修改通知传递渠道。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
某些 **必需** 通知，例如 **支付失败**，是不可配置的。
:::

## 支持的通知 {#supported-notifications}

目前，我们发送与账单相关的通知（支付失败、使用超出确认阈值等），以及与扩展事件相关的通知（扩展完成、扩展被阻止等）。
