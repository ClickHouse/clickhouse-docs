---
'sidebar_label': 'Azure Flexible Server for Postgres'
'description': 'Set up Azure Flexible Server for Postgres as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/azure-flexible-server-postgres'
'title': 'Azure Flexible Server for Postgres Source Setup Guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure Flexible Server for Postgres ソースセットアップガイド

ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

`wal_level`が`logical`に設定されている場合、以下の手順を実行する必要はありません。この設定は、別のデータレプリケーションツールから移行する場合、ほとんどの場合、事前に構成されています。

1. **サーバーパラメータ**セクションをクリックします。

<Image img={server_parameters} alt="Azure Flexible Server for Postgresのサーバーパラメータ" size="lg" border/>

2. `wal_level`を`logical`に編集します。

<Image img={wal_level} alt="Azure Flexible Server for Postgresでwal_levelをlogicalに変更" size="lg" border/>

3. この変更にはサーバーの再起動が必要です。要求された場合は再起動してください。

<Image img={restart} alt="wal_levelを変更した後にサーバーを再起動" size="lg" border/>

## ClickPipesユーザーの作成と権限付与 {#creating-clickpipes-user-and-granting-permissions}

管理ユーザーを通じてAzure Flexible Server Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. テーブルをレプリケートするスキーマに対する読み取り専用アクセスを`clickpipes_user`に付与します。以下の例は`public`スキーマの権限設定を示しています。複数のスキーマにアクセスを付与したい場合は、それぞれのスキーマについてこれらの3つのコマンドを実行できます。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. このユーザーにレプリケーションアクセスを付与します：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 将来MIRROR（レプリケーション）を作成するために使用する公開出版物を作成します。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. `clickpipes_user`の`wal_sender_timeout`を0に設定します。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```


## ClickPipesのIPをファイアウォールに追加する {#add-clickpipes-ips-to-firewall}

以下の手順に従って、[ClickPipesのIP](../../index.md#list-of-static-ips)をネットワークに追加してください。

1. **ネットワーキング**タブに移動し、[ClickPipesのIP](../../index.md#list-of-static-ips)をAzure Flexible Server PostgresのファイアウォールまたはSSHトンネリングを使用している場合はJump Server/Bastionに追加します。

<Image img={firewall} alt="Azure Flexible Server for PostgresのファイアウォールにClickPipesのIPを追加" size="lg"/>


## 次は何ですか？ {#whats-next}

これで[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudへデータを取り込むことができます。Postgresインスタンスをセットアップした際に使用した接続情報を忘れずにメモしておいてください。ClickPipe作成プロセス中にそれらが必要になります。
