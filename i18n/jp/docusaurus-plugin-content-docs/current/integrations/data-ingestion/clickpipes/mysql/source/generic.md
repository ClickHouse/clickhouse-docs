---
sidebar_label: '汎用 MySQL'
description: '任意の MySQL インスタンスを ClickPipes のソースとして設定する'
slug: /integrations/clickpipes/mysql/source/generic
title: '汎用 MySQL ソース設定ガイド'
doc_type: 'guide'
keywords: ['汎用 mysql', 'clickpipes', 'バイナリロギング', 'ssl/tls', 'mysql 8.x']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 汎用 MySQL ソース設定ガイド \{#generic-mysql-source-setup-guide\}

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを利用している場合は、そのプロバイダー専用のガイドを参照してください。

:::

## バイナリログ保持を有効化する \{#enable-binlog-retention\}

バイナリログには、MySQL サーバーインスタンスに対して行われたデータ変更の情報が含まれており、レプリケーションに必須です。

### MySQL 8.x 以降 \{#binlog-v8-x\}

MySQL インスタンスでバイナリログを有効にするには、次の設定が構成されていることを確認してください。

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

これらの設定を確認するには、以下の SQL コマンドを実行します。

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

値が一致しない場合は、次の SQL コマンドを実行して値を設定してください。

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

`log_bin` 設定を変更した場合、変更を反映させるには MySQL インスタンスを必ず再起動する必要があります。

設定を変更したら、続いて [データベースユーザーの設定](#configure-database-user) に進んでください。


### MySQL 5.7 \{#binlog-v5-x\}

MySQL 5.7 インスタンスでバイナリログを有効にするには、次の設定になっていることを確認してください。

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

これらの設定を確認するには、以下の SQL コマンドを実行します。

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル（通常は `/etc/my.cnf` または `/etc/mysql/my.cnf`）でこれらの値を設定できます。

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

変更を有効にするには、MySQL インスタンスを必ず再起動する必要があります。

:::note

MySQL 5.7 およびそれ以前のバージョンでは、カラムの除外やスキーマ変更はサポートされません。これらの機能は、[MySQL 8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) より前のバージョンの binlog には記録されていないテーブルメタデータに依存しています。

:::


## データベースユーザーを設定する \{#configure-database-user\}

root ユーザーとして MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. スキーマ権限を付与します。次の例では、`clickpipes` データベースに対する権限を示しています。レプリケーション対象とする各データベースおよびホストごとに、これらのコマンドを繰り返してください:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. ユーザーにレプリケーション権限を付与します:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

`clickpipes_user` と `some_secure_password` は、任意のユーザー名とパスワードに置き換えてください。

:::

## SSL/TLS 設定（推奨） \{#ssl-tls-configuration\}

SSL 証明書は、MySQL データベースへの接続を暗号化し、安全に保護します。設定内容は証明書の種類によって異なります。

**信頼された認証局（DigiCert、Let's Encrypt など）** - 追加の設定は不要です。

**社内認証局** - IT チームからルート CA 証明書ファイルを入手します。ClickPipes の UI で新しい MySQL ClickPipe を作成するときにアップロードします。

**セルフホスト型 MySQL** - MySQL サーバーから CA 証明書（通常は `/var/lib/mysql/ca.pem`）をコピーし、新しい MySQL ClickPipe を作成するときに UI からアップロードします。ホストにはサーバーの IP アドレスを使用します。

**サーバーへアクセスできないセルフホスト型 MySQL** - IT チームに証明書の提供を依頼してください。最後の手段として、ClickPipes UI の "Skip Certificate Verification" トグルを使用できますが、セキュリティ上の理由から推奨されません。

SSL/TLS オプションの詳細については、[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error) を参照してください。

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、MySQL インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe の作成時に必要になるため、MySQL インスタンスのセットアップ時に使用した接続情報を必ず控えておいてください。