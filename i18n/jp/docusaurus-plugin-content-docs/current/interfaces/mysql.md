---
'description': 'ClickHouse における MySQL プロトコルインターフェースのドキュメントで、MySQL クライアントが ClickHouse
  に接続できるようにします'
'sidebar_label': 'MySQL インターフェース'
'sidebar_position': 25
'slug': '/interfaces/mysql'
'title': 'MySQL インターフェース'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL インターフェース

ClickHouse は MySQL ワイヤープロトコルをサポートしています。これにより、ネイティブな ClickHouse コネクタを持たない特定のクライアントが代わりに MySQL プロトコルを利用でき、以下の BI ツールで検証済みです。

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

他の未検証のクライアントまたは統合を試している場合、次の制限がある可能性があることに留意してください。

- SSL 実装が完全には互換性がない可能性があり、潜在的な [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) の問題が発生することがあります。
- 特定のツールには、未実装の方言機能（例：MySQL 特有の関数や設定）が必要な場合があります。

ネイティブドライバー（例：[DBeaver](../integrations/dbeaver)）が利用可能な場合、MySQL インターフェースよりもこちらを使用することを常に推奨します。また、ほとんどの MySQL 言語クライアントは問題なく動作するはずですが、MySQL インターフェースが既存の MySQL クエリのコードベースに対してそのまま置き換えられることが保証されるわけではありません。

特定のツールがネイティブな ClickHouse ドライバーを持たず、MySQL インターフェースを介して使用したい場合に特定の非互換性が見つかった場合は、[問題を作成してください](https://github.com/ClickHouse/ClickHouse/issues) ClickHouse リポジトリで。

::::note
上記の BI ツールの SQL 方言をよりよくサポートするために、ClickHouse の MySQL インターフェースは暗黙的に設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) で SELECT クエリを実行します。
これは無効にすることができず、稀なエッジケースでは、ClickHouse の通常のクエリインターフェースと MySQL クエリインターフェースに送信されたクエリ間で異なる動作を引き起こす可能性があります。
::::

## ClickHouse Cloud での MySQL インターフェースの有効化 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloud サービスを作成した後、`Connect` ボタンをクリックします。

<br/>

<Image img={mysql0} alt="Credentials screen - Prompt" size="md"/>

2. `Connect with` ドロップダウンを `MySQL` に変更します。 

<br/>

<Image img={mysql1} alt="Credentials screen - MySQL selected" size="md" />

3. この特定のサービスの MySQL インターフェースを有効にするためにスイッチを切り替えます。これにより、このサービスのためにポート `3306` が公開され、ユニークな MySQL ユーザー名を含む MySQL 接続画面が表示されます。パスワードはサービスのデフォルトユーザーのパスワードと同じです。

<br/>

<Image img={mysql2} alt="Credentials screen - Enabled MySQL" size="md"/>

表示される MySQL 接続文字列をコピーします。

<Image img={mysql3} alt="Credentials screen - Connection String" size="md"/>

## ClickHouse Cloud での複数の MySQL ユーザーの作成 {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、`mysql4<subdomain>` ユーザーが組み込まれており、`default` と同じパスワードを使用します。`<subdomain>` 部分は、ClickHouse Cloud ホスト名の最初のセグメントです。この形式は、安全な接続を実装するツールと連携するために必要ですが、TLS ハンドシェイクで [SNI 情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni) ツールとの内部ルーティングを行うためには、ユーザー名に追加のヒントが必要です（MySQL コンソールクライアントはそのようなツールの一つです）。

そのため、MySQL インターフェースで使用する新しいユーザーを作成する際には、`mysql4<subdomain>_<username>` 形式に従うことを _強く推奨_ します。ここで、`<subdomain>` は Cloud サービスを識別するためのヒントで、`<username>` は任意のサフィックスです。

:::tip
ClickHouse Cloud のホスト名が `foobar.us-east1.aws.clickhouse.cloud` の場合、`<subdomain>` 部分は `foobar` に等しく、カスタム MySQL ユーザー名は `mysql4foobar_team1` のようになります。
:::

MySQL インターフェースで使用するために追加のユーザーを作成できます。たとえば、追加の設定を適用する必要がある場合です。

1. オプション - カスタムユーザーに適用するための [設定プロファイル](/sql-reference/statements/create/settings-profile) を作成します。たとえば、以下のように、後で作成するユーザーで接続する際にデフォルトで適用される追加の設定を持つ `my_custom_profile` を作成します。

```sql
CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
```

    `prefer_column_name_to_alias` は単なる例として使用されているので、他の設定を使用することもできます。
2. 以下の形式で [ユーザー](/sql-reference/statements/create/user) を作成します: `mysql4<subdomain>_<username>` ([上記](#creating-multiple-mysql-users-in-clickhouse-cloud)を参照)。パスワードはダブル SHA1 形式でなければなりません。例えば：

```sql
CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
```

    または、このユーザーにカスタムプロファイルを使用したい場合は：

```sql
CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
```

    ここで、`my_custom_profile` は先に作成したプロファイルの名前です。
3. [Grant](/sql-reference/statements/grant) を使用して、新しいユーザーが目的のテーブルやデータベースと対話するために必要な権限を付与します。たとえば、`system.query_log` へのアクセスを許可したい場合：

```sql
GRANT SELECT ON system.query_log TO mysql4foobar_team1;
```

4. 作成したユーザーを使用して、MySQL インターフェースで ClickHouse Cloud サービスに接続します。

### ClickHouse Cloud における複数の MySQL ユーザーのトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しい MySQL ユーザーを作成し、MySQL CLI クライアントを介して接続する際に次のエラーが表示される場合：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が `mysql4<subdomain>_<username>` 形式に従っていることを確認してください。（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)を参照）。

## セルフマネージド ClickHouse での MySQL インターフェースの有効化 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

サーバーの構成ファイルに [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) 設定を追加します。たとえば、`config.d/` [フォルダ](../operations/configuration-files) に新しい XML ファイルでポートを定義することができます：

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、MySQL 互換プロトコルのリスニングに関するメッセージがログに表示されるかどうかを確認します：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## MySQL を ClickHouse に接続する {#connect-mysql-to-clickhouse}

以下のコマンドは、MySQL クライアント `mysql` を ClickHouse に接続する方法を示しています：

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例：

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

接続が成功した場合の出力：

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

すべての MySQL クライアントとの互換性のため、構成ファイルで [ダブル SHA1](/operations/settings/settings-users#user-namepassword) でユーザーパスワードを指定することをお勧めします。
ユーザーパスワードが [SHA256](/sql-reference/functions/hash-functions#SHA256) を使用して指定された場合、一部のクライアントは認証に失敗する場合があります（mysqljs および古いバージョンのコマンドラインツール MySQL および MariaDB）。

制限：

- プレペアードクエリはサポートされていません

- 一部のデータ型は文字列として送信されます

長いクエリをキャンセルするには、`KILL QUERY connection_id` ステートメントを使用します（処理中は `KILL QUERY WHERE query_id = connection_id` に置き換えられます）。例：

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
