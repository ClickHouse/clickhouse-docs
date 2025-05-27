---
'sidebar_title': 'Query Insights'
'slug': '/cloud/get-started/query-insights'
'description': 'system.query_logのデータを可視化して、クエリのデバッグとパフォーマンスの最適化を簡素化'
'keywords':
- 'query insights'
- 'query log'
- 'query log ui'
- 'system.query_log insights'
'title': 'クエリインサイト'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# クエリインサイト

**クエリインサイト**機能は、ClickHouseの組み込みクエリログをさまざまな視覚化やテーブルを通じて使いやすくします。ClickHouseの `system.query_log` テーブルは、クエリの最適化、デバッグ、全体のクラスターの健全性とパフォーマンスの監視において重要な情報源です。

## クエリ概要 {#query-overview}

サービスを選択すると、左側のサイドバーの**監視**ナビゲーションアイテムが展開され、新しい**クエリインサイト**サブアイテムが表示されます。このオプションをクリックすると、新しいクエリインサイトページが開きます。

<Image img={insights_overview} size="md" alt="クエリインサイトUIの概要" border/>

## トップレベルメトリクス {#top-level-metrics}

上部の統計ボックスは、選択した期間内の基本的なトップレベルのクエリメトリクスを表します。その下には、選択した時間ウィンドウ内のクエリの種類（select、insert、other）ごとに分けられたクエリボリューム、レイテンシ、およびエラーレートを示す3つの時系列チャートがあります。レイテンシチャートは、さらにp50、p90、p99のレイテンシを表示するように調整できます：

<Image img={insights_latency} size="md" alt="クエリインサイトUIのレイテンシチャート" border/>

## 最近のクエリ {#recent-queries}

トップレベルメトリクスの下には、選択した時間ウィンドウ内のクエリログエントリ（正規化されたクエリハッシュとユーザーごとにグループ化されたもの）を表示するテーブルがあります：

<Image img={insights_recent} size="md" alt="クエリインサイトUIの最近のクエリテーブル" border/>

最近のクエリは、利用可能な任意のフィールドでフィルタリングおよびソートできます。このテーブルは、テーブル名、p90、p99のレイテンシなどの追加フィールドを表示または非表示にするように構成することもできます。

## クエリの詳細表示 {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、その選択したクエリに特有のメトリクスと情報を含むフライアウトが開きます：

<Image img={insights_drilldown} size="md" alt="クエリインサイトUIのクエリ詳細表示" border/>

フライアウトからわかるように、この特定のクエリは過去24時間で3000回以上実行されています。**クエリ情報**タブのすべてのメトリクスは集約メトリクスですが、**クエリ履歴**タブを選択することで各実行のメトリクスを表示することもできます：

<Image img={insights_query_info} size="sm" alt="クエリインサイトUIのクエリ情報" border/>

<br />

このペインから、各クエリ実行の`設定`および`プロファイルイベント`項目を展開して追加情報を表示できます。
