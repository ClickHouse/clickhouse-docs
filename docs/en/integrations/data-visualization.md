---
sidebar_label: Overview
sidebar_position: 1
keywords: [clickhouse, connect, explo, tableau, grafana, metabase, mitzu, superset, deepnote, draxlr, rocketbi, omni, bi, visualization, tool]
---

# Visualizing Data in ClickHouse

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

- [Apache Superset](./data-visualization/superset-and-clickhouse.md)
- [Deepnote](./data-visualization/deepnote.md)
- [Draxlr](./data-visualization/draxlr-and-clickhouse.md)
- [Explo](./data-visualization/explo-and-clickhouse.md)
- [Grafana](./data-visualization/grafana/index.md)
- [Looker](./data-visualization/looker-and-clickhouse.md)
- [Metabase](./data-visualization/metabase-and-clickhouse.md)
- [Mitzu](./data-visualization/mitzu-and-clickhouse.md)
- [Omni](./data-visualization/omni-and-clickhouse.md)
- [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)
- [Rocket BI](./data-visualization/rocketbi-and-clickhouse.md)
- [Tableau](data-visualization/tableau/tableau-and-clickhouse.md)
- [Zing Data](./data-visualization/zingdata-and-clickhouse.md)

## ClickHouse Cloud Compatibility with Data Visualization Tools

| Tool                                                                    | Supported via                 | Tested | Documented | Comment                                                                                                                                 |
|-------------------------------------------------------------------------|-------------------------------|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./data-visualization/superset-and-clickhouse.md)      | ClickHouse official connector | ✅      | ✅          |                                                                                                                                         |
| [AWS QuickSight](./data-visualization/quicksight-and-clickhouse.md)     | MySQL interface               | ✅      | ✅          | Works with some limitations, see [the documentation](./data-visualization/quicksight-and-clickhouse.md) for more details                |
| [Deepnote](./data-visualization/deepnote.md)                            | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Explo](./data-visualization/explo-and-clickhouse.md)                   | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Grafana](./data-visualization/grafana/index.md)                        | ClickHouse official connector | ✅      | ✅          |                                                                                                                                         |
| [Hashboard](./data-visualization/hashboard-and-clickhouse.md)           | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Looker](./data-visualization/looker-and-clickhouse.md)                 | Native connector              | ✅      | ✅          | Works with some limitations, see [the documentation](./data-visualization/looker-and-clickhouse.md) for more details                    |
| Looker                                                                  | MySQL interface               | 🚧     | ❌          |                                                                                                                                         |
| [Looker Studio](./data-visualization/looker-studio-and-clickhouse.md)   | MySQL interface               | ✅      | ✅          |                                                                                                                                         |
| [Metabase](./data-visualization/metabase-and-clickhouse.md)             | ClickHouse official connector | ✅      | ✅          |                                                                                                        
| [Mitzu](./data-visualization/mitzu-and-clickhouse.md)                   |  Native connector | ✅      | ✅          |                                                                                                                                         |
| [Omni](./data-visualization/omni-and-clickhouse.md)                     | Native connector              | ✅      | ✅          |                                                                                                                                         |
| [Power BI Desktop](./data-visualization/powerbi-and-clickhouse.md)      | ClickHouse official connector | ✅      | ✅          | Via ODBC, supports direct query mode                                                                                                    |
| [Power BI service](https://clickhouse.com/docs/en/integrations/powerbi#power-bi-service)                                                    | ClickHouse official connector | ✅    | ✅          | A [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) setup is required |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | Native connector              | ✅      | ✅          |        
| [Rocket BI](./data-visualization/rocketbi-and-clickhouse.md)            | Native connector              | ✅      | ❌          |                                                                                                                                         |
| [Tableau Desktop](data-visualization/tableau/tableau-and-clickhouse.md)       | ClickHouse official connector | ✅      | ✅          |                                                                                                               |
| [Tableau Online](data-visualization/tableau/tableau-online-and-clickhouse.md) | MySQL interface               | ✅      | ✅          | Works with some limitations, see [the documentation](data-visualization/tableau/tableau-online-and-clickhouse.md) for more details            |
| [Zing Data](./data-visualization/zingdata-and-clickhouse.md)            | Native connector              | ✅      | ✅          |                                                                                                                                         |
