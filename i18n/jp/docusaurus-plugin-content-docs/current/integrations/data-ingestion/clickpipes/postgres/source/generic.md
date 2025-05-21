---
sidebar_label: '一般的な Postgres'
description: 'ClickPipes のソースとして任意の Postgres インスタンスを設定する'
slug: /integrations/clickpipes/postgres/source/generic
title: '一般的な Postgres ソースセットアップガイド'
---


# 一般的な Postgres ソースセットアップガイド

:::info

サイドバーにあるサポートされているプロバイダーのいずれかを使用している場合は、そのプロバイダーの特定のガイドを参照してください。

:::


ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

1. Postgres インスタンスでレプリケーションを有効にするには、次の設定が行われていることを確認する必要があります：

    ```sql
    wal_level = logical
    ```
   確認するには、次の SQL コマンドを実行できます：
    ```sql
    SHOW wal_level;
    ```

   結果は `logical` である必要があります。そうでない場合は、以下を実行します：
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. さらに、Postgres インスタンスに次の設定を行うことが推奨されます：
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   確認するには、次の SQL コマンドを実行できます：
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   値が推奨値と一致しない場合は、以下の SQL コマンドを実行して設定します：
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 上記のように設定を変更した場合、変更を反映させるために Postgres インスタンスを再起動する必要があります。


## 権限と公開を持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に適した権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用する公開物も作成します。

これを行うには、Postgres インスタンスに接続し、次の SQL コマンドを実行します：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 公開物を作成します。パイプを作成する際にこれを使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

`clickpipes_user` および `clickpipes_password` を希望のユーザー名とパスワードに置き換えてください。

:::


## ClickPipes ユーザーへの接続を pg_hba.conf で有効にする {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

セルフサービスの場合、ClickPipes ユーザーへの接続を ClickPipes の IP アドレスから許可する必要があります。以下の手順に従ってください。マネージドサービスを使用している場合は、プロバイダーのドキュメントに従って同様の操作を行うことができます。

1. `pg_hba.conf` ファイルに必要な変更を加えて、ClickPipes ユーザーへの接続を ClickPipes の IP アドレスから許可します。`pg_hba.conf` ファイルの例：
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 変更を反映させるために PostgreSQL インスタンスをリロードします：
    ```sql
    SELECT pg_reload_conf();
    ```


## `max_slot_wal_keep_size` を増加させる {#increase-max_slot_wal_keep_size}

これは、大きなトランザクション/コミットがレプリケーションスロットを削除する原因とならないようにするための推奨設定変更です。

`max_slot_wal_keep_size` パラメータを PostgreSQL インスタンス用に高い値（少なくとも 100GB または `102400`）に更新することができます。これは `postgresql.conf` ファイルを更新することで行えます。

```sql
max_slot_wal_keep_size = 102400
```

変更を反映させるために Postgres インスタンスをリロードします：
```sql
SELECT pg_reload_conf();
```

:::note

この値のより良い推奨を得るには、ClickPipes チームにお問い合わせください。

:::

## 次は何をする？ {#whats-next}

これで [ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。
Postgres インスタンスをセットアップする際に使用した接続の詳細をメモしておくことを忘れないでください。これらは ClickPipe 作成プロセス中に必要になります。
