---
'sidebar_label': 'Azure Flexible Server for Postgres'
'description': 'ClickPipes のソースとして Azure Flexible Server for Postgres を設定します'
'slug': '/integrations/clickpipes/postgres/source/azure-flexible-server-postgres'
'title': 'Azure Flexible Server for Postgres ソース設定ガイド'
'doc_type': 'guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure柔軟サーバーのPostgresソース設定ガイド

ClickPipesは、Postgresバージョン12以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

`wal_level`が`logical`に設定されている場合、以下の手順を実行する必要はありません。この設定は、別のデータレプリケーションツールから移行する場合は、主に事前に設定されているべきです。

1. **サーバーパラメータ**セクションをクリックします。

<Image img={server_parameters} alt="Azure Flexible Server for Postgresのサーバーパラメータ" size="lg" border/>

2. `wal_level`を`logical`に変更します。

<Image img={wal_level} alt="Azure Flexible Server for Postgresでwal_levelをlogicalに変更" size="lg" border/>

3. この変更にはサーバーの再起動が必要ですので、要求された場合は再起動してください。

<Image img={restart} alt="wal_levelを変更後にサーバーを再起動" size="lg" border/>

## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

管理者ユーザーを通じてAzure Flexible Server Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. テーブルをレプリケートしているスキーマへの読み取り専用アクセスを`clickpipes_user`に提供します。以下の例は、`public`スキーマの権限設定を示しています。複数のスキーマにアクセスを付与したい場合は、各スキーマに対してこれらの3つのコマンドを実行できます。

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. このユーザーにレプリケーションアクセスを付与します：

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 将来的にMIRROR（レプリケーション）を作成するために使用する出版物を作成します。

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

5. `clickpipes_user`の`wal_sender_timeout`を0に設定します。

```sql
ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
```

## ClickPipesのIPをファイアウォールに追加する {#add-clickpipes-ips-to-firewall}

以下の手順に従って、[ClickPipesのIP](../../index.md#list-of-static-ips)をネットワークに追加してください。

1. **ネットワーキング**タブに移動し、Azure Flexible Server Postgresのファイアウォールに[ClickPipesのIP](../../index.md#list-of-static-ips)を追加します。SSHトンネリングを使用している場合は、ジャンプサーバー/バスティオンにも追加します。

<Image img={firewall} alt="Azure Flexible Server for PostgresでClickPipesのIPをファイアウォールに追加" size="lg"/>

## 次に何をするか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。Postgresインスタンスを設定する際に使用した接続詳細をメモしておいてください。ClickPipeの作成プロセス中に必要になります。
