---
description: 'MySQL クライアントから ClickHouse へ接続するための MySQL プロトコルインターフェイスに関するドキュメント'
sidebar_label: 'MySQL インターフェイス'
sidebar_position: 25
slug: /interfaces/mysql
title: 'MySQL インターフェイス'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL インターフェイス \{#mysql-interface\}

ClickHouse は MySQL ワイヤプロトコルをサポートしています。これにより、ネイティブな ClickHouse コネクタを持たない一部のクライアントが代わりに MySQL プロトコルを利用できるようになり、以下の BI ツールで動作検証されています:

- [Looker Studio](../data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

他の未検証のクライアントやインテグレーションを試す場合、以下のような制限がある可能性があることに注意してください:

- SSL 実装が完全に互換性がない可能性があり、[TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) に関する問題が発生する場合があります。
- 特定のツールが、まだ実装されていない方言機能 (例: MySQL 固有の関数や設定) を必要とする場合があります。

ネイティブドライバが利用可能な場合 (例: [DBeaver](../integrations/dbeaver)) は、常に MySQL インターフェイスではなくネイティブドライバを使用することを推奨します。さらに、ほとんどの MySQL 言語クライアントは問題なく動作するはずですが、MySQL インターフェイスが、既存の MySQL クエリを用いたコードベースに対する完全な代替となることは保証されていません。

ネイティブな ClickHouse ドライバを持たない特定のツールを対象とするユースケースで、そのツールを MySQL インターフェイス経由で利用したいにもかかわらず、何らかの非互換性を発見した場合は、ClickHouse リポジトリで[Issue を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。

::::note
上記の BI ツールの SQL 方言をより良くサポートするため、ClickHouse の MySQL インターフェイスは、暗黙的に設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) を付与して SELECT クエリを実行します。
これは無効化できず、そのため一部のレアケースでは、通常の ClickHouse クエリインターフェイスと MySQL クエリインターフェイスに送信されたクエリの挙動が異なる場合があります。
::::

## ClickHouse Cloud で MySQL インターフェイスを有効化する \{#enabling-the-mysql-interface-on-clickhouse-cloud\}

1. ClickHouse Cloud サービスを作成したら、`Connect` ボタンをクリックします。

<br/>

<Image img={mysql0} alt="認証情報画面 - プロンプト" size="md"/>

2. `Connect with` のドロップダウンを `MySQL` に変更します。 

<br/>

<Image img={mysql1} alt="認証情報画面 - MySQL を選択" size="md" />

3. スイッチを切り替えて、このサービス用に MySQL インターフェイスを有効にします。これにより、このサービスでポート `3306` が公開され、固有の MySQL ユーザー名が含まれた MySQL 接続情報画面が表示されます。パスワードはサービスのデフォルトユーザーのパスワードと同じです。

<br/>

<Image img={mysql2} alt="認証情報画面 - MySQL が有効化済み" size="md"/>

表示されている MySQL 接続文字列をコピーします。

<Image img={mysql3} alt="認証情報画面 - 接続文字列" size="md"/>

## ClickHouse Cloud で複数の MySQL ユーザーを作成する \{#creating-multiple-mysql-users-in-clickhouse-cloud\}

デフォルトでは、`mysql4<subdomain>` ユーザーが組み込みで用意されており、`default` と同じパスワードを使用します。`<subdomain>` 部分は ClickHouse Cloud ホスト名の最初のセグメントです。この形式は、セキュアな接続を実装しているものの、その [TLS ハンドシェイクで SNI 情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni)ツールと連携するために必要です。この場合、ユーザー名内に追加のヒントがないと内部ルーティングができないためです（MySQL コンソールクライアントはそのようなツールの一例です）。

このため、MySQL インターフェースで使用する新しいユーザーを作成する際には、`mysql4<subdomain>_<username>` という形式に従うことを_強く推奨_します。ここで、`<subdomain>` は Cloud サービスを識別するためのヒントであり、`<username>` は任意に選択したサフィックスです。

:::tip
`foobar.us-east1.aws.clickhouse.cloud` のような ClickHouse Cloud ホスト名の場合、`<subdomain>` 部分は `foobar` となり、カスタム MySQL ユーザー名は `mysql4foobar_team1` のようになります。
:::

たとえば追加の設定を適用する必要がある場合など、MySQL インターフェースで使用するための追加ユーザーを作成できます。

1. （任意）カスタムユーザーに適用する [settings profile](/sql-reference/statements/create/settings-profile) を作成します。たとえば、後で作成するユーザーで接続したときにデフォルトで適用される追加の設定を持つ `my_custom_profile` を作成します。

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias` は単なる例なので、他の設定を使用してもかまいません。
2. 次の形式を使用して [ユーザーを作成](/sql-reference/statements/create/user) します: `mysql4<subdomain>_<username>`（[上記参照](#creating-multiple-mysql-users-in-clickhouse-cloud)）。パスワードは double SHA1 形式で指定する必要があります。例:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    あるいは、このユーザーに対してカスタムプロファイルを使用したい場合:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    ここで、`my_custom_profile` は前の手順で作成したプロファイル名です。
3. 新しいユーザーに対して、目的のテーブルまたはデータベースを操作するために必要な権限を [付与](/sql-reference/statements/grant) します。たとえば、`system.query_log` のみにアクセスを付与したい場合:

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 作成したユーザーを使用して、MySQL インターフェース経由で ClickHouse Cloud サービスに接続します。

### ClickHouse Cloud における複数の MySQL ユーザーに関するトラブルシューティング \{#troubleshooting-multiple-mysql-users-in-clickhouse-cloud\}

新しい MySQL ユーザーを作成し、MySQL CLI クライアント経由で接続しようとした際に、次のエラーが表示される場合があります:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

この場合、ユーザー名が（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)で説明したように）`mysql4<subdomain>_<username>` という形式になっていることを確認してください。


## セルフマネージド ClickHouse での MySQL インターフェイスの有効化 \{#enabling-the-mysql-interface-on-self-managed-clickhouse\}

[mysql&#95;port](../../operations/server-configuration-parameters/settings.md#mysql_port) 設定をサーバーの構成ファイルに追加します。たとえば、`config.d/` [ディレクトリ](/operations/configuration-files) 内の新しい XML ファイルでポートを定義できます。

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouse サーバーを起動して、「Listening for MySQL compatibility protocol」といった文言を含む、次のようなログメッセージを探します:

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```


## MySQL を ClickHouse に接続する \{#connect-mysql-to-clickhouse\}

次のコマンドは、MySQL クライアント `mysql` から ClickHouse へ接続する方法を示します。

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例えば、

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

接続に成功した場合の出力例:

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

すべての MySQL クライアントとの互換性を確保するため、設定ファイルではユーザーのパスワードを [double SHA1](/operations/settings/settings-users#user-namepassword) で指定することを推奨します。
ユーザーのパスワードを [SHA256](/sql-reference/functions/hash-functions#SHA256) で指定した場合、一部のクライアント（mysqljs や、古いバージョンの MySQL および MariaDB のコマンドラインツール）は認証できなくなります。

制限事項:

* prepared クエリはサポートされません

* 一部のデータ型は文字列として送信されます

長時間実行中のクエリをキャンセルするには、`KILL QUERY connection_id` 文を使用します（処理時に `KILL QUERY WHERE query_id = connection_id` に置き換えられます）。例:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
