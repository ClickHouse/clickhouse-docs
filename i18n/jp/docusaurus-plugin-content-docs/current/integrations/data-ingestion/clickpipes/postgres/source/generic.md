---
sidebar_label: Generic Postgres
description: ClickPipesのソースとして任意のPostgresインスタンスを設定する
slug: /integrations/clickpipes/postgres/source/generic
---


# Generic Postgres ソース設定ガイド

:::info

サポートされているプロバイダーのいずれかを使用している場合は、サイドバーにあるそのプロバイダー専用のガイドを参照してください。

:::


ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

1. Postgresインスタンスでレプリケーションを有効にするために、以下の設定が行われていることを確認する必要があります：

    ```sql
    wal_level = logical
    ```
   同じことを確認するには、以下のSQLコマンドを実行できます：
    ```sql
    SHOW wal_level;
    ```

   出力は `logical` である必要があります。そうでない場合は、以下を実行します：
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

   推奨値と一致しない場合は、以下のSQLコマンドを実行して設定できます：
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 上記の設定を変更した場合、設定が反映されるためにPostgresインスタンスを再起動する必要があります。


## 権限と公開を持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDCに適した必要な権限を持つClickPipes用の新しいユーザーを作成し、レプリケーションで使用する公開を作成しましょう。

そのために、Postgresインスタンスに接続し、以下のSQLコマンドを実行します：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 公開を作成します。パイプを作成するときにこれを使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

`clickpipes_user` および `clickpipes_password` を希望のユーザー名とパスワードに置き換えることを忘れないでください。

:::


## ClickPipesユーザーへの接続をpg_hba.confで有効にする {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

セルフサービスを行っている場合は、下記の手順に従ってClickPipesのIPアドレスからClickPipesユーザーへの接続を許可する必要があります。管理されたサービスを使用している場合は、プロバイダーのドキュメントに従って同じことを行えます。

1. `pg_hba.conf`ファイルに必要な変更を加え、ClickPipesのIPアドレスからClickPipesユーザーへの接続を許可します。 `pg_hba.conf`ファイルの例のエントリは次のようになります：
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 設定を反映させるためにPostgreSQLインスタンスをリロードします：
    ```sql
    SELECT pg_reload_conf();
    ```


## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}

これは、レプリケーションスロットが削除されないように、大規模なトランザクション/コミットを防ぐために推奨される設定変更です。

`max_slot_wal_keep_size`パラメーターをより高い値（少なくとも100GBまたは `102400`）に更新することで、PostgreSQLインスタンスに対して増加させることができます。

```sql
max_slot_wal_keep_size = 102400
```

設定を反映させるためにPostgresインスタンスをリロードします：
```sql
SELECT pg_reload_conf();
```

:::note

この値に対してより良い推奨が必要な場合は、ClickPipesチームにお問い合わせください。

:::


## 次は何でしょうか？ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。
Postgresインスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセスで必要になります。
