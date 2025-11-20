---
sidebar_label: 'Planetscale for Postgres'
description: 'ClickPipes のソースとして Planetscale for Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres ソースセットアップガイド

:::info
PlanetScale for Postgres は現在[アーリーアクセス](https://planetscale.com/postgres)段階です。
:::



## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesはPostgresバージョン12以降をサポートしています。


## 論理レプリケーションの有効化 {#enable-logical-replication}

1. Postgresインスタンスでレプリケーションを有効にするには、以下の設定が正しく構成されていることを確認する必要があります：

   ```sql
   wal_level = logical
   ```

   確認するには、以下のSQLコマンドを実行してください：

   ```sql
   SHOW wal_level;
   ```

   出力はデフォルトで`logical`となっているはずです。そうでない場合は、PlanetScaleコンソールにログインし、`Cluster configuration->Parameters`に移動して`Write-ahead log`までスクロールして変更してください。

<Image
  img={planetscale_wal_level_logical}
  alt='PlanetScaleコンソールでwal_levelを調整'
  size='md'
  border
/>

:::warning
PlanetScaleコンソールでこの設定を変更すると、再起動が発生します。
:::

2. さらに、`max_slot_wal_keep_size`設定をデフォルトの4GBから増やすことを推奨します。これもPlanetScaleコンソールから`Cluster configuration->Parameters`に移動し、`Write-ahead log`までスクロールすることで設定できます。新しい値を決定する際は、[こちら](../faq#recommended-max_slot_wal_keep_size-settings)を参照してください。

<Image
  img={planetscale_max_slot_wal_keep_size}
  alt='PlanetScaleコンソールでmax_slot_wal_keep_sizeを調整'
  size='md'
  border
/>


## パーミッションとパブリケーションを持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に適した必要なパーミッションを持つ ClickPipes 用の新しいユーザーを作成し、
レプリケーションに使用するパブリケーションも作成しましょう。

これを行うには、デフォルトの `postgres.<...>` ユーザーを使用して PlanetScale Postgres インスタンスに接続し、以下の SQL コマンドを実行します:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- 移動するテーブルに応じて、追加のスキーマに対してもこれらのパーミッションを付与する必要がある場合があります
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーションパーミッションを付与
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。これはパイプ作成時に使用します
-- ClickPipe に新しいテーブルを追加する際は、パブリケーションにも手動で追加する必要があります。
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```

:::note
`clickpipes_user` と `clickpipes_password` を希望するユーザー名とパスワードに置き換えてください。
:::


## 注意事項 {#caveats}

1. PlanetScale Postgresに接続するには、上記で作成したユーザー名に現在のブランチを付加する必要があります。例えば、作成したユーザーが`clickpipes_user`という名前の場合、ClickPipe作成時に指定する実際のユーザーは`clickpipes_user`.`branch`となります。ここで`branch`は現在のPlanetScale Postgresの[ブランチ](https://planetscale.com/docs/postgres/branching)の「id」を指します。これを素早く確認するには、先ほどユーザーを作成する際に使用した`postgres`ユーザーのユーザー名を参照してください。ピリオドの後の部分がブランチIDです。
2. PlanetScale PostgresへのCDCパイプ接続には`PSBouncer`ポート(現在は`6432`)を使用せず、通常のポート`5432`を使用する必要があります。初期ロードのみのパイプではどちらのポートも使用可能です。
3. プライマリインスタンスのみに接続していることを確認してください。[レプリカインスタンスへの接続](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)は現在サポートされていません。


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
Postgresインスタンスのセットアップ時に使用した接続情報は、ClickPipeの作成時に必要となるため、必ず控えておいてください。
