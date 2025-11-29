---
description: 'ClickHouse の MySQL プロトコルインターフェイスに関するドキュメントです。MySQL クライアントから ClickHouse に接続できます'
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


# MySQL インターフェイス {#mysql-interface}

ClickHouse は MySQL ワイヤープロトコルをサポートしています。これにより、ネイティブな ClickHouse コネクタを持たない一部のクライアントでも MySQL プロトコルを代わりに利用でき、次の BI ツールで動作検証が行われています:

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

他の未検証のクライアントやインテグレーションを試す場合は、次のような制限があり得ることに留意してください:

- SSL 実装が完全には互換でない可能性があり、[TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) に関連する問題が発生する場合があります。
- 特定のツールが、まだ実装されていない方言機能（例: MySQL 固有の関数や設定）を必要とする可能性があります。

ネイティブドライバが利用可能な場合（例: [DBeaver](../integrations/dbeaver)）は、MySQL インターフェイスではなく、常にネイティブドライバを使用することを推奨します。さらに、ほとんどの MySQL 言語クライアントは問題なく動作するはずですが、MySQL インターフェイスが既存の MySQL クエリを持つコードベースに対するドロップインの代替となることは保証されません。

特定のツールにネイティブな ClickHouse ドライバがなく、MySQL インターフェイス経由で利用したいものの、何らかの非互換性を見つけた場合は、ClickHouse リポジトリで[Issue を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。

::::note
上記の BI ツールの SQL 方言をより適切にサポートするため、ClickHouse の MySQL インターフェイスは、設定 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) を有効にした状態で SELECT クエリを暗黙的に実行します。
この設定は無効化できず、まれなエッジケースでは、ClickHouse の通常のクエリインターフェイスと MySQL クエリインターフェイスに送信されたクエリの間で挙動が異なる原因となる場合があります。
::::



## ClickHouse Cloud での MySQL インターフェイスの有効化 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloud サービスを作成したら、`Connect` ボタンをクリックします。

<br/>

<Image img={mysql0} alt="認証情報画面 - プロンプト" size="md"/>

2. `Connect with` のドロップダウンを `MySQL` に変更します。 

<br/>

<Image img={mysql1} alt="認証情報画面 - MySQL を選択" size="md" />

3. このサービスで MySQL インターフェイスを有効にするためにスイッチをオンにします。これにより、このサービスでポート `3306` が公開され、一意の MySQL ユーザー名を含む MySQL 接続画面が表示されます。パスワードはサービスのデフォルトユーザーのパスワードと同一です。

<br/>

<Image img={mysql2} alt="認証情報画面 - MySQL を有効化" size="md"/>

表示されている MySQL 接続文字列をコピーします。

<Image img={mysql3} alt="認証情報画面 - 接続文字列" size="md"/>



## ClickHouse Cloud で複数の MySQL ユーザーを作成する {#creating-multiple-mysql-users-in-clickhouse-cloud}

デフォルトでは、組み込みの `mysql4<subdomain>` ユーザーが存在し、このユーザーは `default` ユーザーと同じパスワードを使用します。`<subdomain>` 部分は、ClickHouse Cloud ホスト名の先頭のセグメントです。この形式は、安全な接続を実装しているものの [TLS ハンドシェイクで SNI 情報を提供しない](https://www.cloudflare.com/learning/ssl/what-is-sni) ツールと連携するために必要であり、ユーザー名に追加のヒントがないと内部ルーティングができないためです（MySQL コンソールクライアントはそのようなツールの一例です）。

このため、MySQL インターフェイスで使用する新しいユーザーを作成する際は、`mysql4<subdomain>_<username>` という形式に従うことを*強く推奨*します。ここで、`<subdomain>` は Cloud サービスを識別するためのヒントであり、`<username>` は任意のサフィックスです。

:::tip
`foobar.us-east1.aws.clickhouse.cloud` のような ClickHouse Cloud ホスト名の場合、`<subdomain>` 部分は `foobar` に相当し、カスタム MySQL ユーザー名は `mysql4foobar_team1` のようになります。
:::

たとえば、追加の設定を適用する必要がある場合などに、MySQL インターフェイスで使用する追加ユーザーを作成できます。

1. （任意）カスタムユーザーに適用する [settings profile](/sql-reference/statements/create/settings-profile) を作成します。たとえば、後で作成するユーザーで接続した際にデフォルトで適用される追加設定を持つ `my_custom_profile` を作成します:

   ```sql
   CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
   ```

   `prefer_column_name_to_alias` はあくまで例であり、ここには他の設定を指定できます。

2. 次の形式で [ユーザーを作成](/sql-reference/statements/create/user) します: `mysql4<subdomain>_<username>`（[前述](#creating-multiple-mysql-users-in-clickhouse-cloud) 参照）。パスワードは double SHA1 形式である必要があります。例:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
   ```

   または、このユーザーに対してカスタムプロファイルを使用したい場合:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
   ```

   ここで、`my_custom_profile` は先ほど作成したプロファイル名です。

3. 新しいユーザーに対して、対象とするテーブルやデータベースとやり取りするために必要な権限を [付与](/sql-reference/statements/grant) します。たとえば、`system.query_log` のみにアクセス権を与えたい場合:

   ```sql
   GRANT SELECT ON system.query_log TO mysql4foobar_team1;
   ```

4. 作成したユーザーを使用して、MySQL インターフェイス経由で ClickHouse Cloud サービスに接続します。

### ClickHouse Cloud での複数 MySQL ユーザーに関するトラブルシューティング {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

新しい MySQL ユーザーを作成し、MySQL CLI クライアント経由で接続する際に次のエラーが表示される場合があります:

```sql
ERROR 2013 (HY000): MySQLサーバーへの接続が切断されました at 'reading authorization packet', system error: 54
```

この場合は、ユーザー名が `mysql4&lt;subdomain&gt;_&lt;username&gt;` という形式（[上記](#creating-multiple-mysql-users-in-clickhouse-cloud)で説明したとおり）になっていることを確認してください。


## セルフマネージド ClickHouse での MySQL インターフェイスの有効化 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

サーバーの構成ファイルに [mysql&#95;port](../operations/server-configuration-parameters/settings.md#mysql_port) 設定を追加します。たとえば、`config.d/` [ディレクトリ](../operations/configuration-files) 内の新しい XML ファイルでこのポートを定義できます。

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、`Listening for MySQL compatibility protocol` というメッセージを含む、次のようなログメッセージを探します。

```bash
{} <Information> Application: MySQL互換プロトコルでリッスン中: 127.0.0.1:9004
```


## MySQL を ClickHouse に接続する {#connect-mysql-to-clickhouse}

次のコマンドは、MySQL クライアント `mysql` から ClickHouse へ接続する方法を示します。

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例えば:

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

接続に成功した場合の出力:

```text
MySQLモニターへようこそ。コマンドは ; または \g で終了します。
MySQL接続IDは 4 です
サーババージョン: 20.2.1.1-ClickHouse

Copyright (c) 2000, 2019, Oracle and/or its affiliates. All rights reserved.

Oracleは、Oracle Corporationおよび/またはその関連会社の登録商標です。
その他の名称は、それぞれの所有者の商標である可能性があります。

ヘルプを表示するには 'help;' または '\h' と入力してください。現在の入力文をクリアするには '\c' と入力してください。

mysql>
```

すべての MySQL クライアントとの互換性を確保するため、設定ファイルではユーザーのパスワードを [double SHA1](/operations/settings/settings-users#user-namepassword) で指定することを推奨します。
ユーザーパスワードを [SHA256](/sql-reference/functions/hash-functions#SHA256) で指定した場合、一部のクライアント（mysqljs や、古いバージョンのコマンドラインツール MySQL および MariaDB）は認証に失敗します。

制限事項:

* プリペアドステートメントはサポートされていません

* 一部のデータ型は文字列として送信されます

長時間実行されているクエリをキャンセルするには、`KILL QUERY connection_id` ステートメントを使用します（実行時には `KILL QUERY WHERE query_id = connection_id` に置き換えられます）。例:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
