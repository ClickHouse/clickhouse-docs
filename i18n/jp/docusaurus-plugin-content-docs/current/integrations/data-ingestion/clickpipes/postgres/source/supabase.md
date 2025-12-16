---
sidebar_label: 'Supabase Postgres'
description: 'Supabase インスタンスを ClickPipes のソースとして構成する'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';

# Supabase ソースセットアップガイド {#supabase-source-setup-guide}

本ガイドでは、ClickPipes で利用するための Supabase の Postgres データベースのセットアップ方法について説明します。

:::note

ClickPipes は、シームレスなレプリケーションのために、Supabase を IPv6 をネイティブサポートする形で利用できます。

:::

## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDC に適した必要な権限を付与した ClickPipes 用の新しいユーザーを作成し、
レプリケーションに使用するパブリケーションも作成します。

そのために、Supabase プロジェクトの **SQL Editor** を開きます。
ここで、次の SQL コマンドを実行します。

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

<Image img={supabase_commands} alt="ユーザーとパブリケーションのコマンド" size="large" border />

**Run** をクリックして、パブリケーションとユーザーを準備します。

:::note

`clickpipes_user` と `clickpipes_password` は、任意のユーザー名とパスワードに置き換えてください。

また、ClickPipes でミラーを作成する際には、必ず同じパブリケーション名を使用してください。

:::

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
