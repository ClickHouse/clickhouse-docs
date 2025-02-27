---
sidebar_label: 概要
sidebar_position: 1
keywords: [ClickHouse, 接続, Luzmo, Explo, Tableau, Grafana, Metabase, Mitzu, superset, Deepnote, Draxlr, RocketBI, Omni, bi, 可視化, ツール]
---

# ClickHouseでのデータの可視化

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

データがClickHouseにあるので、次はそれを分析する時です。分析にはBIツールを使用して可視化を構築することがよく含まれます。多くの人気のBIおよび可視化ツールはClickHouseに接続できます。一部は標準でClickHouseに接続でき、他はコネクタをインストールする必要があります。以下に、いくつかのツールのドキュメントを示します。

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

## ClickHouseクラウドとデータ可視化ツールの互換性 {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| ツール                                                                  | サポート方式                 | テスト済み | 文書化     | コメント                                                                                                                                 |
|-------------------------------------------------------------------------|------------------------------|------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouse公式コネクタ      | ✅          | ✅          |                                                                                                                                           |
| [Astrato](./astrato-and-clickhouse.md)      | ネイティブコネクタ         | ✅          | ✅          | プッシュダウンSQL（直接クエリのみ）を使用してネイティブに動作します。 |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQLインターフェース        | ✅          | ✅          | 一部制限があります。詳細は[ドキュメント](./quicksight-and-clickhouse.md)を参照してください。                |
| [Deepnote](./deepnote.md)                            | ネイティブコネクタ        | ✅          | ✅          |                                                                                                                                           |
| [Explo](./explo-and-clickhouse.md)                   | ネイティブコネクタ        | ✅          | ✅          |                                                                                                                                           |
| [Grafana](./grafana/index.md)                        | ClickHouse公式コネクタ      | ✅          | ✅          |                                                                                                                                           |
| [Hashboard](./hashboard-and-clickhouse.md)           | ネイティブコネクタ        | ✅          | ✅          |                                                                                                                                           |
| [Looker](./looker-and-clickhouse.md)                 | ネイティブコネクタ        | ✅          | ✅          | 一部制限があります。詳細は[ドキュメント](./looker-and-clickhouse.md)を参照してください。                    |
| Looker                                                                  | MySQLインターフェース        | 🚧          | ❌          |                                                                                                                                           |
| [Luzmo](./luzmo-and-clickhouse.md)                   | ClickHouse公式コネクタ      | ✅          | ✅          |                                                                                                                                           |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQLインターフェース        | ✅          | ✅          |                                                                                                                                           |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouse公式コネクタ      | ✅          | ✅          |                                                                                                        
| [Mitzu](./mitzu-and-clickhouse.md)                   | ネイティブコネクタ         | ✅          | ✅          |                                                                                                                                           |
| [Omni](./omni-and-clickhouse.md)                     | ネイティブコネクタ         | ✅          | ✅          |                                                                                                                                           |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouse公式コネクタ      | ✅          | ✅          | ODBC経由で、直接クエリモードをサポートします。                                                                                                    |
| [Power BIサービス](/integrations/powerbi#power-bi-service)                                                    | ClickHouse公式コネクタ      | ✅          | ✅          | A [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) のセットアップが必要です。 |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | ネイティブコネクタ         | ✅          | ✅          |        
| [Rocket BI](./rocketbi-and-clickhouse.md)            | ネイティブコネクタ         | ✅          | ❌          |                                                                                                                                           |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouse公式コネクタ      | ✅          | ✅          |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQLインターフェース        | ✅          | ✅          | 一部制限があります。詳細は[ドキュメント](./tableau/tableau-online-and-clickhouse.md)を参照してください。            |
| [Zing Data](./zingdata-and-clickhouse.md)            | ネイティブコネクタ         | ✅          | ✅          |                                                                                                                                           |
