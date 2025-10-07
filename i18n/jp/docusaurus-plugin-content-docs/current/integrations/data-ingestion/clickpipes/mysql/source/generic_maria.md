---
'sidebar_label': '一般的な MariaDB'
'description': '任意の MariaDB インスタンスを ClickPipes のソースとしてセットアップする'
'slug': '/integrations/clickpipes/mysql/source/generic_maria'
'title': '一般的な MariaDB ソースセットアップガイド'
'doc_type': 'guide'
---


# 一般的なMariaDBソース設定ガイド

:::info

サポートされているプロバイダーの1つを使用している場合（サイドバー参照）、そのプロバイダーの特定のガイドを参照してください。

:::

## バイナリログ保持の有効化 {#enable-binlog-retention}

バイナリログは、MariaDBサーバーインスタンスに対して行われたデータ変更に関する情報を含み、レプリケーションには必須です。

MariaDBインスタンスでバイナリログを有効にするには、以下の設定が正しく構成されていることを確認してください。

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

これらの設定を確認するには、次のSQLコマンドを実行します：
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル（通常は `/etc/my.cnf` または `/etc/my.cnf.d/mariadb-server.cnf`）で設定できます：
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

ソースデータベースがレプリカである場合、`log_slave_updates` も有効にする必要があります。

変更を有効にするには、MariaDBインスタンスを再起動する必要があります。

:::note

MariaDB \<= 10.4では、`binlog_row_metadata` 設定がまだ導入されていないため、カラムの除外はサポートされていません。

:::

## データベースユーザーの設定 {#configure-database-user}

rootユーザーとしてMariaDBインスタンスに接続し、次のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. スキーマ権限を付与します。次の例は `clickpipes` データベースの権限を示します。レプリケートしたい各データベースおよびホストについて、このコマンドを繰り返します：

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. ユーザーにレプリケーション権限を付与します：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

`clickpipes_user` および `some_secure_password` を希望のユーザー名とパスワードに置き換えてください。

:::

## SSL/TLS構成（推奨） {#ssl-tls-configuration}

SSL証明書は、MariaDBデータベースへの安全な接続を確保します。構成は証明書の種類によって異なります：

**信頼された認証局（DigiCert、Let's Encryptなど）** - 追加の構成は不要です。

**内部認証局** - ITチームからルートCA証明書ファイルを取得します。ClickPipes UIで、新しいMariaDB ClickPipeを作成する際にアップロードします。

**セルフホスト型MariaDB** - MariaDBサーバーからCA証明書をコピーします（`my.cnf`の `ssl_ca` 設定を参照してパスを確認します）。ClickPipes UIで、新しいMariaDB ClickPipeを作成する際にアップロードします。ホストにはサーバーのIPアドレスを使用します。

**セルフホスト型MariaDB 11.4以降** - サーバーに `ssl_ca` が設定されている場合は、上記のオプションに従ってください。それ以外の場合、ITチームに適切な証明書を用意するよう相談してください。最後の手段として、ClickPipes UIの「証明書検証をスキップ」トグルを使用できます（セキュリティ上の理由から推奨されません）。

SSL/TLSオプションに関する詳細については、[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)をご覧ください。

## 次は何をしますか？ {#whats-next}

これで [ClickPipeを作成](../index.md)し、MariaDBインスタンスからClickHouse Cloudにデータを取り込むことを開始できます。
MariaDBインスタンスのセットアップ時に使用した接続情報をメモしておくことを忘れないでください。ClickPipeの作成プロセス中に必要になります。
