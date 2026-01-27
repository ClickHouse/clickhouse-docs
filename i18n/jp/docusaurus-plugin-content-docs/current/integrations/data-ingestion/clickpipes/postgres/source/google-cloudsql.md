---
sidebar_label: 'Google Cloud SQL'
description: 'ClickPipes のソースとして Google Cloud SQL Postgres インスタンスを設定する'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'ロジカルデコーディング', 'ファイアウォール']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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


# Google Cloud SQL Postgres ソース設定ガイド \{#google-cloud-sql-postgres-source-setup-guide\}

:::info

サイドバーに表示されているサポート対象プロバイダーのいずれかを使用している場合は、そのプロバイダー専用のガイドを参照してください。

:::

## サポートされている Postgres バージョン \{#supported-postgres-versions\}

Postgres 12 以降のすべてのバージョン

## 論理レプリケーションを有効にする \{#enable-logical-replication\}

設定 `cloudsql. logical_decoding` が on で、かつ `wal_sender_timeout` が 0 の場合は、**以下の手順を実行する必要はありません**。これらの設定は、他のデータレプリケーションツールから移行する場合、ほとんどのケースで事前に構成されています。

1. 概要ページで **Edit** ボタンをクリックします。

<Image img={edit_button} alt="Cloud SQL Postgres の Edit ボタン" size="lg" border/>

2. Flags に移動し、`cloudsql.logical_decoding` を on にし、`wal_sender_timeout` を 0 に変更します。これらの変更を反映するには、Postgres サーバーの再起動が必要です。

<Image img={cloudsql_logical_decoding1} alt="cloudsql.logical_decoding を on に変更" size="lg" border/>

<Image img={cloudsql_logical_decoding2} alt="cloudsql.logical_decoding と wal_sender_timeout を変更" size="lg" border/>

<Image img={cloudsql_logical_decoding3} alt="サーバーを再起動" size="lg" border/>

## ClickPipes ユーザーの作成と権限付与 \{#creating-clickpipes-user-and-granting-permissions\}

管理ユーザーで Cloud SQL Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例では `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるすべてのテーブルには、**主キー (primary key)** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープの決め方については、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対する publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定スキーマ内のすべてのテーブルに対する publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成された変更イベントの集合が含まれ、後でレプリケーションストリームを取り込むために使用されます。

[//]: # (TODO Add SSH Tunneling)

## Firewall に ClickPipes の IP アドレスを追加する \{#add-clickpipes-ips-to-firewall\}

次の手順に従って、ClickPipes の IP アドレスをネットワークに追加します。

:::note

SSH Tunneling を使用している場合は、[ClickPipes IPs](../../index.md#list-of-static-ips) を Jump Server/Bastion のファイアウォールルールに追加する必要があります。

:::

1. **Connections** セクションに移動します

<Image img={connections} alt="Cloud SQL の「Connections」セクション" size="lg" border/>

2. **Networking** サブセクションに移動します

<Image img={connections_networking} alt="Cloud SQL の「Networking」サブセクション" size="lg" border/>

3. [ClickPipes の public IP アドレス](../../index.md#list-of-static-ips) を追加します

<Image img={firewall1} alt="ClickPipes ネットワークを Firewall に追加" size="lg" border/>

<Image img={firewall2} alt="Firewall に追加された ClickPipes ネットワーク" size="lg" border/>

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスのセットアップ時に使用した接続情報は、ClickPipe の作成時に必要になるので、必ず控えておいてください。