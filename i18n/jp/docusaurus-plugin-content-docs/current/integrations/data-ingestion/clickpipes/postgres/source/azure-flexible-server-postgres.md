---
sidebar_label: 'Postgres 用 Azure Flexible Server'
description: 'ClickPipes のソースとして Azure Flexible Server for Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Azure Flexible Server for Postgres ソース設定ガイド'
keywords: ['azure', 'flexible server', 'postgres', 'ClickPipes', 'wal level']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';

# Azure Flexible Server for Postgres のソース設定ガイド \{#azure-flexible-server-for-postgres-source-setup-guide\}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする \{#enable-logical-replication\}

`wal_level` が `logical` に設定されている場合は、以下の手順に **従う必要はありません**。別のデータレプリケーションツールから移行する場合、この設定はあらかじめ構成されていることがほとんどです。

1. **Server parameters** セクションをクリックします

<Image img={server_parameters} alt="Azure Flexible Server for Postgres の Server Parameters" size="lg" border/>

2. `wal_level` の値を `logical` に変更します

<Image img={wal_level} alt="Azure Flexible Server for Postgres で wal_level を logical に変更" size="lg" border/>

3. この変更にはサーバーの再起動が必要です。再起動を求められたら実行します。

<Image img={restart} alt="wal_level を変更した後にサーバーを再起動" size="lg" border/>

## ClickPipes 用ユーザーの作成と権限付与 \{#creating-clickpipes-user-and-granting-permissions\}

管理ユーザーで Azure Flexible Server Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 先ほど作成したユーザーに、スキーマ単位の読み取り専用アクセス権を付与します。次の例では `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返し実行してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. ユーザーにレプリケーション権限を付与します。

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスへのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるテーブルはすべて、**主キー (primary key)** が定義されている _か_、**replica identity** が `FULL` に設定されている必要があります。スコープ設定のガイダンスについては [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブル用の publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定スキーマ内のすべてのテーブル用の publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定されたテーブルから生成される変更イベントの集合が含まれ、後でレプリケーションストリームを取り込む際に使用されます。

5. `clickpipes_user` に対して `wal_sender_timeout` を 0 に設定します。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## Firewall に ClickPipes の IP アドレスを追加する \{#add-clickpipes-ips-to-firewall\}

以下の手順に従って、[ClickPipes の IP アドレス](../../index.md#list-of-static-ips) をネットワークに追加してください。

1. **Networking** タブに移動し、[ClickPipes の IP アドレス](../../index.md#list-of-static-ips) を Azure Flexible Server for Postgres のファイアウォール、
   または SSH トンネリングを使用している場合は Jump Server/Bastion のファイアウォールに追加します。

<Image img={firewall} alt="Azure Flexible Server for Postgres のファイアウォールに ClickPipes の IP アドレスを追加する" size="lg"/>

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe の作成プロセスで必要になるため、Postgres インスタンスのセットアップ時に使用した接続情報は必ずメモしておいてください。