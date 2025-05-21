---
'sidebar_label': 'Mitzu'
'slug': '/integrations/mitzu'
'keywords':
- 'clickhouse'
- 'Mitzu'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Mitzu 是一个无代码的仓库本地产品分析应用。'
'title': '连接 Mitzu 到 ClickHouse'
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

Mitzu 是一款无需编码的、仓库原生的产品分析应用程序。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 使用户能够分析产品使用数据，而无需具备 SQL 或 Python 的专业知识。

然而，与这些平台不同，Mitzu 不会重复公司的产品使用数据。相反，它直接在公司的现有数据仓库或数据湖中生成原生 SQL 查询。

## 目标 {#goal}

在本指南中，我们将介绍以下内容：

- 仓库原生产品分析
- 如何将 Mitzu 集成到 ClickHouse

:::tip 示例数据集
如果您没有可以用于 Mitzu 的数据集，您可以使用 NYC Taxi Data。
该数据集可以在 ClickHouse Cloud 中找到，或 [可以按以下说明加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南只是如何使用 Mitzu 的简要概述。您可以在 [Mitzu 文档](https://docs.mitzu.io/) 中找到更详细的信息。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 登录或注册 Mitzu {#2-sign-in-or-sign-up-to-mitzu}

第一步，请前往 [https://app.mitzu.io](https://app.mitzu.io) 注册。

<Image size="lg" img={mitzu_01} alt="Mitzu 登录页面，包含邮箱和密码字段" border />

## 3. 配置您的工作区 {#3-configure-your-workspace}

创建组织后，按照左侧边栏中的 `设置您的工作区` 入门指南进行操作。然后，点击 `将 Mitzu 连接到您的数据仓库` 链接。

<Image size="lg" img={mitzu_02} alt="Mitzu 工作区设置页面，显示入门步骤" border />

## 4. 将 Mitzu 连接到 ClickHouse {#4-connect-mitzu-to-clickhouse}

首先，选择 ClickHouse 作为连接类型并设置连接详细信息。然后，点击 `测试连接并保存` 按钮以保存设置。

<Image size="lg" img={mitzu_03} alt="Mitzu 连接设置页面，配置 ClickHouse 表单" border />

## 5. 配置事件表 {#5-configure-event-tables}

保存连接后，选择 `事件表` 选项卡并点击 `添加表` 按钮。在弹出窗口中，选择您的数据库及要添加到 Mitzu 的表。

使用复选框选择至少一个表，然后点击 `配置表` 按钮。这将打开一个弹出窗口，您可以在其中为每个表设置关键列。

<Image size="lg" img={mitzu_04} alt="Mitzu 表选择界面，显示数据库表" border />
<br/>

> 要在您的 ClickHouse 设置上运行产品分析，您需要 > 指定来自表的一些关键列。
>
> 这些列包括以下内容：
>
> - **用户 ID** - 用户的唯一标识符列。
> - **事件时间** - 事件的时间戳列。
> - 可选[**事件名称**] - 如果表包含多种事件类型，该列用于对事件进行细分。

<Image size="lg" img={mitzu_05} alt="Mitzu 事件目录配置，显示列映射选项" border />
<br/>
所有表配置完成后，点击 `保存并更新事件目录` 按钮，Mitzu 将从上述定义的表中找到所有事件及其属性。此步骤可能需要几分钟，具体取决于数据集的大小。

## 6. 运行细分查询 {#4-run-segmentation-queries}

在 Mitzu 中进行用户细分与在 Amplitude、Mixpanel 或 PostHog 中一样简单。

探索页面的左侧有事件选择区域，而顶部区域则允许您配置时间范围。

<Image size="lg" img={mitzu_06} alt="Mitzu 细分查询界面，显示事件选择和时间配置" border />

<br/>

:::tip 过滤器和细分
过滤操作与您预期的一样：选择一个属性（ClickHouse 列），并从下拉菜单中选择要过滤的值。
您可以为细分选择任何事件或用户属性（有关如何集成用户属性，请参见下文）。
:::

## 7. 运行漏斗查询 {#5-run-funnel-queries}

选择最多 9 个步骤以创建漏斗。选择用户可以完成漏斗的时间窗口。
无需编写一行 SQL 代码即可获得即时的转化率洞察。

<Image size="lg" img={mitzu_07} alt="Mitzu 漏斗分析视图，显示步骤之间的转化率" border />

<br/>

:::tip 可视化趋势
选择 `漏斗趋势` 以可视化漏斗随时间变化的趋势。
:::

## 8. 运行留存查询 {#6-run-retention-queries}

选择最多 2 个步骤以计算留存率。选择留存窗口，获取有关
用户的即时转化率洞察，无需编写一行 SQL 代码。

<Image size="lg" img={mitzu_08} alt="Mitzu 留存分析，显示队列留存率" border />

<br/>

:::tip 队列留存
选择 `每周队列留存` 以可视化您的留存率随时间变化的情况。
:::


## 9. 运行旅程查询 {#7-run-journey-queries}
选择最多 9 个步骤以创建漏斗。选择用户可以完成旅程的时间窗口。Mitzu 旅程图为您提供了用户在选定事件中采取的每条路径的可视化地图。

<Image size="lg" img={mitzu_09} alt="Mitzu 旅程可视化，显示事件之间的用户路径流" border />
<br/>

:::tip 细分步骤
您可以为细分 `细分` 选择一个属性，以区分同一步骤中的用户。
:::

<br/>

## 10. 运行收入查询 {#8-run-revenue-queries}
如果收入设置已配置，Mitzu 可以根据您的付款事件计算总的 MRR 和订阅数。

<Image size="lg" img={mitzu_10} alt="Mitzu 收入分析仪表板，显示 MRR 指标" border />

## 11. SQL 原生 {#9-sql-native}

Mitzu 是 SQL 原生的，这意味着它会根据您在探索页面上选择的配置生成原生 SQL 代码。

<Image size="lg" img={mitzu_11} alt="Mitzu SQL 代码生成视图，显示原生 ClickHouse 查询" border />

<br/>

:::tip 在 BI 工具中继续工作
如果您在 Mitzu 界面遇到限制，请复制 SQL 代码并继续在 BI 工具中工作。
:::

## Mitzu 支持 {#mitzu-support}

如果您感到迷茫，请随时通过 [support@mitzu.io](email://support@mitzu.io) 联系我们。

或者您可以访问我们的 Slack 社区 [这里](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)。

## 了解更多 {#learn-more}

在 [mitzu.io](https://mitzu.io) 找到更多关于 Mitzu 的信息。

访问我们的文档页面 [docs.mitzu.io](https://docs.mitzu.io)。
