---
sidebar_label: Supabase Postgres
description: ClickPipesのソースとしてSupabaseインスタンスを設定する
slug: /integrations/clickpipes/postgres/source/supabase
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg' 


# Supabaseソース設定ガイド

これは、ClickPipesで使用するためのSupabase Postgresの設定方法に関するガイドです。

:::note

ClickPipesは、シームレスなレプリケーションのためにIPv6経由でSupabaseをネイティブにサポートしています。

:::


## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDCに適した必要な権限を持つClickPipes用の新しいユーザーを作成し、
レプリケーションに使用する発行物も作成します。

これには、あなたのSupabaseプロジェクトの**SQLエディタ**に移動します。
ここで次のSQLコマンドを実行できます：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 発行物を作成します。ミラーを作成する際にこれを使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<img src={supabase_commands} alt="ユーザーと発行物のコマンド"/>


**実行**をクリックして、発行物とユーザーを準備します。

:::note

`clickpipes_user`と`clickpipes_password`をお好みのユーザー名とパスワードに置き換えることを忘れないでください。

また、ClickPipesでミラーを作成する際には同じ発行物名を使用することを忘れないでください。

:::


## `max_slot_wal_keep_size`を増加させる {#increase-max_slot_wal_keep_size}


:::warning

このステップでは、あなたのSupabaseデータベースが再起動され、短時間のダウンタイムが発生する可能性があります。

Supabaseデータベースの`max_slot_wal_keep_size`パラメータを高い値（少なくとも100GBまたは`102400`）に増やすことができます。詳細については、[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)を参照してください。

この値の推奨については、ClickPipesチームにお問い合わせください。

:::

## Supabaseに使用する接続詳細 {#connection-details-to-use-for-supabase}

あなたのSupabaseプロジェクトの`プロジェクト設定` -> `データベース`（`構成`の下）に移動します。

**重要**：このページで`接続プールの表示`を無効にし、`接続パラメータ`セクションに移動して、パラメータをメモまたはコピーしてください。

<img src={supabase_connection_details} alt="Supabase接続詳細を特定する"/>

:::info

CDCベースのレプリケーションには接続プールがサポートされていないため、無効にする必要があります。

:::


## 次は何ですか？ {#whats-next}

あなたは今、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。
Postgresインスタンスを設定する際に使用した接続詳細を必ずメモしておいてください。ClickPipeの作成プロセスで必要になります。
