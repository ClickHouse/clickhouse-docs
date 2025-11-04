---
'sidebar_label': 'Looker'
'slug': '/integrations/looker'
'keywords':
- 'clickhouse'
- 'looker'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Looker 是一个用于商业智能、数据应用和嵌入式分析的企业平台，帮助您实时探索和分享洞察。'
'title': 'Looker'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker

<CommunityMaintainedBadge/>

Looker 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航至 Admin -> Database -> Connections，在右上角点击 "Add Connection" 按钮。

<Image size="md" img={looker_01} alt="在 Looker 的数据库管理界面中添加新连接" border />
<br/>

为您的数据源选择一个名称，并从方言下拉菜单中选择 `ClickHouse`。在表单中输入您的凭据。

<Image size="md" img={looker_02} alt="在 Looker 连接表单中指定 ClickHouse 凭据" border />
<br/>

如果您正在使用 ClickHouse Cloud 或您的部署需要 SSL，请确保在附加设置中启用了 SSL。

<Image size="md" img={looker_03} alt="在 Looker 设置中为 ClickHouse 连接启用 SSL" border />
<br/>

首先测试您的连接，一旦完成，就连接到新的 ClickHouse 数据源。

<Image size="md" img={looker_04} alt="测试并连接到 ClickHouse 数据源" border />
<br/>

现在您应该能够将 ClickHouse 数据源附加到您的 Looker 项目。

## 3. 已知限制 {#3-known-limitations}

1. 默认情况下，以下数据类型被处理为字符串：
   * Array - 由于 JDBC 驱动程序的限制，序列化无法正常工作
   * Decimal* - 可以在模型中更改为数字
   * LowCardinality(...) - 可以在模型中更改为适当类型
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * 地理类型
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [对称聚合特性](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) 不支持
3. [全外连接](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) 尚未在驱动程序中实现
