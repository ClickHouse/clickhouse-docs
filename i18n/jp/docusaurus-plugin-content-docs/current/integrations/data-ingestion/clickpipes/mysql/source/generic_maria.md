---
sidebar_label: '汎用 MariaDB'
description: '任意の MariaDB インスタンスを ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: '汎用 MariaDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['汎用 mariadb', 'clickpipes', 'バイナリロギング', 'SSL/TLS', 'セルフホスト型']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 汎用 MariaDB ソース設定ガイド \{#generic-mariadb-source-setup-guide\}

:::info

サイドバーに記載されているサポート対象のプロバイダーを利用している場合は、そのプロバイダー向けの専用ガイドを参照してください。

:::

## バイナリログの保持を有効にする \{#enable-binlog-retention\}

バイナリログには、MariaDB サーバーインスタンスで行われたデータ変更に関する情報が含まれており、レプリケーションに必要となります。

MariaDB インスタンスでバイナリログを有効にするには、次の設定が行われていることを確認してください。

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

これらの設定を確認するには、以下の SQL コマンドを実行します。

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル（通常は `/etc/my.cnf` または `/etc/my.cnf.d/mariadb-server.cnf`）でこれらの値を設定できます。

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

ソースデータベースがレプリカである場合は、`log_slave_updates` も有効にしてください。

これらの変更を反映させるには、MariaDB インスタンスを再起動する必要があります。

:::note

`binlog_row_metadata` 設定がまだ導入されていないため、MariaDB &lt;= 10.4 ではカラムの除外はサポートされていません。

:::


## データベースユーザーを設定する \{#configure-database-user\}

root ユーザーで MariaDB インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. スキーマ権限を付与します。次の例は、`clickpipes` データベースに対する権限を示しています。レプリケーション対象とする各データベースおよびホストごとに、これらのコマンドを繰り返してください：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

`clickpipes_user` および `some_secure_password` は、任意のユーザー名とパスワードに置き換えてください。

:::

## SSL/TLS 構成（推奨） \{#ssl-tls-configuration\}

SSL 証明書は、MariaDB データベースへの接続を安全に保護します。設定内容は、証明書の種類によって異なります。

**信頼された認証局 (DigiCert, Let's Encrypt など)** - 追加の設定は不要です。

**社内認証局** - IT チームからルート CA 証明書ファイルを取得します。ClickPipes UI で新しい MariaDB ClickPipe を作成する際にアップロードします。

**セルフホスト型 MariaDB** - MariaDB サーバーから CA 証明書をコピーします（`my.cnf` 内の `ssl_ca` 設定でパスを確認します）。ClickPipes UI で新しい MariaDB ClickPipe を作成する際にアップロードします。ホストにはサーバーの IP アドレスを使用します。

**MariaDB 11.4 以降のセルフホスト型 MariaDB** - サーバーで `ssl_ca` が設定されている場合は、上記のオプションに従います。設定されていない場合は、適切な証明書を用意するよう IT チームに相談してください。最後の手段として、ClickPipes UI の「Skip Certificate Verification」トグルを使用できますが、セキュリティ上の理由から推奨されません。

SSL/TLS オプションの詳細については、[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error) を参照してください。

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、MariaDB インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
MariaDB インスタンスをセットアップした際に使用した接続情報は、ClickPipe の作成プロセスで必要になるため、必ず控えておいてください。