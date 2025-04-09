---
sidebar_label: ClickPipes for Postgres
description: Seamlessly connect your Postgres to ClickHouse Cloud.
slug: /integrations/clickpipes/postgres
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'


# PostgresからClickHouseへのデータ取り込み (CDCを使用)

<BetaBadge/>

:::info
現在、ClickPipesを通じてPostgresからClickHouse Cloudへのデータ取り込みは、パブリックベータ版です。
:::


ClickPipesを使用して、ソースのPostgresデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのPostgresデータベースは、オンプレミスまたはクラウドにホストされている可能性があり、Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabaseなどを含みます。


## 前提条件 {#prerequisites}

始めるには、まずPostgresデータベースが正しく設定されていることを確認する必要があります。ソースPostgresインスタンスによっては、次のいずれかのガイドに従うことができます：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Supabase Postgres](./postgres/source/supabase)

3. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

4. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

5. [Neon Postgres](./postgres/source/neon-postgres)

6. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

7. [Generic Postgres Source](./postgres/source/generic)、他のPostgresプロバイダーを使用している場合やセルフホステッドインスタンスを使用している場合


:::warning

PgBouncer、RDS Proxy、Supabase PoolerなどのPostgresプロキシは、CDCベースのレプリケーションには対応していません。ClickPipesの設定には、必ず実際のPostgresデータベースの接続詳細を追加するようにしてください。

:::

ソースのPostgresデータベースが設定できたら、ClickPipeの作成を続けることができます。

## ClickPipeの作成 {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。アカウントをまだお持ちでない場合は、[ここ](https://cloud.clickhouse.com/)にサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<img src={cp_service} alt="ClickPipes service" />

2. 左側のメニューで`Data Sources`ボタンを選択し、「ClickPipeをセットアップする」をクリックします。

<img src={cp_step0} alt="Select imports" />

3. `Postgres CDC`タイルを選択します。

### ソースPostgresデータベース接続の追加 {#adding-your-source-postgres-database-connection}

4. 前提条件で設定したソースPostgresデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、ClickPipesのIPアドレスをファイアウォールのルールにホワイトリスト登録していることを確認してください。ClickPipesのIPアドレスのリストは[こちら](../index.md#list-of-static-ips)にあります。
   より詳しい情報は、[このページの一番上](#prerequisites)にリンクされているソースPostgres設定ガイドを参照してください。

   :::

   <img src={postgres_connection_details} alt="Fill in connection details" />

#### (オプション) SSHトンネルの設定 {#optional-setting-up-ssh-tunneling}

ソースのPostgresデータベースが公開されていない場合は、SSHトンネルの詳細を指定できます。

1. 「SSHトンネリングを使用する」トグルを有効にします。
2. SSH接続の詳細を入力します。

   <img src={ssh_tunnel} alt="SSH tunneling" />

3. キーベースの認証を使用するには、「キー ペアを取り消して生成」をクリックして新しいキー ペアを生成し、生成された公開キーをSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「接続を確認」をクリックして接続を確認します。

:::note

ClickPipesがSSHトンネルを確立できるように、SSHバスティオンホストに対して[ClickPipes IPアドレス](../clickpipes#list-of-static-ips)をファイアウォールのルールにホワイトリスト登録することを忘れないでください。

:::

接続詳細が入力できたら、「次へ」をクリックします。

### レプリケーション設定の構成 {#configuring-the-replication-settings}

5. 前提条件のステップで作成したレプリケーションスロットをドロップダウンリストから選択します。

   <img src={select_replication_slot} alt="Select replication slot" />

#### 高度な設定 {#advanced-settings}

必要に応じて高度な設定を構成できます。各設定の簡単な説明は以下の通りです：

- **同期間隔**: これはClickPipesがソースデータベースを変更内容についてポーリングする間隔です。コストに敏感なユーザーには、これを高めの値（`3600`以上）に保つことをお勧めします。
- **初期読み込み用の並列スレッド数**: 初期スナップショットを取得するために使用される並列作業者の数です。多数のテーブルがある場合や初期スナップショットを取得するための並列作業者の数を制御したい場合に便利です。この設定はテーブルごとに適用されます。
- **プルバッチサイズ**: 単一バッチで取得する行の数です。これは最善を尽くした設定であり、すべてのケースで遵守されるわけではありません。
- **各パーティションのスナップショット行数**: 初期スナップショット中に各パーティションで取得される行の数です。テーブルに多数の行がある場合に、各パーティションで取得される行の数を制御するのに便利です。
- **並列スナップショットのテーブル数**: 初期スナップショット中に並列で取得されるテーブルの数です。多数のテーブルがある場合に、並列で取得されるテーブルの数を制御するのに便利です。


### テーブルの構成 {#configuring-the-tables}

6. ここでは、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <img src={select_destination_db} alt="Select destination database" />
   
7. ソースPostgresデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際に、宛先ClickHouseデータベースでのテーブル名の変更や特定のカラムの除外を選択することもできます。

   :::warning

   ClickHouseでのOrdering KeyをPostgresの主キーとは異なる形で定義している場合は、すべての[考慮事項](https://docs.peerdb.io/mirror/ordering-key-different)を読むことを忘れないでください！

   :::

### 権限を確認してClickPipeを開始 {#review-permissions-and-start-the-clickpipe}

8. 権限のドロップダウンから「フルアクセス」ロールを選択し、「セットアップを完了」をクリックします。

   <img src={ch_permissions} alt="Review permissions" />

## 次は何ですか？ {#whats-next}

PostgresからClickHouseにデータを移行した後の次の明確な質問は、ClickHouseでデータをどのようにモデル化してそれを最大限に活用するかです。ClickHouseでのデータモデルの作成を支援するために、[ClickHouse Data Modeling Tips for Postgres users](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling)をご参照ください。

また、一般的な問題やその解決方法に関する詳細は、[ClickPipes for Postgres FAQ](./postgres/faq)をご参照ください。

:::info

[こちら](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling)は特に重要です。ClickHouseはPostgresと異なり、いくつかの驚きに直面するかもしれません。このガイドは潜在的な落とし穴に対処し、ClickHouseを最大限に活用できるようにします。

:::
