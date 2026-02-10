---
sidebar_label: 'PlanetScale for Postgres'
description: 'ClickPipes のソースとして PlanetScale for Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC（変更データキャプチャ）', 'データインジェスト', 'リアルタイム同期']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres ソース設定ガイド \{#planetscale-for-postgres-source-setup-guide\}

:::info
PlanetScale for Postgres は現在[早期アクセス](https://planetscale.com/postgres)段階にあります。
:::

## サポートされている Postgres バージョン \{#supported-postgres-versions\}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効化する \{#enable-logical-replication\}

1. Postgres インスタンスでレプリケーションを有効にするには、以下の設定が行われていることを確認する必要があります:

    ```sql
    wal_level = logical
    ```
   設定値を確認するには、次の SQL コマンドを実行します:
    ```sql
    SHOW wal_level;
    ```

   出力はデフォルトで `logical` になっているはずです。そうなっていない場合は、PlanetScale コンソールにログインし、`Cluster configuration->Parameters` に移動して、`Write-ahead log` セクションまでスクロールして変更してください。

<Image img={planetscale_wal_level_logical} alt="PlanetScale コンソールで wal_level を調整する" size="md" border/>

:::warning
PlanetScale コンソールでこれを変更すると、必ず再起動が発生します。
:::

2. さらに、`max_slot_wal_keep_size` の設定値をデフォルトの 4GB から増やすことを推奨します。これも PlanetScale コンソールから、`Cluster configuration->Parameters` に移動し、`Write-ahead log` セクションまでスクロールして変更します。新しい値を決定する際は、[こちら](../faq#recommended-max_slot_wal_keep_size-settings) を参照してください。

<Image img={planetscale_max_slot_wal_keep_size} alt="PlanetScale コンソールで max_slot_wal_keep_size を調整する" size="md" border/>

## 権限と publication を持つユーザーの作成 \{#creating-a-user-with-permissions-and-publication\}

デフォルトの `postgres.<...>` ユーザーを使用して PlanetScale Postgres インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 前の手順で作成したユーザーに、スキーマレベルの読み取り専用アクセス権を付与します。次の例では、`public` スキーマに対する権限を示しています。レプリケートしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します。

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. レプリケートしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含まれるすべてのテーブルには、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定に関するガイダンスについては、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブル向けに publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブル向けに publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントの集合が含まれ、後でレプリケーションストリームを取り込むために使用されます。

## 注意事項 \{#caveats\}

1. PlanetScale Postgres に接続するには、上で作成したユーザー名に現在のブランチを付加する必要があります。たとえば、作成したユーザーが `clickpipes_user` という名前だった場合、ClickPipe 作成時に指定する実際のユーザーは `clickpipes_user`.`branch` となり、この `branch` は現在の PlanetScale Postgres の[ブランチ](https://planetscale.com/docs/postgres/branching)の「id」を指します。これを手早く確認するには、先ほどユーザーを作成する際に使用した `postgres` ユーザーのユーザー名を参照し、ピリオド以降の部分がブランチ ID になります。
2. PlanetScale Postgres に接続する CDC パイプでは、`PSBouncer` ポート（現在は `6432`）を使用しないでください。通常のポート `5432` を使用する必要があります。初期ロード専用のパイプであれば、どちらのポートも使用可能です。
3. 常にプライマリインスタンスのみに接続していることを確認してください。[レプリカインスタンスへの接続](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)は現在サポートされていません。 

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスをセットアップする際に使用した接続情報は、ClickPipe の作成時にも必要になるため、必ず控えておいてください。