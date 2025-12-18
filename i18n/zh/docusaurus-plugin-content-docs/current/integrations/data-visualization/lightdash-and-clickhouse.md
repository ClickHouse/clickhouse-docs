---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', 'data visualization', 'BI', 'semantic layer', 'dbt', 'self-serve analytics', 'connect']
description: 'Lightdash 是一个构建在 dbt 之上的现代开源 BI 工具，使团队能够通过语义层使用 ClickHouse 探索和可视化数据。了解如何将 Lightdash 连接到 ClickHouse，以实现由 dbt 驱动的快速、可治理分析。'
title: '将 Lightdash 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import lightdash_01 from '@site/static/images/integrations/data-visualization/lightdash_01.png';
import lightdash_02 from '@site/static/images/integrations/data-visualization/lightdash_02.png';
import lightdash_03 from '@site/static/images/integrations/data-visualization/lightdash_03.png';
import lightdash_04 from '@site/static/images/integrations/data-visualization/lightdash_04.png';
import lightdash_05 from '@site/static/images/integrations/data-visualization/lightdash_05.png';
import lightdash_06 from '@site/static/images/integrations/data-visualization/lightdash_06.png';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash {#lightdash}

<PartnerBadge/>

Lightdash 是一个为现代数据团队构建的 **AI 优先 BI 平台**，将 dbt 的开放性与 ClickHouse 的高性能相结合。通过将 ClickHouse 连接到 Lightdash，团队可以基于其 dbt 语义层获得 **由 AI 驱动的自助式分析体验**，从而确保每个问题都由经过治理且一致的指标来回答。

开发者喜欢 Lightdash 的开放架构、支持版本控制的 YAML 模型，以及能够无缝融入其工作流程的集成功能——从 GitHub 到 IDE。

此次合作将 **ClickHouse 的极速性能** 与 **Lightdash 的开发者体验**相结合，使得借助 AI 进行数据探索、可视化和洞察自动化变得前所未有地轻松。

## 使用 Lightdash 和 ClickHouse 构建交互式仪表板 {#build-an-interactive-dashboard}

本指南将介绍如何使用 **Lightdash** 连接 **ClickHouse** 来探索 dbt 模型并构建交互式仪表板。
以下示例展示了一个由 ClickHouse 数据驱动的完整仪表板。

<Image size='md' img={lightdash_02} alt='Lightdash 仪表板示例' border />

<VerticalStepper headerLevel="h3">
  ### 收集连接数据

  设置 Lightdash 与 ClickHouse 之间的连接时,需要以下信息:

  * **Host:** ClickHouse 数据库所在地址
  * **User:** ClickHouse 数据库用户名
  * **Password:** ClickHouse 数据库密码
  * **DB name:** 您的 ClickHouse 数据库名称
  * **Schema:** dbt 用于编译和运行项目时使用的默认 schema(在 `profiles.yml` 中配置)
  * **Port:** ClickHouse HTTPS 接口端口（默认：`8443`）
  * **Secure:** 启用此选项以通过 HTTPS/SSL 建立安全连接
  * **Retries:** Lightdash 对失败的 ClickHouse 查询进行重试的次数（默认值：`3`）
  * **Start of week:** 选择报表周的起始日；默认为数据仓库中的设置

  <ConnectionDetails />

  ***

  ### 为 ClickHouse 配置 dbt 配置文件

  在 Lightdash 中,连接基于现有的 **dbt 项目**。
  要连接 ClickHouse,请确保本地 `~/.dbt/profiles.yml` 文件包含有效的 ClickHouse 目标配置。

  例如:

  <Image size="md" img={lightdash_01} alt="lightdash-clickhouse 项目的 profiles.yml 配置示例" border />

  <br />

  ### 创建连接到 ClickHouse 的 Lightdash 项目

  配置好 ClickHouse 的 dbt 配置文件后,还需要将 **dbt 项目**连接到 Lightdash。

  由于此过程对所有数据仓库都相同,此处不再详述——请参阅 Lightdash 官方指南了解如何导入 dbt 项目:

  [导入 dbt 项目 → Lightdash 文档](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  连接 dbt 项目后,Lightdash 将自动从 `profiles.yml` 文件中检测 ClickHouse 配置。连接测试成功后,即可开始探索 dbt 模型并构建由 ClickHouse 驱动的仪表板。

  ***

  ### 在 Lightdash 中探索 ClickHouse 数据

  连接后,Lightdash 会自动同步 dbt 模型并提供:

  * 在 YAML 中定义的**维度**和**度量**
  * **语义层逻辑**, 如指标、关联和探索
  * 由实时 ClickHouse 查询驱动的 **仪表板**

  现在可以构建仪表板、共享洞察,甚至使用 **Ask AI** 直接在 ClickHouse 上生成可视化——无需手动编写 SQL。

  ***

  ### 在 Lightdash 中定义指标和维度

  在 Lightdash 中,所有**指标**和**维度**都直接在 dbt 模型的 `.yml` 文件中定义。这使业务逻辑具有版本控制、一致性和完全透明性。

  <Image size="md" img={lightdash_03} alt="在 .yml 文件中定义指标的示例" border />

  <br />

  在 YAML 中定义这些内容可确保团队在仪表板和分析中使用相同的定义。例如,可以在 dbt 模型旁边创建可重用的指标,如 `total_order_count`、`total_revenue` 或 `avg_order_value`——无需在 UI 中重复定义。

  要了解如何定义这些内容的更多信息,请参阅以下 Lightdash 指南:

  * [如何创建指标](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  * [如何创建维度](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### 从表中查询数据

  将 dbt 项目连接并同步到 Lightdash 后,可以直接从**表**(或&quot;探索&quot;)开始探索数据。
  每个表代表一个 dbt 模型,并包含在 YAML 中定义的指标和维度。

  **探索**页面由五个主要区域组成:

  1. **维度和指标** — 所选表中所有可用字段
  2. **筛选器** — 用于限制查询返回的数据
  3. **图表** — 将查询结果可视化展示
  4. **Results** — 查看 ClickHouse 数据库返回的原始数据
  5. **SQL** — 查看生成这些结果的 SQL 查询

  <Image size="lg" img={lightdash_04} alt="Lightdash Explore 视图中展示了维度、筛选条件、图表、结果和 SQL" border />

  在此处,可以交互式地构建和调整查询——拖放字段、添加筛选器,并在表格、条形图或时间序列等可视化类型之间切换。

  要深入了解探索功能以及如何从表中查询数据,请参阅:
  [表和探索页面简介 → Lightdash 文档](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### 构建仪表板

  探索数据并保存可视化后,可以将它们组合到**仪表板**中与团队共享。

  Lightdash 中的仪表板完全交互式——您可以应用筛选器、添加选项卡并查看由实时 ClickHouse 查询驱动的图表。

  还可以**直接在仪表板中**创建新图表,这有助于保持项目的组织性和整洁。以这种方式创建的图表**专属于该仪表板**——无法在项目的其他位置重用。

  要创建仅用于仪表板的图表:

  1. 单击 **Add tile**
  2. 点击 **New chart**
  3. 在图表构建器中创建可视化图表
  4. 保存后,它会显示在仪表板底部

  <Image size="lg" img={lightdash_05} alt="在 Lightdash 仪表板中创建和管理图表" border />

  要了解如何创建和组织仪表板的更多信息,请参阅以下 Lightdash 指南:
  [构建仪表板 → Lightdash 文档](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### Ask AI:由 dbt 驱动的自助式分析

  Lightdash 中的 **AI Agents** 使数据探索真正实现自助服务。
  无需编写查询,只需用自然语言提问——例如 *&quot;我们的月度收入增长是多少?&quot;*——AI Agent 会自动生成正确的可视化,引用 dbt 定义的指标和模型以确保准确性和一致性。

  它由您在 dbt 中使用的同一语义层提供支持,这意味着每个答案都保持受控、可解释且快速——全部由 ClickHouse 支持。

  <Image size="lg" img={lightdash_06} alt="Lightdash Ask AI 界面，展示由 dbt 指标驱动的自然语言查询" border />

  :::tip
  在此了解有关 AI 代理的更多信息:[AI 代理 → Lightdash 文档](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  :::
</VerticalStepper>

## 了解更多 {#learn-more}

要进一步了解如何将 dbt 项目连接到 Lightdash，请访问 [Lightdash 文档 → ClickHouse 配置](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)。