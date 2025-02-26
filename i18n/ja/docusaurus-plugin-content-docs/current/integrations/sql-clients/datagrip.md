---
sidebar_label: DataGrip
slug: /integrations/datagrip
description: DataGripは、ClickHouseを即座にサポートするデータベースIDEです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# DataGripをClickHouseに接続する

## DataGripを起動またはダウンロードする {#start-or-download-datagrip}

DataGripは、https://www.jetbrains.com/datagrip/ で入手できます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouseドライバーを読み込む {#2-load-the-clickhouse-driver}

1. DataGripを起動し、**データソース**タブの**データソースとドライバー**ダイアログで、**+**アイコンをクリックします。

  ![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/datagrip-5.png)

  **ClickHouse**を選択します。

  :::tip
  接続を確立するにつれて順序が変わるため、ClickHouseがまだリストの上部にないかもしれません。
  :::

  ![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/datagrip-6.png)

- **ドライバー**タブに切り替え、ClickHouseドライバーを読み込みます。

  DataGripはダウンロードサイズを最小限に抑えるため、ドライバーを同梱していません。**ドライバー**タブで、**完全サポート**リストから**ClickHouse**を選択し、**+**サインを展開します。**提供されたドライバー**オプションから**最新の安定版**ドライバーを選択します。

  ![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/datagrip-1.png)

## 3. ClickHouseに接続する {#3-connect-to-clickhouse}

- データベース接続詳細を指定し、**接続テスト**をクリックします。

  ステップ1で接続詳細を収集しましたので、ホストURL、ポート、ユーザー名、パスワード、およびデータベース名を入力し、接続をテストします。

  :::tip
  DataGripダイアログの**HOST**エントリは実際にはURLです。以下の画像を参照してください。

  JDBC URL設定の詳細については、[ClickHouse JDBCドライバー](https://github.com/ClickHouse/clickhouse-java)リポジトリを参照してください。
  :::

  ![](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/sql-clients/images/datagrip-7.png)

## 詳細を学ぶ {#learn-more}

DataGripに関する詳細情報は、DataGripのドキュメントをご覧ください。
