---
'sidebar_label': 'Ingesting Data from Postgres to ClickHouse'
'description': 'Seamlessly connect your Postgres to ClickHouse Cloud.'
'slug': '/integrations/clickpipes/postgres'
'title': 'Ingesting Data from Postgres to ClickHouse (using CDC)'
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


# PostgresからClickHouseへのデータ取り込み（CDCを使用）

<BetaBadge/>

:::info
現在、ClickPipesを使用してPostgresからClickHouse Cloudへのデータ取り込みはパブリックベータ版にあります。
:::


ClickPipesを使用して、ソースのPostgresデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのPostgresデータベースは、オンプレミスまたはクラウドにホストされていることができます（Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabaseなどを含む）。


## 前提条件 {#prerequisites}

始めるには、まずPostgresデータベースが正しく設定されていることを確認する必要があります。ソースのPostgresインスタンスに応じて、以下のガイドのいずれかに従ってください：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic)（他のPostgresプロバイダーを使用しているか、セルフホストのインスタンスを使用している場合）

9. [TimescaleDB](./postgres/source/timescale)（マネージドサービスまたはセルフホストのインスタンスでTimescaleDB拡張機能を使用している場合）


:::warning

PgBouncer、RDS Proxy、Supabase PoolerなどのPostgresプロキシは、CDCベースのレプリケーションに対応していません。ClickPipesのセットアップにはそれらを使用しないようにし、実際のPostgresデータベースの接続情報を追加してください。

:::

ソースのPostgresデータベースが設定されたら、ClickPipeの作成を続けることができます。

## ClickPipeの作成 {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューで「データソース」ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. 「Postgres CDC」タイルを選択します。

   <Image img={postgres_tile} alt="Postgresを選択" size="lg" border/>

### ソースのPostgresデータベース接続の追加 {#adding-your-source-postgres-database-connection}

4. 前提条件ステップで構成したソースのPostgresデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、クリックパイプのIPアドレスをファイアウォールルールにホワイトリストに追加していることを確認してください。ClickPipesのIPアドレスのリストは[こちら](../index.md#list-of-static-ips)で確認できます。
   さらなる情報については、[このページの先頭にリンクされているソースPostgres設定ガイドを参照してください](#prerequisites)。

   :::

   <Image img={postgres_connection_details} alt="接続詳細を入力" size="lg" border/>

#### (オプショナル) AWSプライベートリンクの設定 {#optional-setting-up-aws-private-link}

AWSにホストされているソースPostgresデータベースに接続するには、AWSプライベートリンクを使用できます。データ転送をプライベートに保ちたい場合に便利です。
接続を設定するための[セットアップガイドをこちらで確認](../integrations/clickpipes/aws-privatelink)できます。

#### (オプショナル) SSHトンネリングの設定 {#optional-setting-up-ssh-tunneling}

ソースのPostgresデータベースが公開されていない場合、SSHトンネリングの詳細を指定することができます。


1. 「SSHトンネリングを使用する」トグルを有効にします。
2. SSH接続詳細を入力します。

   <Image img={ssh_tunnel} alt="SSHトンネリング" size="lg" border/>

3. キーベースの認証を使用するには、「キーのペアを取り消して生成」をクリックして新しいキーのペアを生成し、生成された公開キーをSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「接続を確認」をクリックして接続を確認します。

:::note

SSHバスティオンホストのファイアウォールルールに[ClickPipes IPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに追加し、ClickPipesがSSHトンネルを確立できるようにしてください。

:::

接続詳細の入力が完了したら、「次へ」をクリックします。

### レプリケーション設定の構成 {#configuring-the-replication-settings}

5. 前提条件ステップで作成したレプリケーションスロットをドロップダウンリストから選択してください。

   <Image img={select_replication_slot} alt="レプリケーションスロットを選択" size="lg" border/>

#### 高度な設定 {#advanced-settings}

必要に応じて、高度な設定を構成できます。各設定の簡単な説明を以下に示します：

- **同期間隔**：これは、ClickPipesがソースデータベースを変更のためにポーリングする間隔です。これは、コストに敏感なユーザーにとって重要で、高い値（`3600`以上）に設定することをお勧めします。
- **初期ロードのための並列スレッド数**：これは、初期スナップショットを取得するために使用される並列ワーカーの数です。多数のテーブルがある場合、初期スナップショットを取得するために使用される並列ワーカーの数を制御したい場合に便利です。この設定はテーブルごとに適用されます。
- **プルバッチサイズ**：単一バッチで取得する行の数です。これは最善を尽くす設定であり、すべてのケースで遵守されるわけではありません。
- **パーティションごとのスナップショットの行数**：これは、初期スナップショット中に各パーティションで取得される行の数です。テーブルに多くの行がある場合、各パーティションで取得される行の数を制御したい場合に便利です。
- **並列でのスナップショットテーブル数**：これは、初期スナップショット中に並列で取得されるテーブルの数です。多数のテーブルがある場合、並列で取得するテーブルの数を制御したい場合に便利です。


### テーブルの構成 {#configuring-the-tables}

6. ここで、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

7. ソースのPostgresデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際、宛先のClickHouseデータベース内でテーブルの名前を変更したり、特定のカラムを除外したりすることもできます。

   :::warning
   ClickHouseでのOrdering KeyをPostgresの主キーと異なるように定義している場合は、[考慮事項](/integrations/clickpipes/postgres/ordering_keys)をすべてお読みください！
   :::

### 権限を確認し、ClickPipeを開始 {#review-permissions-and-start-the-clickpipe}

8. 権限のドロップダウンから「フルアクセス」ロールを選択し、「セットアップを完了」をクリックします。

   <Image img={ch_permissions} alt="権限を確認" size="lg" border/>

## 次は何ですか？ {#whats-next}

PostgresからClickHouseにデータを移動した後の次の明白な質問は、ClickHouseでデータをクエリし、モデル化して最大限に活用する方法です。PostgreSQLからClickHouseへの移行方法に関する段階的アプローチについては、[移行ガイド](/migrations/postgresql/overview)を参照してください。移行ガイドに加えて、[重複排除戦略（CDC使用）](/integrations/clickpipes/postgres/deduplication)や[Ordering Keys](/integrations/clickpipes/postgres/ordering_keys)に関するページを確認して、重複を処理し、CDCを使用する際にOrdering Keysをカスタマイズする方法を理解してください。

最後に、一般的な問題とその解決方法に関する詳細は、["ClickPipes for Postgres FAQ"](/integrations/clickpipes/postgres/faq)ページを参照してください。
