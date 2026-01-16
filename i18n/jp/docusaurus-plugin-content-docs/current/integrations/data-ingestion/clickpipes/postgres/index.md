---
sidebar_label: 'Postgres から ClickHouse へのデータ取り込み'
description: 'Postgres を ClickHouse Cloud とシームレスに連携させます。'
slug: /integrations/clickpipes/postgres
title: 'Postgres から ClickHouse へのデータ取り込み（CDC を使用）'
keywords: ['PostgreSQL', 'ClickPipes', 'CDC', '変更データキャプチャ', 'データベースレプリケーション']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.png'
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# Postgres から ClickHouse へのデータ取り込み（CDC を使用） \\{#ingesting-data-from-postgres-to-clickhouse-using-cdc\\}

ClickPipes を使用して、ソースの Postgres データベースから ClickHouse Cloud にデータを取り込むことができます。ソースの Postgres データベースは、オンプレミス環境だけでなく、Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase などを含む各種クラウドサービス上にホストすることもできます。

## 前提条件 \\{#prerequisites\\}

作業を開始する前に、まず Postgres データベースが正しく設定されていることを確認する必要があります。利用しているソース Postgres インスタンスに応じて、次のいずれかのガイドに従ってください。

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [汎用 Postgres ソース](./postgres/source/generic) — 他の Postgres プロバイダーを利用している場合、またはセルフホストインスタンスを利用している場合はこちらを参照してください。

9. [TimescaleDB](./postgres/source/timescale) — マネージドサービスまたはセルフホストインスタンスで TimescaleDB 拡張機能を使用している場合はこちらを参照してください。

:::warning

PgBouncer、RDS Proxy、Supabase Pooler などの Postgres プロキシは、CDC（変更データキャプチャ）ベースのレプリケーションではサポートされていません。ClickPipes をセットアップする際には、これらを使用せず、必ず実際の Postgres データベースの接続情報を指定してください。

:::

ソース Postgres データベースのセットアップが完了したら、ClickPipe の作成に進みます。

## ClickPipe の作成 \\{#creating-your-clickpipe\\}

ClickHouse Cloud アカウントにログインしていることを確認してください。まだアカウントがない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloud コンソールで、対象の ClickHouse Cloud サービスに移動します。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側のメニューで `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. `Postgres CDC` タイルを選択します。

   <Image img={postgres_tile} alt="Postgres を選択" size="lg" border/>

### ソース Postgres データベース接続の追加 \\{#adding-your-source-postgres-database-connection\\}

4. 事前準備のステップで構成したソース Postgres データベースの接続情報を入力します。

   :::info

   接続情報の追加を始める前に、ファイアウォールルールで ClickPipes の IP アドレスを許可リストに登録していることを確認してください。ClickPipes の IP アドレス一覧は[こちら](../index.md#list-of-static-ips)で確認できます。
   詳細については、[このページの先頭](#prerequisites)にリンクされているソース Postgres セットアップガイドを参照してください。

   :::

   <Image img={postgres_connection_details} alt="接続情報の入力" size="lg" border/>

#### （オプション）AWS Private Link の設定 \\{#optional-setting-up-aws-private-link\\}

ソース Postgres データベースが AWS 上でホストされている場合は、AWS Private Link を使用して接続できます。これは、データ転送をプライベートに保ちたい場合に有効です。
[接続を設定するためのセットアップガイド](/integrations/clickpipes/aws-privatelink)に従ってください。

#### （オプション）SSH トンネリングの設定 \\{#optional-setting-up-ssh-tunneling\\}

ソース Postgres データベースがパブリックにアクセスできない場合は、SSH トンネリングの詳細を指定できます。

1. "Use SSH Tunnelling" トグルを有効にします。
2. SSH 接続情報を入力します。

   <Image img={ssh_tunnel} alt="SSH トンネリング" size="lg" border/>

3. キーベース認証を使用するには、"Revoke and generate key pair" をクリックして新しいキーペアを生成し、生成された公開鍵を SSH サーバー上の `~/.ssh/authorized_keys` にコピーします。
4. "Verify Connection" をクリックして接続を検証します。

:::note

ClickPipes が SSH トンネルを確立できるように、SSH バスティオンホストのファイアウォールルールで [ClickPipes の IP アドレス](../clickpipes#list-of-static-ips)を必ず許可リストに登録してください。

:::

接続情報の入力が完了したら、「Next」をクリックします。

### レプリケーション設定の構成 \\{#configuring-the-replication-settings\\}

5. 事前準備のステップで作成したレプリケーションスロットを、ドロップダウンリストから選択してください。

   <Image img={select_replication_slot} alt="レプリケーションスロットの選択" size="lg" border/>

#### 詳細設定 \\{#advanced-settings\\}

必要に応じて詳細設定を行えます。各設定の簡単な説明は次のとおりです。

- **Sync interval**: ClickPipes が変更を確認するためにソースデータベースをポーリングする間隔です。これは宛先の ClickHouse サービスに影響を与えます。コストを重視するユーザーには、この値を高め（`3600` 以上）に設定することを推奨します。
- **Parallel threads for initial load**: 初回スナップショットを取得するために使用される並列ワーカーの数です。大量のテーブルがあり、初回スナップショット取得に使用される並列ワーカー数を制御したい場合に有効です。この設定はテーブルごとに適用されます。
- **Pull batch size**: 1 回のバッチで取得する行数です。これはベストエフォートの設定であり、すべての場合で厳密に守られるとは限りません。
- **Snapshot number of rows per partition**: 初回スナップショット時に各パーティションで取得される行数です。テーブル内の行数が多く、各パーティションで取得する行数を制御したい場合に有効です。
- **Snapshot number of tables in parallel**: 初回スナップショット時に並列で取得されるテーブル数です。大量のテーブルがあり、並列で取得するテーブル数を制御したい場合に有効です。

### テーブルの構成 \\{#configuring-the-tables\\}

6. ここでは、ClickPipe の宛先データベースを選択できます。既存のデータベースを選択することも、新しいデータベースを作成することもできます。

   <Image img={select_destination_db} alt="宛先データベースの選択" size="lg" border/>

7. ソースの Postgres データベースから、レプリケーションしたいテーブルを選択できます。テーブルを選択する際、宛先の ClickHouse データベース側でテーブル名を変更したり、特定のカラムを除外したりすることも可能です。

   :::warning
   ClickHouse での `ordering key` を Postgres の `primary key` と異なる形で定義する場合は、関連する [考慮事項](/integrations/clickpipes/postgres/ordering_keys) をすべて必ず確認してください。
   :::

### 権限を確認し ClickPipe を開始する \\{#review-permissions-and-start-the-clickpipe\\}

8. 権限のドロップダウンから "Full access" ロールを選択し、"Complete Setup" をクリックします。

   <Image img={ch_permissions} alt="権限の確認" size="lg" border/>

## 次のステップ \\{#whats-next\\}

PostgreSQL から ClickHouse Cloud へのデータレプリケーション用に ClickPipe をセットアップしたら、最適なパフォーマンスを得るためのクエリおよびデータモデリングに集中できます。要件に最も適した戦略を評価するには、[移行ガイド](/migrations/postgresql/overview)を参照し、CDC ワークロードにおけるベストプラクティスについては、[重複排除戦略（CDC の活用）](/integrations/clickpipes/postgres/deduplication)および [Ordering Keys](/integrations/clickpipes/postgres/ordering_keys) の各ページを参照してください。

PostgreSQL CDC に関する一般的な質問やトラブルシューティングについては、[Postgres FAQ ページ](/integrations/clickpipes/postgres/faq)を参照してください。
