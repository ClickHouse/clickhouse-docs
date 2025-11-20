---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'ClickPipes のソースとして Crunchy Bridge Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres ソース設定ガイド'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'logical replication', 'data ingestion']
doc_type: 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres ソース設定ガイド

ClickPipes は Postgres バージョン 12 以降をサポートしています。



## 論理レプリケーションの有効化 {#enable-logical-replication}

Crunchy Bridgeは[デフォルト](https://docs.crunchybridge.com/how-to/logical-replication)で論理レプリケーションが有効になっています。以下の設定が正しく構成されていることを確認してください。正しく構成されていない場合は、必要に応じて調整してください。

```sql
SHOW wal_level; -- logical である必要があります
SHOW max_wal_senders; -- 10 である必要があります
SHOW max_replication_slots; -- 10 である必要があります
```


## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres`ユーザーを使用してCrunchy Bridge Postgresに接続し、以下のコマンドを実行します:

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. レプリケート元のスキーマに対して、`clickpipes_user`に読み取り専用アクセスを付与します。以下の例では`public`スキーマに対する権限付与を示しています。複数のスキーマにアクセスを付与する場合は、各スキーマに対してこれら3つのコマンドを実行してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します:

   ```sql
    ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 今後MIRROR(レプリケーション)を作成する際に使用するパブリケーションを作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## ClickPipes IPをセーフリストに登録 {#safe-list-clickpipes-ips}

Crunchy Bridgeでファイアウォールルールを追加して、[ClickPipes IP](../../index.md#list-of-static-ips)をセーフリストに登録します。

<Image
  size='lg'
  img={firewall_rules_crunchy_bridge}
  alt='Crunchy Bridgeでファイアウォールルールを確認する場所'
  border
/>

<Image
  size='lg'
  img={add_firewall_rules_crunchy_bridge}
  alt='ClickPipes用のファイアウォールルールを追加'
  border
/>


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
Postgresインスタンスのセットアップ時に使用した接続情報は、ClickPipeの作成時に必要となるため、必ず控えておいてください。
