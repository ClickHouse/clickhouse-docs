---
sidebar_label: ジェネリック Postgres
description: ClickPipes のソースとして任意の Postgres インスタンスを設定する
slug: /integrations/clickpipes/postgres/source/generic
---

# ジェネリック Postgres ソースセットアップガイド

:::info

サポートされているプロバイダーのいずれかを使用している場合は、そのプロバイダーに特化したガイドを参照してください。

:::

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

1. Postgres インスタンスでレプリケーションを有効にするためには、以下の設定が行われていることを確認する必要があります：

    ```sql
    wal_level = logical
    ```
   確認するには、次の SQL コマンドを実行できます：
    ```sql
    SHOW wal_level;
    ```

   出力は `logical` である必要があります。そうでない場合は、次のコマンドを実行します：
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. さらに、Postgres インスタンスには以下の設定が推奨されます：
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   これらを確認するには、次の SQL コマンドを実行できます：
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   推奨値と一致しない場合は、次の SQL コマンドを実行して設定できます：
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 上記の設定に変更を加えた場合、変更を適用するために Postgres インスタンスを再起動する必要があります。


## 権限と出版物を持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用する出版物も作成しましょう。

これには、Postgres インスタンスに接続し、次の SQL コマンドを実行します：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 出版物を作成します。この出版物をパイプ作成時に使用します。
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

`clickpipes_user` および `clickpipes_password` を希望のユーザー名とパスワードに置き換えることを忘れないでください。

:::


## ClickPipes ユーザーへの接続の有効化 pg_hba.conf で {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

セルフマネージドの場合、ClickPipes IP アドレスから ClickPipes ユーザーへの接続を許可する必要があります。以下の手順に従ってください。マネージドサービスを使用している場合は、プロバイダーのドキュメントに従ってこれを行ってください。

1. `pg_hba.conf` ファイルに必要な変更を加えて、ClickPipes IP アドレスから ClickPipes ユーザーへの接続を許可します。`pg_hba.conf` ファイルの例は以下のようになります：
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 変更を適用するために PostgreSQL インスタンスを再読み込みします：
    ```sql
    SELECT pg_reload_conf();
    ```


## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}

これは、大きなトランザクションやコミットがレプリケーションスロットの削除を引き起こさないようにするための推奨設定変更です。

PostgreSQL インスタンスの `max_slot_wal_keep_size` パラメータを高い値（少なくとも 100GB または `102400`）に更新して増加させることができます。

```sql
max_slot_wal_keep_size = 102400
```

変更を適用するために Postgres インスタンスを再読み込みできます：
```sql
SELECT pg_reload_conf();
```

:::note

この値のより良い推奨が必要な場合は、ClickPipes チームに連絡してください。

:::

## 次は何ですか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。Postgres インスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe の作成プロセス中に必要になります。
