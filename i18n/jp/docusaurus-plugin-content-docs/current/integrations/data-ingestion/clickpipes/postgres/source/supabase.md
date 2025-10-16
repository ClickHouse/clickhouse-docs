---
'sidebar_label': 'Supabase Postgres'
'description': 'Supabase インスタンスを ClickPipes のソースとして設定する'
'slug': '/integrations/clickpipes/postgres/source/supabase'
'title': 'Supabase 構成ガイド'
'doc_type': 'guide'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase ソース設定ガイド

これは、ClickPipes での使用のために Supabase Postgres を設定する方法に関するガイドです。

:::note

ClickPipes は、シームレスなレプリケーションのために、IPv6 を介してネイティブに Supabase をサポートしています。

:::

## 権限とレプリケーションスロットを持つユーザーの作成 {#creating-a-user-with-permissions-and-replication-slot}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用するパブリケーションも作成しましょう。

そのためには、あなたの Supabase プロジェクトの **SQL エディタ** に移動します。
ここで、次の SQL コマンドを実行できます。
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

<Image img={supabase_commands} alt="ユーザーとパブリケーションコマンド" size="large" border/>

**実行** をクリックして、パブリケーションとユーザーを準備します。

:::note

`clickpipes_user` と `clickpipes_password` を希望のユーザー名とパスワードに置き換えることを忘れないでください。

また、ClickPipes でミラーを作成する際に同じパブリケーション名を使用することを忘れないでください。

:::

## `max_slot_wal_keep_size` の増加 {#increase-max_slot_wal_keep_size}

:::warning

このステップでは、あなたの Supabase データベースが再起動され、短時間のダウンタイムが発生する可能性があります。

Supabase データベースの `max_slot_wal_keep_size` パラメーターを高い値（少なくとも 100GB または `102400`）に増加させることができます。これは [Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) に従って行ってください。

この値のより良い提案が必要な場合は、ClickPipes チームにお問い合わせください。

:::

## Supabase 用の接続詳細 {#connection-details-to-use-for-supabase}

あなたの Supabase プロジェクトの `プロジェクト設定` -> `データベース` ( `設定` の下) に移動します。

**重要**: このページで `接続プールアダプタを表示` を無効にし、`接続パラメータ` セクションに移動して、パラメータをメモまたはコピーしてください。

<Image img={supabase_connection_details} size="lg" border alt="Supabase 接続詳細の確認" border/>

:::info

接続プールアダプタは CDC ベースのレプリケーションをサポートしていないため、無効にする必要があります。

:::

## RLS に関する注意 {#note-on-rls}
ClickPipes の Postgres ユーザーは RLS ポリシーによって制限されるべきではありません。制限されるとデータが欠落する可能性があります。以下のコマンドを実行して、ユーザーの RLS ポリシーを無効にすることができます：
```sql
ALTER USER clickpipes_user BYPASSRLS;
```

## 次は何をする？ {#whats-next}

今すぐ [ClickPipe を作成](../index.md)し、あなたの Postgres インスタンスから ClickHouse Cloud へのデータインジェストを開始できます。
Postgres インスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe 作成プロセス中に必要になります。
