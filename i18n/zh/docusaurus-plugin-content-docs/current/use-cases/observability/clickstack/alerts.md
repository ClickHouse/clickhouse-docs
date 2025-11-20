---
slug: /use-cases/observability/clickstack/alerts
title: '使用 ClickStack 进行搜索'
sidebar_label: '告警'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 进行告警'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'alerts', 'search-alerts', 'notifications', 'thresholds', 'slack', 'email', 'pagerduty', 'error-monitoring', 'performance-monitoring', 'user-events']
---

import Image from '@theme/IdealImage';
import search_alert from '@site/static/images/use-cases/observability/search_alert.png';
import edit_chart_alert from '@site/static/images/use-cases/observability/edit_chart_alert.png';
import add_chart_alert from '@site/static/images/use-cases/observability/add_chart_alert.png';
import create_chart_alert from '@site/static/images/use-cases/observability/create_chart_alert.png';
import alerts_search_view from '@site/static/images/use-cases/observability/alerts_search_view.png';
import add_new_webhook from '@site/static/images/use-cases/observability/add_new_webhook.png';
import add_webhook_dialog from '@site/static/images/use-cases/observability/add_webhook_dialog.png';
import manage_alerts from '@site/static/images/use-cases/observability/manage_alerts.png';
import alerts_view from '@site/static/images/use-cases/observability/alerts_view.png';
import multiple_search_alerts from '@site/static/images/use-cases/observability/multiple_search_alerts.png';
import remove_chart_alert from '@site/static/images/use-cases/observability/remove_chart_alert.png';


## ClickStack 中的告警 {#alerting-in-clickstack}

ClickStack 内置告警功能,使团队能够实时检测和响应日志、指标和追踪中的问题。

告警可直接在 HyperDX 界面中创建,并与 Slack 和 PagerDuty 等主流通知系统集成。

告警功能可无缝处理 ClickStack 数据,帮助您跟踪系统健康状况、捕获性能衰退并监控关键业务事件。


## 告警类型 {#types-of-alerts}

ClickStack 支持两种互补的告警创建方式：**搜索告警**和**仪表板图表告警**。告警创建后，会关联到相应的搜索或图表。

### 1. 搜索告警 {#search-alerts}

搜索告警允许您基于已保存搜索的结果触发通知。它们可以帮助您检测特定事件或模式的发生频率是否高于（或低于）预期。

当定义时间窗口内匹配结果的数量超过或低于指定阈值时，将触发告警。

创建搜索告警：

<VerticalStepper headerLevel="h4">

要为搜索创建告警，必须先保存搜索。用户可以为现有的已保存搜索创建告警，也可以在告警创建过程中保存搜索。在下面的示例中，我们假设搜索尚未保存。

#### 打开告警创建对话框 {#open-dialog}

首先输入一个[搜索](/use-cases/observability/clickstack/search)，然后点击 `Search` 页面右上角的 `Alerts` 按钮。

<Image img={alerts_search_view} alt='Alerts search view' size='lg' />

#### 创建告警 {#create-the-alert}

在告警创建面板中，您可以：

- 为与告警关联的已保存搜索指定名称。
- 设置阈值并指定在给定时间段内必须达到该阈值的次数。阈值也可以用作上限或下限。此处的时间段还将决定告警的触发频率。
- 指定 `grouped by` 值。这允许对搜索进行聚合，例如按 `ServiceName` 聚合，从而允许同一搜索触发多个告警。
- 选择用于通知的 webhook 目标。您可以直接从此视图添加新的 webhook。详情请参阅[添加 webhook](#add-webhook)。

在保存之前，ClickStack 会可视化阈值条件，以便您确认其行为符合预期。

<Image img={search_alert} alt='Search alerts' size='lg' />

</VerticalStepper>

请注意，可以为一个搜索添加多个告警。如果重复上述过程，用户将在编辑告警对话框顶部看到当前告警以选项卡形式显示，每个告警都分配有一个编号。

<Image img={multiple_search_alerts} alt='Multiple alerts' size='md' />

### 2. 仪表板图表告警 {#dashboard-alerts}

仪表板告警将告警功能扩展到图表。

您可以直接从已保存的仪表板创建基于图表的告警，该功能由完整的 SQL 聚合和 ClickHouse 函数提供支持，可进行高级计算。

当指标超过定义的阈值时，告警会自动触发，使您能够持续监控 KPI、延迟或其他关键指标。

:::note
要为仪表板上的可视化创建告警，必须先保存仪表板。
:::

添加仪表板告警：

<VerticalStepper headerLevel="h4">

告警可以在图表创建过程中创建，在向仪表板添加图表时创建，或添加到现有图表。在下面的示例中，我们假设图表已存在于仪表板上。

#### 打开图表编辑对话框 {#open-chart-dialog}

打开图表的配置菜单并选择告警按钮。这将显示图表编辑对话框。

<Image img={edit_chart_alert} alt='Edit chart alert' size='lg' />

#### 添加告警 {#add-chart-alert}

选择 **Add Alert**。

<Image img={add_chart_alert} alt='Add alert to chart' size='lg' />

#### 定义告警条件 {#define-alert-conditions}

定义条件（`>=`、`<`）、阈值、持续时间和 webhook。此处的持续时间还将决定告警的触发频率。

<Image img={create_chart_alert} alt='Create alert for chart' size='lg' />

您可以直接从此视图添加新的 webhook。详情请参阅[添加 webhook](#add-webhook)。

</VerticalStepper>


## 添加 webhook {#add-webhook}

在创建告警时,用户可以使用现有的 webhook 或创建新的 webhook。创建后,该 webhook 可在其他告警中重复使用。

可以为不同的服务类型创建 webhook,包括 Slack、PagerDuty 以及通用目标。

例如,考虑下面为图表创建告警的情况。在指定 webhook 之前,用户可以选择 `Add New Webhook`。

<Image img={add_new_webhook} alt='Add new webhook' size='lg' />

这将打开 webhook 创建对话框,用户可以在其中创建新的 webhook:

<Image img={add_webhook_dialog} alt='Webhook creation' size='md' />

webhook 名称为必填项,描述为可选项。其他必须完成的设置取决于服务类型。

请注意,ClickStack Open Source 和 ClickStack Cloud 支持的服务类型有所不同。请参阅[服务类型集成](#integrations)。

### 服务类型集成 {#integrations}

ClickStack 告警开箱即用地集成了以下服务类型:

- **Slack**: 通过 webhook 或 API 直接向频道发送通知。
- **PagerDuty**: 通过 PagerDuty API 为值班团队路由事件。
- **Webhook**: 通过通用 webhook 将告警连接到任何自定义系统或工作流。

:::note ClickHouse Cloud 专属集成
Slack API 和 PagerDuty 集成仅在 ClickHouse Cloud 中支持。
:::

根据服务类型,用户需要提供不同的详细信息。具体如下:

**Slack (Webhook URL)**

- Webhook URL。例如:`https://hooks.slack.com/services/<unique_path>`。更多详细信息请参阅 [Slack 文档](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)。

**Slack (API)**

- Slack bot token。更多详细信息请参阅 [Slack 文档](https://docs.slack.dev/authentication/tokens/#bot/)。

**PagerDuty API**

- PagerDuty integration key。更多详细信息请参阅 [PagerDuty 文档](https://support.pagerduty.com/main/docs/api-access-keys)。

**通用**

- Webhook URL
- Webhook headers (可选)
- Webhook body (可选)。body 目前支持模板变量 `{{title}}`、`{{body}}` 和 `{{link}}`。


## 管理告警 {#managing-alerts}

告警可以通过 HyperDX 左侧的告警面板进行集中管理。

<Image img={manage_alerts} alt='管理告警' size='lg' />

在此视图中,用户可以查看所有已创建且当前正在 ClickStack 中运行的告警。

<Image img={alerts_view} alt='告警视图' size='lg' />

此视图还会显示告警评估历史记录。告警会按照周期性时间间隔进行评估(由创建告警时设置的周期/持续时间定义)。在每次评估期间,HyperDX 会查询您的数据以检查是否满足告警条件:

- **红色条**:此次评估中满足阈值条件,告警已触发(已发送通知)
- **绿色条**:告警已评估但未满足阈值条件(未发送通知)

每次评估都是独立的——告警会检查该时间窗口的数据,仅在该时刻条件为真时才会触发。

在上面的示例中,第一个告警在每次评估时都触发了,表明存在持续性问题。第二个告警显示问题已解决——最初触发了两次(红色条),然后在后续评估中不再满足阈值条件(绿色条)。

点击告警会跳转到该告警所关联的图表或搜索。

### 删除告警 {#deleting-alerts}

要删除告警,请打开关联搜索或图表的编辑对话框,然后选择 **Remove Alert**。
在下面的示例中,`Remove Alert` 按钮将从图表中删除该告警。

<Image img={remove_chart_alert} alt='删除图表告警' size='lg' />


## 常见告警场景 {#common-alert-scenarios}

以下是使用 HyperDX 的几个常见告警场景：

**错误：** 建议为默认的 `All Error Events` 和 `HTTP Status >= 400` 已保存搜索设置告警，以便在出现过多错误时收到通知。

**慢操作：** 可以设置针对慢操作的搜索（例如 `duration:>5000`），然后在出现过多慢操作时触发告警。

**用户事件：** 还可以为面向客户的团队设置告警，以便在新用户注册或执行关键用户操作时收到通知。
