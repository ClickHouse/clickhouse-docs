---
'sidebar_label': 'Mitzu'
'slug': '/integrations/mitzu'
'keywords':
- 'clickhouse'
- 'Mitzu'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Mitzu 是一个无代码的仓库原生产品分析应用程序。'
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

# 连接 Mitzu 与 ClickHouse

<CommunityMaintainedBadge/>

Mitzu 是一款无代码、仓库原生的产品分析应用。与 Amplitude、Mixpanel 和 PostHog 等工具类似，Mitzu 使用户能够在无需 SQL 或 Python 专业知识的情况下分析产品使用数据。

然而，和这些平台不同的是，Mitzu 不会复制公司的产品使用数据。相反，它直接在公司的现有数据仓库或数据湖上生成原生 SQL 查询。

## 目标 {#goal}

在本指南中，我们将覆盖以下内容：

- 仓库原生产品分析
- 如何将 Mitzu 集成到 ClickHouse 中

:::tip 示例数据集
如果您没有可供 Mitzu 使用的数据集，您可以使用纽约市出租车数据。
该数据集在 ClickHouse Cloud 中可用，或 [可以按照这些说明加载](/getting-started/example-datasets/nyc-taxi)。
:::

本指南只是如何使用 Mitzu 的简要概述。您可以在 [Mitzu 文档](https://docs.mitzu.io/) 中找到更详细的信息。

## 1. 收集您的连接细节 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 登录或注册 Mitzu {#2-sign-in-or-sign-up-to-mitzu}

第一步，前往 [https://app.mitzu.io](https://app.mitzu.io) 进行注册。

<Image size="lg" img={mitzu_01} alt="Mitzu 登录页面，包含电子邮件和密码输入框" border />

## 3. 配置您的工作区 {#3-configure-your-workspace}

创建组织后，按照左侧边栏中的 `设置您的工作区` 引导进行操作。然后，点击 `将 Mitzu 与您的数据仓库连接` 链接。

<Image size="lg" img={mitzu_02} alt="Mitzu 工作区设置页面，显示引导步骤" border />

## 4. 将 Mitzu 连接到 ClickHouse {#4-connect-mitzu-to-clickhouse}

首先，选择 ClickHouse 作为连接类型并设置连接细节。然后，点击 `测试连接并保存` 按钮以保存设置。

<Image size="lg" img={mitzu_03} alt="Mitzu ClickHouse 连接设置页面，包含配置表单" border />

## 5. 配置事件表 {#5-configure-event-tables}

连接保存后，选择 `事件表` 选项卡，点击 `添加表` 按钮。在弹出窗口中，选择您的数据库和想要添加到 Mitzu 的表。

使用复选框至少选择一个表，然后点击 `配置表` 按钮。这将打开一个模态窗口，您可以在其中为每个表设置关键列。

<Image size="lg" img={mitzu_04} alt="Mitzu 表选择界面，显示数据库表" border />
<br/>

> 要在您的 ClickHouse 设置上运行产品分析，您需要 > 指定表中的几个关键列。
>
> 这些列包括：
>
> - **用户 ID** - 用户的唯一标识符的列。
> - **事件时间** - 您事件的时间戳列。
> - 可选[**事件名称**] - 此列用于对事件进行细分，如果表中包含多个事件类型。

<Image size="lg" img={mitzu_05} alt="Mitzu 事件目录配置，显示列映射选项" border />
<br/>
一旦所有表配置完成，点击 `保存并更新事件目录` 按钮，Mitzu 将从上述定义的表中找到所有事件及其属性。此步骤可能需要几分钟，具体取决于您的数据集大小。

## 4. 运行分段查询 {#4-run-segmentation-queries}

在 Mitzu 中进行用户分段与在 Amplitude、Mixpanel 或 PostHog 中一样简单。

探索页面左侧有事件选择区域，而顶部部分允许您配置时间范围。

<Image size="lg" img={mitzu_06} alt="Mitzu 分段查询界面，提供事件选择和时间配置" border />

<br/>

:::tip 过滤和细分
过滤就如您所期望的那样进行：选择一个属性（ClickHouse 列）并从下拉菜单中选择您想要过滤的值。
您可以选择任何事件或用户属性进行细分（请参见下文以了解如何集成用户属性）。
:::

## 5. 运行漏斗查询 {#5-run-funnel-queries}

选择最多 9 个步骤进行漏斗分析。选择用户可以完成漏斗的时间窗口。
立即获得转化率洞察，无需编写任何 SQL 代码。

<Image size="lg" img={mitzu_07} alt="Mitzu 漏斗分析视图，显示各步骤之间的转化率" border />

<br/>

:::tip 可视化趋势
选择 `漏斗趋势` 可可视化漏斗趋势随时间的变化。
:::

## 6. 运行留存查询 {#6-run-retention-queries}

选择最多 2 个步骤进行留存率计算。选择留存窗口以进行定期窗口
立即获得转化率洞察，无需编写任何 SQL 代码。

<Image size="lg" img={mitzu_08} alt="Mitzu 留存分析，显示队列留存率" border />

<br/>

:::tip 队列留存
选择 `每周队列留存` 以可视化您的留存率随时间的变化。
:::


## 7. 运行旅程查询 {#7-run-journey-queries}
选择最多 9 个步骤进行漏斗分析。选择用户能够完成旅程的时间窗口。Mitzu 旅程图为您提供了用户在所选事件之间所采取的每个路径的可视化地图。

<Image size="lg" img={mitzu_09} alt="Mitzu 旅程可视化，显示用户在事件之间的路径流" border />
<br/>

:::tip 细分步骤
您可以选择一个属性用于细分 `细分`，以区分同一步骤中的用户。
:::

<br/>

## 8. 运行收入查询 {#8-run-revenue-queries}
如果收入设置已配置，Mitzu 可以根据您的支付事件计算总 MRR 和订阅数量。

<Image size="lg" img={mitzu_10} alt="Mitzu 收入分析仪表板，显示 MRR 指标" border />

## 9. SQL 原生 {#9-sql-native}

Mitzu 是 SQL 原生的，这意味着它根据您在探索页面上选择的配置生成原生 SQL 代码。

<Image size="lg" img={mitzu_11} alt="Mitzu SQL 代码生成视图，显示原生 ClickHouse 查询" border />

<br/>

:::tip 在 BI 工具中继续您的工作
如果您在 Mitzu UI 中遇到限制，复制 SQL 代码并在 BI 工具中继续您的工作。
:::

## Mitzu 支持 {#mitzu-support}

如果您迷路了，请随时通过 [support@mitzu.io](email://support@mitzu.io) 联系我们。

或者您可以通过 [这里](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg) 加入我们的 Slack 社区。

## 了解更多 {#learn-more}

在 [mitzu.io](https://mitzu.io) 找到有关 Mitzu 的更多信息。

访问我们的文档页面 [docs.mitzu.io](https://docs.mitzu.io)。
