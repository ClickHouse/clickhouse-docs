---
sidebar_label: 'Azure Flexible Server for Postgres'
description: 'ClickPipes のソースとして Azure Flexible Server for Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Azure Flexible Server for Postgres ソース設定ガイド'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
doc_type: 'guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Postgres 用 Azure Flexible Server ソース設定ガイド

ClickPipes は Postgres バージョン 12 以降をサポートします。



## 論理レプリケーションの有効化 {#enable-logical-replication}

`wal_level`が`logical`に設定されている場合、以下の手順を実行する**必要はありません**。他のデータレプリケーションツールから移行する場合、この設定は通常事前に構成されています。

1. **サーバーパラメータ**セクションをクリックします

<Image
  img={server_parameters}
  alt='Azure Flexible Server for PostgreSQLのサーバーパラメータ'
  size='lg'
  border
/>

2. `wal_level`を`logical`に編集します

<Image
  img={wal_level}
  alt='Azure Flexible Server for PostgreSQLでwal_levelをlogicalに変更'
  size='lg'
  border
/>

3. この変更にはサーバーの再起動が必要です。要求されたら再起動してください。

<Image
  img={restart}
  alt='wal_level変更後のサーバー再起動'
  size='lg'
  border
/>


## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理者ユーザーでAzure Flexible Server Postgresに接続し、以下のコマンドを実行します:

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. レプリケーション元のスキーマへの読み取り専用アクセスを`clickpipes_user`に付与します。以下の例では`public`スキーマの権限設定を示しています。複数のスキーマへのアクセスを付与する場合は、各スキーマに対してこれら3つのコマンドを実行してください。

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

5. `clickpipes_user`の`wal_sender_timeout`を0に設定します

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```


## ClickPipes IPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

ネットワークに[ClickPipes IP](../../index.md#list-of-static-ips)を追加するには、以下の手順に従ってください。

1. **Networking**タブに移動し、[ClickPipes IP](../../index.md#list-of-static-ips)をAzure Flexible Server Postgresのファイアウォールに追加します。SSHトンネリングを使用している場合は、ジャンプサーバー/踏み台サーバーに追加してください。

<Image
  img={firewall}
  alt='Azure Flexible Server for PostgresのファイアウォールにClickPipes IPを追加'
  size='lg'
/>


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
Postgresインスタンスのセットアップ時に使用した接続情報は、ClickPipeの作成時に必要となるため、必ず控えておいてください。
