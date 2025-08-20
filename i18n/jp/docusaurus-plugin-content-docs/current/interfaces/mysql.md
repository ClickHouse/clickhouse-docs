---
description: 'ClickHouse で MySQL クライアントが接続できる MySQL プロトコルインターフェースのドキュメント'
sidebar_label: 'MySQL インターフェース'
sidebar_position: 25
slug: '/interfaces/mysql'
title: 'MySQL インターフェース'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL インターフェース

ClickHouse は MySQL ワイヤプロトコルをサポートしています。これにより、ネイティブの ClickHouse コネクタを持たない特定のクライアントが代わりに MySQL プロトコルを利用できるようになり、以下の BI ツールで検証されています：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

他の未検証のクライアントや統合を試す場合、以下の制限に注意してください：

- SSL の実装が完全に互換性がない可能性があり、潜在的な [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 問題があるかもしれません。
- 特定のツールが、まだ実装されていないダイアレクト機能（例えば、MySQL 特有の関数や設定）を必要とする場合があります。

もしネイティブドライバーが利用可能な場合（例えば、[DBeaver](../integrations/dbeaver)）、MySQL インターフェースではなく、それを使用することを常にお勧めします。加えて、ほとんどの MySQL 言語クライアントは正常に動作するはずですが、MySQL インターフェースが既存の MySQL クエリを含むコードベースのドロップイン置き換えであることは保証されません。

特定のツールがネイティブの ClickHouse ドライバーを持たず、そのツールを MySQL インターフェース経由で使用したいが、特定の互換性のない点を見つけた場合は、[issue を作成してください](https://github.com/ClickHouse/ClickHouse/issues)。

::::note
上記の BI ツールの SQL ダイアレクトをよりよくサポートするために、ClickHouse の MySQL インターフェースは暗黙的に設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) で SELECT クエリを実行します。
これはオフにできず、稀なエッジケースでは ClickHouse の通常のクエリインターフェースと MySQL クエリインターフェースへのクエリの挙動が異なる可能性があります。
::::

## ClickHouse Cloud での MySQL インターフェースの有効化 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloud サービスを作成した後、`Connect` ボタンをクリックします。

<br/>

<Image img={mysql0} alt="Credentials screen - Prompt" size="md"/>

2. `Connect with` ドロップダウンを `MySQL` に変更します。

<br/>

<Image img={mysql1} alt="Credentials screen - MySQL selected" size="md" />

3. 特定のサービスのために MySQL インターフェースを有効にするためにスイッチを切り替えます。これにより、このサービス用にポート `3306` が公開され、あなたのユニークな MySQL ユーザー名を含む MySQL 接続画面が表示されます。パスワードはサービスのデフォルトユーザーのパスワードと同じになります。

<br/>

<Image img={mysql2} alt="Credentials screen - Enabled MySQL" size="md"/>

表示された MySQL 接続文字列をコピーします。

<Image img={mysql3} alt="Credentials screen - Connection String" size="md"/>

## ClickHouse Cloud での複数の MySQL ユーザーの作成 {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、`mysql4<subdomain>` ユーザーが組み込まれており、`default` のパスワードと同じパスワードを使用します。`<subdomain>` 部分は ClickHouse Cloud ホスト名の最初のセグメントです。この形式は、安全な接続を実装するツールが必要ですが、TLS ハンドシェイクで [SNI 情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni) ため、ユーザー名に追加のヒントを持たずして内部ルーティングを行うことが不可能になります（MySQL コンソールクライアントがそのようなツールの一つです）。

このため、MySQL インターフェースで使用することを意図した新しいユーザーを作成する際には、`mysql4<subdomain>_<username>` 形式に従うことを**強く推奨**します。ここで、`<subdomain>` はクラウドサービスを識別するためのヒントであり、`<username>` は任意の接尾辞です。

:::tip
ClickHouse Cloud ホスト名が `foobar.us-east1.aws.clickhouse.cloud` の場合、`<subdomain>` 部分は `foobar` に等しく、カスタム MySQL ユーザー名は `mysql4foobar_team1` のようになります。
:::

MySQL インターフェースで使用するために、追加のユーザーを作成できます。たとえば、追加の設定を適用する必要がある場合です。

1. あなたのカスタムユーザーに適用する [設定プロファイル](/sql-reference/statements/create/settings-profile) をオプションとして作成します。たとえば、接続時にデフォルトで適用される追加の設定を持つ `my_custom_profile` を作成します：

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias` はあくまで例として使用されており、他の設定も利用できます。
2. 次の形式を使用して [ユーザーを作成](/sql-reference/statements/create/user) します：`mysql4<subdomain>_<username>`（[上記を参照](#creating-multiple-mysql-users-in-clickhouse-cloud)）。パスワードはダブル SHA1 形式で指定する必要があります。たとえば：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    あるいは、このユーザー用にカスタムプロファイルを使用したい場合：

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    ここで `my_custom_profile` は、先に作成したプロファイルの名前です。
3. [Grant](/sql-reference/statements/grant) を使用して、新しいユーザーに望ましいテーブルまたはデータベースと対話するために必要な権限を付与します。たとえば、`system.query_log` へのアクセス権を付与したい場合：

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 作成したユーザーを使用して、MySQL インターフェースで ClickHouse Cloud サービスに接続します。

### ClickHouse Cloud における複数の MySQL ユーザーのトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しい MySQL ユーザーを作成し、MySQL CLI クライアント経由で接続中に次のエラーが表示された場合：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が `mysql4<subdomain>_<username>` 形式に従っていることを確認してください（[上記を参照](#creating-multiple-mysql-users-in-clickhouse-cloud)）。

## セルフマネージド ClickHouse での MySQL インターフェースの有効化 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

サーバーの設定ファイルに [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) 設定を追加します。たとえば、`config.d/` [フォルダ](../operations/configuration-files) に新しい XML ファイルでポートを定義できます：

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、MySQL 互換プロトコルのリスニングに関する以下のようなログメッセージを探します：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## MySQL を ClickHouse に接続する {#connect-mysql-to-clickhouse}

次のコマンドは、MySQL クライアント `mysql` を ClickHouse に接続する方法を示しています：

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

たとえば：

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

すべての MySQL クライアントとの互換性を保つため、設定ファイル内で [ダブル SHA1](/operations/settings/settings-users#user-namepassword) を使用してユーザーパスワードを指定することを推奨します。
ユーザーパスワードが [SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256) を使用して指定されている場合、一部のクライアントは認証できなくなる可能性があります（mysqljs および古いバージョンのコマンドラインツール MySQL および MariaDB）。

制限：

- プレパードクエリはサポートされていません

- 一部のデータ型は文字列として送信されます

長いクエリをキャンセルするには、`KILL QUERY connection_id` ステートメント（処理中は `KILL QUERY WHERE query_id = connection_id` に置き換えられます）を使用します。たとえば：

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
