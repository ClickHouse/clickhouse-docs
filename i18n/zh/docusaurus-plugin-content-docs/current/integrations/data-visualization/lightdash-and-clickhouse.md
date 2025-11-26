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
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash

<PartnerBadge/>

Lightdash 是一个为现代数据团队构建的 **AI 优先 BI 平台**，将 dbt 的开放性与 ClickHouse 的高性能相结合。通过将 ClickHouse 连接到 Lightdash，团队可以基于其 dbt 语义层获得 **由 AI 驱动的自助分析体验**，从而确保每个问题都由经过治理且一致的指标来回答。

开发者喜欢 Lightdash 的开放架构、支持版本控制的 YAML 模型，以及能够无缝融入其工作流的集成功能——从 GitHub 到 IDE。

这一合作将 **ClickHouse 的极速性能** 与 **Lightdash 的开发者体验**相结合，使得借助 AI 进行数据探索、可视化和洞察自动化变得前所未有地轻松。



## 使用 Lightdash 和 ClickHouse 构建交互式仪表板 {#build-an-interactive-dashboard}

本指南将介绍如何使用 **Lightdash** 连接 **ClickHouse** 来探索 dbt 模型并构建交互式仪表板。
以下示例展示了一个由 ClickHouse 数据驱动的完整仪表板。

<Image size='md' img={lightdash_02} alt='Lightdash 仪表板示例' border />

<VerticalStepper headerLevel="h3">

### 收集连接数据 {#connection-data-required}

设置 Lightdash 与 ClickHouse 之间的连接时,需要以下信息:

- **Host:** ClickHouse 数据库的运行地址
- **User:** ClickHouse 数据库用户名
- **Password:** ClickHouse 数据库密码
- **DB name:** ClickHouse 数据库名称
- **Schema:** dbt 用于编译和运行项目的默认模式(可在 `profiles.yml` 中找到)
- **Port:** ClickHouse HTTPS 接口端口(默认值:`8443`)
- **Secure:** 启用此选项以使用 HTTPS/SSL 进行安全连接
- **Retries:** Lightdash 重试失败的 ClickHouse 查询的次数(默认值:`3`)
- **Start of week:** 选择报告周的起始日;默认使用数据仓库设置

<ConnectionDetails />

---

### 为 ClickHouse 配置 dbt 配置文件 {#configuring-your-dbt-profile-for-clickhouse}

在 Lightdash 中,连接基于现有的 **dbt 项目**。
要连接 ClickHouse,请确保本地 `~/.dbt/profiles.yml` 文件包含有效的 ClickHouse 目标配置。

例如:

<Image
  size='md'
  img={lightdash_01}
  alt='lightdash-clickhouse 项目的 profiles.yml 配置示例'
  border
/>
<br />

### 创建连接到 ClickHouse 的 Lightdash 项目 {#creating-a-lightdash-project-connected-to-clickhouse}

配置好 ClickHouse 的 dbt 配置文件后,还需要将 **dbt 项目**连接到 Lightdash。

由于此过程对所有数据仓库都相同,此处不再详述——请参阅 Lightdash 官方指南了解如何导入 dbt 项目:

[导入 dbt 项目 → Lightdash 文档](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

连接 dbt 项目后,Lightdash 将自动从 `profiles.yml` 文件中检测 ClickHouse 配置。连接测试成功后,即可开始探索 dbt 模型并构建由 ClickHouse 驱动的仪表板。

---

### 在 Lightdash 中探索 ClickHouse 数据 {#exploring-your-clickhouse-data-in-lightdash}

连接后,Lightdash 会自动同步 dbt 模型并提供:

- 在 YAML 中定义的**维度**和**度量**
- **语义层逻辑**,如指标、连接和探索
- 由实时 ClickHouse 查询驱动的**仪表板**

现在可以构建仪表板、共享洞察,甚至使用 **Ask AI** 直接在 ClickHouse 上生成可视化——无需手动编写 SQL。

---

### 在 Lightdash 中定义指标和维度 {#defining-metrics-and-dimensions-in-lightdash}

在 Lightdash 中,所有**指标**和**维度**都直接在 dbt 模型的 `.yml` 文件中定义。这使业务逻辑具有版本控制、一致性和完全透明性。

<Image
  size='md'
  img={lightdash_03}
  alt='在 .yml 文件中定义指标的示例'
  border
/>
<br />

在 YAML 中定义这些内容可确保团队在仪表板和分析中使用相同的定义。例如,可以在 dbt 模型旁边创建可重用的指标,如 `total_order_count`、`total_revenue` 或 `avg_order_value`——无需在 UI 中重复定义。

要了解如何定义这些内容的更多信息,请参阅以下 Lightdash 指南:

- [如何创建指标](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
- [如何创建维度](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### 从表中查询数据 {#querying-your-data-from-tables}

将 dbt 项目连接并同步到 Lightdash 后,可以直接从**表**(或"探索")开始探索数据。
每个表代表一个 dbt 模型,并包含在 YAML 中定义的指标和维度。

**探索**页面由五个主要区域组成:


1. **维度和指标** — 所选表中的所有可用字段
2. **过滤器** — 限制查询返回的数据范围
3. **图表** — 将查询结果可视化
4. **结果** — 查看从 ClickHouse 数据库返回的原始数据
5. **SQL** — 查看生成结果的 SQL 查询语句

<Image
  size='lg'
  img={lightdash_04}
  alt='Lightdash 探索视图,显示维度、过滤器、图表、结果和 SQL'
  border
/>

在此基础上,您可以交互式地构建和调整查询 — 通过拖放字段、添加过滤器,以及在表格、柱状图或时间序列等可视化类型之间切换。

要深入了解探索功能以及如何查询表中的数据,请参阅:  
[表和探索页面简介 → Lightdash 文档](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### 构建仪表板 {#building-dashboards}

在探索数据并保存可视化结果后,您可以将它们组合到**仪表板**中与团队共享。

Lightdash 中的仪表板完全支持交互操作 — 您可以应用过滤器、添加选项卡,并查看由实时 ClickHouse 查询驱动的图表。

您还可以**直接在仪表板内**创建新图表,这有助于保持项目井然有序。以这种方式创建的图表**专属于该仪表板** — 无法在项目的其他位置重复使用。

要创建仪表板专属图表:

1. 点击 **Add tile**
2. 选择 **New chart**
3. 在图表构建器中构建可视化
4. 保存后,图表将显示在仪表板底部

<Image
  size='lg'
  img={lightdash_05}
  alt='在 Lightdash 仪表板中创建和组织图表'
  border
/>

在此处了解有关如何创建和组织仪表板的更多信息:  
[构建仪表板 → Lightdash 文档](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI:由 dbt 驱动的自助式分析 {#ask-ai}

Lightdash 中的 **AI 代理**让数据探索真正实现自助服务。  
用户无需编写查询语句,只需用自然语言提问 — 例如 _"我们的月度收入增长是多少?"_ — AI 代理会自动生成相应的可视化结果,并引用您在 dbt 中定义的指标和模型以确保准确性和一致性。

它基于您在 dbt 中使用的同一语义层,这意味着每个答案都保持受治理、可解释且快速 — 全部由 ClickHouse 提供支持。

<Image
  size='lg'
  img={lightdash_06}
  alt='Lightdash Ask AI 界面,显示由 dbt 指标驱动的自然语言查询'
  border
/>

:::tip
在此处了解有关 AI 代理的更多信息:[AI 代理 → Lightdash 文档](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::

</VerticalStepper>


## 了解更多 {#learn-more}

要进一步了解如何将 dbt 项目连接到 Lightdash，请访问 [Lightdash 文档 → ClickHouse 配置](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)。
