---
sidebar_label: 'Google Cloud SQL'
description: 'ClickPipes のソースとして使用する Google Cloud SQL Postgres インスタンスをセットアップする'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'logical decoding', 'firewall']
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';
import Image from '@theme/IdealImage';


# Google Cloud SQL Postgres ソース設定ガイド

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを利用している場合は、そのプロバイダー専用のガイドを参照してください。

:::



## サポートされているPostgresバージョン {#supported-postgres-versions}

Postgres 12以降


## 論理レプリケーションの有効化 {#enable-logical-replication}

`cloudsql.logical_decoding`が有効で、`wal_sender_timeout`が0に設定されている場合、以下の手順を実行する**必要はありません**。これらの設定は、他のデータレプリケーションツールから移行する場合、通常は事前に構成されています。

1. 概要ページの**編集**ボタンをクリックします。

<Image
  img={edit_button}
  alt='Cloud SQL Postgresの編集ボタン'
  size='lg'
  border
/>

2. フラグに移動し、`cloudsql.logical_decoding`を有効に、`wal_sender_timeout`を0に変更します。これらの変更を適用するには、Postgresサーバーの再起動が必要です。

<Image
  img={cloudsql_logical_decoding1}
  alt='cloudsql.logical_decodingを有効に変更'
  size='lg'
  border
/>
<Image
  img={cloudsql_logical_decoding2}
  alt='cloudsql.logical_decodingとwal_sender_timeoutを変更済み'
  size='lg'
  border
/>
<Image img={cloudsql_logical_decoding3} alt='サーバーの再起動' size='lg' border />


## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理者ユーザーでCloud SQL Postgresに接続し、以下のコマンドを実行します:

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. レプリケーション元のスキーマに対する読み取り専用アクセスを`clickpipes_user`に付与します。以下の例では`public`スキーマの権限設定を示しています。複数のスキーマにアクセス権を付与する場合は、各スキーマに対してこれら3つのコマンドを実行してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 今後MIRROR(レプリケーション)の作成に使用するパブリケーションを作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # "TODO Add SSH Tunneling"


## ClickPipes IPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

ClickPipes IPをネットワークに追加するには、以下の手順に従ってください。

:::note

SSHトンネリングを使用している場合は、ジャンプサーバー/踏み台サーバーのファイアウォールルールに[ClickPipes IP](../../index.md#list-of-static-ips)を追加する必要があります。

:::

1. **Connections**セクションに移動します

<Image
  img={connections}
  alt='Cloud SQLのConnectionsセクション'
  size='lg'
  border
/>

2. Networkingサブセクションに移動します

<Image
  img={connections_networking}
  alt='Cloud SQLのNetworkingサブセクション'
  size='lg'
  border
/>

3. [ClickPipesのパブリックIP](../../index.md#list-of-static-ips)を追加します

<Image
  img={firewall1}
  alt='ClickPipesネットワークをファイアウォールに追加'
  size='lg'
  border
/>
<Image
  img={firewall2}
  alt='ファイアウォールに追加されたClickPipesネットワーク'
  size='lg'
  border
/>


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、Postgresインスタンスのセットアップで使用した接続情報を必ず控えておいてください。
