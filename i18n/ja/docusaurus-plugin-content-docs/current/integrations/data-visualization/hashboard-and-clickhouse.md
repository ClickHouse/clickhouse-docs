---
sidebar_label: ハッシュボード
sidebar_position: 132
slug: /integrations/hashboard
keywords: [clickhouse, ハッシュボード, 接続, 統合, ui, 分析]
description: ハッシュボードは、リアルタイムデータ分析のためにClickHouseと簡単に統合できる堅牢な分析プラットフォームです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';

# ClickHouseとハッシュボードの接続

[ハッシュボード](https://hashboard.com)は、組織内の誰もがメトリクスを追跡し、実用的な洞察を発見できるインタラクティブなデータ探索ツールです。ハッシュボードは、あなたのClickHouseデータベースに対してライブSQLクエリを発行し、セルフサービスやアドホックなデータ探索のユースケースに特に便利です。  

<img src={require('./images/hashboard_01.png').default} class="image" alt="ハッシュボードデータエクスプローラー" />  

<br/>

このガイドでは、ハッシュボードをあなたのClickHouseインスタンスに接続する手順を説明します。この情報は、ハッシュボードの[ClickHouse統合ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse)にも掲載されています。

## 前提条件 {#pre-requisites}

- 自分のインフラストラクチャ上、または[ClickHouse Cloud](https://clickhouse.com/)上にホストされたClickHouseデータベース。
- [ハッシュボードアカウント](https://hashboard.com/getAccess)およびプロジェクト。

## ハッシュボードをClickHouseに接続する手順 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. ハッシュボードに新しいデータベース接続を追加する {#2-add-a-new-database-connection-in-hashboard}

1. [ハッシュボードプロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーの歯車アイコンをクリックして設定ページを開きます。
3. `+ 新しいデータベース接続`をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 前に収集した情報を使用して、**接続名**、**ホスト**、**ポート**、**ユーザー名**、**パスワード**、および**データベース**フィールドを入力します。
6. 「テスト」をクリックして接続が正しく構成されていることを確認します。
7. 「追加」をクリックします。

これで、ClickHouseデータベースがハッシュボードに接続され、[データモデル](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[メトリクス](https://docs.hashboard.com/docs/metrics)、および[ダッシュボード](https://docs.hashboard.com/docs/dashboards)を構築する準備が整いました。これらの機能に関する詳細は、対応するハッシュボードドキュメントを参照してください。

## 詳しく学ぶ {#learn-more}

より高度な機能やトラブルシューティングについては、[ハッシュボードのドキュメント](https://docs.hashboard.com/)を訪れてください。
