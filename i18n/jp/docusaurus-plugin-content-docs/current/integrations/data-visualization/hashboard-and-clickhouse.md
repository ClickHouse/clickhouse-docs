---
sidebar_label: Hashboard
sidebar_position: 132
slug: /integrations/hashboard
keywords: [clickhouse, Hashboard, connect, integrate, ui, analytics]
description: Hashboardは、ClickHouseと簡単に統合できる堅牢な分析プラットフォームで、リアルタイムデータ分析を可能にします。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';


# ClickHouseとHashboardの接続

[Hashboard](https://hashboard.com)は、あなたの組織内の誰でもメトリックを追跡し、行動可能な洞察を発見できるインタラクティブなデータ探索ツールです。Hashboardは、あなたのClickHouseデータベースに対してライブSQLクエリを発行し、自己サービスやアドホックなデータ探索のユースケースに特に役立ちます。


<img src={hashboard_01} class="image" alt="Hashboardデータエクスプローラー" />

<br/>

このガイドでは、HashboardをあなたのClickHouseインスタンスに接続する手順を説明します。この情報は、Hashboardの[ClickHouse統合ドキュメント](https://docs.hashboard.com/docs/database-connections/clickhouse)でも利用可能です。


## 事前要件 {#pre-requisites}

- 自身のインフラ上、または[ClickHouse Cloud](https://clickhouse.com/)上にホスティングされたClickHouseデータベース。
- [Hashboardアカウント](https://hashboard.com/getAccess)とプロジェクト。

## HashboardをClickHouseに接続する手順 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 接続情報を集める {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Hashboardに新しいデータベース接続を追加する {#2-add-a-new-database-connection-in-hashboard}

1. あなたの[Hashboardプロジェクト](https://hashboard.com/app)に移動します。
2. サイドナビゲーションバーのギアアイコンをクリックして設定ページを開きます。
3. `+ 新しいデータベース接続`をクリックします。
4. モーダルで「ClickHouse」を選択します。
5. 以前に集めた情報を使って**接続名**、**ホスト**、**ポート**、**ユーザー名**、**パスワード**、および**データベース**のフィールドに入力します。
6. 「テスト」をクリックして、接続が正しく構成されていることを確認します。
7. 「追加」をクリックします。

あなたのClickHouseデータベースは現在Hashboardに接続されており、[データモデル](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[メトリクス](https://docs.hashboard.com/docs/metrics)、および[ダッシュボード](https://docs.hashboard.com/docs/dashboards)を構築することができます。これらの機能についての詳細は、対応するHashboardのドキュメントを参照してください。

## 詳細を学ぶ {#learn-more}

より高度な機能やトラブルシューティングについては、[Hashboardのドキュメント](https://docs.hashboard.com/)を訪れてください。
