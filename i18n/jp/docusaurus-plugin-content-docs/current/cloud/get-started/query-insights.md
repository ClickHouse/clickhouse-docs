---
sidebar_title: クエリインサイト
slug: /cloud/get-started/query-insights
description: クエリのデバッグとパフォーマンス最適化を簡素化するために system.query_log データを視覚化
keywords: [クエリインサイト, クエリログ, クエリログUI, system.query_logインサイト]
---

import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# クエリインサイト

**クエリインサイト** 機能は、ClickHouse の組み込みクエリログをさまざまな視覚化やテーブルを通じて使いやすくします。 ClickHouse の `system.query_log` テーブルは、クエリの最適化、デバッグ、クラスタ全体の健康状態とパフォーマンスの監視において重要な情報源です。

## クエリ概要 {#query-overview}

サービスを選択した後、左側のサイドバーの **Monitoring** ナビゲーション項目が展開され、新しい **Query insights** サブ項目が表示されます。このオプションをクリックすると、新しいクエリインサイトページが開きます：

<img src={insights_overview} alt="クエリインサイトUI概要"/>

## トップレベルメトリクス {#top-level-metrics}

上部の統計ボックスは、選択した期間の基本的なトップレベルのクエリメトリクスを表しています。その下には、選択した時間ウィンドウでクエリの種類（select, insert, other）ごとに分類されたクエリのボリューム、レイテンシ、エラーレートを示す3つの時系列チャートがあります。レイテンシチャートは、p50、p90、および p99 のレイテンシを表示するようにさらに調整できます：

<img src={insights_latency} alt="クエリインサイトUI レイテンシチャート"/>

## 最近のクエリ {#recent-queries}

トップレベルメトリクスの下には、選択した時間ウィンドウにおけるクエリログエントリ（正規化されたクエリハッシュとユーザーでグループ化）を表示するテーブルがあります：

<img src={insights_recent} alt="クエリインサイトUI 最近のクエリテーブル"/>

最近のクエリは、利用可能な任意のフィールドでフィルタリングおよびソートできます。テーブルは、テーブル、p90、および p99 のレイテンシなどの追加フィールドを表示または非表示にするように設定することもできます。

## クエリの詳細 {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、選択されたクエリに特有のメトリクスと情報を含むフライアウトが開きます：

<img src={insights_drilldown} alt="クエリインサイトUI クエリ詳細"/>

フライアウトから、この特定のクエリは過去24時間で3000回以上実行されたことがわかります。 **クエリ情報** タブのすべてのメトリクスは集計メトリクスですが、**クエリ履歴** タブを選択することで、個々の実行からのメトリクスも表示できます：

<img src={insights_query_info}    
  class="image"
  alt="クエリインサイトUI クエリ情報"
  style={{width: '400px'}} />

<br />

このペインでは、各クエリ実行の `Settings` および `Profile Events` 項目を展開して追加情報を表示することができます。
