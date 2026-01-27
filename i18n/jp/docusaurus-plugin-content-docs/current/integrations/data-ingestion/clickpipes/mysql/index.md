---
sidebar_label: 'MySQL から ClickHouse へのデータ取り込み'
description: 'MySQL または MariaDB データベースから ClickHouse Cloud にデータをシームレスに取り込む方法について説明します。'
slug: /integrations/clickpipes/mysql
title: 'MySQL から ClickHouse へのデータ取り込み（CDC（変更データキャプチャ）の利用）'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', 'CDC（変更データキャプチャ）', 'データベースレプリケーション']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import Aurorasvg from '@site/static/images/integrations/logos/amazon_aurora.svg';
import AFSsvg from '@site/static/images/integrations/logos/azure_database_mysql.svg';
import CloudSQLsvg from '@site/static/images/integrations/logos/gcp_cloudsql.svg';
import MariaDBsvg from '@site/static/images/integrations/logos/mariadb.svg';
import MySQLsvg from '@site/static/images/integrations/logos/mysql.svg';
import RDSsvg from '@site/static/images/integrations/logos/amazon_rds.svg';
import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# MySQL から ClickHouse へのデータインジェスト（CDC の利用） \{#ingesting-data-from-mysql-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
ClickPipes を介して MySQL から ClickHouse Cloud へデータをインジェストする機能は、現在パブリックベータ段階にあります。
:::

MySQL ClickPipe は、MySQL および MariaDB データベースから ClickHouse Cloud へデータを取り込むための、フルマネージドで堅牢な手段を提供します。1 回限りのインジェストを行う **一括ロード（bulk loads）** と、継続的なインジェストを行う **Change Data Capture (CDC)** の両方をサポートします。

MySQL ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できます。将来的には、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を用いて、MySQL ClickPipes をプログラム的にデプロイおよび管理できるようになる予定です。

## 前提条件 \{#prerequisites\}

[//]: # "TODO Binlog replication configuration is not needed for one-time ingestion pipes. This has been a source of confusion in the past, so we should also provide the bare minimum requirements for bulk loads to avoid scaring users off."

開始するには、まず MySQL データベースが binlog レプリケーション用に正しく設定されていることを確認する必要があります。設定手順は MySQL のデプロイ方法によって異なるため、以下の該当するガイドの手順に従ってください。

### サポートされているデータソース \{#supported-data-sources\}

| 名前                 | ロゴ | 詳細           |
|----------------------|------|-------------------|
| **Amazon RDS MySQL** <br></br> _1 回限りのロード、CDC_ | <RDSsvg class="image" alt="Amazon RDS ロゴ" style={{width: '2.5rem', height: 'auto'}}/> | [Amazon RDS MySQL](./mysql/source/rds) の設定ガイドに従ってください。 |
| **Amazon Aurora MySQL** <br></br> _1 回限りのロード、CDC_ | <Aurorasvg class="image" alt="Amazon Aurora ロゴ" style={{width: '2.5rem', height: 'auto'}}/> | [Amazon Aurora MySQL](./mysql/source/aurora) の設定ガイドに従ってください。 |
| **Cloud SQL for MySQL** <br></br> _1 回限りのロード、CDC_ | <CloudSQLsvg class="image" alt="Cloud SQL ロゴ" style={{width: '2.5rem', height: 'auto'}}/>|  [Cloud SQL for MySQL](./mysql/source/gcp) の設定ガイドに従ってください。 |
| **Azure Flexible Server for MySQL** <br></br> _1 回限りのロード_ | <AFSsvg class="image" alt="Azure Flexible Server for MySQL ロゴ" style={{width: '2.5rem', height: 'auto'}}/> | [Azure Flexible Server for MySQL](./mysql/source/azure-flexible-server-mysql) の設定ガイドに従ってください。 |
| **Self-hosted MySQL** <br></br> _1 回限りのロード、CDC_ | <MySQLsvg class="image" alt="MySQL ロゴ" style={{width: '2.5rem', height: 'auto'}}/>|  [Generic MySQL](./mysql/source/generic) の設定ガイドに従ってください。 |
| **Amazon RDS MariaDB** <br></br> _1 回限りのロード、CDC_ | <RDSsvg class="image" alt="Amazon RDS ロゴ" style={{width: '2.5rem', height: 'auto'}}/> | [Amazon RDS MariaDB](./mysql/source/rds_maria) の設定ガイドに従ってください。 |
| **Self-hosted MariaDB** <br></br> _1 回限りのロード、CDC_ | <MariaDBsvg class="image" alt="MariaDB ロゴ" style={{width: '2.5rem', height: 'auto'}}/>|  [Generic MariaDB](./mysql/source/generic_maria) の設定ガイドに従ってください。 |

ソースの MySQL データベースのセットアップが完了したら、ClickPipe の作成に進むことができます。

## ClickPipe を作成する \{#create-your-clickpipe\}

ClickHouse Cloud アカウントにログインしていることを確認します。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloud コンソールで、対象の ClickHouse Cloud サービスに移動します。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側メニューの `Data Sources` ボタンを選択し、「ClickPipe のセットアップ」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. `MySQL CDC` タイルを選択します。

<Image img={mysql_tile} alt="MySQL を選択" size="lg" border/>

### ソース MySQL データベース接続を追加する \{#add-your-source-mysql-database-connection\}

4. 事前準備のステップで設定したソース MySQL データベースの接続情報を入力します。

   :::info
   接続情報を入力し始める前に、ファイアウォールルールで ClickPipes の IP アドレスをホワイトリストに登録していることを確認してください。次のページで、[ClickPipes の IP アドレス一覧](../index.md#list-of-static-ips)を確認できます。
   詳細については、[このページの冒頭](#prerequisites)にリンクされているソース MySQL セットアップガイドを参照してください。
   :::

   <Image img={mysql_connection_details} alt="接続情報を入力" size="lg" border/>

#### （オプション）SSH トンネリングを設定する \{#optional-set-up-ssh-tunneling\}

ソース MySQL データベースがインターネットから直接アクセスできない場合は、SSH トンネリングの詳細を指定できます。

1. 「Use SSH Tunnelling」トグルを有効にします。
2. SSH 接続情報を入力します。

   <Image img={ssh_tunnel} alt="SSH トンネリング" size="lg" border/>

3. キーベース認証を使用するには、「Revoke and generate key pair」をクリックして新しいキーペアを生成し、生成された公開鍵を SSH サーバーの `~/.ssh/authorized_keys` にコピーします。
4. 「Verify Connection」をクリックして接続を検証します。

:::note
ClickPipes が SSH トンネルを確立できるように、SSH バスティオンホストのファイアウォールルールで [ClickPipes の IP アドレス](../clickpipes#list-of-static-ips)を必ずホワイトリストに登録してください。
:::

接続情報をすべて入力したら、`Next` をクリックします。

#### 詳細設定を構成する \{#advanced-settings\}

必要に応じて詳細設定を構成できます。各設定の簡単な説明は次のとおりです。

- **Sync interval**: ClickPipes がソースデータベースの変更をポーリングする間隔です。これは宛先の ClickHouse サービスに影響します。コストを意識するユーザーには、この値を高め（`3600` 秒以上）に保つことを推奨します。
- **Parallel threads for initial load**: 初回スナップショットの取得に使用される並列ワーカーの数です。大量のテーブルがある場合に、初回スナップショット取得時に使用される並列ワーカー数を制御するのに有用です。この設定はテーブル単位です。
- **Pull batch size**: 1 回のバッチで取得する行数です。ベストエフォートの設定であり、すべての場合で厳密に守られるとは限りません。
- **Snapshot number of rows per partition**: 初回スナップショット中に各パーティションで取得される行数です。テーブル内の行数が多い場合に、各パーティションで取得される行数を制御するのに有用です。
- **Snapshot number of tables in parallel**: 初回スナップショット中に並列で取得されるテーブル数です。テーブル数が多い場合に、並列で取得するテーブル数を制御するのに有用です。

### テーブルを構成する \{#configure-the-tables\}

5. ここで ClickPipe の宛先データベースを選択できます。既存のデータベースを選択するか、新しく作成することもできます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

6. ソース MySQL データベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際、宛先の ClickHouse データベースでテーブル名を変更したり、特定のカラムを除外したりすることも可能です。

### 権限を確認して ClickPipe を開始する \{#review-permissions-and-start-the-clickpipe\}

7. 権限のドロップダウンから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt="権限を確認" size="lg" border/>

最後に、一般的な問題とその解決方法については、「[ClickPipes for MySQL FAQ](/integrations/clickpipes/mysql/faq)」ページを参照してください。

## 次のステップ \{#whats-next\}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

MySQL から ClickHouse Cloud へのデータレプリケーション用に ClickPipe のセットアップが完了したら、最適なパフォーマンスを得るために、データのクエリやモデリングに注力できます。MySQL CDC（変更データキャプチャ）およびトラブルシューティングに関するよくある質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。