---
sidebar_label: '概览'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Fabi.ai', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Databrain','Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'BI', '数据可视化', '工具', 'lightdash']
title: 'ClickHouse 中的数据可视化'
slug: /integrations/data-visualization
description: '了解如何在 ClickHouse 中进行数据可视化'
doc_type: 'guide'
---



# 在 ClickHouse 中可视化数据

<div class='vimeo-container'>
<iframe
   src="https://player.vimeo.com/video/754460217?h=3dcae2e1ca"
   width="640"
   height="360"
   frameborder="0"
   allow="autoplay; fullscreen; picture-in-picture"
   allowfullscreen>
</iframe>
</div>

<br/>

现在数据已经进入 ClickHouse，可以开始进行分析了，而这通常需要借助 BI 工具构建可视化图表。许多主流的 BI 和可视化工具都可以连接 ClickHouse。有些工具原生支持 ClickHouse，开箱即用即可连接，而另一些则需要安装连接器。我们为其中的一些工具提供了文档，包括：

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./community_integrations/astrato-and-clickhouse.md)
- [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)
- [Databrain](./community_integrations/databrain-and-clickhouse.md)
- [Deepnote](./community_integrations/deepnote.md)
- [Dot](./community_integrations/dot-and-clickhouse.md)
- [Draxlr](./community_integrations/draxlr-and-clickhouse.md)
- [Embeddable](./community_integrations/embeddable-and-clickhouse.md)
- [Explo](./community_integrations/explo-and-clickhouse.md)
- [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)
- [Grafana](./grafana/index.md)
- [Lightdash](./lightdash-and-clickhouse.md)
- [Looker](./looker-and-clickhouse.md)
- [Luzmo](./community_integrations/luzmo-and-clickhouse.md)
- [Metabase](./metabase-and-clickhouse.md)
- [Mitzu](./community_integrations/mitzu-and-clickhouse.md)
- [Omni](./omni-and-clickhouse.md)
- [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)
- [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)
- [Tableau](./tableau/tableau-and-clickhouse.md)
- [Zing Data](./community_integrations/zingdata-and-clickhouse.md)



## ClickHouse Cloud 与数据可视化工具的兼容性 {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| 工具                                                                | 支持方式                 | 已测试 | 已记录 | 备注                                                                                                                                 |
| ------------------------------------------------------------------- | ----------------------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Apache Superset](./superset-and-clickhouse.md)                     | ClickHouse 官方连接器 | ✅     | ✅         |                                                                                                                                         |
| [Astrato](./community_integrations/astrato-and-clickhouse.md)       | 原生连接器              | ✅     | ✅         | 使用下推 SQL 原生工作(仅支持直接查询)。                                                                                  |
| [AWS QuickSight](./quicksight-and-clickhouse.md)                    | MySQL 接口               | ✅     | ✅         | 存在一些限制,详见[文档](./quicksight-and-clickhouse.md)                                   |
| [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)   | ClickHouse 官方连接器 | ✅     | ✅         |                                                                                                                                         |
| [Databrain](./community_integrations/databrain-and-clickhouse.md)   | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Deepnote](./community_integrations/deepnote.md)                    | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Dot](./community_integrations/dot-and-clickhouse.md)               | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Explo](./community_integrations/explo-and-clickhouse.md)           | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)          | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Grafana](./grafana/index.md)                                       | ClickHouse 官方连接器 | ✅     | ✅         |                                                                                                                                         |
| [Hashboard](./community_integrations/hashboard-and-clickhouse.md)   | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Lightdash](./lightdash-and-clickhouse.md)                          | 原生连接器              | ✅     | ✅         |
|  |
| [Looker](./looker-and-clickhouse.md)                                | 原生连接器              | ✅     | ✅         | 存在一些限制,详见[文档](./looker-and-clickhouse.md)                                       |
| Looker                                                              | MySQL 接口               | 🚧     | ❌         |                                                                                                                                         |
| [Luzmo](./community_integrations/luzmo-and-clickhouse.md)           | ClickHouse 官方连接器 | ✅     | ✅         |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)                  | MySQL 接口               | ✅     | ✅         |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)                            | ClickHouse 官方连接器 | ✅     | ✅         |
| [Mitzu](./community_integrations/mitzu-and-clickhouse.md)           | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                                    | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)                     | ClickHouse 官方连接器 | ✅     | ✅         | 通过 ODBC,支持直接查询模式                                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service)          | ClickHouse 官方连接器 | ✅     | ✅         | 需要配置 [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse) | 原生连接器              | ✅     | ✅         |
| [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)    | 原生连接器              | ✅     | ❌         |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)              | ClickHouse 官方连接器 | ✅     | ✅         |                                                                                                                                         |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md)        | MySQL 接口               | ✅     | ✅         | 存在一些限制,详见[文档](./tableau/tableau-online-and-clickhouse.md)                       |
| [Zing Data](./community_integrations/zingdata-and-clickhouse.md)    | 原生连接器              | ✅     | ✅         |                                                                                                                                         |
