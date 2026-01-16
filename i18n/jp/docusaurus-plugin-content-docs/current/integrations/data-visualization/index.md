---
sidebar_label: '概要'
sidebar_position: 1
keywords: ['ClickHouse', 'connect', 'Luzmo', 'Explo', 'Fabi.ai', 'Tableau', 'Grafana', 'Metabase', 'Mitzu', 'superset', 'Databrain','Deepnote', 'Draxlr', 'RocketBI', 'Omni', 'bi', 'visualization', 'tool', 'lightdash']
title: 'ClickHouse におけるデータ可視化'
slug: /integrations/data-visualization
description: 'ClickHouse におけるデータ可視化について学ぶ'
doc_type: 'guide'
---

# ClickHouse でのデータの可視化 \{#visualizing-data-in-clickhouse\}

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

データが ClickHouse に取り込まれたので、次はそれを分析する段階です。多くの場合、これは BI ツールを使って可視化を作成することを意味します。一般的な BI / 可視化ツールの多くは ClickHouse に接続できます。ClickHouse に標準で対応しているツールもあれば、コネクタのインストールが必要なツールもあります。以下のツールの一部については、ドキュメントを用意しています：

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
- [Holistics BI](./community_integrations/holistics-and-clickhouse.md)

## ClickHouse Cloud とデータ可視化ツールの互換性 \\{#clickhouse-cloud-compatibility-with-data-visualization-tools\\}

| Tool                                                                    | サポート方法                 | テスト済み | ドキュメント | コメント                                                                                                                                 |
|-------------------------------------------------------------------------|-------------------------------|--------|------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| [Apache Superset](./superset-and-clickhouse.md)      | ClickHouse 公式コネクタ | ✅      | ✅          |                                                                                                                                         |
| [Astrato](./community_integrations/astrato-and-clickhouse.md)      | ネイティブコネクタ | ✅      | ✅          | プッシュダウン SQL を利用したネイティブ動作（ダイレクトクエリのみ対応）。 |
| [AWS QuickSight](./quicksight-and-clickhouse.md)     | MySQL インターフェース               | ✅      | ✅          | いくつかの制限があります。詳細は [ドキュメント](./quicksight-and-clickhouse.md) を参照してください                |
| [Chartbrew](./community_integrations/chartbrew-and-clickhouse.md)           | ClickHouse 公式コネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Databrain](./community_integrations/databrain-and-clickhouse.md)           | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Deepnote](./community_integrations/deepnote.md)                            | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Dot](./community_integrations/dot-and-clickhouse.md)                            | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Explo](./community_integrations/explo-and-clickhouse.md)                   | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Fabi.ai](./community_integrations/fabi-and-clickhouse.md)                  | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Grafana](./grafana/index.md)                        | ClickHouse 公式コネクタ | ✅      | ✅          |                                                                                                                                         |
| [Hashboard](./community_integrations/hashboard-and-clickhouse.md)           | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Holistics](./community_integrations/holistics-and-clickhouse.md)           | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Lightdash](./lightdash-and-clickhouse.md)      | ネイティブコネクタ | ✅      | ✅          | 
            |
| [Looker](./looker-and-clickhouse.md)                 | ネイティブコネクタ              | ✅      | ✅          | いくつかの制限があります。詳細は [ドキュメント](./looker-and-clickhouse.md) を参照してください                    |
| Looker                                                                  | MySQL インターフェース               | 🚧     | ❌          |                                                                                                                                         |
| [Luzmo](./community_integrations/luzmo-and-clickhouse.md)                   | ClickHouse 公式コネクタ | ✅      | ✅          |                                                                                                                                         |
| [Looker Studio](./looker-studio-and-clickhouse.md)   | MySQL インターフェース               | ✅      | ✅          |                                                                                                                                         |
| [Metabase](./metabase-and-clickhouse.md)             | ClickHouse 公式コネクタ | ✅      | ✅          |
| [Mitzu](./community_integrations/mitzu-and-clickhouse.md)                   |  ネイティブコネクタ | ✅      | ✅          |                                                                                                                                         |
| [Omni](./omni-and-clickhouse.md)                     | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |
| [Power BI Desktop](./powerbi-and-clickhouse.md)      | ClickHouse 公式コネクタ | ✅      | ✅          | ODBC 経由でダイレクトクエリ モードをサポートします                                                                                                    |
| [Power BI service](/integrations/powerbi#power-bi-service)                                                    | ClickHouse 公式コネクタ | ✅    | ✅          | [Microsoft Data Gateway](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors) のセットアップが必要です |
| [Rill](https://docs.rilldata.com/reference/olap-engines/clickhouse)     | ネイティブコネクタ              | ✅      | ✅          |
| [Rocket BI](./community_integrations/rocketbi-and-clickhouse.md)            | ネイティブコネクタ              | ✅      | ❌          |                                                                                                                                         |
| [Tableau Desktop](./tableau/tableau-and-clickhouse.md)       | ClickHouse 公式コネクタ | ✅      | ✅          |                                                                                                               |
| [Tableau Online](./tableau/tableau-online-and-clickhouse.md) | MySQL インターフェース               | ✅      | ✅          | いくつかの制限があります。詳細は [ドキュメント](./tableau/tableau-online-and-clickhouse.md) を参照してください            |
| [Zing Data](./community_integrations/zingdata-and-clickhouse.md)            | ネイティブコネクタ              | ✅      | ✅          |                                                                                                                                         |