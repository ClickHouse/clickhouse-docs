---
sidebar_label: 'Supabase Postgres'
description: 'Supabase インスタンスを ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データ取り込み', 'リアルタイム同期']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase ソースセットアップガイド

これは、ClickPipes で利用するための Supabase Postgres のセットアップ方法を説明するガイドです。

:::note

ClickPipes は、シームレスなレプリケーションを実現するため、Supabase を IPv6 ネイティブでサポートしています。

:::



## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDC用に必要な権限を持つClickPipes用の新しいユーザーを作成し、
レプリケーションに使用するパブリケーションも作成しましょう。

Supabaseプロジェクトの**SQLエディタ**に移動してください。
ここで、以下のSQLコマンドを実行します:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成。ミラー作成時に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image
  img={supabase_commands}
  alt='ユーザーとパブリケーションのコマンド'
  size='large'
  border
/>

**Run**をクリックして、パブリケーションとユーザーを作成します。

:::note

`clickpipes_user`と`clickpipes_password`は、任意のユーザー名とパスワードに置き換えてください。

また、ClickPipesでミラーを作成する際には、同じパブリケーション名を使用してください。

:::


## `max_slot_wal_keep_size`の増加 {#increase-max_slot_wal_keep_size}

:::warning

この手順を実行するとSupabaseデータベースが再起動され、短時間のダウンタイムが発生する可能性があります。

[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)に従って、Supabaseデータベースの`max_slot_wal_keep_size`パラメータをより大きな値(最低100GBまたは`102400`)に増加できます。

この値の推奨設定については、ClickPipesチームにお問い合わせください。

:::


## Supabaseで使用する接続詳細 {#connection-details-to-use-for-supabase}

Supabaseプロジェクトの`Project Settings` -> `Database`（`Configuration`配下）に移動します。

**重要**: このページで`Display connection pooler`を無効にし、`Connection parameters`セクションに移動してパラメータをメモまたはコピーします。

<Image
  img={supabase_connection_details}
  size='lg'
  border
  alt='Supabase接続詳細の確認'
  border
/>

:::info

CDCベースのレプリケーションではコネクションプーラーがサポートされていないため、無効にする必要があります。

:::


## RLSに関する注意事項 {#note-on-rls}

ClickPipes Postgresユーザーは、RLSポリシーによって制限されないようにする必要があります。制限されるとデータの欠損につながる可能性があります。以下のコマンドを実行することで、ユーザーのRLSポリシーを無効化できます。

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、Postgresインスタンスのセットアップで使用した接続情報を必ず控えておいてください。
