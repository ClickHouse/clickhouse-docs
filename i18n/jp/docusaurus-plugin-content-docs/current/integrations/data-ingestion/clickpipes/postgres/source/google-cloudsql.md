---
sidebar_label: 'Google Cloud SQL'
description: 'ClickPipesのソースとしてGoogle Cloud SQL Postgresインスタンスを設定する'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres ソース設定ガイド'
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

サポートされているプロバイダーの1つを使用している場合（サイドバーに表示）、そのプロバイダー用の特定のガイドを参照してください。

:::


## サポートされているPostgresバージョン {#supported-postgres-versions}

Postgres 12 以降のすべてのバージョン

## 論理レプリケーションの有効化 {#enable-logical-replication}

**以下の手順を実行する必要はありません** `cloudsql.logical_decoding` の設定がオンで、`wal_sender_timeout` が 0 の場合。これらの設定は、他のデータレプリケーションツールから移行している場合は、事前に設定されていることがほとんどです。

1. 概要ページで **編集** ボタンをクリックします。

<Image img={edit_button} alt="Cloud SQL Postgres の編集ボタン" size="lg" border/>

2. フラグに移動し、`cloudsql.logical_decoding` をオンに、`wal_sender_timeout` を 0 に変更します。これらの変更を行うと、Postgres サーバーを再起動する必要があります。

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decodingをオンに変更" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decodingとwal_sender_timeoutを変更" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="サーバーを再起動" size="lg" border/>


## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じて Cloud SQL Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用の Postgres ユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. レプリケートするテーブルのスキーマに対して、`clickpipes_user` に読み取り専用アクセスを付与します。以下の例は、`public` スキーマの権限を設定する方法を示しています。複数のスキーマに対してアクセスを付与したい場合は、それぞれのスキーマについてこの3つのコマンドを実行できます。

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

[//]: # (TODO Add SSH Tunneling)


## ClickPipes IPをファイアウォールに追加 {#add-clickpipes-ips-to-firewall}

以下の手順に従って、ClickPipesのIPをネットワークに追加してください。

:::note

SSHトンネリングを使用している場合は、[ClickPipesのIP](../../index.md#list-of-static-ips)をジャンプサーバー/バスティオンのファイアウォールルールに追加する必要があります。

:::

1. **接続** セクションに移動します。

<Image img={connections} alt="Cloud SQLの接続セクション" size="lg" border/>

2. ネットワーキングのサブセクションに移動します。

<Image img={connections_networking} alt="Cloud SQLのネットワーキングサブセクション" size="lg" border/>

3. [ClickPipesの公共IPを追加します](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="ファイアウォールにClickPipesネットワークを追加" size="lg" border/>
<Image img={firewall2} alt="ファイアウォールに追加されたClickPipesネットワーク" size="lg" border/>


## 次は？ {#whats-next}

これで [ClickPipeを作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。Postgres インスタンスを設定する際に使用した接続情報をメモしておくことを忘れないでください。ClickPipeを作成する際に必要になります。
