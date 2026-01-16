---
sidebar_title: 'クエリインサイト'
slug: /cloud/get-started/query-insights
description: 'system.query_log データを可視化し、クエリのデバッグとパフォーマンスの最適化を容易にします'
keywords: ['クエリインサイト', 'クエリログ', 'クエリログ UI', 'system.query_log インサイト']
title: 'クエリインサイト'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';

# Query Insights \\{#query-insights\\}

**Query Insights** 機能は、さまざまな可視化やテーブルを通じて、ClickHouse の組み込みクエリログをより簡単に活用できるようにします。ClickHouse の `system.query_log` テーブルは、クエリ最適化、デバッグ、クラスタ全体の健全性とパフォーマンスの監視にとって重要な情報源です。

## クエリ概要 \\{#query-overview\\}

サービスを選択すると、左サイドバーの **Monitoring** ナビゲーション項目が展開され、新たに **Query insights** というサブ項目が表示されます。このオプションをクリックすると、新しい Query insights ページが開きます。

<Image img={insights_overview} size="md" alt="Query Insights UI Overview" border/>

## トップレベルメトリクス \\{#top-level-metrics\\}

上部の統計ボックスは、選択した期間におけるいくつかの基本的なクエリのトップレベルメトリクスを表しています。その下には、クエリ種別（select、insert、other）ごとに分解されたクエリ数、レイテンシ、エラー率を、選択した時間範囲にわたって可視化する 3 つの時系列チャートが表示されます。レイテンシチャートではさらに、p50、p90、p99 のレイテンシを表示するように切り替えることができます。

<Image img={insights_latency} size="md" alt="Query Insights UI Latency Chart" border/>

## 最近のクエリ \\{#recent-queries\\}

トップレベルのメトリクスの下には、選択した時間範囲におけるクエリログのエントリ（正規化されたクエリハッシュとユーザーごとにグループ化）がテーブルで表示されます。

<Image img={insights_recent} size="md" alt="Query Insights UI Recent Queries Table" border/>

最近のクエリは、利用可能な任意のフィールドでフィルタおよびソートできます。テーブルでは、テーブル名や p90 / p99 レイテンシなどの追加フィールドを表示または非表示にするように設定することもできます。

## クエリのドリルダウン \\{#query-drill-down\\}

最近のクエリテーブルからクエリを選択すると、選択したクエリに固有のメトリクスと情報を含むフライアウトが開きます。

<Image img={insights_drilldown} size="md" alt="Query Insights UI Query Drill down" border/>

フライアウトから分かるように、このクエリは過去24時間に 3,000 回以上実行されています。**Query info** タブに表示されるメトリクスはすべて集計メトリクスですが、**Query history** タブを選択することで、各実行ごとのメトリクスも表示できます。

<Image img={insights_query_info} size="sm" alt="Query Insights UI Query Information" border/>

<br />

このペインからは、各クエリ実行の `Settings` および `Profile Events` 項目を展開して、追加情報を表示できます。
