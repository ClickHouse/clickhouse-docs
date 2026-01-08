---
sidebar_label: 'Supabase Postgres'
description: 'Supabase インスタンスを ClickPipes のソースとして構成する'
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

# Supabase ソースセットアップガイド {#supabase-source-setup-guide}

本ガイドでは、ClickPipes で利用するための Supabase の Postgres データベースのセットアップ方法について説明します。

:::note

ClickPipes は、シームレスなレプリケーションのために、Supabase を IPv6 をネイティブサポートする形で利用できます。

:::

## 権限およびレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

管理者ユーザーとして Supabase インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例は `public` スキーマに対する権限を示しています。レプリケートしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. レプリケートしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスへのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるすべてのテーブルは、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定の指針については [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対する publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブルに対する publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントの一連の集合が含まれ、後でレプリケーションストリームを取り込む際に使用されます。

## `max_slot_wal_keep_size` を増やす {#increase-max_slot_wal_keep_size}

:::warning

このステップを実行すると Supabase データベースが再起動され、短時間のダウンタイムが発生する可能性があります。

[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) に従って、Supabase データベースの `max_slot_wal_keep_size` パラメータを、より大きな値（少なくとも 100GB または `102400`）に増やすことができます。

この値のより適切な設定については、ClickPipes チームにお問い合わせください。

:::

## Supabase で使用する接続情報 {#connection-details-to-use-for-supabase}

Supabase プロジェクトの `Project Settings` から、`Configuration` 配下の `Database` に移動します。

**重要**: このページで `Display connection pooler` を無効化してから、`Connection parameters` セクションに移動し、各パラメータを確認して控えておきます。

<Image img={supabase_connection_details} size="lg" border alt="Supabase の接続情報の場所を確認する" border/>

:::info

CDC（変更データキャプチャ）ベースのレプリケーションでは `connection pooler` はサポートされていないため、無効化する必要があります。

:::

## RLS に関する注意 {#note-on-rls}

ClickPipes の Postgres ユーザーは RLS ポリシーで制限してはいけません。制限するとデータの欠損が発生するおそれがあります。以下のコマンドを実行して、このユーザーに対する RLS ポリシーを無効化できます。

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスをセットアップする際に使用した接続情報は、ClickPipe の作成時にも必要になるため、必ず控えておいてください。