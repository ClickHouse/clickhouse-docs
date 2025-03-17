---
sidebar_label: Google Cloud SQL
description: ClickPipesのソースとしてGoogle Cloud SQL Postgresインスタンスを設定します
slug: /integrations/clickpipes/postgres/source/google-cloudsql
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';


# Google Cloud SQL Postgres ソース設定ガイド

:::info

サイドバーにあるサポートされているプロバイダーのいずれかを使用している場合は、そのプロバイダーの特定のガイドを参照してください。

:::


## サポートされている Postgres バージョン {#supported-postgres-versions}

Postgres 12 以降のバージョン

## 論理レプリケーションの有効化 {#enable-logical-replication}

**以下の手順を実行する必要はありません**。設定 `cloudsql.logical_decoding` がオンであり、`wal_sender_timeout` が 0 に設定されている場合、これらの設定は、他のデータレプリケーションツールから移行する場合にはほとんど事前に設定されています。

1. 概要ページの **Edit** ボタンをクリックします。

<img src={edit_button} alt="Cloud SQL Postgres の編集ボタン" />

2. フラグに移動し、`cloudsql.logical_decoding` をオンに、`wal_sender_timeout` を 0 に変更します。これらの変更にはPostgresサーバーの再起動が必要です。

<img src={cloudsql_logical_decoding1} alt="cloudsql.logical_decodingをonに変更" />
<img src={cloudsql_logical_decoding2} alt="cloudsql.logical_decodingおよびwal_sender_timeoutを変更" />
<img src={cloudsql_logical_decoding3} alt="サーバーの再起動" />


## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じてCloud SQL Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルをレプリケートするスキーマへの読み取り専用アクセスを`clickpipes_user`に付与します。以下の例は`public`スキーマの権限設定を示しています。複数のスキーマにアクセスを付与する場合は、各スキーマごとにこれら3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 今後MIRROR（レプリケーション）を作成するために使用する公開を作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO SSHトンネリングを追加)


## ClickPipesのIPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

以下の手順に従って、ClickPipesのIPをネットワークに追加してください。

:::note

SSHトンネリングを使用している場合は、[ClickPipesのIP](../../index.md#list-of-static-ips)をジャンプサーバー/バスティオンのファイアウォールルールに追加する必要があります。

:::

1. **Connections** セクションに移動します。

<img src={connections} alt="Cloud SQLの接続セクション" />

2. ネットワーキングのサブセクションに移動します。

<img src={connections_networking} alt="Cloud SQLのネットワーキングサブセクション" />

3. [ClickPipesのパブリックIP](../../index.md#list-of-static-ips)を追加します。

<img src={firewall1} alt="ファイアウォールにClickPipesネットワークを追加" />
<img src={firewall2} alt="ファイアウォールに追加されたClickPipesネットワーク" />


## 今後の予定は？ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。Postgresインスタンスを設定する際に使用した接続情報をメモしておくことを忘れないでください。ClickPipe作成プロセスで必要になります。
