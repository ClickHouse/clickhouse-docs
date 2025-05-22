---
'sidebar_label': 'Generic Postgres'
'description': 'Set up any Postgres instance as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/generic'
'title': 'Generic Postgres Source Setup Guide'
---





# 一般的な Postgres ソースセットアップガイド

:::info

サポートされているプロバイダのいずれかを使用している場合は、サイドバーのそのプロバイダの特定のガイドを参照してください。

:::


ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

1. Postgres インスタンスでレプリケーションを有効にするために、以下の設定が行われていることを確認する必要があります:

    ```sql
    wal_level = logical
    ```
   同じことを確認するには、次の SQL コマンドを実行できます:
    ```sql
    SHOW wal_level;
    ```

   出力は `logical` である必要があります。そうでない場合は、次を実行します:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. 加えて、Postgres インスタンスで設定することが推奨されている以下の設定があります:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   同じことを確認するには、次の SQL コマンドを実行できます:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   値が推奨値と一致しない場合は、次の SQL コマンドを実行して設定できます:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 上記の設定を変更した場合は、変更が適用されるために Postgres インスタンスを再起動する必要があります。


## 権限とパブリケーションを持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用するパブリケーションも作成しましょう。

これを行うには、Postgres インスタンスに接続し、次の SQL コマンドを実行できます:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。パイプを作成するときに使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

`clickpipes_user` と `clickpipes_password` は希望するユーザー名とパスワードに置き換えてください。

:::


## ClickPipes ユーザーのための pg_hba.conf での接続の有効化 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

セルフサービスの場合は、ClickPipes IP アドレスから ClickPipes ユーザーへの接続を許可する必要があります。以下の手順に従ってください。マネージドサービスを使用している場合は、プロバイダのドキュメントに従って同じことを行えます。

1. `pg_hba.conf` ファイルで ClickPipes ユーザーへの接続を許可するために必要な変更を行います。`pg_hba.conf` ファイルの例のエントリは次のようになります:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 変更が適用されるように PostgreSQL インスタンスを再読み込みします:
    ```sql
    SELECT pg_reload_conf();
    ```


## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}

これは、大きなトランザクション/コミットによってレプリケーションスロットが削除されないようにするための推奨設定変更です。

`max_slot_wal_keep_size` パラメータを PostgreSQL インスタンスのより高い値（少なくとも 100GB または `102400`）に増やすことができます。`postgresql.conf` ファイルを更新して行います。

```sql
max_slot_wal_keep_size = 102400
```

変更が適用されるように Postgres インスタンスを再読み込みできます:
```sql
SELECT pg_reload_conf();
```

:::note

この値のより良い推奨が必要な場合は、ClickPipes チームに連絡してください。

:::

## 次は何をしますか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータの取り込みを開始できます。
Postgres インスタンスを設定したときに使用した接続の詳細をメモしておくことを忘れないでください。ClickPipe 作成プロセス中に必要になります。
