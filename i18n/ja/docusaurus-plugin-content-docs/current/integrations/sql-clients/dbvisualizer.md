---
sidebar_label: DbVisualizer
slug: /integrations/dbvisualizer
description: DbVisualizerはClickHouseに対して拡張サポートを持つデータベースツールです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# DbVisualizerをClickHouseに接続する

## DbVisualizerの起動またはダウンロード {#start-or-download-dbvisualizer}

DbVisualizerは[こちらからダウンロードできます](https://www.dbvis.com/download/)。

## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 組み込みJDBCドライバ管理 {#2-built-in-jdbc-driver-management}

DbVisualizerにはClickHouse用の最新のJDBCドライバが含まれています。最新のリリースおよびドライバの履歴バージョンを指す完全なJDBCドライバ管理機能が組み込まれています。

![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/dbvisualizer-driver-manager.png)

## 3. ClickHouseに接続する {#3-connect-to-clickhouse}

DbVisualizerでデータベースに接続するには、まずデータベース接続を作成し設定する必要があります。

1. **Database->Create Database Connection**から新しい接続を作成し、ポップアップメニューからデータベース用のドライバを選択します。

2. 新しい接続の**Object View**タブが開きます。

3. **Name**フィールドに接続名を入力し、オプションで**Notes**フィールドに接続の説明を入力します。

4. **Database Type**は**Auto Detect**のままにします。

5. **Driver Type**で選択されたドライバに緑のチェックマークが付いている場合、使用可能です。緑のチェックマークが付いていない場合、**Driver Manager**でドライバを設定する必要があります。

6. 残りのフィールドにデータベースサーバに関する情報を入力します。

7. **Ping Server**ボタンをクリックして、指定されたアドレスとポートへのネットワーク接続が確立できることを確認します。

8. Ping Serverの結果がサーバに接続できることを示している場合、**Connect**をクリックしてデータベースサーバに接続します。

:::tip
接続に問題がある場合は、[接続の問題を修正する](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues)ためのヒントを参照してください。

## 詳細を学ぶ {#learn-more}

DbVisualizerに関する詳細情報は[DbVisualizerのドキュメント](https://confluence.dbvis.com/display/UG231/Users+Guide)をご覧ください。
