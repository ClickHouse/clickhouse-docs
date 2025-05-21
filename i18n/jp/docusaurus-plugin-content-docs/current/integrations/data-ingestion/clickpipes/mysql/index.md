---
sidebar_label: 'MySQL向けClickPipes'
description: 'MySQLをClickHouse Cloudにシームレスに接続する方法を説明します。'
slug: /integrations/clickpipes/mysql
title: 'MySQLからClickHouseへのデータ取り込み（CDCを使用）'
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


# MySQLからClickHouseへのデータ取り込み（CDCを使用）

<BetaBadge/>

:::info
現在、ClickPipesを介してMySQLからClickHouse Cloudへのデータ取り込みはプライベートプレビュー中です。
:::


ClickPipesを使用して、ソースのMySQLデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのMySQLデータベースは、オンプレミスまたはクラウド上にホストできます。

## 前提条件 {#prerequisites}

始めるには、最初にMySQLデータベースが正しく設定されていることを確認する必要があります。ソースのMySQLインスタンスに応じて、以下のガイドのいずれかに従うことができます。

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Amazon RDS MariaDB](./mysql/source/rds_maria)

ソースのMySQLデータベースが設定されたら、ClickPipeの作成を続行できます。

## ClickPipeを作成する {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。もしアカウントをまだお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. `MySQL CDC`タイルを選択します。

<Image img={mysql_tile} alt="MySQLの選択" size="lg" border/>

### ソースMySQLデータベースの接続を追加する {#adding-your-source-mysql-database-connection}

4. 前提条件のステップで設定したソースMySQLデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、ファイアウォールルールでClickPipesのIPアドレスをホワイトリストに設定していることを確認してください。次のページに[ClickPipesのIPアドレスのリスト](../index.md#list-of-static-ips)があります。
   詳細については、このページの[最上部にリンクされたソースのMySQL設定ガイド](#prerequisites)を参照してください。

   :::

   <Image img={mysql_connection_details} alt="接続詳細の入力" size="lg" border/>

#### （オプション）SSHトンネリングの設定 {#optional-setting-up-ssh-tunneling}

ソースのMySQLデータベースが公開されていない場合は、SSHトンネリングの詳細を指定できます。

1. 「SSHトンネリングを使用」のトグルを有効にします。
2. SSH接続の詳細を入力します。

   <Image img={ssh_tunnel} alt="SSHトンネリング" size="lg" border/>

3. キーベースの認証を使用する場合は、「キーの取り消しとペアの生成」をクリックして新しいキーのペアを生成し、生成された公開鍵をSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「接続の確認」をクリックして接続を確認します。

:::note

ClickPipesがSSHトンネルを確立できるようにするために、SSHバスティオンホストのファイアウォールルールで[ClickPipesのIPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに設定してください。

:::

接続詳細を入力したら、「次へ」をクリックします。

#### 高度な設定の構成 {#advanced-settings}

必要に応じて高度な設定を構成できます。各設定の簡単な説明は以下の通りです。

- **同期間隔**: ClickPipesがソースデータベースを変更のためにポールする間隔です。これは、コストに敏感なユーザーには`3600`を超える高い値を保持することを推奨します。
- **初回ロード用の並列スレッド数**: 初回スナップショットを取得するために使用される並列ワーカーの数です。多くのテーブルがある場合や、初回スナップショットを取得するために使用される並列ワーカーの数を制御したい場合に便利です。この設定はテーブルごとです。
- **プルバッチサイズ**: 単一のバッチで取得する行数です。これは最善の努力に基づく設定であり、すべてのケースで尊重されるわけではありません。
- **パーティションごとのスナップショット行数**: 初回スナップショット中に各パーティションで取得される行数です。テーブルに多くの行がある場合や、各パーティションで取得される行数を制御したい場合に便利です。
- **並列で取得するスナップショットテーブル数**: 初回スナップショット中に並列で取得されるテーブルの数です。多くのテーブルがある場合や、並列で取得されるテーブル数を制御したい場合に便利です。

### テーブルの構成 {#configuring-the-tables}

5. ここで、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="宛先データベースの選択" size="lg" border/>

6. ソースのMySQLデータベースからレプリケートしたいテーブルを選択します。テーブルを選択する際には、宛先のClickHouseデータベースでテーブルの名前を変更したり、特定のカラムを除外することもできます。

### 権限を確認し、ClickPipeを開始する {#review-permissions-and-start-the-clickpipe}

7. 権限のドロップダウンから「フルアクセス」ロールを選択し、「セットアップを完了」をクリックします。

   <Image img={ch_permissions} alt="権限の確認" size="lg" border/>

最後に、一般的な問題や解決方法についての詳細は、["MySQL向けClickPipes FAQ"](/integrations/clickpipes/mysql/faq)ページを参照してください。
