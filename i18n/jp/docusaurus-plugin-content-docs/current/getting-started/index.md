---
slug: /getting-started/example-datasets/
sidebar_position: 0
sidebar_label: 概要
keywords: [clickhouse, install, tutorial, sample, datasets]
pagination_next: 'tutorial'
---


# チュートリアルとサンプルデータセット

ClickHouseの使い方を学ぶためのリソースが多数あります。

- ClickHouseを立ち上げる必要がある場合は、[クイックスタート](../quick-start.mdx)を確認してください。
- [ClickHouseチュートリアル](../tutorial.md)では、ニューヨーク市のタクシーライドのデータセットを分析します。

また、サンプルデータセットはClickHouseを使った作業を良い体験として提供し、重要な技術やコツを学び、ClickHouseの多くの強力な機能を活用する方法を確認できます。サンプルデータセットには以下が含まれています：

<!-- このページの目次テーブルは自動的に生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールド：slug, description, titleから。

誤りを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->

| ページ | 説明 |
|-----|-----|
| [ニューヨークタクシーデータ](/docs/getting-started/example-datasets/nyc-taxi) | 2009年以降にニューヨーク市で発生した数十億のタクシーおよび配車車両（Uber、Lyftなど）のデータ |
| [Criteoのテラバイトクリックログ](/docs/getting-started/example-datasets/criteo) | Criteoからのテラバイトのクリックログ |
| [WikiStat](/docs/getting-started/example-datasets/wikistat) | 0.5兆レコードを含むWikiStatデータセットを探索します。 |
| [TPC-DS (2012)](/docs/getting-started/example-datasets/tpcds) | TPC-DSベンチマークデータセットとクエリ。 |
| [レシピデータセット](/docs/getting-started/example-datasets/recipes) | 220万のレシピを含むRecipeNLGデータセット |
| [COVID-19オープンデータ](/docs/getting-started/example-datasets/covid19) | COVID-19オープンデータは、COVID-19の疫学データや、人口統計、経済、政府の対応などの関連要因に関する大規模なオープンソースデータベースです。 |
| [NOAAグローバルヒストリカル気候ネットワーク](/docs/getting-started/example-datasets/noaa) | 過去120年間の気候データの25億行 |
| [GitHubイベントデータセット](/docs/getting-started/example-datasets/github-events) | 2011年から2020年12月6日までのGitHub上のすべてのイベントを含むデータセットで、31億のレコードがあります。 |
| [Amazonカスタマーレビュー](/docs/getting-started/example-datasets/amazon-reviews) | Amazon製品の1億5千万以上のカスタマーレビュー |
| [ブラウン大学ベンチマーク](/docs/getting-started/example-datasets/brown-benchmark) | 機械生成されたログデータのための新しい分析ベンチマーク |
| [GitHubデータを使用したClickHouseでのクエリ作成](/docs/getting-started/example-datasets/github) | ClickHouseリポジトリのすべてのコミットと変更を含むデータセット |
| [ClickHouseを使用してStack Overflowデータを分析する](/docs/getting-started/example-datasets/stackoverflow) | ClickHouseを使用したStack Overflowデータの分析 |
| [AMPLabビッグデータベンチマーク](/docs/getting-started/example-datasets/amplab-benchmark) | データウェアハウジングソリューションのパフォーマンスを比較するために使用されるベンチマークデータセット。 |
| [ニューヨーク公共図書館「メニューに何がありますか？」データセット](/docs/getting-started/example-datasets/menus) | ホテル、レストラン、カフェのメニューとその価格に関する歴史的データの130万レコードを含むデータセット。 |
| [Laion-400Mデータセット](/docs/getting-started/example-datasets/laion-400m-dataset) | 英語の画像キャプション付きの4億枚の画像を含むデータセット |
| [スター・スキーマ・ベンチマーク（SSB, 2009）](/docs/getting-started/example-datasets/star-schema) | スター・スキーマ・ベンチマーク（SSB）データセットとクエリ |
| [英国の物件価格データセット](/docs/getting-started/example-datasets/uk-price-paid) | 英国の不動産の購入価格に関するデータを含むUKプロパティデータセットを使用して、頻繁に実行するクエリのパフォーマンスを向上させるためのプロジェクションの使用法を学びます。 |
| [Redditコメントデータセット](/docs/getting-started/example-datasets/reddit-comments) | 2005年12月から2023年3月までのReddit上の公開コメントを含むデータセットで、JSON形式で140億行以上のデータがあります。 |
| [OnTime](/docs/getting-started/example-datasets/ontime) | 航空機のフライトの時間通りのパフォーマンスを含むデータセット |
| [台湾の歴史的気象データセット](/docs/getting-started/example-datasets/tw-weather) | 過去128年間の気象観測データの1.31億行 |
| [The OpenSky Network 2020からのクラウドソース航空交通データ](/docs/getting-started/example-datasets/opensky) | このデータセットのデータは、COVID-19パンデミック中の航空交通の発展を示すために、完全なOpenSkyデータセットから派生およびクリーンアップされたものです。 |
| [NYPD苦情データ](/docs/getting-started/example-datasets/nypd_complaint_data) | タブ区切り値データを取り込み、5ステップでクエリ |
| [TPC-H (1999)](/docs/getting-started/example-datasets/tpch) | TPC-Hベンチマークデータセットとクエリ。 |
| [YouTubeの嫌悪データセット](/docs/getting-started/example-datasets/youtube-dislikes) | YouTube動画の嫌悪のコレクション。 |
| [セルタワーデータセットを使用したGeoデータ](/docs/getting-started/example-datasets/cell-towers) | OpenCelliDデータをClickHouseにロードし、Apache SupersetをClickHouseに接続し、データに基づいてダッシュボードを構築する方法を学びます。 |
| [環境センサーのデータ](/docs/getting-started/example-datasets/environmental-sensors) | Sensor.Communityからのデータの200億以上のレコード、そのコミュニティ駆動のグローバルセンサー網がOpen Environmental Dataを生成しています。 |
| [匿名化されたウェブ分析](/docs/getting-started/example-datasets/metrica) | ヒット数と訪問数を含む匿名化されたウェブ分析データを持つ2つのテーブルからなるデータセット |

