---
sidebar_label: '概要'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', 'visualization', 'tool']
title: 'ClickHouseにおけるデータの可視化'
slug: /integrations/data-visualization
description: 'ClickHouseにおけるデータの可視化について学ぶ'
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

データがClickHouseに取り込まれたら、次は分析の準備をします。これは多くの場合、BIツールを使用して可視化を作成することを含みます。多くの人気のBIおよび可視化ツールがClickHouseに接続できます。いくつかはすぐに使える状態でClickHouseに接続できる一方で、他のツールはコネクタのインストールが必要です。以下のツールについてのドキュメントがあります：

- [Apache Superset](./superset-and-clickhouse.md)
- [Astrato](./astrato-and-clickhouse.md)
- [Chartbrew](./chartbrew-and-clickhouse.md)
- [Deepnote](./deepnote.md)
- [Draxlr](./draxlr-and-clickhouse.md)
- [Embeddable](./embeddable-and-clickhouse.md)
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

| ツール                                                                  | 対応方法                        | テスト済み | 文書化済み | コメント                                                                                                                                    |
|-------------------------------------------------------------------------|-------------------------------|--------|------------|------------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)                        | ClickHouse公式コネクタ        | ✅      | ✅          |                                                                                                                                          |
| [Astrato](./astrato-and-clickhouse.md)                                 | ネイティブコネクタ            | ✅      | ✅          | プッシュダウンSQL（直接クエリのみ）を使用してネイティブに動作します。                                                                                |
| [AWS QuickSight](./quicksight-and-clickhouse.md)                      | MySQLインターフェイス         | ✅      | ✅          | いくつかの制限があります。詳細は[ドキュメント](./quicksight-and-clickhouse.md)を参照してください。                                        |
| [Chartbrew](./chartbrew-and-clickhouse.md)                             | ClickHouse公式コネクタ        | ✅      | ✅          |                                                                                                                                          |
| [Deepnote](./deepnote.md)                                              | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                          |
| [Explo](./explo-and-clickhouse.md)                                     | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                          |
| [Grafana](./grafana/index.md)                                         | ClickHouse公式コネクタ        | ✅      | ✅          |                                                                                                                                          |
| [Hashboard](./hashboard-and-clickhouse.md)                             | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                          |
| [Looker](./looker-and-clickhouse.md)                                   | ネイティブコネクタ            | ✅      | ✅          | いくつかの制限があります。詳細は[ドキュメント](./looker-and-clickhouse.md)を参照してください。                                                |
| Looker                                                                  | MySQLインターフェイス         | 🚧     | ❌          |                                                                                                                                          |
| [Luzmo](./luzmo-and-clickhouse.md)                                     | ClickHouse公式コネクタ        | ✅      | ✅          |                                                                                                                                          |
| [Looker Studio](./looker-studio-and-clickhouse.md)                    | MySQLインターフェイス         | ✅      | ✅          |                                                                                                                                          |
| [Metabase](./metabase-and-clickhouse.md)                               | ClickHouse公式コネクタ        | ✅      | ✅          |                                                                                                                                                |
| [Mitzu](./mitzu-and-clickhouse.md)                                     | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                          |
| [Omni](./omni-and-clickhouse.md)                                       | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                          |
| [Power BI Desktop](./powerbi-and-clickhouse.md)                        | ClickHouse公式コネクタ        | ✅      | ✅          | ODBC経由で、直接クエリモードをサポートしています。                                                                                                |
| [Power BI service](/integrations/powerbi#power-bi-service)            | ClickHouse公式コネクタ        | ✅    | ✅          | [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)のセットアップが必要です。 |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)    | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                                |
| [Rocket BI](./rocketbi-and-clickhouse.md)                              | ネイティブコネクタ            | ✅      | ❌          |                                                                                                                                          |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)                 | ClickHouse公式コネクタ        | ✅      | ✅          |                                                                                                                                                |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md)          | MySQLインターフェイス         | ✅      | ✅          | いくつかの制限があります。詳細は[ドキュメント](./tableau/tableau-online-and-clickhouse.md)を参照してください。                                   |
| [Zing Data](./zingdata-and-clickhouse.md)                              | ネイティブコネクタ            | ✅      | ✅          |                                                                                                                                          |
