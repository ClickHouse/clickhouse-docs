---
sidebar_label: 概要
sidebar_position: 1
keywords: [ClickHouse, 接続, Luzmo, Explo, Tableau, Grafana, Metabase, Mitzu, superset, Deepnote, Draxlr, RocketBI, Omni, bi, 可視化, ツール]
---


# ClickHouseにおけるデータの可視化

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

あなたのデータがClickHouseに入ったので、分析を行う時間です。分析には、BIツールを使用して視覚化を作成することが含まれます。多くの人気のあるBIおよび可視化ツールがClickHouseに接続できます。いくつかはデフォルトでClickHouseに接続しますが、他のツールはコネクタをインストールする必要があります。以下は、いくつかのツールに関するドキュメントです：

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

## ClickHouse Cloudとデータ可視化ツールの互換性 {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| ツール                                                                    | サポート方法                   | テスト済み | ドキュメント | コメント                                                                                                                                 |
|-------------------------------------------------------------------------|-------------------------------|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouseの公式コネクタ | ✅      | ✅          |                                                                                                                                         |
| [Astrato](./astrato-and-clickhouse.md)      | ネイティブコネクタ | ✅      | ✅          | プッシュダウンSQLを使用してネイティブに動作します（直接クエリのみ）。 |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQLインターフェース               | ✅      | ✅          | 制限があります。詳細は[ドキュメント](./quicksight-and-clickhouse.md)を参照してください。                |
| [Deepnote](./deepnote.md)                            | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Explo](./explo-and-clickhouse.md)                   | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | ClickHouseの公式コネクタ | ✅      | ✅          |                                                                                                                                         |
| [Hashboard](./hashboard-and-clickhouse.md)           | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Looker](./looker-and-clickhouse.md)                 | ネイティブコネクタ              | ✅      | ✅          | 制限があります。詳細は[ドキュメント](./looker-and-clickhouse.md)を参照してください。                    |
| Looker                                                                  | MySQLインターフェース               | 🚧     | ❌          |                                                                                                                                         |
| [Luzmo](./luzmo-and-clickhouse.md)                   | ClickHouseの公式コネクタ | ✅      | ✅          |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQLインターフェース               | ✅      | ✅          |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouseの公式コネクタ | ✅      | ✅          |                                                                                                        
| [Mitzu](./mitzu-and-clickhouse.md)                   | ネイティブコネクタ | ✅      | ✅          |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouseの公式コネクタ | ✅      | ✅          | ODBC経由で、直接クエリモードをサポートしています。                                                                                                   |
| [Power BI service](/integrations/powerbi#power-bi-service)                                                    | ClickHouseの公式コネクタ | ✅    | ✅          | [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)の設定が必要です。 |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | ネイティブコネクタ              | ✅      | ✅          |        
| [Rocket BI](./rocketbi-and-clickhouse.md)            | ネイティブコネクタ              | ✅      | ❌          |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouseの公式コネクタ | ✅      | ✅          |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQLインターフェース               | ✅      | ✅          | 制限があります。詳細は[ドキュメント](./tableau/tableau-online-and-clickhouse.md)を参照してください。            |
| [Zing Data](./zingdata-and-clickhouse.md)            | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
