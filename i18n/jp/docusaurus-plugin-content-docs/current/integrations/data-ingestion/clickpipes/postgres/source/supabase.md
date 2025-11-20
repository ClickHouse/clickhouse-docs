---
sidebar_label: 'Supabase Postgres'
description: 'ClickPipes のソースとして Supabase インスタンスをセットアップする'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase ソースセットアップガイド

このガイドでは、ClickPipes で利用するための Supabase Postgres のセットアップ方法を説明します。

:::note

ClickPipes は、シームレスなレプリケーションを実現するために、IPv6 経由で Supabase をネイティブサポートしています。

:::



## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、
レプリケーションに使用するパブリケーションも作成しましょう。

そのためには、Supabase プロジェクトの **SQL Editor** に移動してください。
ここで、以下の SQL コマンドを実行します:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the mirror
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image
  img={supabase_commands}
  alt='ユーザーとパブリケーションのコマンド'
  size='large'
  border
/>

**Run** をクリックして、パブリケーションとユーザーを作成します。

:::note

`clickpipes_user` と `clickpipes_password` を、任意のユーザー名とパスワードに置き換えてください。

また、ClickPipes でミラーを作成する際には、同じパブリケーション名を使用してください。

:::


## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}

:::warning

この手順を実行すると Supabase データベースが再起動され、短時間のダウンタイムが発生する可能性があります。

[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) に従って、Supabase データベースの `max_slot_wal_keep_size` パラメータをより大きな値(最低 100GB または `102400`)に増やすことができます。

この値の推奨設定については、ClickPipes チームにお問い合わせください。

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

ClickPipes Postgresユーザーは、RLSポリシーによる制限を受けないようにする必要があります。制限されるとデータの欠落につながる可能性があります。以下のコマンドを実行することで、ユーザーのRLSポリシーを無効化できます。

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
Postgresインスタンスのセットアップ時に使用した接続情報は、ClickPipeの作成時に必要となるため、必ず控えておいてください。
