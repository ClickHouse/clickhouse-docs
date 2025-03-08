---
sidebar_label: Looker
slug: /integrations/looker
keywords: [clickhouse, looker, connect, integrate, ui]
description: Looker 是一个企业平台，用于商业智能、数据应用和嵌入式分析，帮助您实时探索和共享洞察。
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';


# Looker

Looker 可以通过官方的 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署。

## 1. 收集您的连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建一个 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航至 Admin -> Database -> Connections，并点击右上角的“添加连接”按钮。

<img src={looker_01} class="image" alt="添加新的连接" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

为您的数据源选择一个名称，并在方言下拉菜单中选择 `ClickHouse`。在表单中输入您的凭据。

<img src={looker_02} class="image" alt="指定您的凭据" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

如果您使用的是 ClickHouse Cloud 或您的部署需要 SSL，请确保在附加设置中开启 SSL。

<img src={looker_03} class="image" alt="启用 SSL" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

首先测试您的连接，一旦完成，就连接到您的新的 ClickHouse 数据源。

<img src={looker_04} class="image" alt="启用 SSL" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

现在，您应该能够将 ClickHouse 数据源附加到您的 Looker 项目中。

## 3. 已知限制 {#3-known-limitations}

1. 默认情况下，以下数据类型被处理为字符串：
   * Array - 由于 JDBC 驱动程序的限制，序列化未按预期工作
   * Decimal* - 可以在模型中更改为数字
   * LowCardinality(...) - 可以在模型中更改为适当的类型
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
2. [对称聚合特性](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates) 不受支持
3. [全外连接](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer) 在驱动程序中尚未实现
