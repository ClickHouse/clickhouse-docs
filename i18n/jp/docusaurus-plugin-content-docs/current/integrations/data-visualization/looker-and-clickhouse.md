---
sidebar_label: Looker
slug: /integrations/looker
keywords: [clickhouse, looker, connect, integrate, ui]
description: Lookerは、BI、データアプリケーション、および組み込み分析のためのエンタープライズプラットフォームであり、リアルタイムで洞察を探求し、共有するのに役立ちます。
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';


# Looker

Lookerは、公式のClickHouseデータソースを介して、ClickHouse Cloudまたはオンプレミスのデプロイメントに接続できます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Database -> Connectionsに移動し、右上隅の「Add Connection」ボタンをクリックします。

<img src={looker_01} class="image" alt="新しい接続を追加" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

データソースの名前を選択し、ダイアレクトのドロップダウンから`ClickHouse`を選択します。フォームに認証情報を入力します。

<img src={looker_02} class="image" alt="認証情報を指定" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

ClickHouse Cloudを使用している場合や、デプロイメントにSSLが必要な場合は、追加設定でSSLがオンになっていることを確認してください。

<img src={looker_03} class="image" alt="SSLを有効にする" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

まず接続をテストし、完了したら新しいClickHouseデータソースに接続します。

<img src={looker_04} class="image" alt="SSLを有効にする" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

これで、ClickHouseデータソースをLookerプロジェクトに添付できるようになります。

## 3. 既知の制限事項 {#3-known-limitations}

1. 次のデータ型はデフォルトで文字列として処理されます:
   * Array - シリアル化はJDBCドライバーの制限により期待どおりに動作しません
   * Decimal* - モデルで数値に変更できます
   * LowCardinality(...) - モデルで適切な型に変更できます
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geo types
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [対称的集約機能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)はサポートされていません
3. [フル外部結合](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)はまだドライバーに実装されていません
