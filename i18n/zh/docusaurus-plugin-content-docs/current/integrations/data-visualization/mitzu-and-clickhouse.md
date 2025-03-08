---
sidebar_label: Mitzu
slug: /integrations/mitzu
keywords: [clickhouse, Mitzu, connect, integrate, ui]
description: Mitzu 是一款无代码的仓库原生产品分析应用程序。
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 连接 Mitzu 到 ClickHouse

Mitzu 是一款无代码的仓库原生产品分析应用程序。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 使用户能够分析产品使用数据，而无需具备 SQL 或 Python 专业知识。

然而，与这些平台不同，Mitzu 不会复制公司的产品使用数据。相反，它直接在公司的现有数据仓库或数据湖中生成原生 SQL 查询。

## 目标 {#goal}

在本指南中，我们将覆盖以下内容：

- 仓库原生产品分析
- 如何将 Mitzu 集成到 ClickHouse

:::tip 示例数据集
如果您没有可供 Mitzu 使用的数据集，您可以使用 NYC Taxi 数据。
此数据集可以在 ClickHouse Cloud 中找到或 [根据这些说明加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南仅为使用 Mitzu 的简要概述。您可以在 [Mitzu 文档](https://docs.mitzu.io/) 中找到更详细的信息。

## 1. 收集连接详情 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 登录或注册 Mitzu {#2-sign-in-or-sign-up-to-mitzu}

第一步，前往 [https://app.mitzu.io](https://app.mitzu.io) 注册。

<img src={mitzu_01} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="登录" />

## 3. 配置工作区 {#3-configure-your-workspace}

创建组织后，按照左侧边栏中的 `设置工作区` 入门指南操作。然后，点击 `将 Mitzu 连接到您的数据仓库` 链接。

<img src={mitzu_02} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="创建工作区" ></img>

## 4. 连接 Mitzu 到 ClickHouse {#4-connect-mitzu-to-clickhouse}

首先，选择 ClickHouse 作为连接类型，并设置连接详情。然后，点击 `测试连接并保存` 按钮以保存设置。

<img src={mitzu_03} class="image" style={{width: '50%', 'background-color': 'transparent'}}alt="设置连接详情" ></img>

## 5. 配置事件表 {#5-configure-event-tables}

连接保存后，选择 `事件表` 选项卡，点击 `添加表` 按钮。在弹出窗口中，选择您的数据库和要添加到 Mitzu 的表。

使用复选框至少选择一个表，然后点击 `配置表` 按钮。这将打开一个弹出窗口，您可以在其中设置每个表的关键列。

<img src={mitzu_04} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="设置表连接"></img>
<br/>

> 要在您的 ClickHouse 设置上运行产品分析，您需要 > 指定表中的几个关键列。
>
> 这些包括：
>
> - **用户 ID** - 唯一标识用户的列。
> - **事件时间** - 您事件的时间戳列。
> - 可选[**事件名称**] - 如果表包含多个事件类型，则该列用于分隔事件。

<img src={mitzu_05} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="创建事件目录" ></img>
<br/>
所有表配置完成后，点击 `保存并更新事件目录` 按钮，Mitzu 将从上述定义的表中找到所有事件及其属性。此步骤可能需要几分钟，具体取决于您的数据集大小。

## 6. 运行分段查询 {#4-run-segmentation-queries}

在 Mitzu 中，用户分段与在 Amplitude、Mixpanel 或 PostHog 中一样简单。

探索页面有一个左侧选择区域用于事件，而顶部部分允许您配置时间范围。

<img src={mitzu_06} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="分段" ></img>

<br/>

:::tip 过滤和细分
过滤过程与您预期的一样：选择一个属性（ClickHouse 列），然后选择您想要过滤的下拉值。
您可以选择任何事件或用户属性进行细分（如下所示如何集成用户属性）。
:::

## 7. 运行漏斗查询 {#5-run-funnel-queries}

选择最多 9 个步骤作为漏斗。选择用户可以完成漏斗的时间窗口。
获得即时转换率见解，无需编写一行 SQL 代码。

<img src={mitzu_07} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="漏斗" ></img>

<br/>

:::tip 可视化趋势
选择 `漏斗趋势` 以可视化漏斗随时间的趋势变化。
:::

## 8. 运行留存查询 {#6-run-retention-queries}

选择最多 2 个步骤进行留存率计算。选择重复窗口的留存窗口。
获得即时转换率见解，无需编写一行 SQL 代码。

<img src={mitzu_08} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="留存" ></img>

<br/>

:::tip 阶段留存
选择 `每周阶段留存` 以可视化您的留存率随时间的变化。
:::

## 9. 运行旅程查询 {#7-run-journey-queries}
选择最多 9 个步骤作为漏斗。选择用户完成旅程的时间窗口。Mitzu 的旅程图为您提供了用户通过所选事件每个路径的可视化图。

<img src={mitzu_09} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="旅程" ></img>
<br/>

:::tip 细分步骤
您可以为段 `细分` 选择一个属性，以区分同一步骤中的用户。
:::

<br/>

## 10. 运行收入查询 {#8-run-revenue-queries}
如果配置了收入设置，Mitzu 可以根据您的支付事件计算总 MRR 和订阅计数。

<img src={mitzu_10} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="收入" ></img>

## 11. SQL 原生 {#9-sql-native}

Mitzu 是 SQL 原生的，这意味着它根据您在探索页面上选择的配置生成原生 SQL 代码。

<img src={mitzu_11} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="SQL 原生" ></img>

<br/>

:::tip 在 BI 工具中继续工作
如果您在 Mitzu UI 中遇到限制，复制 SQL 代码并在 BI 工具中继续您的工作。
:::

## Mitzu 支持 {#mitzu-support}

如果您感到迷失，请随时通过 [support@mitzu.io](email://support@mitzu.io) 联系我们。

或者，您可以在 [此处](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg) 加入我们的 Slack 社区。

## 了解更多 {#learn-more}

有关 Mitzu 的更多信息，请访问 [mitzu.io](https://mitzu.io)。

访问我们的文档页面 [docs.mitzu.io](https://docs.mitzu.io)。
