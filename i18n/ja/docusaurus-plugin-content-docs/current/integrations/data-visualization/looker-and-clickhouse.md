---
sidebar_label: Looker
slug: /integrations/looker
keywords: [clickhouse, looker, connect, integrate, ui]
description: Lookerは、リアルタイムでインサイトを探求し共有するのに役立つBI、データアプリケーション、組み込み分析のためのエンタープライズプラットフォームです。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Looker

Lookerは公式のClickHouseデータソースを介して、ClickHouse Cloudまたはオンプレミスのデプロイメントに接続できます。

## 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

管理者 -> データベース -> 接続に移動し、右上隅の「接続を追加」ボタンをクリックします。

<img src={require('./images/looker_01.png').default} class="image" alt="新しい接続の追加" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

データソースの名前を選択し、ダイアレクトのドロップダウンから `ClickHouse` を選択します。フォームに認証情報を入力します。

<img src={require('./images/looker_02.png').default} class="image" alt="認証情報の指定" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

ClickHouse Cloudを使用している場合や、デプロイメントにSSLが必要な場合は、追加設定でSSLがオンになっていることを確認してください。

<img src={require('./images/looker_03.png').default} class="image" alt="SSLを有効にする" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

接続テストを最初に行い、完了したら新しいClickHouseデータソースに接続します。

<img src={require('./images/looker_04.png').default} class="image" alt="SSLを有効にする" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

これで、ClickHouseデータソースをLookerプロジェクトにアタッチできるはずです。

## 3. 知られている制限事項 {#3-known-limitations}

1. 次のデータ型はデフォルトで文字列として処理されます：
   * Array - JDBCドライバーの制限によりシリアル化が期待通りに動作しません
   * Decimal* - モデルで数値に変更可能
   * LowCardinality(...) - モデルで適切な型に変更可能
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geoタイプ
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [対称集約機能](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)はサポートされていません
3. [フル外部結合](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)はまだドライバーに実装されていません
