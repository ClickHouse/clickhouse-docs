---
slug: /interfaces/mysql
sidebar_position: 20
sidebar_label: MySQLインターフェース
---

import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQLインターフェース

ClickHouseはMySQLワイヤプロトコルをサポートしています。これにより、ネイティブのClickHouseコネクタを持たない特定のクライアントは、代わりにMySQLプロトコルを利用できるようになります。これは以下のBIツールで検証されています：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

未テストのクライアントや統合を試している場合、以下の制限がある可能性があることに注意してください：

- SSL実装が完全に互換性がないかもしれません；潜在的な [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) の問題があるかもしれません。
- 特定のツールはまだ実装されていない方言機能（例：MySQL固有の関数や設定）を必要とする場合があります。

ネイティブドライバが利用可能な場合（例： [DBeaver](../integrations/dbeaver)）、MySQLインターフェースよりもこちらの使用を推奨します。また、ほとんどのMySQL言語クライアントは問題なく動作するはずですが、MySQLインターフェースは既存のMySQLクエリを持つコードベースのドロップイン代替品であることは保証されていません。

特定のツールにネイティブのClickHouseドライバがなく、MySQLインターフェースを介して使用したい場合、互換性の問題があると感じたら、ClickHouseリポジトリに[問題を作成してください](https://github.com/ClickHouse/ClickHouse/issues)。

::::note
上記のBIツールのSQL方言をよりよくサポートするために、ClickHouseのMySQLインターフェースは、設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias)でSELECTクエリを暗黙的に実行します。
これをオフにすることはできず、稀なエッジケースにおいて、ClickHouseの通常のクエリインターフェースとMySQLクエリインターフェース間で異なる動作が発生する場合があります。
::::

## ClickHouse CloudでMySQLインターフェースを有効にする {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloud Serviceを作成した後、`接続` ボタンをクリックします。

<br/>

<img src={mysql0} alt="認証情報画面 - プロンプト" />

2. `Connect with` ドロップダウンを `MySQL` に変更します。

<br/>

<img src={mysql1} alt="認証情報画面 - MySQL が選択された" />

3. 特定のサービスのMySQLインターフェースを有効にするためにスイッチを切り替えます。これにより、このサービスのポート `3306` が公開され、ユニークなMySQLユーザー名を含むMySQL接続画面が表示されます。パスワードはサービスのデフォルトユーザーパスワードと同じになります。

<br/>

<img src={mysql2} alt="認証情報画面 - 有効化されたMySQL" />

表示されたMySQL接続文字列をコピーします。

<img src={mysql3} alt="認証情報画面 - 接続文字列" />

## ClickHouse Cloudで複数のMySQLユーザーを作成する {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、`mysql4<subdomain>`ユーザーが組み込まれており、`default` と同じパスワードを使用します。`<subdomain>`部分は、ClickHouse Cloudホスト名の最初のセグメントです。この形式は、セキュア接続を実装するツールと連携するために必要ですが、[TLSハンドシェイクにSNI情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni)ツールがあるため、ユーザー名に追加のヒントを与えずに内部ルーティングを行うことは不可能になります（MySQLコンソールクライアントがそのようなツールの1つです）。

このため、MySQLインターフェースで使用する新しいユーザーを作成する際には、`mysql4<subdomain>_<username>`形式に従うことを _強く推奨_ します。ここで、`<subdomain>`はCloudサービスを識別するためのヒントであり、`<username>`は任意のサフィックスです。

:::tip
ClickHouse Cloudホスト名が `foobar.us-east1.aws.clickhouse.cloud` の場合、`<subdomain>`部分は `foobar` に等しく、カスタムMySQLユーザー名は `mysql4foobar_team1`のようになります。
:::

特定の設定を適用する必要がある場合など、MySQLインターフェース用に追加のユーザーを作成できます。

1. 任意 - カスタムユーザー用に適用する[設定プロファイル](/sql-reference/statements/create/settings-profile)を作成します。例えば、`my_custom_profile`という名前の追加設定を持つプロファイルを作成し、後で作成したユーザーで接続するときにデフォルトとして適用されます：

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias`は単なる例として使用されており、他の設定を使用することもできます。
2. 以下の形式を用いて[ユーザーを作成](/sql-reference/statements/create/user)します：`mysql4<subdomain>_<username>`（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)を参照）。パスワードはダブルSHA1形式である必要があります。例えば：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    または、このユーザー用にカスタムプロファイルを使用する場合：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    ここで、`my_custom_profile`は先ほど作成したプロファイルの名前です。
3. 必要な許可を新しいユーザーに付与して、目的のテーブルやデータベースと対話できるようにします。例えば、`system.query_log`のみへのアクセスを付与したい場合：

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 作成したユーザーを使用して、MySQLインターフェースでClickHouse Cloudサービスに接続します。

### ClickHouse Cloudでの複数のMySQLユーザーのトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しいMySQLユーザーを作成し、MySQL CLIクライアントを介して接続するときに次のエラーが表示される場合：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が`mysql4<subdomain>_<username>`形式に従っているか確認してください（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)を参照）。

## セルフマネージドClickHouseでMySQLインターフェースを有効にする {#enabling-the-mysql-interface-on-self-managed-clickhouse}

サーバーの設定ファイルに[mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port)設定を追加します。例えば、`config.d/` [フォルダー](../operations/configuration-files)内の新しいXMLファイルにポートを定義できます：

``` xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouseサーバーを起動し、MySQL互換プロトコルのリスニングに関する以下のようなログメッセージを探します：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## MySQLをClickHouseに接続する {#connect-mysql-to-clickhouse}

以下のコマンドは、MySQLクライアント `mysql` をClickHouseに接続する方法を示しています：

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

すべてのMySQLクライアントとの互換性を保つために、設定ファイル内で[ダブルSHA1](/operations/settings/settings-users#user-namepassword)でユーザーパスワードを指定することをお勧めします。
ユーザーパスワードが[SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256)を使用して指定されている場合、一部のクライアントでは認証できないことがあります（mysqljsや古いコマンドラインツールMySQLおよびMariaDBのバージョン）。

制限：

- 準備済みクエリはサポートされていません

- 一部のデータ型は文字列として送信されます

長いクエリをキャンセルするには、`KILL QUERY connection_id`文を使用します（処理中に`KILL QUERY WHERE query_id = connection_id`に置き換えられます）。例えば：

``` bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
