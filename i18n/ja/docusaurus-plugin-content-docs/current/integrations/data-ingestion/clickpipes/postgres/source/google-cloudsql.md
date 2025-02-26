---
sidebar_label: Google Cloud SQL
description: ClickPipesのソースとしてのGoogle Cloud SQL Postgresインスタンスの設定
slug: /integrations/clickpipes/postgres/source/google-cloudsql
---

# Google Cloud SQL Postgres ソース設定ガイド

:::info

サポートされているプロバイダーのいずれかを使用している場合は、サイドバーの特定のガイドを参照してください。

:::


## サポートされているPostgresバージョン {#supported-postgres-versions}

Postgres 12以降のすべて

## 論理レプリケーションを有効にする {#enable-logical-replication}

**以下の手順を実行する必要はありません** もし設定 `cloudsql.logical_decoding` がオンで、`wal_sender_timeout` が0の場合。これらの設定は、別のデータレプリケーションツールから移行する場合にはほとんどの場合、事前に構成されています。

1. 概要ページの **Edit** ボタンをクリックします。

   ![Cloud SQL PostgresのEditボタン](images/setup/google-cloudsql/edit.png)


2. フラグに移動し、`cloudsql.logical_decoding` をオンに、`wal_sender_timeout` を0に変更します。これらの変更にはPostgresサーバーの再起動が必要です。

   ![`cloudsql.logical_decoding`をオンに変更](images/setup/google-cloudsql/cloudsql_logical_decoding1.png)
   ![変更された`cloudsql.logical_decoding`と`wal_sender_timeout`](images/setup/google-cloudsql/cloudsql_logical_decoding2.png)
   ![サーバーを再起動](images/setup/google-cloudsql/cloudsql_logical_decoding3.png)


## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを介してCloud SQL Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルをレプリケートするスキーマへの読み取り専用アクセスを `clickpipes_user` に付与します。以下の例は、`public` スキーマの権限を設定する方法を示しています。複数のスキーマにアクセスを権限を与えたい場合は、各スキーマに対してこれらの3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 将来のMIRROR（レプリケーション）作成に使用する公開を作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO SSHトンネリングの追加)


## ClickPipesのIPをファイアウォールに追加する {#add-clickpipes-ips-to-firewall}

以下の手順に従って、ClickPipesのIPをネットワークに追加してください。

:::note

SSHトンネリングを使用している場合は、[ClickPipesのIP](../../index.md#list-of-static-ips)をジャンプサーバー/バスティオンのファイアウォールルールに追加する必要があります。

:::

1. **Connections** セクションに移動します。

   ![Connectionsセクション](images/setup/google-cloudsql/connections.png)

2. ネットワークのサブセクションに移動します。

   ![Networkingサブセクション](images/setup/google-cloudsql/connections_networking.png)

3. [ClickPipesの公開IP](../../index.md#list-of-static-ips)を追加します。

   ![ClickPipesネットワークの追加](images/setup/google-cloudsql/firewall1.png)
   ![追加されたClickPipesネットワーク](images/setup/google-cloudsql/firewall2.png) 


## 次は何ですか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータをインジェストし始めることができます。
Postgresインスタンスを設定する際に使用した接続詳細をメモしておいてください。ClickPipeの作成プロセス中に必要になります。
