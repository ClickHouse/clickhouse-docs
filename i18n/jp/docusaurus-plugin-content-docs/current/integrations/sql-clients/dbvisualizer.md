---
sidebar_label: DbVisualizer
slug: /integrations/dbvisualizer
description: DbVisualizer は ClickHouse に対する拡張サポートを持つデータベースツールです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';


# DbVisualizer を ClickHouse に接続する

## DbVisualizer の開始またはダウンロード {#start-or-download-dbvisualizer}

DbVisualizer は https://www.dbvis.com/download/ で入手可能です。

## 1. 接続の詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 組み込みの JDBC ドライバ管理 {#2-built-in-jdbc-driver-management}

DbVisualizer には ClickHouse 用の最新の JDBC ドライバが含まれています。最新のリリースや履歴バージョンにポイントする完全な JDBC ドライバ管理が組み込まれています。

<img src={dbvisualizer_driver_manager} class="image" alt="DbVisualizer 01" />

## 3. ClickHouse に接続する {#3-connect-to-clickhouse}

DbVisualizer でデータベースに接続するには、まずデータベース接続を作成して設定する必要があります。

1. **Database->Create Database Connection** から新しい接続を作成し、ポップアップメニューからデータベースのためのドライバを選択します。

2. 新しい接続のために **Object View** タブが開かれます。

3. **Name** フィールドに接続の名前を入力し、必要に応じて **Notes** フィールドに接続の説明を入力します。

4. **Database Type** は **Auto Detect** のままにします。

5. **Driver Type** に選択したドライバが緑のチェックマークで表示される場合、それは使用可能です。緑のチェックマークが表示されない場合、**Driver Manager** でドライバを設定する必要があるかもしれません。

6. 残りのフィールドにデータベースサーバーに関する情報を入力します。

7. **Ping Server** ボタンをクリックして、指定されたアドレスとポートにネットワーク接続が確立できるか確認します。

8. Ping Server の結果がサーバーに到達できることを示す場合、**Connect** をクリックしてデータベースサーバーに接続します。

:::tip
接続に問題がある場合は、[接続の問題を修正する](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) を参照して、いくつかのヒントを確認してください。

## さらに学ぶ {#learn-more}

DbVisualizer についての詳細情報は、[DbVisualizer ドキュメント](https://confluence.dbvis.com/display/UG231/Users+Guide)をご覧ください。
