---
sidebar_label: 'Postgres 用 PlanetScale'
description: 'PlanetScale for Postgres を ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';

# PlanetScale for Postgres ソースセットアップガイド {#planetscale-for-postgres-source-setup-guide}

:::info
PlanetScale for Postgres は現在 [早期アクセス](https://planetscale.com/postgres) 段階です。
:::

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降に対応しています。

## 論理レプリケーションを有効化する {#enable-logical-replication}

1. Postgres インスタンスでレプリケーションを有効にするには、次の設定が行われていることを確認する必要があります:

    ```sql
    wal_level = logical
    ```
   設定値を確認するには、次の SQL コマンドを実行します:
    ```sql
    SHOW wal_level;
    ```

   出力はデフォルトで `logical` になっているはずです。そうでない場合は、PlanetScale コンソールにログインし、`Cluster configuration->Parameters` に移動して、`Write-ahead log` セクションまでスクロールし、そこで変更します。

<Image img={planetscale_wal_level_logical} alt="PlanetScale コンソールで wal_level を調整する" size="md" border/>

:::warning
PlanetScale コンソールでこの設定を変更すると、再起動が発生します。
:::

2. さらに、`max_slot_wal_keep_size` の設定値をデフォルトの 4GB から増やすことを推奨します。これも PlanetScale コンソールから、`Cluster configuration->Parameters` に移動し、`Write-ahead log` セクションまでスクロールして実施します。新しい値を決める際の参考として、[こちら](../faq#recommended-max_slot_wal_keep_size-settings)を参照してください。

<Image img={planetscale_max_slot_wal_keep_size} alt="PlanetScale コンソールで max_slot_wal_keep_size を調整する" size="md" border/>

## 権限とパブリケーションを持つユーザーの作成 {#creating-a-user-with-permissions-and-publication}

CDC に必要な権限を付与した ClickPipes 用の新しいユーザーを作成し、
あわせてレプリケーションに使用するパブリケーションも作成します。

そのために、デフォルトの `postgres.<...>` ユーザーを使用して PlanetScale Postgres インスタンスに接続し、次の SQL コマンドを実行します。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- 移動するテーブルに応じて、追加のスキーマに対してもこれらの権限を付与する必要がある場合があります
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与します
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。パイプ作成時に使用します
-- ClickPipeに新しいテーブルを追加する際は、パブリケーションにも手動で追加する必要があります。 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```

:::note
`clickpipes_user` と `clickpipes_password` を、必ずご希望のユーザー名とパスワードに置き換えてください。
:::

## 注意事項 {#caveats}
1. PlanetScale Postgres に接続するには、上で作成したユーザー名に現在のブランチ名を付加する必要があります。たとえば、作成したユーザーが `clickpipes_user` という名前だった場合、ClickPipe 作成時に指定する実際のユーザー名は `clickpipes_user`.`branch` とする必要があります。このとき `branch` は、現在の PlanetScale Postgres の[ブランチ](https://planetscale.com/docs/postgres/branching)の "id" を指します。これを手早く確認するには、先ほどユーザー作成に使用した `postgres` ユーザーのユーザー名を参照してください。ピリオド以降の部分がブランチ ID になります。
2. PlanetScale Postgres に接続する CDC パイプには `PSBouncer` ポート（現在 `6432`）を使用しないでください。通常のポート `5432` を使用する必要があります。初回ロード専用のパイプであれば、どちらのポートも使用できます。
3. 必ずプライマリインスタンスのみに接続していることを確認してください。[レプリカインスタンスへの接続](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)は現在サポートされていません。 

## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に利用するため、Postgres インスタンスのセットアップ時に使用した接続情報を必ず控えておいてください。
