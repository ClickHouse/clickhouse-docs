---
sidebar_label: '汎用 Postgres'
description: '任意の Postgres インスタンスを ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/postgres/source/generic
title: '汎用 Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 汎用的な Postgres ソースのセットアップガイド \\{#generic-postgres-source-setup-guide\\}

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを使用している場合は、そのプロバイダー専用のガイドを参照してください。

:::

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする \\{#enable-logical-replication\\}

1. Postgres インスタンスでレプリケーションを有効にするには、次の設定が行われていることを確認する必要があります:

    ```sql
    wal_level = logical
    ```
   これを確認するには、次の SQL コマンドを実行します:
    ```sql
    SHOW wal_level;
    ```

   出力は `logical` である必要があります。そうでない場合は、次を実行します:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. さらに、Postgres インスタンスでは次の設定を行うことを推奨します:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   これらを確認するには、次の SQL コマンドを実行します:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   値が推奨値と一致しない場合は、次の SQL コマンドを実行して設定します:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 上記のとおり構成に変更を加えた場合は、その変更を反映させるために Postgres インスタンスを再起動する必要があります。

## 権限とパブリケーションを設定したユーザーの作成 \\{#creating-a-user-with-permissions-and-publication\\}

管理者ユーザーとして Postgres インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 先ほど作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例は `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. レプリケーションしたいテーブルを対象とする [パブリケーション](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスへの余計なオーバーヘッドを避けるため、パブリケーションには必要なテーブルのみを含めることを強く推奨します。

   :::warning
   パブリケーションに含めるすべてのテーブルは、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープの設定に関するガイダンスについては [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対するパブリケーションを作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブルに対するパブリケーションを作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` パブリケーションには、指定したテーブルから生成された変更イベントの集合が含まれ、後にレプリケーションストリームを取り込むために使用されます。

## pg_hba.conf で ClickPipes ユーザーへの接続を有効にする \\{#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user\\}

セルフホストで運用している場合は、以下の手順に従って、ClickPipes の IP アドレスから ClickPipes ユーザーへの接続を許可する必要があります。マネージドサービスを利用している場合は、プロバイダーのドキュメントに従って同様の設定を行ってください。

1. `pg_hba.conf` ファイルを編集し、ClickPipes の IP アドレスから ClickPipes ユーザーへの接続を許可します。`pg_hba.conf` ファイルの設定例は次のとおりです:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 変更を反映させるために、PostgreSQL インスタンスをリロードします:
    ```sql
    SELECT pg_reload_conf();
    ```

## `max_slot_wal_keep_size` を増やす \{#increase-max_slot_wal_keep_size\}

これは、大きなトランザクションやコミットによってレプリケーションスロットが失われてしまうことを防ぐために推奨される構成変更です。

`postgresql.conf` ファイルを更新して、PostgreSQL インスタンスの `max_slot_wal_keep_size` パラメータをより大きな値（少なくとも 100GB または `102400`）に設定できます。

```sql
max_slot_wal_keep_size = 102400
```

変更を反映させるには、Postgres インスタンスを再読み込みします。

```sql
SELECT pg_reload_conf();
```

:::note

この値の最適な設定については、ClickPipes チームにお問い合わせください。

:::


## 次のステップ \\{#whats-next\\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に必要になるため、Postgres インスタンスのセットアップ時に使用した接続情報は必ず控えておいてください。