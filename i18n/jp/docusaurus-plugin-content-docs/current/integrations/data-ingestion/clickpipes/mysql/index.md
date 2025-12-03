---
sidebar_label: 'MySQL から ClickHouse へのデータ取り込み'
description: 'MySQL を ClickHouse Cloud とシームレスに接続する方法について説明します。'
slug: /integrations/clickpipes/mysql
title: 'MySQL から ClickHouse へのデータ取り込み（CDC（変更データキャプチャ）の利用）'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', 'CDC（変更データキャプチャ）', 'データベースレプリケーション']
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

# MySQL から ClickHouse へのデータ取り込み（CDC の使用） {#ingesting-data-from-mysql-to-clickhouse-using-cdc}

<BetaBadge/>

:::info
ClickPipes を使用した MySQL から ClickHouse Cloud へのデータ取り込みは、現在パブリックベータ版です。
:::

ClickPipes を使用して、ソースの MySQL データベースから ClickHouse Cloud にデータを取り込むことができます。ソースの MySQL データベースは、オンプレミス環境だけでなく、Amazon RDS や Google Cloud SQL などのクラウドサービス上にホストされていても構いません。

## 前提条件 {#prerequisites}

開始するには、まず MySQL データベースが binlog レプリケーション用に正しく設定されていることを確認する必要があります。設定手順は MySQL のデプロイ方法によって異なるため、以下の該当するガイドの手順に従ってください。

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [汎用 MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [汎用 MariaDB](./mysql/source/generic_maria)

ソース MySQL データベースのセットアップが完了したら、ClickPipe の作成に進むことができます。

## ClickPipe を作成する {#create-your-clickpipe}

ClickHouse Cloud アカウントにログインしていることを確認します。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloud コンソールで、対象の ClickHouse Cloud サービスに移動します。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側メニューの `Data Sources` ボタンを選択し、「ClickPipe のセットアップ」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. `MySQL CDC` タイルを選択します。

<Image img={mysql_tile} alt="MySQL を選択" size="lg" border/>

### ソース MySQL データベース接続を追加する {#add-your-source-mysql-database-connection}

4. 事前準備のステップで設定したソース MySQL データベースの接続情報を入力します。

   :::info
   接続情報を入力し始める前に、ファイアウォールルールで ClickPipes の IP アドレスをホワイトリストに登録していることを確認してください。次のページで、[ClickPipes の IP アドレス一覧](../index.md#list-of-static-ips)を確認できます。
   さらに詳しい情報については、[このページの冒頭](#prerequisites)にリンクされているソース MySQL セットアップガイドを参照してください。
   :::

   <Image img={mysql_connection_details} alt="接続情報を入力" size="lg" border/>

#### （オプション）SSH トンネリングを設定する {#optional-set-up-ssh-tunneling}

ソース MySQL データベースがパブリックにアクセス可能でない場合は、SSH トンネリングの詳細を指定できます。

1. 「Use SSH Tunnelling」トグルを有効にします。
2. SSH 接続情報を入力します。

   <Image img={ssh_tunnel} alt="SSH トンネリング" size="lg" border/>

3. キーベース認証を使用するには、「Revoke and generate key pair」をクリックして新しいキーペアを生成し、生成された公開鍵を SSH サーバーの `~/.ssh/authorized_keys` にコピーします。
4. 「Verify Connection」をクリックして接続を検証します。

:::note
ClickPipes が SSH トンネルを確立できるように、SSH バスティオンホストのファイアウォールルールで [ClickPipes の IP アドレス](../clickpipes#list-of-static-ips)を必ずホワイトリストに登録してください。
:::

接続情報をすべて入力したら、`Next` をクリックします。

#### 詳細設定を構成する {#advanced-settings}

必要に応じて詳細設定を構成できます。各設定の簡単な説明は次のとおりです。

- **Sync interval**: ClickPipes がソースデータベースの変更をポーリングする間隔です。これは宛先の ClickHouse サービスに影響します。コストを意識するユーザーには、この値を高め（`3600` 秒以上）に保つことを推奨します。
- **Parallel threads for initial load**: 初回スナップショットの取得に使用される並列ワーカーの数です。大量のテーブルがある場合に、初回スナップショット取得時に使用される並列ワーカー数を制御するのに有用です。この設定はテーブル単位です。
- **Pull batch size**: 1 回のバッチで取得する行数です。ベストエフォートの設定であり、すべての場合で厳密に守られるとは限りません。
- **Snapshot number of rows per partition**: 初回スナップショット中に各パーティションで取得される行数です。テーブル内の行数が多い場合に、各パーティションで取得される行数を制御するのに有用です。
- **Snapshot number of tables in parallel**: 初回スナップショット中に並列で取得されるテーブル数です。テーブル数が多い場合に、並列で取得するテーブル数を制御するのに有用です。

### テーブルを構成する {#configure-the-tables}

5. ここで ClickPipe の宛先データベースを選択できます。既存のデータベースを選択するか、新しく作成することもできます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

6. ソース MySQL データベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際、宛先の ClickHouse データベースでテーブル名を変更したり、特定のカラムを除外したりすることも可能です。

### 権限を確認して ClickPipe を開始する {#review-permissions-and-start-the-clickpipe}

7. 権限のドロップダウンから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt="権限を確認" size="lg" border/>

最後に、一般的な問題とその解決方法については、「[ClickPipes for MySQL FAQ](/integrations/clickpipes/mysql/faq)」ページを参照してください。

## 次のステップ {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

MySQL から ClickHouse Cloud へのデータレプリケーション用に ClickPipe のセットアップが完了したら、最適なパフォーマンスを得るために、データのクエリやモデリングに注力できます。MySQL CDC（変更データキャプチャ）およびトラブルシューティングに関するよくある質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。
