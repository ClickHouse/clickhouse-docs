---
title: '通知'
slug: /cloud/notifications
description: '有关您的 ClickHouse Cloud 服务的通知'
keywords: ['云', '通知', '警报', '服务通知', '账单通知']
sidebar_label: '通知'
sidebar_position: 3
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';


# 通知 \{#notifications\}

ClickHouse Cloud 会发送与你的服务或组织相关的关键事件通知。为便于理解通知的发送方式及其配置方式，需要了解以下几个概念：

1. **通知类别**：指通知的分组，例如账单通知、服务相关通知等。每个类别中都包含多种通知，并且可以配置其传递方式。
2. **通知严重性**：通知严重性可以是 `info`、`warning` 或 `critical`，具体取决于通知的重要程度。此项不可配置。
3. **通知渠道**：渠道指接收通知的方式，例如 UI、电子邮件、Slack 等。对于大多数通知，此项可配置。

## 接收通知 \{#receiving-notifications\}

通知可通过多种渠道接收。ClickHouse Cloud 支持通过电子邮件、ClickHouse Cloud UI 和 Slack 接收通知。您可以点击左上角菜单中的铃铛图标查看当前通知，这会打开一个弹出面板。点击弹出面板底部的 **View All** 按钮，将进入一个显示所有通知活动日志的页面。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud 通知弹出面板" border />

<Image img={notifications_2} size="md" alt="ClickHouse Cloud 通知活动日志" border />

## 自定义通知 \{#customizing-notifications\}

对于每条通知，您都可以自定义接收方式。您可以从通知弹出面板或通知活动日志中的第二个选项卡进入设置页面。

您可以自定义通过 Cloud UI 接收的通知，并且这些自定义设置会针对每个用户分别生效。您还可以自定义发送到您自己电子邮箱的通知，但只有具有管理员权限的用户才能自定义发送到自定义电子邮箱地址的通知，以及发送到 Slack 频道的通知。

要为特定通知配置发送方式，请点击铅笔图标以修改通知的发送渠道。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud 通知设置页面" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud 通知发送设置" border/>

:::note
某些**必需**通知（例如 **Payment failed**）无法配置。
:::

## 服务通知 \{#service-notifications\}

当满足特定告警条件时，ClickHouse 会发送服务通知。有关 ClickHouse Cloud 服务通知的更多信息，请参见下文：

| 何时通知             | 具体告警条件                                      | 默认通知渠道        | 处理步骤                                                                         |
| ---------------- | ------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| 集群无法扩容           | 当建议的集群大小超过垂直扩容的最大限制时。当建议的集群大小发生变化时，会生成新的通知。 |               | 可考虑提高每个副本自动扩缩容的最大大小限制。请参见[扩缩容](/manage/scaling)。                             |
| parts 过多错误       | 当检测到“too many parts”错误时。通知每天仅触发一次。          | 管理员用户将收到电子邮件。 | 可考虑对插入进行批处理。请参见[异常：Too many parts](/knowledgebase/exception-too-many-parts)。 |
| 失败的变更            | 当某个变更处于失败状态达到 15 分钟时。通知每天仅触发一次。             | 管理员用户将收到电子邮件。 | 终止失败的变更。请参见[避免 mutations](/best-practices/avoid-mutations)。                  |
| 查询并发过高           | 当每个副本的查询并发数超过 1,000 时。通知每天仅触发一次。            | 管理员用户将收到电子邮件。 | 可考虑添加副本。                                                                     |
| 集群伸缩完成           | 当集群大小发生变化时。                                 |               | 不适用                                                                          |
| 集群无法缩容           | 当建议的集群大小超过垂直扩容的最大限制时。当建议的集群大小发生变化时，会生成新的通知。 |               | 可考虑降低每个副本自动扩缩容的最小大小限制。请参见[扩缩容](/manage/scaling)。                             |
| ClickHouse 版本已更改 | 当 ClickHouse 服务版本更新开始时，以及更新完成时。             |               | 不适用                                                                          |

## ClickPipes 通知 \{#clickpipes-notifications\}

当您的 ClickPipe 出现故障或其他问题时，ClickHouse 会发送 ClickPipes 通知。 

## 账单通知 \{#billing-notifications\}

ClickHouse 会在出现付款问题时，以及预付承诺额度的消耗达到特定阈值时发送账单通知。 

## 支持的通知类型 \{#supported-notifications\}

目前，我们会发送与账单相关的通知 (付款失败、用量超过某个阈值等) ，以及与扩缩容事件相关的通知 (扩缩容完成、扩缩容受阻等) 。

## 相关页面 \{#related\}

* [Cloud 控制台监控](/cloud/monitoring/cloud-console) — 查看用于监控服务健康状况、资源和查询性能的内置仪表板
* [监控概述](/cloud/monitoring) — 比较 ClickHouse Cloud 的所有监控方式

:::note
信用额度阈值通知目前仅适用于签订了承诺消费合同的组织。按使用量付费 (PAYG) 的组织不会收到这些通知。
:::