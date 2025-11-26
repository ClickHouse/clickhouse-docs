---
sidebar_label: 'Google Cloud SQL'
description: 'ClickPipes のソースとして Google Cloud SQL Postgres インスタンスを設定する'
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


# Google Cloud SQL Postgres ソースセットアップガイド

:::info

サイドバーにあるサポート対象プロバイダのいずれかを利用している場合は、そのプロバイダ向けの個別ガイドを参照してください。

:::



## サポートされている Postgres バージョン {#supported-postgres-versions}

Postgres 12 以降のすべてのバージョン



## 論理レプリケーションを有効化する {#enable-logical-replication}

設定 `cloudsql. logical_decoding` が on で、かつ `wal_sender_timeout` が 0 の場合、以下の手順に従う**必要はありません**。別のデータレプリケーションツールから移行する場合、これらの設定はあらかじめ構成されていることがほとんどです。

1. Overview ページの **Edit** ボタンをクリックします。

<Image img={edit_button} alt="Cloud SQL Postgres の Edit ボタン" size="lg" border/>

2. Flags タブに移動し、`cloudsql.logical_decoding` を on に、`wal_sender_timeout` を 0 に変更します。これらの変更を反映するには Postgres サーバーの再起動が必要です。

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decoding を on に変更" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decoding と wal_sender_timeout を変更" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="サーバーを再起動" size="lg" border/>



## ClickPipes ユーザーの作成と権限付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーで Cloud SQL の Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用の Postgres ユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルをレプリケートするスキーマに対して、`clickpipes_user` に読み取り専用アクセスを付与します。以下の例では、`public` スキーマに対する権限を設定しています。複数のスキーマにアクセス権を付与したい場合は、各スキーマごとにこれら 3 つのコマンドを実行してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーション用のアクセス権を付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 今後 MIRROR（レプリケーション）を作成する際に使用する publication を作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO SSH トンネリングを追加)



## ClickPipes の IP をファイアウォールに追加する {#add-clickpipes-ips-to-firewall}

以下の手順に従って、ClickPipes の IP をネットワークに追加してください。

:::note

SSH Tunneling を使用している場合は、[ClickPipes の IP](../../index.md#list-of-static-ips) を Jump Server/Bastion のファイアウォールルールに追加する必要があります。

:::

1. **Connections** セクションに移動します

<Image img={connections} alt="Cloud SQL の Connections セクション" size="lg" border/>

2. **Networking** サブセクションに移動します

<Image img={connections_networking} alt="Cloud SQL の Networking サブセクション" size="lg" border/>

3. [ClickPipes のパブリック IP](../../index.md#list-of-static-ips) を追加します

<Image img={firewall1} alt="ClickPipes のネットワークをファイアウォールに追加" size="lg" border/>
<Image img={firewall2} alt="ClickPipes のネットワークがファイアウォールに追加された状態" size="lg" border/>



## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)して、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に必要になるため、Postgres インスタンスのセットアップ時に使用した接続情報を必ず控えておいてください。
