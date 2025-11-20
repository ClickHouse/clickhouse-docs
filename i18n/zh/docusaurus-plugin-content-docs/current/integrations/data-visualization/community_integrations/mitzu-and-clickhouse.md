---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu 是一款零代码、原生于数据仓库的产品分析应用。'
title: '将 Mitzu 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 将 Mitzu 连接到 ClickHouse

<CommunityMaintainedBadge/>

Mitzu 是一款零代码、原生对接数据仓库的产品分析应用。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 让用户无需掌握 SQL 或 Python 技能即可分析产品使用数据。

不过，与这些平台不同的是，Mitzu 并不会复制公司的产品使用数据，而是直接在公司现有的数据仓库或数据湖之上生成原生 SQL 查询。



## 目标 {#goal}

本指南将介绍以下内容:

- 数据仓库原生产品分析
- 如何将 Mitzu 集成到 ClickHouse

:::tip 示例数据集
如果您没有可用于 Mitzu 的数据集,可以使用 NYC Taxi Data。
该数据集在 ClickHouse Cloud 中可用,也可以[按照这些说明加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南仅提供 Mitzu 使用方法的简要概述。更详细的信息请参阅 [Mitzu 文档](https://docs.mitzu.io/)。


## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 登录或注册 Mitzu {#2-sign-in-or-sign-up-to-mitzu}

第一步,前往 [https://app.mitzu.io](https://app.mitzu.io) 进行注册。

<Image
  size='lg'
  img={mitzu_01}
  alt='Mitzu 登录页面,包含邮箱和密码输入框'
  border
/>


## 3. 配置您的工作空间 {#3-configure-your-workspace}

创建组织后,请按照左侧边栏中的"设置您的工作空间"引导指南进行操作。然后,点击"将 Mitzu 连接到您的数据仓库"链接。

<Image
  size='lg'
  img={mitzu_02}
  alt='Mitzu 工作空间设置页面,显示引导步骤'
  border
/>


## 4. 将 Mitzu 连接到 ClickHouse {#4-connect-mitzu-to-clickhouse}

首先,选择 ClickHouse 作为连接类型并设置连接详细信息。然后,点击 `Test connection & Save` 按钮以保存设置。

<Image
  size='lg'
  img={mitzu_03}
  alt='Mitzu 的 ClickHouse 连接设置页面及配置表单'
  border
/>


## 5. 配置事件表 {#5-configure-event-tables}

连接保存后,选择 `Event tables` 选项卡并点击 `Add table` 按钮。在弹出的对话框中,选择您的数据库以及要添加到 Mitzu 的表。

使用复选框至少选择一个表,然后点击 `Configure table` 按钮。这将打开一个对话框窗口,您可以在其中为每个表设置关键列。

<Image
  size='lg'
  img={mitzu_04}
  alt='Mitzu 表选择界面显示数据库表'
  border
/>
<br />

> 要在您的 ClickHouse 环境中运行产品分析,您需要从表中指定几个关键列。
>
> 这些列包括:
>
> - **User id** - 用户唯一标识符列。
> - **Event time** - 事件时间戳列。
> - 可选[**Event name**] - 当表包含多种事件类型时,此列用于区分不同的事件。

<Image
  size='lg'
  img={mitzu_05}
  alt='Mitzu 事件目录配置显示列映射选项'
  border
/>
<br />
配置完所有表后,点击 `Save & update event catalog` 按钮,Mitzu 将从上述定义的表中查找所有事件及其属性。此步骤可能需要几分钟时间,具体取决于数据集的大小。


## 4. 运行用户分群查询 {#4-run-segmentation-queries}

在 Mitzu 中进行用户分群与在 Amplitude、Mixpanel 或 PostHog 中一样简单。

探索页面左侧提供事件选择区域,顶部区域可配置时间范围。

<Image
  size='lg'
  img={mitzu_06}
  alt='Mitzu 用户分群查询界面,包含事件选择和时间配置功能'
  border
/>

<br />

:::tip 过滤与分组
过滤操作很直观:选择一个属性(ClickHouse 列),然后从下拉列表中选择要过滤的值。
您可以选择任何事件或用户属性进行分组分析(有关如何集成用户属性,请参见下文)。
:::


## 5. 运行漏斗查询 {#5-run-funnel-queries}

为漏斗选择最多 9 个步骤。选择用户可以完成漏斗的时间窗口。
无需编写任何 SQL 代码即可立即获得转化率洞察。

<Image
  size='lg'
  img={mitzu_07}
  alt='Mitzu 漏斗分析视图,显示各步骤之间的转化率'
  border
/>

<br />

:::tip 可视化趋势
选择 `Funnel trends` 以可视化漏斗随时间的变化趋势。
:::


## 6. 运行留存查询 {#6-run-retention-queries}

选择最多 2 个步骤来计算留存率。为重复窗口选择留存窗口，
无需编写任何 SQL 代码即可立即获得转化率洞察。

<Image
  size='lg'
  img={mitzu_08}
  alt='Mitzu 留存分析展示群组留存率'
  border
/>

<br />

:::tip 群组留存
选择 `Weekly cohort retention` 来可视化留存率随时间的变化趋势。
:::


## 7. 运行用户旅程查询 {#7-run-journey-queries}

为漏斗选择最多 9 个步骤。选择用户完成旅程的时间窗口。Mitzu 旅程图表为您提供用户通过所选事件的所有路径的可视化展示。

<Image
  size='lg'
  img={mitzu_09}
  alt='Mitzu 旅程可视化,展示事件之间的用户路径流向'
  border
/>
<br />

:::tip 分解步骤
您可以为 `Break down` 分段选择一个属性,以区分同一步骤内的不同用户。
:::

<br />


## 8. 运行收入查询 {#8-run-revenue-queries}

配置收入设置后,Mitzu 可以根据支付事件计算总 MRR(月度经常性收入)和订阅数量。

<Image
  size='lg'
  img={mitzu_10}
  alt='Mitzu 收入分析仪表板显示 MRR 指标'
  border
/>


## 9. SQL 原生 {#9-sql-native}

Mitzu 是 SQL 原生工具,这意味着它可以根据您在探索页面上选择的配置生成原生 SQL 代码。

<Image
  size='lg'
  img={mitzu_11}
  alt='Mitzu SQL 代码生成视图,显示原生 ClickHouse 查询'
  border
/>

<br />

:::tip 在 BI 工具中继续工作
如果 Mitzu UI 无法满足您的需求,可以复制 SQL 代码并在 BI 工具中继续操作。
:::


## Mitzu 支持 {#mitzu-support}

如果您需要帮助,请随时通过 [support@mitzu.io](email://support@mitzu.io) 联系我们

或者加入我们的 Slack 社区:[点击这里](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)


## 了解更多 {#learn-more}

在 [mitzu.io](https://mitzu.io) 了解更多关于 Mitzu 的信息

访问我们的文档页面：[docs.mitzu.io](https://docs.mitzu.io)
