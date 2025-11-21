---
sidebar_title: 'クエリインサイト'
slug: /cloud/get-started/query-insights
description: 'クエリのデバッグとパフォーマンス最適化を容易にするために、system.query_log データを可視化します'
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


# クエリインサイト

**Query Insights** 機能は、さまざまな可視化やテーブルを通じて、ClickHouse の組み込みクエリログをより活用しやすくします。ClickHouse の `system.query_log` テーブルは、クエリ最適化、デバッグ、クラスター全体の健全性とパフォーマンスの監視のための主要な情報源です。



## クエリ概要 {#query-overview}

サービスを選択すると、左サイドバーの**Monitoring**ナビゲーション項目が展開され、新しい**Query insights**サブ項目が表示されます。このオプションをクリックすると、Query insightsページが開きます:

<Image
  img={insights_overview}
  size='md'
  alt='Query Insights UIの概要'
  border
/>


## トップレベルメトリクス {#top-level-metrics}

上部の統計ボックスには、選択された期間における基本的なトップレベルのクエリメトリクスが表示されます。その下には、選択された時間枠内でクエリの種類(select、insert、その他)ごとに分類されたクエリ量、レイテンシ、エラー率を表す3つの時系列チャートが表示されます。レイテンシチャートは、p50、p90、p99のレイテンシを表示するように調整することができます:

<Image
  img={insights_latency}
  size='md'
  alt='Query Insights UIレイテンシチャート'
  border
/>


## 最近のクエリ {#recent-queries}

トップレベルメトリクスの下には、選択した期間における(正規化されたクエリハッシュとユーザーでグループ化された)クエリログエントリを表示するテーブルがあります:

<Image
  img={insights_recent}
  size='md'
  alt='Query Insights UI 最近のクエリテーブル'
  border
/>

最近のクエリは、利用可能な任意のフィールドでフィルタリングおよびソートできます。また、テーブル名、p90、p99レイテンシなどの追加フィールドを表示または非表示にするようテーブルを設定することもできます。


## クエリのドリルダウン {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、選択したクエリに関する詳細なメトリクスと情報を含むフライアウトが開きます:

<Image
  img={insights_drilldown}
  size='md'
  alt='Query Insights UIのクエリドリルダウン'
  border
/>

フライアウトから確認できるように、この特定のクエリは過去24時間で3000回以上実行されています。**Query info**タブ内のすべてのメトリクスは集計されたメトリクスですが、**Query history**タブを選択することで個別の実行結果のメトリクスも表示できます:

<Image
  img={insights_query_info}
  size='sm'
  alt='Query Insights UIのクエリ情報'
  border
/>

<br />

このペインから、各クエリ実行の`Settings`と`Profile Events`項目を展開して追加情報を表示することができます。
