---
sidebar_label: 'MySQL から ClickHouse へのデータ取り込み'
description: 'MySQL を ClickHouse Cloud にシームレスに接続する方法を説明します。'
slug: /integrations/clickpipes/mysql
title: 'MySQL から ClickHouse へのデータ取り込み（CDC を使用）'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', 'change data capture', 'database replication']
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# MySQL から ClickHouse へのデータ取り込み（CDC 利用）

<BetaBadge/>

:::info
ClickPipes を利用した MySQL から ClickHouse Cloud へのデータ取り込みは、現在パブリックベータです。
:::

ClickPipes を使用して、MySQL のソースデータベースから ClickHouse Cloud にデータを取り込むことができます。MySQL のソースデータベースは、オンプレミス環境に配置することも、Amazon RDS や Google Cloud SQL などのサービスを利用してクラウド上に配置することもできます。



## 前提条件 {#prerequisites}

開始する前に、MySQLデータベースがbinlogレプリケーション用に正しく設定されていることを確認する必要があります。設定手順はMySQLのデプロイ方法によって異なるため、以下の該当するガイドを参照してください。

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [汎用MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [汎用MariaDB](./mysql/source/generic_maria)

ソースMySQLデータベースの設定が完了したら、ClickPipeの作成に進むことができます。


## ClickPipeの作成 {#create-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # "   TODO update image here"

1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt='ClickPipesサービス' size='lg' border />

2. 左側のメニューから`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt='インポートの選択' size='lg' border />

3. `MySQL CDC`タイルを選択します。

<Image img={mysql_tile} alt='MySQLの選択' size='lg' border />

### ソースMySQLデータベース接続の追加 {#add-your-source-mysql-database-connection}

4. 前提条件のステップで設定したソースMySQLデータベースの接続詳細を入力します。

   :::info
   接続詳細の追加を開始する前に、ファイアウォールルールでClickPipesのIPアドレスをホワイトリストに登録していることを確認してください。次のページで[ClickPipesのIPアドレスリスト](../index.md#list-of-static-ips)を確認できます。
   詳細については、[このページの上部](#prerequisites)にリンクされているソースMySQLセットアップガイドを参照してください。
   :::

   <Image
     img={mysql_connection_details}
     alt='接続詳細の入力'
     size='lg'
     border
   />

#### (オプション) SSHトンネリングの設定 {#optional-set-up-ssh-tunneling}

ソースMySQLデータベースが公開アクセス可能でない場合、SSHトンネリングの詳細を指定できます。

1. 「Use SSH Tunnelling」トグルを有効にします。
2. SSH接続の詳細を入力します。

   <Image img={ssh_tunnel} alt='SSHトンネリング' size='lg' border />

3. 鍵ベース認証を使用するには、「Revoke and generate key pair」をクリックして新しい鍵ペアを生成し、生成された公開鍵をSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「Verify Connection」をクリックして接続を検証します。

:::note
ClickPipesがSSHトンネルを確立できるように、SSH踏み台ホストのファイアウォールルールで[ClickPipesのIPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに登録してください。
:::

接続詳細の入力が完了したら、`Next`をクリックします。

#### 詳細設定の構成 {#advanced-settings}

必要に応じて詳細設定を構成できます。各設定の簡単な説明を以下に示します:

- **Sync interval**: ClickPipesがソースデータベースの変更をポーリングする間隔です。これは宛先ClickHouseサービスに影響を与えるため、コストに敏感なユーザーには、この値を高く設定すること(`3600`以上)を推奨します。
- **Parallel threads for initial load**: 初期スナップショットの取得に使用される並列ワーカーの数です。多数のテーブルがあり、初期スナップショットの取得に使用される並列ワーカーの数を制御したい場合に便利です。この設定はテーブルごとに適用されます。
- **Pull batch size**: 1回のバッチで取得する行数です。これはベストエフォート設定であり、すべてのケースで保証されるわけではありません。
- **Snapshot number of rows per partition**: 初期スナップショット中に各パーティションで取得される行数です。テーブルに多数の行があり、各パーティションで取得される行数を制御したい場合に便利です。
- **Snapshot number of tables in parallel**: 初期スナップショット中に並列で取得されるテーブルの数です。多数のテーブルがあり、並列で取得されるテーブルの数を制御したい場合に便利です。

### テーブルの構成 {#configure-the-tables}

5. ここでClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image
     img={select_destination_db}
     alt='宛先データベースの選択'
     size='lg'
     border
   />

6. ソースMySQLデータベースからレプリケートするテーブルを選択できます。テーブルを選択する際、宛先ClickHouseデータベースでテーブル名を変更したり、特定のカラムを除外したりすることもできます。

### 権限の確認とClickPipeの開始 {#review-permissions-and-start-the-clickpipe}

7. 権限ドロップダウンから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt='権限の確認' size='lg' border />

最後に、一般的な問題とその解決方法の詳細については、[「ClickPipes for MySQL FAQ」](/integrations/clickpipes/mysql/faq)ページを参照してください。


## 次のステップ {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

MySQLからClickHouse CloudへデータをレプリケートするためのClickPipeの設定が完了したら、最適なパフォーマンスを実現するためのデータのクエリ方法とモデリング方法に集中できます。MySQL CDCに関するよくある質問やトラブルシューティングについては、[MySQL FAQsページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。
