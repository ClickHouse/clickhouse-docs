---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker 是一个企业级平台，提供 BI、数据应用和嵌入式分析功能，帮助你实时探索和分享洞察。'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker

<PartnerBadge/>

Looker 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署的 ClickHouse。



## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航至 Admin -> Database -> Connections,然后点击右上角的 "Add Connection" 按钮。

<Image
  size='md'
  img={looker_01}
  alt="在 Looker 数据库管理界面中添加新连接"
  border
/>
<br />

为您的数据源选择一个名称,并从数据库类型下拉菜单中选择 `ClickHouse`。在表单中输入您的凭据信息。

<Image
  size='md'
  img={looker_02}
  alt='在 Looker 连接表单中指定 ClickHouse 凭据'
  border
/>
<br />

如果您使用的是 ClickHouse Cloud 或您的部署需要 SSL,请确保在附加设置中开启 SSL。

<Image
  size='md'
  img={looker_03}
  alt='在 Looker 设置中为 ClickHouse 连接启用 SSL'
  border
/>
<br />

首先测试您的连接,测试通过后,连接到您的新 ClickHouse 数据源。

<Image
  size='md'
  img={looker_04}
  alt='测试并连接到 ClickHouse 数据源'
  border
/>
<br />

现在您应该能够将 ClickHouse 数据源关联到您的 Looker 项目了。


## 3. 已知限制 {#3-known-limitations}

1. 以下数据类型默认按字符串处理：
   - Array - 由于 JDBC 驱动的限制，序列化无法正常工作
   - Decimal\* - 可在模型中改为数值类型
   - LowCardinality(...) - 可在模型中改为相应类型
   - Enum8, Enum16
   - UUID
   - Tuple
   - Map
   - JSON
   - Nested
   - FixedString
   - Geo types
     - MultiPolygon
     - Polygon
     - Point
     - Ring
2. 不支持[对称聚合功能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)
3. 驱动中尚未实现[全外连接](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)
