---
sidebar_label: Azure Flexible Server for Postgres
description: ClickPipesのソースとしてAzure Flexible Server for Postgresを設定する
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';


# Azure Flexible Server for Postgres ソースセットアップガイド

ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

**以下の手順を実行する必要はありません。** `wal_level` が `logical` に設定されている場合。この設定は、別のデータレプリケーションツールから移行している場合、主に事前に構成されているべきです。

1. **サーバーパラメータ**セクションをクリックします。

<img src={server_parameters} alt="Azure Flexible Server for Postgresのサーバーパラメータ" />

2. `wal_level` を `logical` に編集します。

<img src={wal_level} alt="Azure Flexible Server for Postgresでwal_levelをlogicalに変更" />

3. この変更にはサーバーの再起動が必要ですので、要求された場合は再起動してください。

<img src={restart} alt="wal_level変更後のサーバー再起動" />

## ClickPipesユーザーの作成と権限付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じてAzure Flexible Server Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルをレプリケートしますスキーマへ `clickpipes_user` に対して読み取り専用アクセスを付与します。以下の例は `public` スキーマの権限設定を示しています。複数のスキーマにアクセスを付与したい場合は、各スキーマに対してこれらの3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 将来的にMIRROR（レプリケーション）を作成するために使用するパブリケーションを作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. `clickpipes_user` の `wal_sender_timeout` を0に設定します。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## ClickPipesのIPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

以下の手順に従って、[ClickPipesのIP](../../index.md#list-of-static-ips)をネットワークに追加してください。

1. **ネットワーキング**タブに移動し、Azure Flexible Server Postgresのファイアウォールに[ClickPipesのIP](../../index.md#list-of-static-ips)を追加します。SSHトンネリングを使用している場合は、Jump Server/Bastionにも追加してください。

<img src={firewall} alt="Azure Flexible Server for PostgresのファイアウォールにClickPipesのIPを追加" />

## 次は何ですか？ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudへのデータインジェストを開始できます。
Postgresインスタンスをセットアップ中に使用した接続情報は、ClickPipe作成プロセスで必要になるため、メモしておいてください。
