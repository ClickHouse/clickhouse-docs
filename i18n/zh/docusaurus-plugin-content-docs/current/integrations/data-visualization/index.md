---
sidebar_label: '概述'
sidebar_position: 1
keywords: ['ClickHouse', '连接', 'Luzmo', 'Explo', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', '可视化', '工具']
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

现在您的数据已在 ClickHouse 中，是时候进行分析，这通常涉及使用 BI 工具构建可视化。许多流行的 BI 和可视化工具可以连接到 ClickHouse。一些工具可以开箱即用地连接到 ClickHouse，而另一些则需要安装连接器。我们为一些工具提供了文档，包括：

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./astrato-and-clickhouse.md)
- [Deepnote](./deepnote.md)
- [Draxlr](./draxlr-and-clickhouse.md)
- [Explo](./explo-and-clickhouse.md)
- [Grafana](./grafana/index.md)
- [Looker](./looker-and-clickhouse.md)
- [Luzmo](./luzmo-and-clickhouse.md)
- [Metabase](./metabase-and-clickhouse.md)
- [Mitzu](./mitzu-and-clickhouse.md)
- [Omni](./omni-and-clickhouse.md)
- [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)
- [Rocket BI](./rocketbi-and-clickhouse.md)
- [Tableau](./tableau/tableau-and-clickhouse.md)
- [Zing Data](./zingdata-and-clickhouse.md)

## ClickHouse Cloud 与数据可视化工具的兼容性 {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| 工具                                                                    | 通过支持                  | 测试 | 文档     | 注释                                                                                                                                 |
|-------------------------------------------------------------------------|---------------------------|------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouse 官方连接器  | ✅    | ✅        |                                                                                                                                         |
| [Astrato](./astrato-and-clickhouse.md)      | 原生连接器              | ✅    | ✅        | 原生支持使用下推 SQL（仅限直接查询）。 |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQL 接口               | ✅    | ✅        | 有一些限制，详见 [文档](./quicksight-and-clickhouse.md)。                |
| [Deepnote](./deepnote.md)                            | 原生连接器              | ✅    | ✅        |                                                                                                                                         |
| [Explo](./explo-and-clickhouse.md)                   | 原生连接器              | ✅    | ✅        |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | ClickHouse 官方连接器  | ✅    | ✅        |                                                                                                                                         |
| [Hashboard](./hashboard-and-clickhouse.md)           | 原生连接器              | ✅    | ✅        |                                                                                                                                         |
| [Looker](./looker-and-clickhouse.md)                 | 原生连接器              | ✅    | ✅        | 有一些限制，详见 [文档](./looker-and-clickhouse.md)。                    |
| Looker                                                                  | MySQL 接口               | 🚧    | ❌        |                                                                                                                                         |
| [Luzmo](./luzmo-and-clickhouse.md)                   | ClickHouse 官方连接器  | ✅    | ✅        |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQL 接口               | ✅    | ✅        |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouse 官方连接器  | ✅    | ✅        |                                                                                                        
| [Mitzu](./mitzu-and-clickhouse.md)                   | 原生连接器              | ✅    | ✅        |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | 原生连接器              | ✅    | ✅        |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouse 官方连接器  | ✅    | ✅        | 通过 ODBC，支持直接查询模式                                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service)                                                    | ClickHouse 官方连接器  | ✅    | ✅        | 需要设置 [Microsoft 数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | 原生连接器              | ✅    | ✅        |        
| [Rocket BI](./rocketbi-and-clickhouse.md)            | 原生连接器              | ✅    | ❌        |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouse 官方连接器  | ✅    | ✅        |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQL 接口               | ✅    | ✅        | 有一些限制，详见 [文档](./tableau/tableau-online-and-clickhouse.md)。            |
| [Zing Data](./zingdata-and-clickhouse.md)            | 原生连接器              | ✅    | ✅        |                                                                                                                                         |
