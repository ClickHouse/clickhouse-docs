---
slug: /interfaces/mysql
sidebar_position: 20
sidebar_label: MySQLインターフェース
---

# MySQLインターフェース

ClickHouseはMySQLワイヤプロトコルをサポートしています。これにより、ネイティブなClickHouseコネクタを持たない特定のクライアントがMySQLプロトコルを利用できるようになり、以下のBIツールで検証されています。

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

他の未検証のクライアントや統合を試している場合、次のような制限があることに留意してください。

- SSL実装が完全に互換性がない場合があり、潜在的に[TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/)の問題が発生する可能性があります。
- 特定のツールは、まだ実装されていないダイアレクト機能（例：MySQL固有の関数や設定）を必要とする場合があります。

ネイティブドライバーが利用可能な場合（例：[DBeaver](../integrations/dbeaver)）、MySQLインターフェースの代わりにそれを使用することを常に推奨しています。また、ほとんどのMySQL言語クライアントは正常に動作するはずですが、MySQLインターフェースは既存のMySQLクエリを持つコードベースのドロップイン置き換えであることは保証されていません。

特定のツールがネイティブなClickHouseドライバーを持たず、MySQLインターフェースを介して使用したいが、特定の互換性の問題が見つかった場合は、[Issueを作成してください](https://github.com/ClickHouse/ClickHouse/issues) ClickHouseリポジトリで。

::::note
上記のBIツールのSQLダイアレクトをより良くサポートするために、ClickHouseのMySQLインターフェースは暗黙的に設定[prefer_column_name_to_alias = 1](../operations/settings/settings.md#prefer-column-name-to-alias)でSELECTクエリを実行します。
これはオフにできず、稀なエッジケースでClickHouseの通常のクエリインターフェースとMySQLクエリインターフェースに対して異なる動作を引き起こす可能性があります。
::::

## ClickHouse CloudでのMySQLインターフェースの有効化 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloudサービスを作成した後、`Connect`ボタンをクリックします。

<br/>

![Credentials screen - Prompt](./images/mysql0.png)

2. `Connect with`のドロップダウンを`MySQL`に変更します。

<br/>

![Credentials screen - Prompt](./images/mysql1.png)

3. この特定のサービスのMySQLインターフェースを有効にするためにスイッチを切り替えます。これにより、このサービスに対してポート`3306`が公開され、ユニークなMySQLユーザー名を含むMySQL接続画面が表示されます。パスワードはサービスのデフォルトユーザーのパスワードと同じです。

<br/>

![Credentials screen - Enabled MySQL](./images/mysql2.png)

表示されたMySQL接続文字列をコピーします。

![Credentials screen - Connection String](./images/mysql3.png)

## ClickHouse Cloudでの複数のMySQLユーザーの作成 {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、`mysql4<subdomain>`という組み込みのユーザーが存在し、`default`のパスワードと同じものを使用します。`<subdomain>`部分はClickHouse Cloudホスト名の最初のセグメントです。この形式は、セキュア接続を実装するツールと連携するために必要ですが、TLSハンドシェイクで[SNI情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni)ツールがあるため、ユーザー名に追加のヒントがないと内部ルーティングが不可能になります（MySQLコンソールクライアントなどが該当します）。

このため、MySQLインターフェースで使用する新しいユーザーを作成する際には、`mysql4<subdomain>_<username>`という形式に従うことを**強くお勧め**します。ここで、`<subdomain>`はCloudサービスを識別するためのヒントであり、`<username>`は任意のサフィックスです。

:::tip
ClickHouse Cloudホスト名が`foobar.us-east1.aws.clickhouse.cloud`の場合、`<subdomain>`部分は`foobar`に等しく、カスタムMySQLユーザー名は`mysql4foobar_team1`のようになります。
:::

MySQLインターフェースを使用するために追加のユーザーを作成することができます。例えば、追加の設定を適用する必要がある場合。

1. オプション - カスタムユーザーに適用される[設定プロファイル](/sql-reference/statements/create/settings-profile)を作成します。例えば、`my_custom_profile`を作成し、後で作成するユーザーに接続するときにデフォルトで適用される追加の設定：

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias`はただの例として使用されているので、他の設定も使用できます。
2. [ユーザーを作成](/sql-reference/statements/create/user)する際は、以下の形式を使用します: `mysql4<subdomain>_<username>`（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)参照）。パスワードはダブルSHA1形式でなければなりません。例えば：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    または、このユーザー用にカスタムプロファイルを使用したい場合：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    ここで`my_custom_profile`は先に作成したプロファイルの名前です。
3. [必要な権限を付与](/sql-reference/statements/grant)し、対象のテーブルまたはデータベースと対話できるように新しいユーザーにアクセス権を付与します。例えば、`system.query_log`へのアクセスのみを付与する場合：

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 作成したユーザーを使用して、MySQLインターフェースでClickHouse Cloudサービスに接続します。

### ClickHouse Cloudでの複数のMySQLユーザーのトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しいMySQLユーザーを作成し、MySQL CLIクライアント経由で接続中に以下のエラーが表示された場合：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が`mysql4<subdomain>_<username>`形式に従っていることを確認してください（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)参照）。

## セルフマネージドClickHouseでのMySQLインターフェースの有効化 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

サーバーの設定ファイルに[mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port)設定を追加します。例えば、`config.d/` [フォルダー](../operations/configuration-files)に新しいXMLファイルでポートを定義できます。

``` xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouseサーバーを起動し、MySQL互換プロトコルのリスニングに関するログメッセージが表示されるか確認します：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## MySQLをClickHouseに接続 {#connect-mysql-to-clickhouse}

以下のコマンドは、MySQLクライアント`mysql`をClickHouseに接続する方法を示しています。

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例えば：

``` bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

接続に成功した場合の出力：

``` text
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 20.2.1.1-ClickHouse

Copyright (c) 2000, 2019, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

すべてのMySQLクライアントとの互換性を保つために、設定ファイルでユーザーパスワードを[ダブルSHA1](../operations/settings/settings-users.md#password_double_sha1_hex)で指定することを推奨します。
ユーザーパスワードが[SHA256](../operations/settings/settings-users.md#password_sha256_hex)で指定されると、一部のクライアントは認証できない場合があります（mysqljsや古いバージョンのコマンドラインツールMySQLおよびMariaDB）。

制限事項：

- プレペアードクエリはサポートされていません。
- 一部のデータ型は文字列として送信されます。

長いクエリをキャンセルするには、`KILL QUERY connection_id`ステートメントを使用します（進行中は`KILL QUERY WHERE query_id = connection_id`に置き換えられます）。例えば：

``` bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
