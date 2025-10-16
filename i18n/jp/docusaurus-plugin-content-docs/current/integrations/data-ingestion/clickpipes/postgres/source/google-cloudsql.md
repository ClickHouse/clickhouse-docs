---
'sidebar_label': 'Google Cloud SQL'
'description': 'Google Cloud SQL Postgres インスタンスを ClickPipes のソースとして設定する'
'slug': '/integrations/clickpipes/postgres/source/google-cloudsql'
'title': 'Google Cloud SQL Postgres ソース設定ガイド'
'doc_type': 'guide'
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

サポートされているプロバイダのいずれかを使用している場合（サイドバーを参照）、そのプロバイダのための特定のガイドを参照してください。

:::

## サポートされている Postgres バージョン {#supported-postgres-versions}

Postgres 12 以降はすべて

## 論理レプリケーションを有効にする {#enable-logical-replication}

**以下の手順を実行する必要はありません** `cloudsql.logical_decoding` がオンで、`wal_sender_timeout` が 0 の場合。これらの設定は、他のデータレプリケーションツールから移行する場合には主に事前に構成されているはずです。

1. 概要ページの **編集** ボタンをクリックします。

<Image img={edit_button} alt="Cloud SQL Postgres の編集ボタン" size="lg" border/>

2. フラグに移動し、`cloudsql.logical_decoding` をオンにし、`wal_sender_timeout` を 0 に変更します。これらの変更には Postgres サーバーの再起動が必要です。

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decoding をオンに変更" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decoding と wal_sender_timeout の変更" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="サーバーを再起動" size="lg" border/>

## ClickPipes ユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じて Cloud SQL Postgres に接続し、以下のコマンドを実行してください：

1. ClickPipes 専用の Postgres ユーザーを作成します。

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. テーブルをレプリケートするスキーマに対して、`clickpipes_user` に読み取り専用アクセスを提供します。以下の例は `public` スキーマの権限を設定する方法を示しています。複数のスキーマにアクセスを付与したい場合は、それぞれのスキーマに対してこれらの 3 つのコマンドを実行できます。

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. このユーザーにレプリケーションアクセスを付与します：

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 将来的に MIRROR（レプリケーション）を作成するために使用する公開を作成します。

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

[//]: # (TODO Add SSH Tunneling)

## ClickPipes の IP をファイアウォールに追加する {#add-clickpipes-ips-to-firewall}

以下の手順に従って、ClickPipes の IP をネットワークに追加してください。

:::note

SSH トンネリングを使用している場合は、[ClickPipes の IP](../../index.md#list-of-static-ips) をジャンプサーバー/バスティオンのファイアウォールルールに追加する必要があります。

:::

1. **接続** セクションに移動します。

<Image img={connections} alt="Cloud SQL の接続セクション" size="lg" border/>

2. ネットワーキングのサブセクションに移動します。

<Image img={connections_networking} alt="Cloud SQL のネットワーキングのサブセクション" size="lg" border/>

3. [ClickPipes の公衆 IP](../../index.md#list-of-static-ips) を追加します。

<Image img={firewall1} alt="ClickPipes ネットワークをファイアウォールに追加" size="lg" border/>
<Image img={firewall2} alt="ファイアウォールに追加された ClickPipes ネットワーク" size="lg" border/>

## 次は何？ {#whats-next}

これで [ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込むことができます。Postgres インスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe の作成プロセス中にそれらが必要となります。
