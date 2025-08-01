---
sidebar_label: 'ClickPipes for MySQL'
description: 'Describes how to seamlessly connect your MySQL to ClickHouse Cloud.'
slug: '/integrations/clickpipes/mysql'
title: 'Ingesting Data from MySQL to ClickHouse (using CDC)'
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


# MySQLからClickHouseへのCDCを使用したデータの取り込み

<BetaBadge/>

:::info
現在、ClickPipesを介してClickHouse CloudにMySQLからデータを取り込むことはプライベートプレビュー中です。
:::

ClickPipesを使用して、ソースのMySQLデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのMySQLデータベースは、オンプレミスまたはクラウドにホストされている可能性があります。

## 前提条件 {#prerequisites}

まず、MySQLデータベースが正しく設定されていることを確認してください。ソースのMySQLインスタンスに応じて、次のガイドのいずれかに従ってください。

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Amazon RDS MariaDB](./mysql/source/rds_maria)

ソースのMySQLデータベースが設定されたら、ClickPipeの作成を続けることができます。

## ClickPipeを作成する {#creating-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントをお持ちでない場合は、[こちらからサインアップ](https://cloud.clickhouse.com/)できます。

[//]: # (   TODO update image here)
1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューから`データソース`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. `MySQL CDC`タイルを選択します。

<Image img={mysql_tile} alt="MySQLを選択" size="lg" border/>

### ソースのMySQLデータベース接続を追加する {#adding-your-source-mysql-database-connection}

4. 前提条件のステップで構成したソースのMySQLデータベースの接続詳細を入力します。

   :::info

   接続詳細を追加する前に、ファイアウォールルールでClickPipesのIPアドレスをホワイトリストに登録していることを確認してください。次のページには、[ClickPipesのIPアドレスのリスト](../index.md#list-of-static-ips)があります。
   詳細については、[このページの上部](#prerequisites)にリンクされているソースのMySQL設定ガイドを参照してください。

   :::

   <Image img={mysql_connection_details} alt="接続詳細を入力" size="lg" border/>

#### (オプション) SSHトンネリングの設定 {#optional-setting-up-ssh-tunneling}

ソースのMySQLデータベースが公開アクセスできない場合は、SSHトンネリングの詳細を指定できます。

1. 「SSHトンネリングを使用する」トグルを有効にします。
2. SSH接続詳細を入力します。

   <Image img={ssh_tunnel} alt="SSHトンネリング" size="lg" border/>

3. キーベースの認証を使用する場合は、「キーペアを取り消して生成」をクリックして新しいキーを生成し、生成された公開キーをSSHサーバーの`~/.ssh/authorized_keys`にコピーします。
4. 「接続を確認」をクリックして接続を確認します。

:::note

ClickPipesがSSHトンネルを確立できるように、SSHバスチオンホストのファイアウォールルールで[ClickPipesのIPアドレス](../clickpipes#list-of-static-ips)をホワイトリストに登録してください。

:::

接続詳細が入力されたら、「次へ」をクリックします。

#### 詳細設定の構成 {#advanced-settings}

必要に応じて詳細設定を構成できます。各設定の簡単な説明は以下の通りです。

- **同期間隔**: これはClickPipesがソースデータベースをポーリングして変更を確認する間隔です。コストに敏感なユーザーには、これを高い値（`3600`を超える）に設定することを推奨します。
- **初回ロードのための並列スレッド**: これは初回スナップショットを取得するために使用される並列作業者の数です。テーブルの数が多い場合に、初回スナップショットを取得するために使用される並列作業者の数を制御するのに役立ちます。この設定はテーブルごとです。
- **プルバッチサイズ**: 単一バッチで取得する行の数です。これは最善の努力としての設定であり、すべてのケースで適用されるとは限りません。
- **スナップショットごとのパーティションの行数**: 初回スナップショット中に各パーティションで取得される行の数です。テーブルに多くの行がある場合に、各パーティションで取得される行の数を制御するのに役立ちます。
- **スナップショットのテーブル数**: 初回スナップショット中に並列で取得されるテーブルの数です。テーブルの数が多い場合に、並列で取得されるテーブルの数を制御するのに役立ちます。

### テーブルの構成 {#configuring-the-tables}

5. ここで、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成することができます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

6. ソースのMySQLデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際に、宛先のClickHouseデータベースでテーブルの名称を変更したり、特定のカラムを除外することも可能です。

### 権限を確認してClickPipeを開始する {#review-permissions-and-start-the-clickpipe}

7. 権限のドロップダウンから「フルアクセス」ロールを選択し、「セットアップを完了」をクリックします。

   <Image img={ch_permissions} alt="権限を確認" size="lg" border/>

最後に、一般的な問題とその解決方法についての詳細は、["ClickPipes for MySQLFAQ"](/integrations/clickpipes/mysql/faq)ページを参照してください。
