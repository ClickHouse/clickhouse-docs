---
'sidebar_label': 'Generic Postgres'
'description': '任意の Postgres インスタンスを ClickPipes のソースとして設定します'
'slug': '/integrations/clickpipes/postgres/source/generic'
'title': '汎用 Postgres ソース設定ガイド'
'doc_type': 'guide'
---


# Generic Postgres source setup guide

:::info

サポートされているプロバイダーの1つを使用している場合（サイドバーに記載）、そのプロバイダーの具体的なガイドを参照してください。

:::

ClickPipesはPostgresバージョン12以降をサポートしています。

## Enable logical replication {#enable-logical-replication}

1. Postgresインスタンスでレプリケーションを有効にするには、以下の設定が行われていることを確認する必要があります：

```sql
wal_level = logical
```
   同じことを確認するには、以下のSQLコマンドを実行できます：
```sql
SHOW wal_level;
```

   出力は`logical`であるべきです。そうでない場合は、次のコマンドを実行してください：
```sql
ALTER SYSTEM SET wal_level = logical;
```

2. さらに、Postgresインスタンスに設定することが推奨される以下の設定があります：
```sql
max_wal_senders > 1
max_replication_slots >= 4
```
   同じことを確認するには、以下のSQLコマンドを実行できます：
```sql
SHOW max_wal_senders;
SHOW max_replication_slots;
```

   値が推薦される値に一致しない場合は、以下のSQLコマンドを実行して設定できます：
```sql
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;
```
3. 上記のように構成に変更を加えた場合は、変更を有効にするためにPostgresインスタンスを再起動する必要があります。

## Creating a user with permissions and publication {#creating-a-user-with-permissions-and-publication}

CDCに適した必要な権限を持つClickPipes用の新しいユーザーを作成し、レプリケーションに使用する公開を作成しましょう。

このためには、Postgresインスタンスに接続し、以下のSQLコマンドを実行できます：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

`clickpipes_user`および`clickpipes_password`を希望するユーザー名とパスワードに置き換えてください。

:::

## Enabling connections in pg_hba.conf to the ClickPipes User {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

セルフサービスの場合は、以下の手順に従ってClickPipesのIPアドレスからClickPipesユーザーへの接続を許可する必要があります。マネージドサービスを使用している場合は、プロバイダーの文書に従って同様のことができます。

1. `pg_hba.conf`ファイルに必要な変更を加えて、ClickPipesのIPアドレスからClickPipesユーザーへの接続を許可します。`pg_hba.conf`ファイルの例のエントリーは次のようになります：
```response
host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
```

2. 変更を有効にするためにPostgreSQLインスタンスをリロードします：
```sql
SELECT pg_reload_conf();
```

## Increase `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

これは、大きなトランザクション/コミットがレプリケーションスロットをドロップさせないようにするために推奨される構成変更です。

`max_slot_wal_keep_size`パラメータを高い値（最低100GBまたは`102400`）に増加させることができます。これは`postgresql.conf`ファイルを更新することによって行います。

```sql
max_slot_wal_keep_size = 102400
```

変更を有効にするためにPostgresインスタンスをリロードできます：
```sql
SELECT pg_reload_conf();
```

:::note

この値に関するより良い推奨を得るには、ClickPipesチームに問い合わせてください。

:::

## What's next? {#whats-next}

これで [ClickPipeを作成](../index.md) し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。Postgresインスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセス中に必要になります。
