---
sidebar_label: Azure Flexible Server for Postgres
description: ClickPipesのソースとしてAzure Flexible Server for Postgresをセットアップする
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
---

# Azure Flexible Server for Postgres ソース設定ガイド

ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

**`wal_level`が`logical`に設定されている場合、以下の手順を実行する必要はありません。** この設定は、別のデータレプリケーションツールから移行する場合は、主に事前に構成されているはずです。

1. **サーバーパラメータ**セクションをクリックします。

   ![サーバーパラメータ](images/setup/azure-flexible-server-postgres/server_parameters.png)

2. `wal_level`を`logical`に編集します。

   ![wal_levelをlogicalに変更](images/setup/azure-flexible-server-postgres/wal_level.png)

3. この変更にはサーバーの再起動が必要です。要求されたら再起動してください。

   ![サーバーを再起動](images/setup/azure-flexible-server-postgres/restart.png)

## ClickPipesユーザーの作成と権限付与 {#creating-clickpipes-user-and-granting-permissions}

管理者ユーザーを通じてAzure Flexible Server Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 複製するテーブルのスキーマに対して`clickpipes_user`に読み取り専用アクセスを提供します。以下の例は、`public`スキーマに対する権限の設定を示しています。複数のスキーマにアクセスを付与したい場合、それぞれのスキーマに対してこの3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 将来MIRROR（レプリケーション）を作成するために使用するパブリケーションを作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. `clickpipes_user`に対して`wal_sender_timeout`を0に設定します。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## ClickPipes IPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

以下の手順に従って、[ClickPipes IP](../../index.md#list-of-static-ips)をネットワークに追加してください。

1. **ネットワーキング**タブに移動し、[ClickPipes IP](../../index.md#list-of-static-ips)をAzure Flexible Server Postgresのファイアウォールに追加します。または、SSHトンネリングを使用している場合は、ジャンプサーバー/バスティオンに追加します。

   ![ファイアウォールにClickPipes IPを追加](images/setup/azure-flexible-server-postgres/firewall.png)

## 次は何ですか？ {#whats-next}

今すぐ[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。Postgresインスタンスの設定中に使用した接続詳細をメモしておくと、ClickPipeの作成プロセス中に必要になります。
