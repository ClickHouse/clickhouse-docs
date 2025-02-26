---
slug: /integrations/dbeaver
sidebar_label: DBeaver
description: DBeaverは多機能なデータベースツールです。
---

# DBeaverをClickHouseに接続する

DBeaverは複数のオファリングを提供しています。このガイドでは、[DBeaver Community](https://dbeaver.io/)を使用しています。さまざまなオファリングと機能については、[こちら](https://dbeaver.com/edition/)を参照してください。DBeaverはJDBCを使用してClickHouseに接続します。

:::note
ClickHouseの`Nullable`カラムを改善されたサポートで使用するために、DBeaverのバージョン23.1.0以上を使用してください。
:::

## 1. ClickHouseの詳細を集める {#1-gather-your-clickhouse-details}

DBeaverは、HTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は以下の通りです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

## 2. DBeaverをダウンロードする {#2-download-dbeaver}

DBeaverはhttps://dbeaver.io/download/で入手できます。

## 3. データベースを追加する {#3-add-a-database}

- **Database > New Database Connection**メニューまたは**Database Navigator**内の**New Database Connection**アイコンを使用して、**データベースに接続**ダイアログを表示します：

![新しいデータベースを追加する](./images/dbeaver-add-database.png)

- **Analytical**を選択し、次に**ClickHouse**を選択します：

- JDBC URLを構築します。**Main**タブでホスト、ポート、ユーザー名、パスワード、およびデータベースを設定します：

![ホスト名、ポート、ユーザー、パスワード、およびデータベース名を設定する](./images/dbeaver-host-port.png)

- デフォルトでは**SSL > Use SSL**プロパティはオフになっています。ClickHouse CloudやHTTPポートでSSLが必要なサーバーに接続する場合は、**SSL > Use SSL**をオンに設定します：

![必要に応じてSSLを有効にする](./images/dbeaver-use-ssl.png)

- 接続をテストします：

![接続をテストする](./images/dbeaver-test-connection.png)

もしDBeaverがClickHouseドライバーがインストールされていないことを検出した場合は、ドライバーをダウンロードする提案をします：

![ClickHouseドライバーをダウンロードする](./images/dbeaver-download-driver.png)

- ドライバーをダウンロードした後、再度**Test**を行い接続をテストします：

![接続をテストする](./images/dbeaver-test-connection.png)

## 4. ClickHouseにクエリを実行する {#4-query-clickhouse}

クエリエディタを開いてクエリを実行します。

- 接続を右クリックして**SQL Editor > Open SQL Script**を選択し、クエリエディタを開きます：

![SQLエディタを開く](./images/dbeaver-sql-editor.png)

- `system.query_log`に対するサンプルクエリ：

  ![サンプルクエリ](./images/dbeaver-query-log-select.png)

## 次のステップ {#next-steps}

DBeaverの機能について学ぶには[DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki)を、ClickHouseの機能について学ぶには[ClickHouseのドキュメント](https://clickhouse.com/docs)を参照してください。
