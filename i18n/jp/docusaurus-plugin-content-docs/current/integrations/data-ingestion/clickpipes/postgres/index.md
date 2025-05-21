---
sidebar_label: 'PostgresからClickHouseへのデータ取り込み'
description: 'あなたのPostgresをClickHouse Cloudにシームレスに接続します。'
slug: /integrations/clickpipes/postgres
title: 'PostgresからClickHouseへのデータ取り込み (CDCを使用)'
---
```

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


# PostgresからClickHouseへのデータ取り込み (CDCを使用)

<BetaBadge/>

:::info
現在、ClickPipesを介してPostgresからClickHouse Cloudにデータを取り込むことはパブリックベータ版です。
:::


ClickPipesを使用して、ソースのPostgresデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのPostgresデータベースは、オンプレミスまたはAmazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabaseなどのクラウドにホストすることができます。


## 前提条件 {#prerequisites}

始めるには、まずPostgresデータベースが正しく設定されていることを確認する必要があります。ソースPostgresインスタンスに応じて、次のいずれかのガイドに従うことができます：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic)、他のPostgresプロバイダを使用している場合やセルフホストインスタンスを使用している場合

9. [TimescaleDB](./postgres/source/timescale)、管理サービスまたはセルフホストインスタンスでTimescaleDB拡張を使用している場合


:::warning

PgBouncer、RDS Proxy、Supabase PoolerなどのPostgresプロキシはCDCベースのレプリケーションに対応していません。ClickPipesの設定にそれらを使用しないようにし、実際のPostgresデータベースの接続詳細を追加してください。

:::

ソースのPostgresデータベースが設定されたら、ClickPipeの作成を続けることができます。

## ClickPipeの作成 {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントを持っていない場合は、[こちら](https://cloud.clickhouse.com/)でサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloud Consoleで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューで`データソース`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. `Postgres CDC`タイルを選択します。

   <Image img={postgres_tile} alt="Postgresを選択" size="lg" border/>

### ソースのPostgresデータベース接続の追加 {#adding-your-source-postgres-database-connection}

4. 前提条件のステップで設定したソースPostgresデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、ファイアウォールルールにClickPipesのIPアドレスをホワイトリストに登録していることを確認してください。ClickPipesのIPアドレスのリストは[こちら](../index.md#list-of-static-ips)で確認できます。
   詳細については、[このページの上部](#prerequisites)にリンクされているソースPostgres設定ガイドを参照してください。

   :::

   <Image img={postgres_connection_details} alt="接続詳細を入力" size="lg" border/>

#### (オプション) AWS Private Linkの設定 {#optional-setting-up-aws-private-link}

AWSにホストされているソースPostgresデータベースに接続するためにAWS Private Linkを使用できます。これはデータ転送をプライベートに保ちたい場合に便利です。
接続設定のための[セットアップガイド](/integrations/clickpipes/aws-privatelink)に従ってください。

#### (オプション) SSHトンネリングの設定 {#optional-setting-up-ssh-tunneling}

ソースのPostgresデータベースが公開されていない場合は、SSHトンネリングの詳細を指定できます。


1. 「SSHトンネリングを使用」のトグルを有効にします。
2. SSH接続詳細を入力します。

   <Image img={ssh_tunnel} alt="SSHトンネリング" size="lg" border/>

3. キーベース認証を使用する場合は、「キーの取り消しとペアの生成」をクリックして新しいキーのペアを生成し、生成された公開キーをSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「接続を確認」をクリックして、接続を確認します。

:::note

ClickPipesがSSHトンネルを確立できるように、SSHバスチョンホストのファイアウォールルールに[ClickPipesのIPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに登録してください。

:::

接続詳細を入力したら、「次へ」をクリックします。

### レプリケーション設定の構成 {#configuring-the-replication-settings}

5. 前提条件のステップで作成したレプリケーションスロットをドロップダウンリストから選択してください。

   <Image img={select_replication_slot} alt="レプリケーションスロットを選択" size="lg" border/>

#### 高度な設定 {#advanced-settings}

必要に応じて高度な設定を構成できます。各設定の簡単な説明は以下に示します：

- **同期間隔**: ClickPipesがソースデータベースから変更をポーリングする間隔です。これは、コストに敏感なユーザーにとってはより高い値（`3600`を超える）に保つことをお勧めします。
- **初期ロード用の並行スレッド数**: 初期スナップショットを取得するために使用される並行作業者の数です。これは多くのテーブルがある場合に便利で、初期スナップショットを取得するために使用される並行作業者の数を制御できます。この設定はテーブルごとです。
- **プルバッチサイズ**: 単一バッチで取得する行の数です。これは最良の努力設定であり、すべてのケースで尊重されるわけではありません。
- **パーティションごとのスナップショット行数**: 初期スナップショット中に各パーティションで取得される行の数です。これはテーブル内に多くの行がある場合に便利で、各パーティションで取得される行の数を制御できます。
- **並行してスナップショットに取得するテーブルの数**: 初期スナップショット中に並行して取得されるテーブルの数です。これは多くのテーブルがある場合に便利で、並行して取得されるテーブルの数を制御できます。


### テーブルの構成 {#configuring-the-tables}

6. ここで、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

7. ソースのPostgresデータベースからレプリケートするテーブルを選択できます。テーブルを選択する際、宛先ClickHouseデータベース内でテーブルの名前を変更したり、特定のカラムを除外したりすることもできます。

   :::warning
   ClickHouseでOrdering KeyをPostgresの主キーと異なるように定義する場合は、すべての[考慮事項](/integrations/clickpipes/postgres/ordering_keys)を読むことを忘れないでください！
   :::

### アクセス権を確認し、ClickPipeを開始 {#review-permissions-and-start-the-clickpipe}

8. アクセス権のドロップダウンから「フルアクセス」ロールを選択し、「セットアップを完了」をクリックします。

   <Image img={ch_permissions} alt="アクセス権を確認" size="lg" border/>

## 次は何ですか？ {#whats-next}

PostgresからClickHouseにデータを移動した後、次に考えられる質問は、ClickHouseでデータをクエリし、モデル化して最大限に活用する方法です。PostgreSQLからClickHouseへの移行方法に関するステップバイステップのアプローチについては、[移行ガイド](/migrations/postgresql/overview)を参照してください。移行ガイドと共に、[デデュプリケーション戦略（CDCを使用）](/integrations/clickpipes/postgres/deduplication)や[Ordering Keys](/integrations/clickpipes/postgres/ordering_keys)に関するページも確認して、重複を処理し、CDCを使用する際にOrdering Keysをカスタマイズする方法を理解してください。

最後に、一般的な問題やその解決方法についての詳細は、["ClickPipes for Postgres FAQ"](/integrations/clickpipes/postgres/faq)ページを参照してください。
