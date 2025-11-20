---
sidebar_label: '汎用 Postgres'
description: '任意の Postgres インスタンスを ClickPipes のソースとして設定する'
slug: /integrations/clickpipes/postgres/source/generic
title: '汎用 Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
---



# 汎用 Postgres ソースセットアップガイド

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを利用している場合は、そのプロバイダー専用のガイドを参照してください。

:::

ClickPipes は Postgres バージョン 12 以降をサポートしています。



## 論理レプリケーションの有効化 {#enable-logical-replication}

1. Postgresインスタンスでレプリケーションを有効にするには、以下の設定が適用されていることを確認する必要があります:

   ```sql
   wal_level = logical
   ```

   確認するには、以下のSQLコマンドを実行します:

   ```sql
   SHOW wal_level;
   ```

   出力は`logical`である必要があります。そうでない場合は、以下を実行します:

   ```sql
   ALTER SYSTEM SET wal_level = logical;
   ```

2. さらに、Postgresインスタンスには以下の設定を行うことを推奨します:

   ```sql
   max_wal_senders > 1
   max_replication_slots >= 4
   ```

   確認するには、以下のSQLコマンドを実行します:

   ```sql
   SHOW max_wal_senders;
   SHOW max_replication_slots;
   ```

   値が推奨値と一致しない場合は、以下のSQLコマンドを実行して設定します:

   ```sql
   ALTER SYSTEM SET max_wal_senders = 10;
   ALTER SYSTEM SET max_replication_slots = 10;
   ```

3. 上記の設定を変更した場合は、変更を有効にするためにPostgresインスタンスを**必ず再起動**してください。


## パーミッションとパブリケーションを持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に必要なパーミッションを持つ ClickPipes 用の新しいユーザーを作成し、
レプリケーションに使用するパブリケーションも作成しましょう。

Postgres インスタンスに接続して、以下の SQL コマンドを実行してください:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成。パイプ作成時に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

:::note

`clickpipes_user` と `clickpipes_password` を任意のユーザー名とパスワードに置き換えてください。

:::


## pg_hba.confでClickPipesユーザーへの接続を有効にする {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

セルフホスティングの場合、以下の手順に従ってClickPipes IPアドレスからClickPipesユーザーへの接続を許可する必要があります。マネージドサービスを使用している場合は、プロバイダーのドキュメントに従って同様の設定を行ってください。

1. `pg_hba.conf`ファイルに必要な変更を加えて、ClickPipes IPアドレスからClickPipesユーザーへの接続を許可します。`pg_hba.conf`ファイルのエントリ例は次のようになります:

   ```response
   host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
   ```

2. 変更を有効にするためにPostgreSQLインスタンスをリロードします:
   ```sql
   SELECT pg_reload_conf();
   ```


## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}

これは、大規模なトランザクション/コミットによってレプリケーションスロットが削除されることを防ぐための推奨設定変更です。

`postgresql.conf` ファイルを更新することで、PostgreSQL インスタンスの `max_slot_wal_keep_size` パラメータをより大きな値(少なくとも 100GB または `102400`)に増やすことができます。

```sql
max_slot_wal_keep_size = 102400
```

変更を有効にするには、Postgres インスタンスをリロードします:

```sql
SELECT pg_reload_conf();
```

:::note

この値の最適な推奨値については、ClickPipes チームにお問い合わせください。

:::


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、Postgresインスタンスのセットアップで使用した接続情報を必ず控えておいてください。
