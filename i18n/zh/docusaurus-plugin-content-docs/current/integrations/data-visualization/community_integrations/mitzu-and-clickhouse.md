---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu 是一款无需编码、原生支持数据仓库的产品分析应用。'
title: '将 Mitzu 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import mitzu_01 from '@site/static/images/integrations/data-visualization/mitzu_01.png';
import mitzu_02 from '@site/static/images/integrations/data-visualization/mitzu_02.png';
import mitzu_03 from '@site/static/images/integrations/data-visualization/mitzu_03.png';
import mitzu_04 from '@site/static/images/integrations/data-visualization/mitzu_04.png';
import mitzu_05 from '@site/static/images/integrations/data-visualization/mitzu_05.png';
import mitzu_06 from '@site/static/images/integrations/data-visualization/mitzu_06.png';
import mitzu_07 from '@site/static/images/integrations/data-visualization/mitzu_07.png';
import mitzu_08 from '@site/static/images/integrations/data-visualization/mitzu_08.png';
import mitzu_09 from '@site/static/images/integrations/data-visualization/mitzu_09.png';
import mitzu_10 from '@site/static/images/integrations/data-visualization/mitzu_10.png';
import mitzu_11 from '@site/static/images/integrations/data-visualization/mitzu_11.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Mitzu 连接到 ClickHouse \{#connecting-mitzu-to-clickhouse\}

<CommunityMaintainedBadge/>

Mitzu 是一款零代码、仓库原生的产品分析应用程序。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 让用户在无需掌握 SQL 或 Python 方面专业知识的情况下即可分析产品使用数据。

然而，与这些平台不同的是，Mitzu 不会复制公司的产品使用数据。相反，它会直接针对公司现有的数据仓库或数据湖生成原生 SQL 查询。

## 目标 \{#goal\}

在本指南中，我们将介绍以下内容：

- 数据仓库原生的产品分析
- 如何将 Mitzu 集成到 ClickHouse

:::tip 示例数据集
如果尚没有可在 Mitzu 中使用的数据集，可以使用 NYC Taxi Data。
该数据集可在 ClickHouse Cloud 中获取，或者[可以按照这些说明进行加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南仅对如何使用 Mitzu 作简要概述。您可以在 [Mitzu 文档](https://docs.mitzu.io/) 中找到更详细的信息。

## 1. 收集连接信息 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 登录或注册 Mitzu \{#2-sign-in-or-sign-up-to-mitzu\}

首先，访问 [https://app.mitzu.io](https://app.mitzu.io) 注册账号。

<Image size="lg" img={mitzu_01} alt="包含电子邮件和密码输入字段的 Mitzu 登录页面" border />

## 3. 配置你的工作区 \{#3-configure-your-workspace\}

创建组织后，在左侧边栏中按照 `Set up your workspace` 入门指南进行操作。然后，点击 `Connect Mitzu with your data warehouse` 链接。

<Image size="lg" img={mitzu_02} alt="Mitzu 工作区设置页面显示入门步骤" border />

## 4. 将 Mitzu 连接到 ClickHouse \{#4-connect-mitzu-to-clickhouse\}

首先，选择 ClickHouse 作为连接类型并设置连接详细信息。然后，点击 `Test connection & Save` 按钮保存设置。

<Image size="lg" img={mitzu_03} alt="Mitzu 连接 ClickHouse 的设置页面及其配置表单" border />

## 5. 配置事件表 \{#5-configure-event-tables\}

连接保存后，选择 `Event tables` 选项卡并点击 `Add table` 按钮。在弹出窗口中，选择你的数据库以及要接入 Mitzu 的表。

使用复选框至少选择一个表，然后点击 `Configure table` 按钮。这会打开一个弹窗，你可以在其中为每个表设置关键列。

<Image size="lg" img={mitzu_04} alt="Mitzu 表选择界面展示数据库中的数据表" border />

<br/>

> 要在你的 ClickHouse 部署上运行产品分析，你需要从表中指定几个关键列。
>
> 具体包括：
>
> - **User id** - 用作用户唯一标识符的列。
> - **Event time** - 事件的时间戳列。
> - 可选项 [**Event name**] - 如果表中包含多种事件类型，此列用于对事件进行分类。

<Image size="lg" img={mitzu_05} alt="Mitzu 事件目录配置界面展示列映射选项" border />

<br/>

当所有表都配置完成后，点击 `Save & update event catalog` 按钮，Mitzu 会从上述定义的表中识别出所有事件及其属性。此步骤可能需要几分钟，具体取决于数据集的大小。

## 4. 运行分群查询 \{#4-run-segmentation-queries\}

在 Mitzu 中进行用户分群与在 Amplitude、Mixpanel 或 PostHog 中同样简单。

Explore 页面左侧区域用于选择事件（event），顶部区域用于配置时间范围。

<Image size="lg" img={mitzu_06} alt="Mitzu 分群查询界面，包含事件选择和时间配置" border />

<br/>

:::tip 过滤与拆分
过滤的方式与预期一致：选择一个属性（ClickHouse 列），然后从下拉列表中选择要过滤的值。
可以选择任意事件或用户属性作为拆分维度（如何集成用户属性见下文）。
:::

## 5. 运行漏斗查询 \{#5-run-funnel-queries\}

为一个漏斗选择最多 9 个步骤。选择用户完成漏斗所允许的时间窗口。
无需编写一行 SQL 代码，即可立即获取转化率洞察。

<Image size="lg" img={mitzu_07} alt="Mitzu 漏斗分析视图，展示各步骤之间的转化率" border />

<br/>

:::tip 可视化趋势
选择 `Funnel trends` 以可视化漏斗随时间变化的趋势。
:::

## 6. 运行留存分析查询 \{#6-run-retention-queries\}

选择最多 2 个步骤用于计算留存率。为留存分析选择滚动时间窗口，即可进行持续的留存分析。
无需编写任何 SQL 代码，即可立即获得关于转化率的洞察。

<Image size="lg" img={mitzu_08} alt="Mitzu 留存分析显示分群留存率" border />

<br/>

:::tip 分群留存
选择 `Weekly cohort retention`，以图形方式查看留存率随时间的变化。
:::

## 7. 运行旅程查询 \{#7-run-journey-queries\}

为漏斗选择最多 9 个步骤。选择一个时间窗口，规定用户需要在此时间范围内完成整个旅程。Mitzu 旅程图会直观展示用户在所选事件中的每一条路径。

<Image size="lg" img={mitzu_09} alt="Mitzu 旅程可视化图，展示用户在事件之间的路径流向" border />

<br/>

:::tip 分解步骤
你可以在分段中的 `Break down` 选项里选择一个属性，用来区分处于同一步骤中的不同用户。
:::

<br/>

## 8. 运行营收查询 \{#8-run-revenue-queries\}

如果已配置营收设置，Mitzu 可以基于您的支付事件计算总 MRR 和订阅数。

<Image size="lg" img={mitzu_10} alt="Mitzu 营收分析仪表板显示 MRR 指标" border />

## 9. 原生 SQL \{#9-sql-native\}

Mitzu 是 SQL Native 的，这意味着它会根据你在 Explore 页面上选择的配置生成原生 SQL 代码。

<Image size="lg" img={mitzu_11} alt="Mitzu SQL 代码生成视图，展示原生 ClickHouse 查询" border />

<br/>

:::tip 在 BI 工具中继续你的工作
如果你在使用 Mitzu UI 时遇到限制，可以复制 SQL 代码并在 BI 工具中继续你的工作。
:::

## Mitzu 支持 \{#mitzu-support\}

如果您遇到问题，欢迎通过 [support@mitzu.io](email://support@mitzu.io) 与我们联系。

或者加入我们的 Slack 社区：[点击这里](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)。

## 了解更多 \{#learn-more\}

在 [mitzu.io](https://mitzu.io) 了解 Mitzu 的更多信息

访问我们的文档页面：[docs.mitzu.io](https://docs.mitzu.io)