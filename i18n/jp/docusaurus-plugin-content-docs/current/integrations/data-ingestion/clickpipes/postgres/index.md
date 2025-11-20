---
sidebar_label: 'Postgres から ClickHouse へのデータ取り込み'
description: 'Postgres を ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/postgres
title: 'Postgres から ClickHouse へのデータ取り込み（CDC 利用）'
keywords: ['PostgreSQL', 'ClickPipes', 'CDC', 'change data capture', 'database replication']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.png';
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg';
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg';
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg';
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg';
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg';
import Image from '@theme/IdealImage';


# Postgres から ClickHouse へのデータ取り込み（CDC の利用）

ClickPipes を使用することで、ソースとなる Postgres データベースから ClickHouse Cloud にデータを取り込むことができます。ソースの Postgres データベースは、オンプレミス環境のほか、Amazon RDS、Google Cloud SQL, Azure Database for Postgres, Supabase などを含むクラウド上でホストされたものを利用できます。



## 前提条件 {#prerequisites}

開始するには、まずPostgresデータベースが正しく設定されていることを確認する必要があります。ソースとなるPostgresインスタンスに応じて、以下のいずれかのガイドに従ってください:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [汎用Postgresソース](./postgres/source/generic) - その他のPostgresプロバイダーまたはセルフホストインスタンスを使用している場合

9. [TimescaleDB](./postgres/source/timescale) - マネージドサービスまたはセルフホストインスタンスでTimescaleDB拡張機能を使用している場合

:::warning

PgBouncer、RDS Proxy、Supabase Poolerなどのプロキシは、CDCベースのレプリケーションではサポートされていません。ClickPipesのセットアップ時にはこれらを使用せず、実際のPostgresデータベースの接続情報を追加してください。

:::

ソースとなるPostgresデータベースの設定が完了したら、ClickPipeの作成を続行できます。


## ClickPipeの作成 {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # "   TODO update image here"

1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt='ClickPipesサービス' size='lg' border />

2. 左側のメニューから`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt='インポートの選択' size='lg' border />

3. `Postgres CDC`タイルを選択します。

   <Image img={postgres_tile} alt='Postgresの選択' size='lg' border />

### ソースPostgresデータベース接続の追加 {#adding-your-source-postgres-database-connection}

4. 前提条件のステップで設定したソースPostgresデータベースの接続詳細を入力します。

   :::info

   接続詳細の追加を開始する前に、ファイアウォールルールでClickPipes IPアドレスをホワイトリストに登録していることを確認してください。ClickPipes IPアドレスのリストは[こちら](../index.md#list-of-static-ips)で確認できます。
   詳細については、[このページの上部](#prerequisites)にリンクされているソースPostgresセットアップガイドを参照してください。

   :::

   <Image
     img={postgres_connection_details}
     alt='接続詳細の入力'
     size='lg'
     border
   />

#### (オプション) AWS Private Linkのセットアップ {#optional-setting-up-aws-private-link}

ソースPostgresデータベースがAWS上でホストされている場合、AWS Private Linkを使用して接続できます。これは、データ転送をプライベートに保ちたい場合に便利です。
[接続をセットアップするためのセットアップガイド](/integrations/clickpipes/aws-privatelink)に従ってください。

#### (オプション) SSHトンネリングのセットアップ {#optional-setting-up-ssh-tunneling}

ソースPostgresデータベースが公開アクセス可能でない場合、SSHトンネリングの詳細を指定できます。

1. 「Use SSH Tunnelling」トグルを有効にします。
2. SSH接続の詳細を入力します。

   <Image img={ssh_tunnel} alt='SSHトンネリング' size='lg' border />

3. 鍵ベース認証を使用するには、「Revoke and generate key pair」をクリックして新しい鍵ペアを生成し、生成された公開鍵をSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「Verify Connection」をクリックして接続を検証します。

:::note

ClickPipesがSSHトンネルを確立できるように、SSH踏み台ホストのファイアウォールルールで[ClickPipes IPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに登録してください。

:::

接続詳細を入力したら、「Next」をクリックします。

### レプリケーション設定の構成 {#configuring-the-replication-settings}

5. 前提条件のステップで作成したレプリケーションスロットをドロップダウンリストから選択してください。

   <Image
     img={select_replication_slot}
     alt='レプリケーションスロットの選択'
     size='lg'
     border
   />

#### 詳細設定 {#advanced-settings}

必要に応じて詳細設定を構成できます。各設定の簡単な説明を以下に示します:

- **Sync interval**: ClickPipesがソースデータベースに変更をポーリングする間隔です。これは宛先ClickHouseサービスに影響を与えるため、コストに敏感なユーザーには、この値を高く(`3600`以上)保つことをお勧めします。
- **Parallel threads for initial load**: 初期スナップショットを取得するために使用される並列ワーカーの数です。多数のテーブルがあり、初期スナップショットを取得するために使用される並列ワーカーの数を制御したい場合に便利です。この設定はテーブルごとに適用されます。
- **Pull batch size**: 1回のバッチで取得する行数です。これはベストエフォート設定であり、すべてのケースで保証されるわけではありません。
- **Snapshot number of rows per partition**: 初期スナップショット中に各パーティションで取得される行数です。テーブルに多数の行があり、各パーティションで取得される行数を制御したい場合に便利です。
- **Snapshot number of tables in parallel**: 初期スナップショット中に並列で取得されるテーブルの数です。多数のテーブルがあり、並列で取得されるテーブルの数を制御したい場合に便利です。

### テーブルの構成 {#configuring-the-tables}

6. ここでClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image
     img={select_destination_db}
     alt='宛先データベースの選択'
     size='lg'
     border
   />


7. ソースPostgresデータベースからレプリケートするテーブルを選択できます。テーブルの選択時に、宛先ClickHouseデータベースでのテーブル名の変更や、特定のカラムの除外も可能です。

   :::warning
   ClickHouseでPostgresのプライマリキーとは異なる順序キーを定義する場合は、関連する[考慮事項](/integrations/clickpipes/postgres/ordering_keys)をすべて必ず確認してください
   :::

### 権限を確認してClickPipeを開始する {#review-permissions-and-start-the-clickpipe}

8. 権限のドロップダウンから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt='権限を確認' size='lg' border />


## 次のステップ {#whats-next}

PostgreSQLからClickHouse CloudへデータをレプリケートするClickPipeの設定が完了したら、最適なパフォーマンスを実現するためのデータのクエリとモデリング方法に集中できます。要件に最適な戦略を評価するには[移行ガイド](/migrations/postgresql/overview)を、CDCワークロードのベストプラクティスについては[重複排除戦略(CDCを使用)](/integrations/clickpipes/postgres/deduplication)および[順序キー](/integrations/clickpipes/postgres/ordering_keys)のページを参照してください。

PostgreSQL CDCに関するよくある質問やトラブルシューティングについては、[Postgres FAQページ](/integrations/clickpipes/postgres/faq)を参照してください。
