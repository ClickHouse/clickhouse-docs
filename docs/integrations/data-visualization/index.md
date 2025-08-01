---
sidebar_label: 'Overview'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Fabi.ai', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', 'visualization', 'tool']
title: 'Visualizing Data in ClickHouse'
slug: /integrations/data-visualization
description: 'Learn about Visualizing Data in ClickHouse'
---

# Visualizing data in ClickHouse

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

Now that your data is in ClickHouse, it's time to analyze it, which often involves building visualizations using a BI tool. Many of the popular BI and visualization tools connect to ClickHouse. Some connect to ClickHouse out-of-the-box, while others require a connector to be installed. We have docs for some of the tools, including:

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./astrato-and-clickhouse.md)
- [Chartbrew](./chartbrew-and-clickhouse.md)
- [Deepnote](./deepnote.md)
- [Draxlr](./draxlr-and-clickhouse.md)
- [Embeddable](./embeddable-and-clickhouse.md)
- [Explo](./explo-and-clickhouse.md)
- [Fabi.ai](./fabi-and-clickhouse.md)
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

## ClickHouse Cloud compatibility with data visualization tools {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| Tool                                                                    | Supported via                 | Tested | Documented | Comment                                                                                                                                 |
|-------------------------------------------------------------------------|-------------------------------|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouse official connector | ✅      | ✅          |                                                                                                                                         |
| [Astrato](./astrato-and-clickhouse.md)      | Native connector | ✅      | ✅          | Works natively using pushdown SQL (direct query only). |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQL interface               | ✅      | ✅          | Works with some limitations, see [the documentation](./quicksight-and-clickhouse.md) for more details                |
| [Chartbrew](./chartbrew-and-clickhouse.md)           | ClickHouse official connector              | ✅      | ✅          |                                                                                                                                         |
| [Deepnote](./deepnote.md)                            | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Explo](./explo-and-clickhouse.md)                   | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Fabi.ai](./fabi-and-clickhouse.md)                  | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | ClickHouse official connector | ✅      | ✅          |                                                                                                                                         |
| [Hashboard](./hashboard-and-clickhouse.md)           | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Looker](./looker-and-clickhouse.md)                 | Native connector              | ✅      | ✅          | Works with some limitations, see [the documentation](./looker-and-clickhouse.md) for more details                    |
| Looker                                                                  | MySQL interface               | 🚧     | ❌          |                                                                                                                                         |
| [Luzmo](./luzmo-and-clickhouse.md)                   | ClickHouse official connector | ✅      | ✅          |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQL interface               | ✅      | ✅          |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouse official connector | ✅      | ✅          |                                                                                                        
| [Mitzu](./mitzu-and-clickhouse.md)                   |  Native connector | ✅      | ✅          |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouse official connector | ✅      | ✅          | Via ODBC, supports direct query mode                                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service)                                                    | ClickHouse official connector | ✅    | ✅          | A [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) setup is required |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | Native connector              | ✅      | ✅          |        
| [Rocket BI](./rocketbi-and-clickhouse.md)            | Native connector              | ✅      | ❌          |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouse official connector | ✅      | ✅          |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQL interface               | ✅      | ✅          | Works with some limitations, see [the documentation](./tableau/tableau-online-and-clickhouse.md) for more details            |
| [Zing Data](./zingdata-and-clickhouse.md)            | Native connector              | ✅      | ✅          |                                                                                                                                         |
