---
description: 'ClickHouse の MySQL プロトコルインターフェースについて説明し、MySQL クライアントから ClickHouse への接続を可能にするドキュメントです'
sidebar_label: 'MySQL インターフェース'
sidebar_position: 25
slug: /interfaces/mysql
title: 'MySQL インターフェース'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL インターフェイス

ClickHouse は MySQL のワイヤプロトコルをサポートしています。これにより、ネイティブな ClickHouse コネクタを持たない一部のクライアントが代わりに MySQL プロトコルを利用できるようになっており、以下の BI ツールで検証されています：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

その他の未検証のクライアントや統合を試す場合は、次のような制限があり得ることに留意してください。

- SSL 実装が完全に互換ではない可能性があり、[TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) に関する問題が発生する可能性があります。
- 特定のツールが、まだ実装されていない方言機能（例: MySQL 固有の関数や設定）を必要とする場合があります。

ネイティブドライバが利用可能な場合（例: [DBeaver](../integrations/dbeaver)）は、MySQL インターフェイスではなく常にネイティブドライバの使用を推奨します。さらに、ほとんどの MySQL クライアントは問題なく動作するはずですが、MySQL インターフェイスが既存の MySQL クエリを含むコードベースに対して、完全なドロップインの代替となることは保証されません。

特定のツールにネイティブな ClickHouse ドライバが存在せず、MySQL インターフェイス経由でそれを利用したいものの、何らかの非互換性を発見した場合は、ClickHouse リポジトリで[Issue を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。

::::note
上記の BI ツールの SQL 方言をより良くサポートするため、ClickHouse の MySQL インターフェイスは、設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) を暗黙的に有効にした状態で SELECT クエリを実行します。
これは無効化できず、まれなエッジケースでは、ClickHouse の通常のクエリインターフェイスと MySQL クエリインターフェイスに送信されたクエリの挙動が異なる原因となる可能性があります。
::::



## ClickHouse CloudでMySQLインターフェースを有効にする {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloudサービスを作成後、`Connect`ボタンをクリックします。

<br />

<Image img={mysql0} alt='認証情報画面 - プロンプト' size='md' />

2. `Connect with`ドロップダウンを`MySQL`に変更します。

<br />

<Image img={mysql1} alt='認証情報画面 - MySQL選択済み' size='md' />

3. スイッチを切り替えて、このサービスのMySQLインターフェースを有効にします。これにより、このサービスのポート`3306`が公開され、固有のMySQLユーザー名を含むMySQL接続画面が表示されます。パスワードは、サービスのデフォルトユーザーのパスワードと同じです。

<br />

<Image img={mysql2} alt='認証情報画面 - MySQL有効化済み' size='md' />

表示されているMySQL接続文字列をコピーします。

<Image img={mysql3} alt='認証情報画面 - 接続文字列' size='md' />


## ClickHouse Cloudで複数のMySQLユーザーを作成する {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、`default`ユーザーと同じパスワードを使用する組み込みの`mysql4<subdomain>`ユーザーが存在します。`<subdomain>`部分は、ClickHouse Cloudホスト名の最初のセグメントです。この形式は、セキュア接続を実装しているものの、[TLSハンドシェイクでSNI情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni)ツールと連携するために必要です。SNI情報がない場合、ユーザー名に追加のヒントがなければ内部ルーティングが不可能になります(MySQLコンソールクライアントはそのようなツールの1つです)。

このため、MySQLインターフェースで使用する新しいユーザーを作成する際には、`mysql4<subdomain>_<username>`形式に従うことを_強く推奨_します。ここで、`<subdomain>`はCloudサービスを識別するためのヒントであり、`<username>`は任意の接尾辞です。

:::tip
`foobar.us-east1.aws.clickhouse.cloud`のようなClickHouse Cloudホスト名の場合、`<subdomain>`部分は`foobar`に相当し、カスタムMySQLユーザー名は`mysql4foobar_team1`のようになります。
:::

例えば、追加の設定を適用する必要がある場合、MySQLインターフェースで使用する追加のユーザーを作成できます。

1. オプション - カスタムユーザーに適用する[設定プロファイル](/sql-reference/statements/create/settings-profile)を作成します。例えば、後で作成するユーザーで接続する際にデフォルトで適用される追加設定を持つ`my_custom_profile`を作成します:

   ```sql
   CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
   ```

   `prefer_column_name_to_alias`は単なる例として使用されており、他の設定を使用することもできます。

2. 次の形式を使用して[ユーザーを作成](/sql-reference/statements/create/user)します: `mysql4<subdomain>_<username>`([上記を参照](#creating-multiple-mysql-users-in-clickhouse-cloud))。パスワードはdouble SHA1形式である必要があります。例:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
   ```

   または、このユーザーにカスタムプロファイルを使用する場合:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
   ```

   ここで、`my_custom_profile`は先ほど作成したプロファイルの名前です。

3. 新しいユーザーに、目的のテーブルまたはデータベースと対話するために必要な権限を[付与](/sql-reference/statements/grant)します。例えば、`system.query_log`のみへのアクセスを付与する場合:

   ```sql
   GRANT SELECT ON system.query_log TO mysql4foobar_team1;
   ```

4. 作成したユーザーを使用して、MySQLインターフェースでClickHouse Cloudサービスに接続します。

### ClickHouse Cloudでの複数のMySQLユーザーのトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しいMySQLユーザーを作成し、MySQL CLIクライアント経由で接続する際に次のエラーが表示される場合:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が([上記](#creating-multiple-mysql-users-in-clickhouse-cloud)で説明されているように)`mysql4<subdomain>_<username>`形式に従っていることを確認してください。


## セルフマネージド版ClickHouseでMySQLインターフェースを有効化する {#enabling-the-mysql-interface-on-self-managed-clickhouse}

サーバーの設定ファイルに[mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port)設定を追加してください。例えば、`config.d/`[フォルダ](../operations/configuration-files)内の新しいXMLファイルでポートを定義できます:

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouseサーバーを起動し、MySQL互換プロトコルのリスニングに関する以下のようなログメッセージを確認してください:

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```


## MySQLをClickHouseに接続する {#connect-mysql-to-clickhouse}

以下のコマンドは、MySQLクライアント`mysql`をClickHouseに接続する方法を示しています:

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例:

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

接続が成功した場合の出力:

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

すべてのMySQLクライアントとの互換性を確保するため、設定ファイルでユーザーパスワードを[double SHA1](/operations/settings/settings-users#user-namepassword)で指定することを推奨します。
ユーザーパスワードが[SHA256](/sql-reference/functions/hash-functions#SHA256)を使用して指定されている場合、一部のクライアント(mysqljsおよび古いバージョンのコマンドラインツールMySQLとMariaDB)では認証できません。

制限事項:

- プリペアドクエリはサポートされていません

- 一部のデータ型は文字列として送信されます

長時間実行されるクエリをキャンセルするには、`KILL QUERY connection_id`ステートメントを使用します(処理中に`KILL QUERY WHERE query_id = connection_id`に置き換えられます)。例:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
