---
'sidebar_title': 'Query Insights'
'slug': '/cloud/get-started/query-insights'
'description': 'システム.query_log データを視覚化してクエリ デバッグとパフォーマンス最適化を簡素化します'
'keywords':
- 'query insights'
- 'query log'
- 'query log ui'
- 'system.query_log insights'
'title': 'クエリ インサイト'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# Query Insights

**Query Insights** 機能は、ClickHouse の組み込みクエリログをさまざまな視覚化と表を通じて使いやすくします。ClickHouse の `system.query_log` テーブルは、クエリの最適化、デバッグ、および全体的なクラスターの健康とパフォーマンスの監視において重要な情報源です。

## Query overview {#query-overview}

サービスを選択した後、左サイドバーの **Monitoring** ナビゲーション項目が展開され、新しい **Query insights** サブアイテムが表示されるはずです。このオプションをクリックすると、新しい Query insights ページが開きます。

<Image img={insights_overview} size="md" alt="Query Insights UI Overview" border/>

## Top-level metrics {#top-level-metrics}

上部の統計ボックスは、選択した期間にわたる基本的なトップレベルのクエリメトリクスを表しています。その下には、選択した時間ウィンドウにわたるクエリの種類（select、insert、other）別に分かれたクエリ量、レイテンシ、およびエラーレートを表す 3 つの時系列グラフが表示されています。レイテンシ グラフは、p50、p90、p99 のレイテンシを表示するようにさらに調整できます。

<Image img={insights_latency} size="md" alt="Query Insights UI Latency Chart" border/>

## Recent queries {#recent-queries}

トップレベルメトリクスの下には、選択した時間ウィンドウにわたるクエリログエントリ（正規化されたクエリハッシュとユーザーでグループ化）が表示されるテーブルがあります。

<Image img={insights_recent} size="md" alt="Query Insights UI Recent Queries Table" border/>

最近のクエリは、利用可能な任意のフィールドでフィルタリングおよびソートできます。また、テーブルは、テーブルや p90、p99 のレイテンシなどの追加フィールドを表示または非表示にするように設定することもできます。

## Query drill-down {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、選択したクエリに特有のメトリクスと情報を含むフライアウトが開きます。

<Image img={insights_drilldown} size="md" alt="Query Insights UI Query Drill down" border/>

フライアウトから分かるように、この特定のクエリは過去 24 時間で 3000 回以上実行されています。**Query info** タブの全メトリクスは集約メトリクスですが、**Query history** タブを選択することで、個々の実行からのメトリクスも表示できます。

<Image img={insights_query_info} size="sm" alt="Query Insights UI Query Information" border/>

<br />

このペインから、各クエリ実行の `Settings` および `Profile Events` 項目を展開して、追加情報を表示できます。
