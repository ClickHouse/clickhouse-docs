---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu 是一款无需编码的、原生支持数据仓库的产品分析应用。'
title: '将 Mitzu 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
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


# 将 Mitzu 连接到 ClickHouse {#connecting-mitzu-to-clickhouse}

<CommunityMaintainedBadge/>

Mitzu 是一款零代码、原生运行于数据仓库之上的产品分析应用。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 让用户无需掌握 SQL 或 Python 专业技能即可分析产品使用数据。

然而，与这些平台不同的是，Mitzu 不会复制公司的产品使用数据。相反，它会在公司现有的数据仓库或数据湖之上直接生成原生 SQL 查询。



## 目标 {#goal}

在本指南中，我们将介绍以下内容：

- 面向数据仓库的原生产品分析
- 如何将 Mitzu 与 ClickHouse 集成

:::tip 示例数据集
如果你没有可供 Mitzu 使用的数据集，可以使用 NYC Taxi Data 数据集。
该数据集在 ClickHouse Cloud 中可用，或者[可以按照这些说明进行加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南仅对如何使用 Mitzu 进行简要概览。你可以在 [Mitzu 文档](https://docs.mitzu.io/) 中找到更详细的信息。



## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />



## 2. 登录或注册 Mitzu {#2-sign-in-or-sign-up-to-mitzu}

首先，前往 [https://app.mitzu.io](https://app.mitzu.io) 注册账号。

<Image size="lg" img={mitzu_01} alt="Mitzu 登录页面，其中包含电子邮件和密码字段" border />



## 3. 配置你的工作区 {#3-configure-your-workspace}

创建组织之后，按照左侧导航栏中的 `Set up your workspace` 入门指南完成设置。然后，点击 `Connect Mitzu with your data warehouse` 链接。

<Image size="lg" img={mitzu_02} alt="Mitzu 工作区设置页面，显示入门步骤" border />



## 4. 将 Mitzu 连接到 ClickHouse {#4-connect-mitzu-to-clickhouse}

首先，选择 ClickHouse 作为连接类型并设置连接详细信息。然后，点击 `Test connection & Save` 按钮以保存设置。

<Image size="lg" img={mitzu_03} alt="Mitzu 连接 ClickHouse 的配置页面，带有配置表单" border />



## 5. 配置事件表 {#5-configure-event-tables}

连接保存后，选择 `Event tables` 选项卡并点击 `Add table` 按钮。在弹出的窗口中，选择你的数据库以及要添加到 Mitzu 的表。

使用复选框至少选择一个表，然后点击 `Configure table` 按钮。这将打开一个弹窗，你可以在其中为每个表设置关键列。

<Image size="lg" img={mitzu_04} alt="Mitzu 表选择界面，显示数据库中的表" border />
<br/>

> 要在你的 ClickHouse 部署中进行产品分析，你需要从表中指定几个关键列。
>
> 具体包括：
>
> - **User id** - 用户唯一标识符所在的列。
> - **Event time** - 事件的时间戳列。
> - 可选 [**Event name**] - 如果表中包含多种事件类型，此列用于对事件进行区分。

<Image size="lg" img={mitzu_05} alt="Mitzu 事件目录配置界面，显示列映射选项" border />
<br/>
当所有表配置完成后，点击 `Save & update event catalog` 按钮，Mitzu 将根据上述定义的表自动发现所有事件及其属性。根据数据集的大小，此步骤可能需要几分钟时间。



## 4. 运行分群查询 {#4-run-segmentation-queries}

在 Mitzu 中进行用户分群与在 Amplitude、Mixpanel 或 PostHog 中一样简单。

Explore 页面左侧是事件选择区域，顶部区域用于配置时间范围。

<Image size="lg" img={mitzu_06} alt="Mitzu 分群查询界面，包含事件选择和时间配置" border />

<br/>

:::tip 筛选与细分
筛选方式与预期一致：选择一个属性（ClickHouse 列），然后从下拉菜单中选取需要筛选的值。
你可以选择任意事件属性或用户属性进行细分（参见下文了解如何集成用户属性）。
:::



## 5. 运行漏斗查询 {#5-run-funnel-queries}

为一个漏斗最多选择 9 个步骤。选择用户必须在其中完成该漏斗的时间窗口。
无需编写一行 SQL 代码，即可立即获得转化率洞察。

<Image size="lg" img={mitzu_07} alt="Mitzu 漏斗分析视图，展示各步骤之间的转化率" border />

<br/>

:::tip 可视化趋势
选择 `Funnel trends`，以查看随时间变化的漏斗趋势。
:::



## 6. 运行留存查询 {#6-run-retention-queries}

最多选择 2 个步骤用于计算留存率。为滚动分析选择留存时间窗口。
无需编写任何 SQL 代码，即可立即获得转化率洞察。

<Image size="lg" img={mitzu_08} alt="Mitzu 留存分析显示不同分群的留存率" border />

<br/>

:::tip 分群留存
选择 `Weekly cohort retention` 来可视化留存率随时间的变化。
:::



## 7. 运行旅程查询 {#7-run-journey-queries}
为漏斗最多选择 9 个步骤。设置一个时间窗口，用于限定用户完成整个旅程的时间范围。Mitzu 旅程图会为你提供可视化图表，展示用户在所选事件之间经过的每一条路径。

<Image size="lg" img={mitzu_09} alt="Mitzu 旅程可视化，展示事件之间的用户路径流向" border />
<br/>

:::tip 分解步骤
你可以在分段中为 `Break down` 选择一个属性，用于区分处于同一步骤的不同用户。
:::

<br/>



## 8. 运行营收查询 {#8-run-revenue-queries}
如果已完成营收配置，Mitzu 可以根据你的付款事件计算总 MRR 和订阅数量。

<Image size="lg" img={mitzu_10} alt="Mitzu 营收分析仪表板，展示 MRR 指标" border />



## 9. 原生 SQL {#9-sql-native}

Mitzu 对 SQL 提供原生支持，这意味着它会根据你在 Explore 页面上选择的配置生成原生 SQL 代码。

<Image size="lg" img={mitzu_11} alt="Mitzu SQL 代码生成视图，显示原生 ClickHouse 查询" border />

<br/>

:::tip 在 BI 工具中继续你的工作
如果你在使用 Mitzu UI 时遇到限制，可以复制 SQL 代码，在 BI 工具中继续你的工作。
:::



## Mitzu 支持 {#mitzu-support}

如果你在使用过程中遇到问题，欢迎通过 [support@mitzu.io](email://support@mitzu.io) 联系我们。

你也可以加入我们的 Slack 社区：[点击这里](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)



## 了解更多 {#learn-more}

访问 [mitzu.io](https://mitzu.io) 了解更多关于 Mitzu 的信息

访问我们的文档页面：[docs.mitzu.io](https://docs.mitzu.io)
