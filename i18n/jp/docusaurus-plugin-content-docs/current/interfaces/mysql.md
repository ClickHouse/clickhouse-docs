---
description: 'ClickHouseにおけるMySQLプロトコルインターフェースのドキュメント。MySQLクライアントがClickHouseに接続できるようにします。'
sidebar_label: 'MySQL インターフェース'
sidebar_position: 25
slug: /interfaces/mysql
title: 'MySQL インターフェース'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL インターフェース

ClickHouseはMySQLワイヤプロトコルをサポートしています。これにより、ネイティブのClickHouseコネクタを持たない特定のクライアントが代わりにMySQLプロトコルを利用できるようになります。以下のBIツールでの検証が行われています：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

他の未テストのクライアントやインテグレーションを試みる場合、以下の制限があるかもしれないことに注意してください：

- SSL実装が完全には互換性がない可能性があり、潜在的な [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) の問題があります。
- 特定のツールは、まだ実装されていない方言機能（例：MySQL固有の関数や設定）を必要とする場合があります。

ネイティブドライバ（例：[DBeaver](../integrations/dbeaver)）が利用可能な場合は、MySQLインターフェースではなくこちらを使用することを常に推奨します。また、ほとんどのMySQL言語クライアントは正常に動作しますが、MySQLインターフェースは既存のMySQLクエリがあるコードベースのドロップイン置き換えであることは保証されません。

特定のツールがネイティブのClickHouseドライバを持たず、MySQLインターフェースで使用したい場合に特定の非互換性がある場合は、[課題を作成してください](https://github.com/ClickHouse/ClickHouse/issues) ClickHouseリポジトリで。

::::note
上記のBIツールのSQL方言をよりよくサポートするために、ClickHouseのMySQLインターフェースは、設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) を用いて暗黙的にSELECTクエリを実行します。
これはオフにすることができず、稀なエッジケースではClickHouseの通常のクエリインターフェースとの間で異なる動作を引き起こすことがあります。
::::

## ClickHouse CloudでのMySQL インターフェースの有効化 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloudサービスを作成した後、`Connect`ボタンをクリックします。

<br/>

<Image img={mysql0} alt="クレデンシャル画面 - プロンプト" size="md"/>

2. `Connect with`のドロップダウンを`MySQL`に変更します。

<br/>

<Image img={mysql1} alt="クレデンシャル画面 - MySQL選択済み" size="md" />

3. スイッチを切り替えて、この特定のサービスのためにMySQLインターフェースを有効にします。これにより、このサービスのポート`3306`が公開され、ユニークなMySQLユーザー名を含むMySQL接続画面が表示されます。パスワードはサービスのデフォルトユーザーパスワードと同じになります。

<br/>

<Image img={mysql2} alt="クレデンシャル画面 - 有効化されたMySQL" size="md"/>

表示されたMySQL接続文字列をコピーします。

<Image img={mysql3} alt="クレデンシャル画面 - 接続文字列" size="md"/>

## ClickHouse Cloudでの複数のMySQLユーザーの作成 {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、`mysql4<subdomain>`という組み込みユーザーがあり、`default`と同じパスワードを使用します。`<subdomain>`部分は、ClickHouse Cloudホスト名の最初のセグメントです。この形式は、安全な接続を実装するツールがそれを必要としますが、TLSハンドシェイクで[SNI情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni)ため、ユーザー名に追加のヒントがないと内部ルーティングを行うことができません（MySQLコンソールクライアントはそのようなツールの1つです）。

このため、MySQLインターフェースで使用するための新しいユーザーを作成する際には、`mysql4<subdomain>_<username>`形式に従うことを**強く推奨**します。ここで、`<subdomain>`はCloudサービスを識別するためのヒントであり、`<username>`は任意のサフィックスです。

:::tip
ClickHouse Cloudホスト名が`foobar.us-east1.aws.clickhouse.cloud`の場合、`<subdomain>`部分は`foobar`に等しく、カスタムMySQLユーザー名は`mysql4foobar_team1`のようになります。
:::

MySQLインターフェースとともに使用するための追加のユーザーを作成することができます。たとえば、追加の設定を適用する必要がある場合などです。

1. オプション - カスタムユーザーに適用するための[設定プロファイル](/sql-reference/statements/create/settings-profile)を作成します。たとえば、接続するユーザーにデフォルトで適用される追加設定を持つ`my_custom_profile`を作成します：

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias`は例として使用されているだけです。他の設定を使用することもできます。
2. 次の形式を使用して[ユーザーを作成](/sql-reference/statements/create/user)します：`mysql4<subdomain>_<username>`（[上記を参照](#creating-multiple-mysql-users-in-clickhouse-cloud)）。パスワードはダブルSHA1形式でなければなりません。たとえば：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    または、このユーザーにカスタムプロファイルを使用したい場合：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    ここで、`my_custom_profile`は以前に作成したプロファイルの名前です。
3. [権限を付与する](/sql-reference/statements/grant)新しいユーザーに、目的のテーブルやデータベースと対話するために必要な権限を付与します。たとえば、`system.query_log`へのアクセスを許可したい場合：

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 作成したユーザーを使用して、MySQLインターフェースを介してClickHouse Cloudサービスに接続します。

### ClickHouse Cloudでの複数のMySQLユーザーのトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しいMySQLユーザーを作成し、MySQL CLIクライアントを介して接続中に次のエラーが表示された場合：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が`mysql4<subdomain>_<username>`形式に従っていることを確認してください（[上記を参照](#creating-multiple-mysql-users-in-clickhouse-cloud)）。

## セルフマネージドClickHouseでのMySQLインターフェースの有効化 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

[mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port)設定をサーバーの設定ファイルに追加します。たとえば、`config.d/` [フォルダー](../operations/configuration-files)内の新しいXMLファイルにポートを定義することができます：

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouseサーバーを起動し、MySQL互換プロトコルのリスニングに関するログメッセージを探します：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## MySQLをClickHouseに接続 {#connect-mysql-to-clickhouse}

次のコマンドは、MySQLクライアント`mysql`をClickHouseに接続する方法を示しています：

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

たとえば：

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

接続に成功した場合の出力：

```text
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

すべてのMySQLクライアントと互換性を持たせるために、設定ファイルでユーザーパスワードを[ダブルSHA1](/operations/settings/settings-users#user-namepassword)で指定することをお勧めします。
ユーザーパスワードが[SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256)を使用して指定されている場合、一部のクライアントが認証を行えない可能性があります（mysqljsおよび古いコマンドラインツールMySQLとMariaDBのバージョン）。

制限：

- 準備されたクエリはサポートされていません

- 一部のデータ型は文字列として送信されます

長いクエリをキャンセルするには、`KILL QUERY connection_id`ステートメントを実行します（これは処理中に`KILL QUERY WHERE query_id = connection_id`に置き換えられます）。たとえば：

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
