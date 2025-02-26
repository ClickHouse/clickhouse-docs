---
sidebar_label: ClickPipes for Postgres
description: Seamlessly connect your Postgres to ClickHouse Cloud.
slug: /integrations/clickpipes/postgres
---

import BetaBadge from '@theme/badges/BetaBadge';

# PostgresからClickHouseへのデータ取り込み (CDCを使用)

<BetaBadge/>

:::info
現在、ClickPipesを介してPostgresからClickHouse Cloudへのデータ取り込みは公開ベータ版です。
:::


ClickPipesを使用して、ソースのPostgresデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのPostgresデータベースは、オンプレミスまたはクラウドにホストされている可能性があり、Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabaseなどが含まれます。


## 前提条件 {#prerequisites}

始めるには、まずPostgresデータベースが正しく設定されていることを確認する必要があります。ソースのPostgresインスタンスに応じて、以下のガイドのいずれかに従ってください。

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Supabase Postgres](./postgres/source/supabase)

3. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

4. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

5. [Neon Postgres](./postgres/source/neon-postgres)

6. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

7. [一般的なPostgresソース](./postgres/source/generic)、他のPostgresプロバイダを使用している場合やセルフホストされたインスタンスを使用している場合

:::warning

PgBouncer、RDS Proxy、Supabase PoolerなどのPostgresプロキシは、CDCベースのレプリケーションにはサポートされていません。ClickPipesの設定にはこれらを使用しないようにし、実際のPostgresデータベースの接続詳細を追加してください。

:::

ソースのPostgresデータベースが設定されたら、ClickPipeの作成を続けることができます。

## ClickPipeの作成 {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントがない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloud Consoleで、ClickHouse Cloudサービスに移動します。

   ![ClickPipesサービス](./../images/cp_service.png)

2. 左側のメニューから「データソース」ボタンを選択し、「ClickPipeを設定」をクリックします。

   ![インポートを選択](./../images/cp_step0.png)

3. `Postgres CDC`タイルを選択します。

   ![Postgresを選択](./images/postgres-tile.jpg)

### ソースPostgresデータベース接続の追加 {#adding-your-source-postgres-database-connection}

4. 前提条件ステップで構成したソースPostgresデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、ファイアウォールルールでClickPipesのIPアドレスをホワイトリストに登録していることを確認してください。ClickPipesのIPアドレスのリストは[こちら](../index.md#list-of-static-ips)で確認できます。
   詳細情報については、このページの[上部にリンクされているソースPostgresセットアップガイド](#prerequisites)を参照してください。

   :::

   ![接続詳細を入力](./images/postgres-connection-details.jpg)

#### (オプション) SSHトンネリングの設定 {#optional-setting-up-ssh-tunneling}

ソースのPostgresデータベースが公開アクセスできない場合は、SSHトンネリングの詳細を指定できます。

1. 「SSHトンネリングを使用する」トグルをオンにします。
2. SSH接続の詳細を入力します。

   ![SSHトンネリング](./images/ssh-tunnel.jpg)

3. キーベース認証を使用するには、「キーの取り消しと新しいキーのペアを生成」をクリックして新しいキーのペアを生成し、生成された公開キーをSSHサーバーの「~/.ssh/authorized_keys」にコピーします。
4. 「接続を確認」をクリックして接続を確認します。

:::note

ClickPipesがSSHトンネルを確立できるようにするために、SSHバスティオンホストのファイアウォールルールに[ClickPipes IPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに登録してください。

:::

接続詳細が入力されたら、「次へ」をクリックします。

### レプリケーション設定の構成 {#configuring-the-replication-settings}

5. 前提条件ステップで作成したレプリケーションスロットをドロップダウンリストから選択します。

   ![レプリケーションスロットを選択](./images/select-replication-slot.jpg)

#### 高度な設定 {#advanced-settings}

必要に応じて、高度な設定を構成できます。各設定の簡単な説明を以下に示します。

- **同期間隔**: ClickPipesがソースデータベースに変更をポーリングする間隔です。この設定は、コストに敏感なユーザーには時間が過ぎないようにすることをお勧めします（`3600`を超える価値）。
- **初期ロードの並行スレッド数**: 初期スナップショットを取得するために使用される並行作業者の数です。多くのテーブルがある場合や初期スナップショットの取得に使用される並行作業者の数を制御したい場合に便利です。この設定はテーブルごとに適用されます。
- **プルバッチサイズ**: 単一のバッチで取得する行の数です。これは最善を尽くす設定であり、すべてのケースで守られない場合があります。
- **パーティションごとのスナップショット行数**: 初期スナップショット中に各パーティションで取得される行の数です。テーブルに多くの行があり、各パーティションで取得される行の数を制御したい場合に便利です。
- **並行でのスナップショットテーブル数**: 初期スナップショット中に並行して取得されるテーブルの数です。多くのテーブルがある場合や並行して取得されるテーブルの数を制御したい場合に便利です。


### テーブルの構成 {#configuring-the-tables}

6. ここでは、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   ![宛先データベースを選択](./images/select-destination-db.jpg)

7. ソースPostgresデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際に、宛先のClickHouseデータベースでのテーブルの名前を変更したり、特定のカラムを除外することもできます。

   :::warning

   ClickHouseでOrdering KeyをPostgresのPrimary Keyと異なるように定義している場合は、必ず[考慮事項](https://docs.peerdb.io/mirror/ordering-key-different)をすべて読んでおいてください！
   
   :::

### 権限を確認し、ClickPipeを開始 {#review-permissions-and-start-the-clickpipe}

8. 権限ドロップダウンから「フルアクセス」ロールを選択し、「設定の完了」をクリックします。

   ![権限を確認](./images/ch-permissions.jpg)


## 次は何ですか？ {#whats-next}

PostgresからClickHouseにデータを移動した後、次に考えるべき明白な質問は、ClickHouseでデータをどのようにモデル化して最大限に活用できるかです。ClickHouseでデータをモデル化するための[ClickHouseデータモデル化のヒント](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling)のページを参照してください。

また、一般的な問題やそれらの解決策についての情報は、[ClickPipes for Postgres FAQ](./postgres/faq)を参照してください。

:::info

[この](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling)内容は特に重要です。ClickHouseはPostgresと異なり、いくつかの驚きに直面するかもしれません。このガイドは、潜在的な落とし穴に対処し、ClickHouseを最大限に活用できるように支援します。

:::
