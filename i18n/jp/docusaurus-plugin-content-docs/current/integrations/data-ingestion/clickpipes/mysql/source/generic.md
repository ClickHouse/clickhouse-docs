---
'sidebar_label': 'Generic MySQL'
'description': '任意の MySQL インスタンスを ClickPipes のソースとして設定する'
'slug': '/integrations/clickpipes/mysql/source/generic'
'title': '汎用 MySQL ソース設定ガイド'
'doc_type': 'guide'
---


# Generic MySQL source setup guide

:::info

サポートされているプロバイダーのいずれかを使用している場合（サイドバー参照）、そのプロバイダー向けの特定のガイドを参照してください。

:::

## Enable binary log retention {#enable-binlog-retention}

バイナリログは、MySQLサーバーインスタンスに対して行われたデータ変更に関する情報を含み、レプリケーションに必要です。

### MySQL 8.x and newer {#binlog-v8-x}

MySQLインスタンスでバイナリログを有効にするには、次の設定が構成されていることを確認してください。

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

これらの設定を確認するには、次のSQLコマンドを実行します：
```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

値が一致しない場合は、次のSQLコマンドを実行して設定してください：
```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

`log_bin`設定を変更した場合は、変更を反映させるためにMySQLインスタンスを再起動する必要があります。

設定を変更した後は、[データベースユーザーの構成](#configure-database-user)に進んでください。

### MySQL 5.7 {#binlog-v5-x}

MySQL 5.7インスタンスでバイナリログを有効にするには、次の設定が構成されていることを確認してください。

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

これらの設定を確認するには、次のSQLコマンドを実行します：
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル（通常は `/etc/my.cnf` または `/etc/mysql/my.cnf` にあります）でそれらを設定できます：
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

変更を反映させるためにMySQLインスタンスを再起動する必要があります。

:::note

MySQL 5.7では `binlog_row_metadata` 設定がまだ導入されていないため、カラム除外はサポートされていません。

:::

## Configure a database user {#configure-database-user}

MySQLインスタンスにrootユーザーとして接続し、次のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. スキーマ権限を付与します。次の例は、 `clickpipes` データベースの権限を示しています。レプリケーションしたい各データベースとホストについてこれらのコマンドを繰り返してください：

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. ユーザーにレプリケーション権限を付与します：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

`clickpipes_user` と `some_secure_password` を、希望のユーザー名とパスワードに置き換えることを忘れないでください。

:::

## SSL/TLS configuration (recommended) {#ssl-tls-configuration}

SSL証明書は、MySQLデータベースへの安全な接続を確保します。設定は証明書の種類によって異なります：

**信頼された認証局（DigiCert、Let's Encryptなど）** - 追加の設定は必要ありません。

**内部認証局** - ITチームからルートCA証明書ファイルを取得します。ClickPipes UIで新しいMySQL ClickPipeを作成する際にそれをアップロードします。

**セルフホストMySQL** - MySQLサーバーからCA証明書をコピーします（通常は `/var/lib/mysql/ca.pem` にあります）し、新しいMySQL ClickPipeを作成する際にUIにアップロードします。サーバーのIPアドレスをホストとして使用します。

**サーバーアクセスのないセルフホストMySQL** - 証明書についてITチームに連絡します。最終手段として、ClickPipes UIで「証明書検証をスキップ」のトグルを使用します（セキュリティ上の理由からは推奨されません）。

SSL/TLSオプションに関する詳細は、私たちの[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)を参照してください。

## What's next? {#whats-next}

これで、[ClickPipeを作成](../index.md)し、MySQLインスタンスからClickHouse Cloudにデータを取り込むことができます。MySQLインスタンスを設定する際に使用した接続詳細を書き留めておくことを忘れないでください。ClickPipe作成プロセス中に必要になります。
