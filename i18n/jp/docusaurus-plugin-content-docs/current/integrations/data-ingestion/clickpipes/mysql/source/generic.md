---
sidebar_label: '汎用 MySQL'
description: '任意の MySQL インスタンスを ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/mysql/source/generic
title: '汎用 MySQL ソースセットアップガイド'
doc_type: 'guide'
keywords: ['汎用 mysql', 'clickpipes', 'バイナリログ', 'ssl/tls', 'mysql 8.x']
---



# 汎用 MySQL ソース設定ガイド

:::info

サイドバーに表示されているサポート対象のプロバイダーを使用している場合は、そのプロバイダー向けの個別ガイドを参照してください。

:::



## バイナリログの保持を有効にする

バイナリログには、MySQL サーバーインスタンスに対して行われたデータ変更に関する情報が含まれており、レプリケーションに必要です。

### MySQL 8.x 以降

MySQL インスタンスでバイナリログを有効にするには、次の設定が行われていることを確認します。

```sql
log_bin = ON                        -- デフォルト値
binlog_format = ROW                 -- デフォルト値
binlog_row_image = FULL             -- デフォルト値
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1日以上; デフォルトは30日
```

これらの設定を確認するには、次の SQL コマンドを実行してください。

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

値が一致しない場合は、次の SQL コマンドを実行して値を設定できます。

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

`log_bin` 設定を変更した場合、変更を反映させるには MySQL インスタンスを必ず再起動する必要があります。

設定を変更したら、続いて[データベースユーザーの設定](#configure-database-user)に進んでください。

### MySQL 5.7

MySQL 5.7 インスタンスでバイナリログを有効にするには、次の設定が行われていることを確認してください。

```sql
server_id = 1            -- 1以上; 0以外の任意の値
log_bin = ON
binlog_format = ROW      -- デフォルト値
binlog_row_image = FULL  -- デフォルト値
expire_logs_days = 1     -- 1以上; 0を指定するとログが永久に保持されます
```

これらの設定を確認するには、次の SQL コマンドを実行します。

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル（通常は `/etc/my.cnf` または `/etc/mysql/my.cnf`）でこれらの値を設定できます：

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

変更を反映させるには、MySQL インスタンスを必ず再起動する必要があります。

:::note

`binlog_row_metadata` 設定がまだ導入されていないため、MySQL 5.7 では列の除外はサポートされていません。

:::


## データベースユーザーの設定 {#configure-database-user}

root ユーザーとして MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. スキーマ権限を付与します。次の例では、`clickpipes` データベースに対する権限を示しています。レプリケーションしたい各データベースおよびホストに対して、これらのコマンドを繰り返してください。

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

`clickpipes_user` と `some_secure_password` は、使用したいユーザー名とパスワードに置き換えてください。

:::



## SSL/TLS の構成（推奨） {#ssl-tls-configuration}

SSL 証明書は、MySQL データベースへの安全な接続を確立するために使用されます。設定内容は証明書の種類によって異なります。

**信頼できる認証局（DigiCert、Let's Encrypt など）** - 追加の設定は不要です。

**社内認証局** - IT チームからルート CA 証明書ファイルを取得します。ClickPipes の UI で新しい MySQL ClickPipe を作成する際にアップロードします。

**セルフホスト型 MySQL** - MySQL サーバー上の CA 証明書（通常は `/var/lib/mysql/ca.pem`）をコピーし、新しい MySQL ClickPipe を作成するときに UI からアップロードします。ホストにはサーバーの IP アドレスを使用します。

**サーバーへのアクセス権がないセルフホスト型 MySQL** - IT チームに証明書の提供を依頼します。最後の手段として、ClickPipes UI の「Skip Certificate Verification」トグルを使用できます（セキュリティ上は推奨されません）。

SSL/TLS オプションの詳細については、[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error) を参照してください。



## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、MySQL インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
ClickPipe を作成する際に必要となるため、MySQL インスタンスのセットアップ時に使用した接続情報を必ず控えておいてください。