---
sidebar_label: 'Azure Flexible Server for Postgres'
description: 'ClickPipesのソースとしてAzure Flexible Server for Postgresを設定する'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Azure Flexible Server for Postgresソースセットアップガイド'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure Flexible Server for Postgresソースセットアップガイド

ClickPipesはPostgresバージョン12以降をサポートしています。

## ロジカルレプリケーションを有効にする {#enable-logical-replication}

**以下の手順を実行する必要はありません** `wal_level` が `logical` に設定されている場合。この設定は、別のデータレプリケーションツールから移行する際には事前に構成されているべきです。

1. **サーバーパラメータ**セクションをクリックします。

<Image img={server_parameters} alt="Azure Flexible Server for Postgresのサーバーパラメータ" size="lg" border/>

2. `wal_level` を `logical` に変更します。

<Image img={wal_level} alt="Azure Flexible Server for Postgresでwal_levelをlogicalに変更" size="lg" border/>

3. この変更はサーバーの再起動を必要とします。要求された場合は再起動してください。

<Image img={restart} alt="wal_levelを変更した後にサーバーを再起動" size="lg" border/>

## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じてAzure Flexible Server Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルをレプリケーションするスキーマに対して、`clickpipes_user`に対して読み取り専用アクセスを提供します。以下の例は、`public`スキーマの権限を設定する方法を示しています。複数のスキーマにアクセスを付与したい場合は、それぞれのスキーマに対してこの3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 将来のMIRROR（レプリケーション）作成に使用する公開を作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. `clickpipes_user`の`wal_sender_timeout`を0に設定します。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## ClickPipesのIPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

以下の手順に従って、[ClickPipesのIP](../../index.md#list-of-static-ips)をネットワークに追加してください。

1. **ネットワーク**タブに移動し、Azure Flexible Server Postgresのファイアウォールに[ClickPipesのIP](../../index.md#list-of-static-ips)を追加します。または、SSHトンネリングを使用している場合はジャンプサーバー/バスティオンにも追加します。

<Image img={firewall} alt="Azure Flexible Server for PostgresのファイアウォールにClickPipesのIPを追加" size="lg"/>

## 次に何をしますか？ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。Postgresインスタンスを設定する際に使用した接続詳細をメモしてください。ClickPipe作成プロセス中に必要になります。
