---
'sidebar_label': 'Supabase Postgres'
'description': 'Set up Supabase instance as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/supabase'
'title': 'Supabase Source Setup Guide'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase ソース設定ガイド

これは、ClickPipes で使用するために Supabase Postgres を設定する方法のガイドです。

:::note

ClickPipes は、IPv6 経由でネイティブに Supabase をサポートしており、シームレスなレプリケーションを実現します。

:::


## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDC に適した必要な権限を持つ新しいユーザーを ClickPipes 用に作成し、レプリケーションに使用するパブリケーションを作成しましょう。

これには、Supabase プロジェクトの **SQL エディタ** に移動します。
ここで、以下の SQL コマンドを実行できます:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーションの権限を与える
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。これをミラー作成時に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image img={supabase_commands} alt="ユーザーとパブリケーションコマンド" size="large" border/>


**Run** をクリックして、パブリケーションとユーザーを準備します。

:::note

`clickpipes_user` と `clickpipes_password` を希望のユーザー名とパスワードに置き換えることを忘れないでください。

また、ClickPipes でミラーを作成する際に同じパブリケーション名を使用することを覚えておいてください。

:::


## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}


:::warning

このステップでは、Supabase データベースが再起動し、短いダウンタイムが発生する可能性があります。

Supabase データベースの `max_slot_wal_keep_size` パラメータをより高い値（少なくとも 100GB または `102400`）に増加させるには、[Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)に従ってください。

この値のより良い推奨事項については、ClickPipes チームにお問い合わせください。

:::

## Supabase 用の接続詳細 {#connection-details-to-use-for-supabase}

Supabase プロジェクトの `プロジェクト設定` -> `データベース`（`設定` の下）に移動します。

**重要**: このページで `接続プーラーを表示` を無効にし、`接続パラメータ` セクションに移動して、パラメータをメモまたはコピーします。

<Image img={supabase_connection_details} size="lg" border alt="Supabase 接続詳細の位置" border/>

:::info

接続プーラーは CDC ベースのレプリケーションではサポートされていないため、無効にする必要があります。

:::


## 次は何をすべきか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。
ClickPipe 作成プロセス中に必要になるため、Postgres インスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。
