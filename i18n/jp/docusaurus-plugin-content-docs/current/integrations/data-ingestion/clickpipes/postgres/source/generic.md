---
sidebar_label: '汎用 Postgres'
description: '任意の Postgres インスタンスを ClickPipes のソースとして利用できるようにセットアップする'
slug: /integrations/clickpipes/postgres/source/generic
title: '汎用 Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 汎用的な Postgres ソースセットアップガイド \{#generic-postgres-source-setup-guide\}

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを使用している場合は、そのプロバイダー専用ガイドを参照してください。

:::

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効化する \{#enable-logical-replication\}

1. Postgres インスタンスでレプリケーションを有効にするには、以下の設定が行われていることを確認する必要があります:

    ```sql
    wal_level = logical
    ```
   設定値を確認するには、次の SQL コマンドを実行します:
    ```sql
    SHOW wal_level;
    ```

   出力は `logical` である必要があります。そうでない場合は、次を実行します:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. さらに、Postgres インスタンスでは以下の設定を行うことを推奨します:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   設定値を確認するには、次の SQL コマンドを実行します:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   値が推奨値と一致しない場合は、次の SQL コマンドを実行して設定します:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 上記のとおり設定に変更を加えた場合は、その変更を反映させるために Postgres インスタンスを必ず再起動してください。

## 権限とパブリケーションを持つユーザーの作成 \{#creating-a-user-with-permissions-and-publication\}

管理ユーザーとして Postgres インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマ単位の読み取り専用アクセス権を付与します。次の例では、`public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマについて、これらのコマンドを繰り返してください:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーションの権限を付与します:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む[パブリケーション](https://www.postgresql.org/docs/current/logical-replication-publication.html)を作成します。パフォーマンスへのオーバーヘッドを避けるため、パブリケーションには必要なテーブルのみを含めることを強く推奨します。

   :::warning
   パブリケーションに含める各テーブルには、**主キー (primary key)** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定のガイダンスについては、[Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対するパブリケーションを作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブルに対するパブリケーションを作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` パブリケーションには、指定したテーブルから生成される変更イベントの集合が含まれ、後でレプリケーションストリームを取り込むために使用されます。

## pg_hba.conf で ClickPipes USER への接続を有効化する \{#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user\}

セルフマネージド環境の場合、以下の手順に従って ClickPipes の IP アドレスから ClickPipes USER への接続を許可する必要があります。マネージドサービスを利用している場合は、プロバイダーが提供するドキュメントに従って同様の設定を行ってください。

1. `pg_hba.conf` ファイルに必要な変更を加え、ClickPipes の IP アドレスから ClickPipes USER への接続を許可します。`pg_hba.conf` ファイルの設定例は次のとおりです。
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 変更を反映させるために、PostgreSQL インスタンスをリロードします。
    ```sql
    SELECT pg_reload_conf();
    ```

## `max_slot_wal_keep_size` を増やす \{#increase-max_slot_wal_keep_size\}

大きなトランザクションやコミットが原因でレプリケーションスロットが削除されないようにするために、次の設定変更を行うことを推奨します。

`postgresql.conf` ファイルを更新し、PostgreSQL インスタンスの `max_slot_wal_keep_size` パラメータを、より大きな値（少なくとも 100GB または `102400`）に増やします。

```sql
max_slot_wal_keep_size = 102400
```

変更を有効にするには、Postgres インスタンスを再読み込みします。

```sql
SELECT pg_reload_conf();
```

:::note

この値のより適切な設定については、ClickPipes チームまでお問い合わせください。

:::


## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)して、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
ClickPipe を作成する際に必要になるため、Postgres インスタンスをセットアップしたときに使用した接続情報を必ず控えておいてください。