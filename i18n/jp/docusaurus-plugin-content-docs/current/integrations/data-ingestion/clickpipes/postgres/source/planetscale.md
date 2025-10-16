---
'sidebar_label': 'Planetscale for Postgres'
'description': 'ClickPipesのソースとしてPostgres用のPlanetscaleを設定する'
'slug': '/integrations/clickpipes/postgres/source/planetscale'
'title': 'PlanetScaleによるPostgresソース設定ガイド'
'doc_type': 'guide'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres ソースセットアップガイド

:::info
PlanetScale for Postgres は現在 [early access](https://planetscale.com/postgres) にあります。
:::

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

1. Postgres インスタンスでレプリケーションを有効にするには、以下の設定が行われていることを確認する必要があります：

```sql
wal_level = logical
```
   同様の確認をするには、次の SQL コマンドを実行できます：
```sql
SHOW wal_level;
```

   出力はデフォルトで `logical` であるべきです。そうでない場合は、PlanetScale コンソールにログインし、`Cluster configuration->Parameters` に移動し、`Write-ahead log` の下にスクロールして変更してください。

<Image img={planetscale_wal_level_logical} alt="PlanetScale コンソールでの wal_level の調整" size="md" border/>

:::warning
PlanetScale コンソールでこれを変更すると、再起動がトリガーされます。
:::

2. さらに、デフォルトの 4GB から `max_slot_wal_keep_size` の設定を増加させることを推奨します。これは、`Cluster configuration->Parameters` に移動し、`Write-ahead log` にスクロールすることで PlanetScale コンソールを通じて行います。新しい値を決定するために、[こちら](../faq#recommended-max_slot_wal_keep_size-settings)を確認してください。

<Image img={planetscale_max_slot_wal_keep_size} alt="PlanetScale コンソールでの max_slot_wal_keep_size の調整" size="md" border/>

## 権限と公開を持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用する公開物も作成します。

これには、デフォルトの `postgres.<...>` ユーザーを使用して PlanetScale Postgres インスタンスに接続し、以下の SQL コマンドを実行します：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- You may need to grant these permissions on more schemas depending on the tables you're moving
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
-- When adding new tables to the ClickPipe, you'll need to manually add them to the publication as well. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```
:::note
`clickpipes_user` と `clickpipes_password` を希望のユーザー名とパスワードに置き換えてください。
:::

## 注意事項 {#caveats}
1. PlanetScale Postgres に接続するには、上記で作成したユーザー名に現在のブランチを付加する必要があります。例えば、作成したユーザーが `clickpipes_user` であった場合、ClickPipe 作成時に指定する実際のユーザーは `clickpipes_user`.`branch` であり、ここで `branch` は現在の PlanetScale Postgres の [branch](https://planetscale.com/docs/postgres/branching) の「id」を指します。これを迅速に判断するには、以前にユーザーを作成するために使用した `postgres` ユーザー名を参照し、ピリオドの後ろの部分がブランチ id になります。
2. PlanetScale Postgres に接続する CDC パイプに `PSBouncer` ポート（現在 `6432`）を使用しないでください。通常のポート `5432` を使用する必要があります。初回ロード専用のパイプにはどちらのポートも使用できます。
3. 必ずプライマリインスタンスにのみ接続していることを確認してください。[レプリカインスタンスへの接続](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) は現在サポートされていません。

## 次は何ですか？ {#whats-next}

現在、[ClickPipe](../index.md) を作成して、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。Postgres インスタンスを設定する際に使用した接続情報をメモしておくことを忘れないでください。ClickPipe 作成プロセスで必要になります。
