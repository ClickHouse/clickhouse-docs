---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker 是一个企业级平台，面向 BI、数据应用和嵌入式分析，帮助你实时探索和分享数据洞察。'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Looker {#looker}

<PartnerBadge/>

Looker 可以通过官方的 ClickHouse 数据源连接到 ClickHouse Cloud 或自托管的 ClickHouse 部署。

## 1. 收集连接信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航到 Admin -> Database -> Connections，然后单击右上角的 “Add Connection” 按钮。

<Image size="md" img={looker_01} alt="在 Looker 的数据库管理界面中添加新连接" border />
<br/>

为数据源选择一个名称，并在 “Dialect” 下拉列表中选择 `ClickHouse`。在表单中输入连接凭据。

<Image size="md" img={looker_02} alt="在 Looker 连接表单中填写 ClickHouse 凭据" border />
<br/>

如果您使用的是 ClickHouse Cloud，或者部署需要 SSL，请确保在附加设置中启用 SSL。

<Image size="md" img={looker_03} alt="在 Looker 设置中为 ClickHouse 连接启用 SSL" border />
<br/>

请先测试连接，测试通过后，再连接到新的 ClickHouse 数据源。

<Image size="md" img={looker_04} alt="测试并连接到 ClickHouse 数据源" border />
<br/>

现在，您应该可以将 ClickHouse 数据源关联到 Looker 项目中。

## 3. 已知限制 {#3-known-limitations}

1. 以下数据类型默认按字符串类型处理：
   * Array - 由于 JDBC 驱动的限制，序列化无法按预期工作
   * Decimal* - 可以在模型中修改为数值类型
   * LowCardinality(...) - 可以在模型中修改为合适的数据类型
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geo 类型
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. 不支持 [Symmetric aggregate（对称聚合）功能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)
3. 驱动程序中尚未实现 [Full outer join（完全外连接）](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)
