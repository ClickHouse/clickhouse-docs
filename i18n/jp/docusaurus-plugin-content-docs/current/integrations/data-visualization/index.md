---
sidebar_label: '概要'
sidebar_position: 1
keywords:
- 'ClickHouse'
- 'connect'
- 'Luzmo'
- 'Explo'
- 'Tableau'
- 'Grafana'
- 'Metabase'
- 'Mitzu'
- 'superset'
- 'Deepnote'
- 'Draxlr'
- 'RocketBI'
- 'Omni'
- 'bi'
- 'visualization'
- 'tool'
title: 'ClickHouseでデータを可視化する'
slug: '/integrations/data-visualization'
description: 'ClickHouseでデータの可視化について学ぶ'
---




# ClickHouseでのデータの視覚化

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

データがClickHouseに入ったので、分析を行う時が来ました。分析には通常、BIツールを使用して視覚化を構築することが含まれます。多くの人気のあるBIおよび視覚化ツールがClickHouseに接続します。一部はClickHouseにアウトオブボックスで接続される一方、他はコネクタをインストールする必要があります。いくつかのツールに関するドキュメントがあります。

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

## ClickHouse Cloudとデータ視覚化ツールの互換性 {#clickhouse-cloud-compatibility-with-data-visualization-tools}

| ツール                                                                           | サポート方法                     | テスト済み | ドキュメント化 | コメント                                                                                                                                    |
|--------------------------------------------------------------------------------|----------------------------------|------------|----------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)       | ClickHouse公式コネクタ         | ✅          | ✅              |                                                                                                                                             |
| [Astrato](./astrato-and-clickhouse.md)       | ネイティブコネクタ             | ✅          | ✅              | プッシュダウンSQL（直接クエリのみ）を使用してネイティブに動作します。                                                                          |
| [AWS QuickSight](./quicksight-and-clickhouse.md)    | MySQLインターフェース           | ✅          | ✅              | 一部制限付きで動作します。詳細については[ドキュメント](./quicksight-and-clickhouse.md)を参照してください。                               |
| [Chartbrew](./chartbrew-and-clickhouse.md)          | ClickHouse公式コネクタ         | ✅          | ✅              |                                                                                                                                             |
| [Deepnote](./deepnote.md)                              | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
| [Explo](./explo-and-clickhouse.md)                    | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
| [Grafana](./grafana/index.md)                          | ClickHouse公式コネクタ         | ✅          | ✅              |                                                                                                                                             |
| [Hashboard](./hashboard-and-clickhouse.md)           | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
| [Looker](./looker-and-clickhouse.md)                   | ネイティブコネクタ             | ✅          | ✅              | 一部制限付きで動作します。詳細については[ドキュメント](./looker-and-clickhouse.md)を参照してください。                                     |
| Looker                                                                 | MySQLインターフェース           | 🚧          | ❌              |                                                                                                                                             |
| [Luzmo](./luzmo-and-clickhouse.md)                     | ClickHouse公式コネクタ         | ✅          | ✅              |                                                                                                                                             |
| [Looker Studio](./looker-studio-and-clickhouse.md)    | MySQLインターフェース           | ✅          | ✅              |                                                                                                                                             |
| [Metabase](./metabase-and-clickhouse.md)               | ClickHouse公式コネクタ         | ✅          | ✅              |                                                                                                                                             |
| [Mitzu](./mitzu-and-clickhouse.md)                     | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
| [Omni](./omni-and-clickhouse.md)                       | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
| [Power BI Desktop](./powerbi-and-clickhouse.md)        | ClickHouse公式コネクタ         | ✅          | ✅              | ODBC経由で接続し、直接クエリモードをサポートします。                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service) | ClickHouse公式コネクタ         | ✅          | ✅              | [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)のセットアップが必要です。 |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)          | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
| [Rocket BI](./rocketbi-and-clickhouse.md)             | ネイティブコネクタ             | ✅          | ❌              |                                                                                                                                             |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md) | ClickHouse公式コネクタ         | ✅          | ✅              |                                                                                                                                             |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQLインターフェース           | ✅          | ✅              | 一部制限付きで動作します。詳細については[ドキュメント](./tableau/tableau-online-and-clickhouse.md)を参照してください。                   |
| [Zing Data](./zingdata-and-clickhouse.md)             | ネイティブコネクタ             | ✅          | ✅              |                                                                                                                                             |
