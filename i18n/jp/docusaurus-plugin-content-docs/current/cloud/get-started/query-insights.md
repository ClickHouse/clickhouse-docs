---
sidebar_title: 'クエリインサイト'
slug: /cloud/get-started/query-insights
description: 'クエリデバッグとパフォーマンス最適化を簡素化するために system.query_log データを視覚化します'
keywords: ['クエリインサイト', 'クエリログ', 'クエリログ UI', 'system.query_log インサイト']
title: 'クエリインサイト'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# クエリインサイト

**クエリインサイト**機能は、ClickHouseの組み込みクエリログをさまざまな視覚化とテーブルを通じて使いやすくします。ClickHouseの`system.query_log`テーブルは、クエリの最適化、デバッグ、全体的なクラスターの健康状態とパフォーマンスの監視に関する重要な情報源です。

## クエリ概要 {#query-overview}

サービスを選択した後、左側のサイドバーの**監視**ナビゲーションアイテムが展開され、新しい**クエリインサイト**サブアイテムが表示されます。このオプションをクリックすると、新しいクエリインサイトページが開きます：

<Image img={insights_overview} size="md" alt="クエリインサイト UI 概要" border/>

## トップレベルメトリクス {#top-level-metrics}

上部の統計ボックスは、選択した期間内の基本的なトップレベルのクエリメトリクスを表しています。その下には、選択した時間ウィンドウでのクエリの種類（SELECT, INSERT, その他）別に分類されたクエリボリューム、レイテンシ、エラーレートを示す3つのタイムシリーズチャートがあります。レイテンシチャートは、p50、p90、およびp99のレイテンシを表示するようにさらに調整できます：

<Image img={insights_latency} size="md" alt="クエリインサイト UI レイテンシチャート" border/>

## 最近のクエリ {#recent-queries}

トップレベルメトリクスの下に、選択した時間ウィンドウにおけるクエリログエントリ（正規化されたクエリハッシュおよびユーザー別にグループ化）が表示されるテーブルがあります：

<Image img={insights_recent} size="md" alt="クエリインサイト UI 最近のクエリテーブル" border/>

最近のクエリは、利用可能な任意のフィールドでフィルタリングおよびソートできます。また、テーブルはテーブル名、p90、およびp99レイテンシなどの追加フィールドを表示したり隠したりするように構成できます。

## クエリ詳細 {#query-drill-down}

最近のクエリテーブルからクエリを選択すると、選択したクエリに特有のメトリクスと情報を含むフライアウトが開きます：

<Image img={insights_drilldown} size="md" alt="クエリインサイト UI クエリ詳細" border/>

フライアウトからわかるように、この特定のクエリは過去24時間で3000回以上実行されています。**クエリ情報**タブのすべてのメトリクスは集計されたメトリクスですが、**クエリ履歴**タブを選択することで、各実行からのメトリクスも表示できます：

<Image img={insights_query_info} size="sm" alt="クエリインサイト UI クエリ情報" border/>

<br />

このペインから、各クエリ実行の`設定`および`プロファイルイベント`アイテムを展開して追加情報を表示できます。
