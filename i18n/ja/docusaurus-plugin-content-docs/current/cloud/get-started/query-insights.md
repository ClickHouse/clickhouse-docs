---
sidebar_title: クエリインサイト
slug: /cloud/get-started/query-insights
description: クエリのデバッグとパフォーマンスの最適化を簡素化するために system.query_log データを可視化します
keywords: [クエリインサイト, クエリログ, クエリログ UI, system.query_log インサイト]
---

# クエリインサイト

**クエリインサイト** 機能は、ClickHouseに組み込まれたクエリログを、さまざまな可視化とテーブルを通じて使いやすくします。ClickHouseの `system.query_log` テーブルは、クエリの最適化、デバッグ、全体的なクラスターの健康状態とパフォーマンスを監視するための重要な情報源です。

## クエリ概要 {#query-overview}

サービスを選択すると、左側のサイドバーの **Monitoring** ナビゲーションアイテムが展開され、新しい **Query insights** サブアイテムが表示されます。このオプションをクリックすると、新しいクエリインサイトページが開きます：

![クエリインサイト UI 概要](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/insights_overview.png)

## トップレベルメトリクス {#top-level-metrics}

上部の統計ボックスは、選択した期間にわたる基本的なトップレベルのクエリメトリクスを表します。その下には、選択した時間ウィンドウにおけるクエリの種類（select、insert、other）で分類されたクエリのボリューム、レイテンシ、およびエラーレートを示す3つの時系列チャートが表示されています。レイテンシチャートは、p50、p90、およびp99のレイテンシを表示するようにさらに調整できます：

![クエリインサイト UI レイテンシチャート](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/insights_latency.png)

## 最近のクエリ {#recent-queries}

トップレベルメトリクスの下に、選択した時間ウィンドウにわたるクエリログエントリ（正規化されたクエリハッシュとユーザーでグループ化）が表示されるテーブルがあります：

![クエリインサイト UI 最近のクエリテーブル](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/insights_recent.png)

最近のクエリは、任意の利用可能なフィールドによってフィルターおよびソートできます。また、テーブルはテーブル名やp90、p99のレイテンシなど、追加のフィールドを表示または非表示にするように構成できます。

## クエリの詳細 {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、選択したクエリに特有のメトリクスと情報を含むフライアウトが開きます：

![クエリインサイト UI クエリの詳細](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/insights_drilldown.png)

フライアウトからわかるように、この特定のクエリは過去24時間に3000回以上実行されています。**クエリ情報**タブのすべてのメトリクスは集計メトリクスですが、**クエリ履歴**タブを選択することで個別の実行からのメトリクスも表示できます：

<img src={require('@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/insights_query_info.png').default}    
  class="image"
  alt="クエリインサイト UI クエリ情報"
  style={{width: '400px'}} />

<br />

このペインでは、各クエリ実行の `Settings` および `Profile Events` アイテムを展開して、追加の情報を表示できます。
