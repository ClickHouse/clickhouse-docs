---
sidebar_label: 'Supabase Postgres'
description: 'ClickPipesのソースとしてSupabaseインスタンスをセットアップする'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabaseソースセットアップガイド'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabaseソースセットアップガイド

これは、ClickPipesで使用するためのSupabase Postgresのセットアップ方法に関するガイドです。

:::note

ClickPipesは、シームレスなレプリケーションのためにIPv6経由でSupabaseをネイティブにサポートしています。

:::


## パーミッションとレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDCに適した必要なパーミッションを持つClickPipes用の新しいユーザーを作成し、レプリケーションに使用するパブリケーションも作成しましょう。

そのためには、Supabaseプロジェクトの**SQLエディタ**に移動します。
ここで、次のSQLコマンドを実行できます：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。このパブリケーションをミラーの作成時に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image img={supabase_commands} alt="ユーザーとパブリケーションのコマンド" size="large" border/>


**Run**をクリックして、パブリケーションとユーザーを準備します。

:::note

`clickpipes_user` と `clickpipes_password` を希望のユーザー名とパスワードに置き換えることを忘れないでください。

また、ClickPipesでミラーを作成する際に同じパブリケーション名を使用することを忘れないでください。

:::


## `max_slot_wal_keep_size`を増やす {#increase-max_slot_wal_keep_size}


:::warning

このステップでは、Supabaseデータベースが再起動され、一時的なダウンタイムが発生する可能性があります。

Supabaseデータベースの`max_slot_wal_keep_size`パラメータを高い値（少なくとも100GBまたは`102400`）に増やすには、[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)を参照してください。

この値のより良い推奨が必要な場合は、ClickPipesチームにお問い合わせください。

:::

## Supabaseに使用する接続詳細 {#connection-details-to-use-for-supabase}

Supabaseプロジェクトの`プロジェクト設定` -> `データベース`（`設定`の下）に移動します。

**重要**: このページで`コネクションプールを表示`を無効にし、`接続パラメータ`セクションに移動して、パラメータをメモまたはコピーしてください。

<Image img={supabase_connection_details} size="lg" border alt="Supabase接続詳細を探す" border/>

:::info

CDCベースのレプリケーションにはコネクションプールはサポートされていないため、無効にする必要があります。

:::


## 次に何をするべきか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)して、PostgresインスタンスからClickHouse Cloudにデータをインジェストすることができます。
Postgresインスタンスをセットアップする際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセス中に必要になります。
