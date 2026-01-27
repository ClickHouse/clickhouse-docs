---
sidebar_label: 'Supabase Postgres'
description: 'Supabase インスタンスを ClickPipes のデータソースとして設定する'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase ソースセットアップガイド \{#supabase-source-setup-guide\}

このガイドでは、ClickPipes から利用する Supabase Postgres をセットアップする方法を説明します。

:::note

ClickPipes は、シームレスなレプリケーションのために Supabase を IPv6 でネイティブサポートしています。

:::

## 権限を持つユーザーとレプリケーションスロットの作成 \{#creating-a-user-with-permissions-and-replication-slot\}

管理者ユーザーとして Supabase インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例は `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む[パブリケーション](https://www.postgresql.org/docs/current/logical-replication-publication.html)を作成します。パフォーマンス上のオーバーヘッドを避けるため、パブリケーションには必要なテーブルのみを含めることを強く推奨します。

   :::warning
   パブリケーションに含めるテーブルはすべて、**主キー**が定義されているか、**レプリカ識別子 (replica identity)** が `FULL` に設定されている必要があります。スコープ設定の指針については、[Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対するパブリケーションを作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブルに対するパブリケーションを作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` パブリケーションには、指定されたテーブルから生成される一連の変更イベントが含まれ、後でレプリケーションストリームを取り込むために使用されます。

## `max_slot_wal_keep_size` の増加 \{#increase-max_slot_wal_keep_size\}

:::warning

この手順を実行すると Supabase データベースが再起動され、短時間のダウンタイムが発生する可能性があります。

[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) に従って、Supabase データベースの `max_slot_wal_keep_size` パラメータを、より大きな値（少なくとも 100GB または `102400`）に増やすことができます。

この値について、より適切な推奨値が必要な場合は、ClickPipes チームにお問い合わせください。

:::

## Supabase で使用する接続情報 \{#connection-details-to-use-for-supabase\}

Supabase プロジェクトの `Project Settings` -> `Database`（`Configuration` 配下）に移動します。

**重要**: このページで `Display connection pooler` を無効にし、`Connection parameters` セクションに移動してパラメータを確認／コピーします。

<Image img={supabase_connection_details} size="lg" border alt="Supabase の接続情報の場所" border/>

:::info

CDC ベースのレプリケーションでは connection pooler はサポートされていないため、無効化する必要があります。

:::

## RLS に関する注意 \{#note-on-rls\}

ClickPipes の Postgres ユーザーは RLS ポリシーによって制限してはいけません。制限すると、データの欠落につながる可能性があります。以下のコマンドを実行すると、このユーザーに対する RLS ポリシーを無効化できます。

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)して、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスをセットアップした際に使用した接続情報は、ClickPipe 作成時にも必要になるため、必ず控えておきましょう。