---
sidebar_label: '汎用 MariaDB'
description: '任意の MariaDB インスタンスを ClickPipes のソースとして設定する'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: '汎用 MariaDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['generic mariadb', 'clickpipes', 'binary logging', 'ssl tls', 'self hosted']
---



# 一般的な MariaDB ソース設定ガイド

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを利用している場合は、そのプロバイダー専用のガイドを参照してください。

:::



## バイナリログの保持を有効にする {#enable-binlog-retention}

バイナリログには、MariaDBサーバーインスタンスに対して行われたデータ変更に関する情報が含まれており、レプリケーションに必要です。

MariaDBインスタンスでバイナリログを有効にするには、以下の設定が構成されていることを確認してください:

```sql
server_id = 1               -- 1以上の値; 0以外
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- 10.5.0で導入
expire_logs_days = 1        -- 1以上の値; 0の場合はログが永久に保持される
```

これらの設定を確認するには、以下のSQLコマンドを実行してください:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

値が一致しない場合は、設定ファイル(通常は `/etc/my.cnf` または `/etc/my.cnf.d/mariadb-server.cnf`)で設定できます:

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; 10.5.0以降のみ
expire_logs_days = 1
```

ソースデータベースがレプリカの場合は、`log_slave_updates` も有効にしてください。

変更を有効にするには、MariaDBインスタンスを再起動する必要があります。

:::note

MariaDB 10.4以前では、`binlog_row_metadata` 設定がまだ導入されていなかったため、カラム除外はサポートされていません。

:::


## データベースユーザーの設定 {#configure-database-user}

rootユーザーとしてMariaDBインスタンスに接続し、以下のコマンドを実行します:

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

`clickpipes_user`と`some_secure_password`を任意のユーザー名とパスワードに置き換えてください。

:::


## SSL/TLS設定（推奨） {#ssl-tls-configuration}

SSL証明書により、MariaDBデータベースへの安全な接続が確保されます。設定内容は証明書の種類によって異なります：

**信頼された認証局（DigiCert、Let's Encryptなど）** - 追加設定は不要です。

**内部認証局** - ITチームからルートCA証明書ファイルを取得してください。ClickPipes UIで新しいMariaDB ClickPipeを作成する際にアップロードします。

**セルフホスト型MariaDB** - MariaDBサーバーからCA証明書をコピーしてください（`my.cnf`内の`ssl_ca`設定でパスを確認できます）。ClickPipes UIで新しいMariaDB ClickPipeを作成する際にアップロードします。ホストにはサーバーのIPアドレスを使用してください。

**バージョン11.4以降のセルフホスト型MariaDB** - サーバーに`ssl_ca`が設定されている場合は、上記のオプションに従ってください。設定されていない場合は、ITチームに相談して適切な証明書をプロビジョニングしてください。最終手段として、ClickPipes UIの「証明書検証をスキップ」トグルを使用できますが、セキュリティ上の理由から推奨されません。

SSL/TLSオプションの詳細については、[FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)をご確認ください。


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、MariaDBインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
MariaDBインスタンスのセットアップ時に使用した接続情報は、ClickPipe作成時に必要となるため、必ず控えておいてください。
