---
sidebar_label: 'Azure Flexible Server for Postgres'
description: 'ClickPipes のソースとして Azure Flexible Server for Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Azure Flexible Server for Postgres ソースセットアップガイド'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
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


# Azure Flexible Server を使用した Postgres ソース設定ガイド \{#azure-flexible-server-for-postgres-source-setup-guide\}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## ロジカルレプリケーションを有効にする \{#enable-logical-replication\}

`wal_level` が `logical` に設定されている場合、以下の手順に **従う必要はありません**。この設定は、他のデータレプリケーションツールから移行している場合には、多くの場合すでに設定されています。

1. **Server parameters** セクションをクリックします

<Image img={server_parameters} alt="Azure Flexible Server for Postgres の Server Parameters" size="lg" border/>

2. `wal_level` を `logical` に設定します

<Image img={wal_level} alt="Azure Flexible Server for Postgres で wal_level を logical に変更する" size="lg" border/>

3. この変更を反映するにはサーバーの再起動が必要です。プロンプトが表示されたら再起動してください。

<Image img={restart} alt="wal_level の変更後にサーバーを再起動する" size="lg" border/>

## ClickPipes ユーザーの作成と権限付与 \{#creating-clickpipes-user-and-granting-permissions\}

管理ユーザーで Azure Flexible Server Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例では `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. ユーザーにレプリケーション権限を付与します。

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスへの余分な負荷を避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるすべてのテーブルは、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープの設定方法については、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブル向けの publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブル向けの publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントの集合が含まれ、後でレプリケーションストリームを取り込むために使用されます。

5. `clickpipes_user` に対して `wal_sender_timeout` を 0 に設定します。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## Firewall に ClickPipes の IP アドレスを追加する \{#add-clickpipes-ips-to-firewall\}

以下の手順に従って、[ClickPipes の IP アドレス](../../index.md#list-of-static-ips) をネットワークに追加してください。

1. **Networking** タブに移動し、Azure Flexible Server Postgres の Firewall、または SSH トンネリングを使用している場合は Jump Server/Bastion の Firewall に [ClickPipes の IP アドレス](../../index.md#list-of-static-ips) を追加します。

<Image img={firewall} alt="Azure Flexible Server for Postgres の Firewall に ClickPipes の IP アドレスを追加する" size="lg"/>

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスをセットアップする際に使用した接続情報は、ClickPipe を作成する際にも必要になるため、必ず記録しておいてください。