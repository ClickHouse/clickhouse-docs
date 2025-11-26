---
slug: /use-cases/observability/clickstack/alerts
title: '使用 ClickStack 配置告警'
sidebar_label: '告警'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 管理告警'
doc_type: 'guide'
keywords: ['ClickStack', '可观测性', '告警', '搜索告警', '通知', '阈值', 'Slack', 'Email', 'PagerDuty', '错误监控', '性能监控', '用户事件']
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

ClickStack 内置告警功能，支持团队在日志、指标和链路追踪等各类数据上实时发现并响应问题。

可以直接在 HyperDX 界面中创建告警，并与 Slack、PagerDuty 等常用通知系统集成。

告警功能可在您的 ClickStack 数据之上无缝运行，帮助您跟踪系统健康状况、捕获性能退化并监控关键业务事件。



## 告警类型 {#types-of-alerts}

ClickStack 支持两种互为补充的告警创建方式：**搜索告警** 和 **仪表盘图表告警**。告警创建后，将分别关联到对应的搜索或图表上。

### 1. 搜索告警 {#search-alerts}

搜索告警允许基于已保存搜索的结果触发通知，帮助检测特定事件或模式是否比预期更频繁（或更少）地发生。

当在定义的时间窗口内，匹配结果的数量超出或低于指定阈值时，就会触发告警。

创建搜索告警的步骤如下：

<VerticalStepper headerLevel="h4">

要为某个搜索创建告警，该搜索必须先被保存。用户可以为已有的已保存搜索创建告警，也可以在创建告警的过程中保存搜索。在下面的示例中，我们假设搜索尚未保存。

#### 打开告警创建对话框 {#open-dialog}

首先输入一个[搜索](/use-cases/observability/clickstack/search)，然后点击 `Search` 页面右上角的 `Alerts` 按钮。

<Image img={alerts_search_view} alt="告警搜索视图" size="lg"/>

#### 创建告警 {#create-the-alert}

在告警创建面板中，可以：

- 为与告警关联的已保存搜索指定名称。
- 设置阈值，并指定在给定时间段内需要达到该阈值的次数。阈值也可以用作上限或下限。这里设置的时间段还将决定告警被触发的频率。
- 指定一个 `grouped by` 值。这允许对搜索结果进行聚合，例如按 `ServiceName` 聚合，从而可以基于同一次搜索触发多个告警。
- 选择通知的 webhook 目标。可以在该视图中直接添加新的 webhook。详情参见 [添加 webhook](#add-webhook)。

在保存前，ClickStack 会对阈值条件进行可视化展示，以便确认其行为是否符合预期。

<Image img={search_alert} alt="搜索告警" size="lg"/>

</VerticalStepper>

请注意，可以为同一个搜索添加多个告警。如果重复上述过程，用户会在编辑告警对话框顶部看到当前告警以标签页形式展示，每个告警会被分配一个编号。

<Image img={multiple_search_alerts} alt="多个告警" size="md"/>

### 2. 仪表盘图表告警 {#dashboard-alerts}

仪表盘告警将告警能力扩展到图表。

可以直接从已保存的仪表盘上创建基于图表的告警，利用完整的 SQL 聚合以及 ClickHouse 函数来进行高级计算。

当某个指标跨越预定义阈值时，会自动触发告警，从而持续监控 KPI、延迟或其他关键指标。

:::note
要在仪表盘上的可视化图表上创建告警，该仪表盘必须先被保存。
:::

添加仪表盘告警的步骤如下：

<VerticalStepper headerLevel="h4">

可以在创建图表时、将图表添加到仪表盘时，或在已有图表上为其添加告警。在下面的示例中，我们假设该图表已经存在于仪表盘上。

#### 打开图表编辑对话框 {#open-chart-dialog}

打开图表的配置菜单并选择告警按钮。这将显示图表编辑对话框。

<Image img={edit_chart_alert} alt="编辑图表告警" size="lg"/>

#### 添加告警 {#add-chart-alert}

选择 **Add Alert**。

<Image img={add_chart_alert} alt="为图表添加告警" size="lg"/>

#### 定义告警条件 {#define-alert-conditions}

定义条件（`>=`、`<`）、阈值、持续时间以及 webhook。这里设置的持续时间同样会决定告警被触发的频率。

<Image img={create_chart_alert} alt="为图表创建告警" size="lg"/>

可以在该视图中直接添加新的 webhook。详情参见 [添加 webhook](#add-webhook)。

</VerticalStepper>



## 添加 webhook {#add-webhook}

在创建告警时，用户可以使用已有的 webhook，或新建一个 webhook。创建后，该 webhook 可在其他告警中重复使用。

可以为不同的服务类型创建 webhook，包括 Slack、PagerDuty，以及通用目标。

例如，下方是在图表上创建告警的示例。在指定 webhook 之前，用户可以选择 `Add New Webhook`。

<Image img={add_new_webhook} alt="添加新 webhook" size="lg"/>

这会打开 webhook 创建对话框，用户可以在此创建一个新的 webhook：

<Image img={add_webhook_dialog} alt="Webhook 创建" size="md"/>

Webhook 名称为必填项，描述为可选项。其他必填设置取决于服务类型。

请注意，ClickStack 开源版本与 ClickStack Cloud 支持的服务类型不同。参见 [服务类型集成](#integrations)。

### 服务类型集成 {#integrations}

ClickStack 告警开箱即用地集成了以下服务类型：

- **Slack**：通过 webhook 或 API 直接向频道发送通知。
- **PagerDuty**：通过 PagerDuty API 为值班团队路由事件。
- **Webhook**：通过通用 webhook 将告警连接到任意自定义系统或工作流。

:::note 仅适用于 ClickHouse Cloud 的集成
Slack API 和 PagerDuty 集成仅在 ClickHouse Cloud 中受支持。
:::

根据服务类型不同，用户需要提供的详细信息也不同，具体如下：

**Slack（Webhook URL）**

- Webhook URL。例如：`https://hooks.slack.com/services/<unique_path>`。更多详情参见 [Slack 文档](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)。

**Slack（API）**

- Slack 机器人令牌。更多详情参见 [Slack 文档](https://docs.slack.dev/authentication/tokens/#bot/)。

**PagerDuty API**

- PagerDuty 集成密钥。更多详情参见 [PagerDuty 文档](https://support.pagerduty.com/main/docs/api-access-keys)。

**通用**

- Webhook URL
- Webhook 请求头（可选）
- Webhook 请求体（可选）。请求体目前支持模板变量 `{{title}}`、`{{body}}` 和 `{{link}}`。



## 管理告警 {#managing-alerts}

可以通过 HyperDX 左侧的告警面板集中管理告警。

<Image img={manage_alerts} alt="Manage alerts" size="lg"/>

在此视图中，用户可以看到在 ClickStack 中已创建且当前正在运行的所有告警。

<Image img={alerts_view} alt="Alerts view" size="lg"/>

该视图还会显示告警评估历史。告警会按固定时间间隔进行评估（由创建告警时设置的周期/持续时间决定）。在每次评估期间，HyperDX 会查询你的数据，以检查是否满足告警条件：

- **红色条**：在本次评估中达到阈值条件并触发了告警（已发送通知）
- **绿色条**：本次评估完成，但未达到阈值条件（未发送通知）

每次评估都是彼此独立的——告警只检查该时间窗口内的数据，只有在当时条件为真时才会触发。

在上述示例中，第一个告警在每次评估时都被触发，表明存在持续性问题。第二个告警则表示问题已解决——它在最初两次评估时被触发（红色条），之后的评估中不再满足阈值条件（绿色条）。

点击某个告警会跳转到该告警所关联的图表或搜索。

### 删除告警 {#deleting-alerts}

要删除某个告警，请打开其关联搜索或图表的编辑对话框，然后选择 **Remove Alert**。
在下方示例中，`Remove Alert` 按钮会从图表中移除该告警。

<Image img={remove_chart_alert} alt="Remove chart alert" size="lg"/>



## 常见告警场景 {#common-alert-scenarios}

以下是一些可以使用 HyperDX 配置的常见告警场景：

**错误：** 我们建议为默认的 `All Error Events` 和 `HTTP Status >= 400` 已保存搜索设置告警，以便在错误事件过多时收到通知。

**慢操作：** 可以创建一个用于筛选慢操作的搜索（例如，`duration:>5000`），然后在慢操作次数过多时触发告警。

**用户事件：** 你还可以为面向客户的团队设置告警，在有新用户注册或发生关键用户操作时收到通知。
