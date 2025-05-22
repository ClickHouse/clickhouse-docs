---
'sidebar_label': 'Mitzu'
'slug': '/integrations/mitzu'
'keywords':
- 'clickhouse'
- 'Mitzu'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Mitzu 是一款无代码的仓库原生产品分析应用。'
'title': '将 Mitzu 连接到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

Mitzu 是一种无代码、仓库原生的产品分析应用程序。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 使用户能够分析产品使用数据，而无需具备 SQL 或 Python 专业知识。

然而，与这些平台不同，Mitzu 不会重复公司的产品使用数据。相反，它直接在公司的现有数据仓库或数据湖上生成原生 SQL 查询。

## 目标 {#goal}

在本指南中，我们将涵盖以下内容：

- 仓库原生产品分析
- 如何将 Mitzu 集成到 ClickHouse

:::tip 示例数据集
如果您没有可用于 Mitzu 的数据集，可以使用 NYC Taxi 数据。
此数据集可在 ClickHouse Cloud 中获取，或者 [可以按照这些说明加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南只是如何使用 Mitzu 的简要概述。您可以在 [Mitzu 文档](https://docs.mitzu.io/) 中找到更详细的信息。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 登录或注册 Mitzu {#2-sign-in-or-sign-up-to-mitzu}

作为第一步，请前往 [https://app.mitzu.io](https://app.mitzu.io) 注册。

<Image size="lg" img={mitzu_01} alt="Mitzu 登录页面，包含电子邮件和密码字段" border />

## 3. 配置工作区 {#3-configure-your-workspace}

创建组织后，请按照左侧边栏中的 `设置您的工作区` 入门指南进行操作。然后，单击 `将 Mitzu 连接到您的数据仓库` 链接。

<Image size="lg" img={mitzu_02} alt="Mitzu 工作区设置页面，显示入门步骤" border />

## 4. 将 Mitzu 连接到 ClickHouse {#4-connect-mitzu-to-clickhouse}

首先，选择 ClickHouse 作为连接类型并设置连接详细信息。然后，单击 `测试连接并保存` 按钮以保存设置。

<Image size="lg" img={mitzu_03} alt="Mitzu 连接设置页面，用于 ClickHouse 的配置表单" border />

## 5. 配置事件表 {#5-configure-event-tables}

连接保存后，选择 `事件表` 标签并单击 `添加表` 按钮。在弹出窗口中，选择您的数据库和您想要添加到 Mitzu 的表。

使用复选框选择至少一个表，然后单击 `配置表` 按钮。这将打开一个弹出窗口，您可以在此设置每个表的关键列。

<Image size="lg" img={mitzu_04} alt="Mitzu 表选择界面，显示数据库表" border />
<br/>

> 要在您的 ClickHouse 设置上运行产品分析，您需要 > 从您的表中指定一些关键列。
>
> 这些包括：
>
> - **用户 ID** - 用户的唯一标识符列。
> - **事件时间** - 您的事件的时间戳列。
> - 可选 [**事件名称**] - 如果表包含多种事件类型，此列将对事件进行细分。

<Image size="lg" img={mitzu_05} alt="Mitzu 事件目录配置，显示列映射选项" border />
<br/>
配置完所有表后，单击 `保存并更新事件目录` 按钮，Mitzu 将识别上述定义表中的所有事件及其属性。此步骤可能需要几分钟，具体取决于数据集的大小。

## 6. 运行分段查询 {#4-run-segmentation-queries}

在 Mitzu 中进行用户分段与在 Amplitude、Mixpanel 或 PostHog 中一样简单。

探索页面有左侧的事件选择区域，而顶部则允许您配置时间范围。

<Image size="lg" img={mitzu_06} alt="Mitzu 分段查询界面，显示事件选择和时间配置" border />

<br/>

:::tip 过滤和细分
过滤的方式与您所期待的相同：选择一个属性（ClickHouse 列），从下拉列表中选择要过滤的值。
您可以选择任何事件或用户属性以进行细分（请参见下面如何集成用户属性）。
:::

## 7. 运行漏斗查询 {#5-run-funnel-queries}

选择最多 9 个步骤进行漏斗分析。选择用户可以完成漏斗的时间窗口。
无需编写一行 SQL 代码，立即获得转化率洞察。

<Image size="lg" img={mitzu_07} alt="Mitzu 漏斗分析视图，显示各步骤之间的转化率" border />

<br/>

:::tip 可视化趋势
选择 `漏斗趋势` 以可视化随时间变化的漏斗趋势。
:::

## 8. 运行留存查询 {#6-run-retention-queries}

选择最多 2 个步骤来计算留存率。选择重复窗口的留存窗口，以便
无需编写一行 SQL 代码，立即获得转化率洞察。

<Image size="lg" img={mitzu_08} alt="Mitzu 留存分析，显示群体留存率" border />

<br/>

:::tip 群体留存
选择 `每周群体留存` 来可视化您的留存率如何随时间变化。
:::

## 9. 运行旅程查询 {#7-run-journey-queries}
选择最多 9 个步骤进行漏斗分析。选择用户可以完成旅程的时间窗口。Mitzu 旅程图为您提供了用户在所选事件中采取的每条路径的可视化地图。

<Image size="lg" img={mitzu_09} alt="Mitzu 旅程可视化，显示用户在事件之间的路径流" border />
<br/>

:::tip 细分步骤
您可以选择一个属性进行 `细分`，以区分同一步骤中的用户。
:::

<br/>

## 10. 运行收入查询 {#8-run-revenue-queries}
如果配置了收入设置，Mitzu 可以根据您的支付事件计算总 MRR 和订阅数量。

<Image size="lg" img={mitzu_10} alt="Mitzu 收入分析仪表板，显示 MRR 指标" border />

## 11. SQL 原生 {#9-sql-native}

Mitzu 是 SQL 原生的，这意味着它根据您在探索页面上的配置生成原生 SQL 代码。

<Image size="lg" img={mitzu_11} alt="Mitzu SQL 代码生成视图，显示原生 ClickHouse 查询" border />

<br/>

:::tip 在 BI 工具中继续工作
如果您在 Mitzu UI 中遇到限制，请复制 SQL 代码，并在 BI 工具中继续工作。
:::

## Mitzu 支持 {#mitzu-support}

如果您迷失了，可以随时联系我们 [support@mitzu.io](email://support@mitzu.io)

或您可以在我们的 Slack 社区 [这里](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## 了解更多 {#learn-more}

在 [mitzu.io](https://mitzu.io) 上找到更多关于 Mitzu 的信息

访问我们的文档页面 [docs.mitzu.io](https://docs.mitzu.io)
