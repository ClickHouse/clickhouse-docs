---
sidebar_title: 'クエリインサイト'
slug: /cloud/get-started/query-insights
description: 'システムテーブル system.query_log のデータを可視化し、クエリのデバッグとパフォーマンス最適化を容易にします'
keywords: ['query insights', 'query log', 'query log ui', 'system.query_log insights']
title: 'クエリインサイト'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# Query Insights

**Query Insights** 機能は、さまざまな可視化やテーブルによって、ClickHouse の組み込みクエリログをより扱いやすくします。ClickHouse の `system.query_log` テーブルは、クエリの最適化、デバッグ、クラスター全体の健全性およびパフォーマンスの監視における主要な情報源です。



## クエリ概要 {#query-overview}

サービスを選択すると、左サイドバーの**モニタリング**ナビゲーション項目が展開され、新しい**クエリインサイト**サブ項目が表示されます。このオプションをクリックすると、クエリインサイトページが開きます:

<Image
  img={insights_overview}
  size='md'
  alt='クエリインサイトUIの概要'
  border
/>


## トップレベルメトリクス {#top-level-metrics}

上部の統計ボックスには、選択された期間における基本的なトップレベルのクエリメトリクスが表示されます。その下には、選択された時間枠内でクエリの種類(SELECT、INSERT、その他)ごとに分類されたクエリ量、レイテンシ、エラー率を表す3つの時系列チャートが表示されます。レイテンシチャートは、p50、p90、p99のレイテンシを表示するようにさらに調整できます:

<Image
  img={insights_latency}
  size='md'
  alt='Query Insights UIレイテンシチャート'
  border
/>


## 最近のクエリ {#recent-queries}

トップレベルメトリクスの下には、選択した期間における正規化されたクエリハッシュとユーザーでグループ化されたクエリログエントリを表示するテーブルがあります:

<Image
  img={insights_recent}
  size='md'
  alt='Query Insights UI 最近のクエリテーブル'
  border
/>

最近のクエリは、利用可能な任意のフィールドでフィルタリングおよびソートできます。また、テーブル名、p90、p99レイテンシなどの追加フィールドの表示・非表示を設定することもできます。


## クエリのドリルダウン {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、選択したクエリに関する詳細なメトリクスと情報を含むフライアウトが開きます:

<Image
  img={insights_drilldown}
  size='md'
  alt='Query Insights UIのクエリドリルダウン'
  border
/>

フライアウトから確認できるように、この特定のクエリは過去24時間で3000回以上実行されています。**Query info**タブのすべてのメトリクスは集計メトリクスですが、**Query history**タブを選択することで個別実行のメトリクスも確認できます:

<Image
  img={insights_query_info}
  size='sm'
  alt='Query Insights UIのクエリ情報'
  border
/>

<br />

このペインでは、各クエリ実行の`Settings`と`Profile Events`項目を展開して追加情報を表示できます。
