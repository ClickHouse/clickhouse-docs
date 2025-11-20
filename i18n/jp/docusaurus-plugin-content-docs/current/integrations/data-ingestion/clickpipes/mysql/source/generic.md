---
sidebar_label: '汎用 MySQL'
description: '任意の MySQL インスタンスを ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/mysql/source/generic
title: '汎用 MySQL ソースセットアップガイド'
doc_type: 'guide'
keywords: ['generic mysql', 'clickpipes', 'binary logging', 'ssl tls', 'mysql 8.x']
---



# 汎用 MySQL ソース設定ガイド

:::info

サイドバーに表示されているサポート対象のプロバイダーを利用している場合は、そのプロバイダー向けの専用ガイドを参照してください。

:::



## バイナリログ保持の有効化 {#enable-binlog-retention}

バイナリログには、MySQLサーバーインスタンスに対して行われたデータ変更に関する情報が含まれており、レプリケーションに必要です。

### MySQL 8.x以降 {#binlog-v8-x}

MySQLインスタンスでバイナリログを有効にするには、以下の設定が構成されていることを確認してください:

```sql
log_bin = ON                        -- デフォルト値
binlog_format = ROW                 -- デフォルト値
binlog_row_image = FULL             -- デフォルト値
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1日以上; デフォルトは30日
```

これらの設定を確認するには、以下のSQLコマンドを実行してください:

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

値が一致しない場合は、以下のSQLコマンドを実行して設定できます:

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

`log_bin`設定を変更した場合は、変更を有効にするためにMySQLインスタンスを再起動する必要があります。

設定を変更した後、[データベースユーザーの構成](#configure-database-user)に進んでください。

### MySQL 5.7 {#binlog-v5-x}

MySQL 5.7インスタンスでバイナリログを有効にするには、以下の設定が構成されていることを確認してください:

```sql
server_id = 1            -- 1以上; 0以外の値
log_bin = ON
binlog_format = ROW      -- デフォルト値
binlog_row_image = FULL  -- デフォルト値
expire_logs_days = 1     -- 1以上; 0の場合はログが永久に保持される
```

これらの設定を確認するには、以下のSQLコマンドを実行してください:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル(通常は`/etc/my.cnf`または`/etc/mysql/my.cnf`)で設定できます:

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

変更を有効にするには、MySQLインスタンスを再起動する必要があります。

:::note

MySQL 5.7では、`binlog_row_metadata`設定がまだ導入されていなかったため、カラム除外はサポートされていません。

:::


## データベースユーザーの設定 {#configure-database-user}

rootユーザーとしてMySQLインスタンスに接続し、以下のコマンドを実行します:

1. ClickPipes専用のユーザーを作成します:

   ```sql
   CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
   ```

2. スキーマ権限を付与します。以下の例は`clickpipes`データベースに対する権限を示しています。レプリケートする各データベースとホストに対してこれらのコマンドを繰り返してください:

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
   ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```

:::note

`clickpipes_user`と`some_secure_password`は、任意のユーザー名とパスワードに置き換えてください。

:::


## SSL/TLS設定（推奨） {#ssl-tls-configuration}

SSL証明書により、MySQLデータベースへの安全な接続が確保されます。設定内容は証明書の種類によって異なります：

**信頼された認証局（DigiCert、Let's Encryptなど）** - 追加設定は不要です。

**内部認証局** - ITチームからルートCA証明書ファイルを入手してください。ClickPipes UIで新しいMySQL ClickPipeを作成する際にアップロードします。

**セルフホスト型MySQL** - MySQLサーバーからCA証明書をコピーし（通常は`/var/lib/mysql/ca.pem`に配置されています）、新しいMySQL ClickPipeを作成する際にUIでアップロードします。ホストにはサーバーのIPアドレスを指定してください。

**サーバーアクセス権のないセルフホスト型MySQL** - 証明書についてはITチームにお問い合わせください。最終手段として、ClickPipes UIの「証明書検証をスキップ」トグルを使用することもできますが、セキュリティ上の理由から推奨されません。

SSL/TLSオプションの詳細については、[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)をご参照ください。


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、MySQLインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
MySQLインスタンスのセットアップ時に使用した接続情報は、ClickPipeの作成時に必要となるため、必ず控えておいてください。
