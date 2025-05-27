---
'sidebar_label': 'Google Cloud SQL'
'description': 'Set up Google Cloud SQL Postgres instance as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/google-cloudsql'
'title': 'Google Cloud SQL Postgres Source Setup Guide'
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

サポートされているプロバイダーのいずれかを使用している場合は、サイドバーのそのプロバイダーに特化したガイドを参照してください。

:::


## サポートされている Postgres バージョン {#supported-postgres-versions}

Postgres 12 以降のすべて

## 論理レプリケーションを有効にする {#enable-logical-replication}

`cloudsql.logical_decoding` がオンで `wal_sender_timeout` が 0 の場合は、以下の手順を実行する必要はありません。これらの設定は、別のデータレプリケーションツールから移行する場合は、前もって設定されていることが多いです。

1. 概要ページで **Edit** ボタンをクリックします。

<Image img={edit_button} alt="Cloud SQL Postgres の Edit ボタン" size="lg" border/>

2. フラグに移動し、`cloudsql.logical_decoding` をオンにし、`wal_sender_timeout` を 0 に変更します。これらの変更は、Postgres サーバーの再起動が必要です。

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decoding をオンに変更" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decoding と wal_sender_timeout を変更" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="サーバーを再起動" size="lg" border/>


## ClickPipes ユーザーを作成し、権限を付与する {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じて Cloud SQL Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用の Postgres ユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルを複製しているスキーマへの読み取り専用アクセスを `clickpipes_user` に提供します。以下の例は `public` スキーマの権限を設定する方法を示しています。複数のスキーマにアクセスを付与したい場合は、それぞれのスキーマについてこの3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 今後 MIRROR（レプリケーション）を作成するために使用する公開物を作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO Add SSH Tunneling)


## ClickPipes IP をファイアウォールに追加する {#add-clickpipes-ips-to-firewall}

以下の手順に従って、ClickPipes IP をネットワークに追加してください。

:::note

SSH トンネリングを使用している場合は、[ClickPipes IP](../../index.md#list-of-static-ips)をジャンプサーバー/バスティオンのファイアウォールルールに追加する必要があります。

:::

1. **Connections** セクションに移動します。

<Image img={connections} alt="Cloud SQL の Connections セクション" size="lg" border/>

2. ネットワーキングのサブセクションに移動します。

<Image img={connections_networking} alt="Cloud SQL の Networking サブセクション" size="lg" border/>

3. [ClickPipes のパブリック IP](../../index.md#list-of-static-ips)を追加します。

<Image img={firewall1} alt="ファイアウォールに ClickPipes ネットワークを追加" size="lg" border/>
<Image img={firewall2} alt="ファイアウォールに追加された ClickPipes ネットワーク" size="lg" border/>


## 次に何をしますか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータをインジェストすることができます。
Postgres インスタンスの設定時に使用した接続詳細をメモしておいてください。ClickPipe 作成プロセス中に必要になります。
