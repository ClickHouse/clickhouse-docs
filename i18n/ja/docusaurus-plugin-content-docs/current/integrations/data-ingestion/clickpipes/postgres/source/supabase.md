---
sidebar_label: Supabase Postgres
description: SupabaseインスタンスをClickPipesのソースとして設定する
slug: /integrations/clickpipes/postgres/source/supabase
---

# Supabaseソース設定ガイド

これは、ClickPipesで使用するためのSupabase Postgresの設定方法に関するガイドです。

:::note

ClickPipesは、シームレスなレプリケーションのためにIPv6を介してSupabaseをネイティブにサポートします。

:::


## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDCに適した必要な権限を持つClickPipes用の新しいユーザーを作成し、また、レプリケーションに使用する公開を作成しましょう。

これには、Supabaseプロジェクトの**SQLエディタ**に移動することができます。
ここで、以下のSQLコマンドを実行できます：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- USERにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 公開を作成します。ミラーを作成する際に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

![ユーザーと公開のコマンド](images/setup/supabase/supabase-commands.jpg)



**実行**をクリックして、公開とユーザーを準備します。

:::note

`clickpipes_user`と`clickpipes_password`を希望のユーザー名とパスワードに置き換えることを忘れないでください。

また、ClickPipesでミラーを作成する際に同じ公開名を使用することを忘れないでください。

:::


## `max_slot_wal_keep_size`の増加 {#increase-max_slot_wal_keep_size}


:::warning

このステップでは、Supabaseデータベースが再起動され、短時間のダウンタイムが発生する可能性があります。

:::warning

Supabaseデータベースの`max_slot_wal_keep_size`パラメータをより高い値（少なくとも100GBまたは`102400`）に増加させることができます。詳細は[Supabaseドキュメント](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)を参照してください。

この値に関してより良い推奨を得るためには、ClickPipesチームに連絡できます。


## Supabase用の接続詳細 {#connection-details-to-use-for-supabase}

Supabaseプロジェクトの`プロジェクト設定` -> `データベース`（`構成`内）に移動します。

**重要**: このページで`接続プーラーを表示`を無効にし、`接続パラメータ`セクションに移動して、パラメータをメモまたはコピーしてください。

![Supabase接続詳細の確認](images/setup/supabase/supabase-connection-details.jpg)


:::info

接続プーラーはCDCベースのレプリケーションではサポートされていないため、無効にする必要があります。

:::


## 次は何をする？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。
Postgresインスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeの作成プロセス中に必要になります。
