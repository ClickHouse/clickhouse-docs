---
'sidebar_label': 'PostgresからClickHouseへのデータ取り込み'
'description': 'シームレスにあなたのPostgresをClickHouse Cloudに接続します。'
'slug': '/integrations/clickpipes/postgres'
'title': 'PostgresからClickHouseへのデータ取り込み（CDCを使用）'
'doc_type': 'guide'
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


# Postgres から ClickHouse へのデータの取り込み (CDCを使用)

ClickPipesを使用して、ソースのPostgresデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのPostgresデータベースは、オンプレミスまたはAmazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabaseなどのクラウドにホストされることがあります。

## 前提条件 {#prerequisites}

始める前に、まずPostgresデータベースが正しくセットアップされていることを確認する必要があります。ソースのPostgresインスタンスに応じて、以下のガイドのいずれかに従うことができます。

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic)、他のPostgresプロバイダーを使用している場合やセルフホストのインスタンスを使用している場合。

9. [TimescaleDB](./postgres/source/timescale)、管理サービスまたはセルフホストインスタンスでTimescaleDB拡張を使用している場合。

:::warning

PgBouncer、RDS Proxy、Supabase PoolerなどのPostgresプロキシはCDCベースのレプリケーションではサポートされていません。ClickPipesのセットアップには、実際のPostgresデータベースの接続詳細を追加するようにしてください。

:::

ソースのPostgresデータベースがセットアップされたら、ClickPipeの作成を続けることができます。

## ClickPipeの作成 {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントを作成していない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. `Postgres CDC`タイルを選択します。

   <Image img={postgres_tile} alt="Select Postgres" size="lg" border/>

### ソースPostgresデータベース接続の追加 {#adding-your-source-postgres-database-connection}

4. 前提条件ステップで構成したソースのPostgresデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、ClickPipesのIPアドレスがファイアウォール規則でホワイトリストに登録されていることを確認してください。ClickPipesのIPアドレスのリストは[こちら](../index.md#list-of-static-ips)から確認できます。
   詳細については、[このページの最上部](#prerequisites)にリンクされているソースPostgresのセットアップガイドを参照してください。

   :::

   <Image img={postgres_connection_details} alt="Fill in connection details" size="lg" border/>

#### (オプション) AWS Private Linkの設定 {#optional-setting-up-aws-private-link}

データ転送をプライベートに保ちたい場合、AWSにホストされているソースのPostgresデータベースに接続するためにAWS Private Linkを使用できます。
接続を設定するための[セットアップガイド](https://integrations/clickpipes/aws-privatelink)に従うことができます。

#### (オプション) SSHトンネリングの設定 {#optional-setting-up-ssh-tunneling}

ソースのPostgresデータベースが公開されていない場合、SSHトンネリングの詳細を指定できます。

1. 「Use SSH Tunnelling」トグルを有効にします。
2. SSH接続の詳細を入力します。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. キーベースの認証を使用する場合は、「Revoke and generate key pair」をクリックして新しいキーペアを生成し、生成された公開鍵をSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「Verify Connection」をクリックして接続を確認します。

:::note

SSHバスティオンホストのファイアウォール規則に[ClickPipesのIPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに登録して、ClickPipesがSSHトンネルを確立できるようにしてください。

:::

接続詳細が入力されたら、「Next」をクリックします。

### レプリケーション設定の構成 {#configuring-the-replication-settings}

5. 前提条件ステップで作成したレプリケーションスロットをドロップダウンリストから選択してください。

   <Image img={select_replication_slot} alt="Select replication slot" size="lg" border/>

#### 高度な設定 {#advanced-settings}

必要に応じて高度な設定を構成できます。各設定の簡単な説明は以下の通りです：

- **Sync interval**: ClickPipesがソースデータベースの変更をポーリングする間隔です。これは、コストに敏感なユーザーには3600を超える高い値を推奨します。
- **Parallel threads for initial load**: 初期スナップショットを取得するために使用される並行ワーカーの数です。多くのテーブルがある場合に初期スナップショットを取得する並行ワーカーの数を制御するのに便利です。この設定はテーブルごとに適用されます。
- **Pull batch size**: 一度に取得する行数です。この設定は努力の結果であり、すべてのケースで尊重されるわけではありません。
- **Snapshot number of rows per partition**: 初期スナップショットの際に各パーティションで取得される行数です。テーブルに多くの行がある場合、各パーティションで取得する行数を制御するのに便利です。
- **Snapshot number of tables in parallel**: 初期スナップショットの際に並行して取得されるテーブルの数です。多くのテーブルがある場合、並行して取得されるテーブルの数を制御するのに便利です。

### テーブルの構成 {#configuring-the-tables}

6. ここでClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

7. ソースのPostgresデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際に、宛先のClickHouseデータベース内でテーブルの名前を変更したり、特定のカラムを除外したりすることもできます。

   :::warning
   ClickHouseで決定キーをPostgresの主キーとは異なる方法で定義している場合は、関連するすべての[考慮事項](/integrations/clickpipes/postgres/ordering_keys)を忘れないでください。
   :::

### 権限を確認し、ClickPipeを開始 {#review-permissions-and-start-the-clickpipe}

8. 権限のドロップダウンから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 次は何ですか？ {#whats-next}

ClickPipeがPostgreSQLからClickHouse Cloudへのデータのレプリケーションを設定したら、データを最適なパフォーマンスのためにクエリし、モデル化する方法に集中できます。ニーズに最適な戦略を判断するための[移行ガイド](/migrations/postgresql/overview)や、CDCワークロードのベストプラクティスに関する[重複排除戦略 (CDCを使用)](/integrations/clickpipes/postgres/deduplication)および[並びキー](/integrations/clickpipes/postgres/ordering_keys)ページを参照してください。

PostgreSQL CDCおよびトラブルシューティングに関する共通の質問については、[Postgres FAQsページ](/integrations/clickpipes/postgres/faq)をご覧ください。
