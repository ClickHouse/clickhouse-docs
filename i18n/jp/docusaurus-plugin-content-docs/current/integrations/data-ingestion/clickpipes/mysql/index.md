---
sidebar_label: 'MySQL から ClickHouse へのデータ取り込み'
description: 'MySQL または MariaDB データベースから ClickHouse Cloud へシームレスにデータを取り込みます。'
slug: /integrations/clickpipes/mysql
title: 'MySQL から ClickHouse へのデータ取り込み（CDC を使用）'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', '変更データキャプチャ', 'データベースレプリケーション']
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


# MySQL から ClickHouse へのデータインジェスト（CDC の使用） \{#ingesting-data-from-mysql-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
ClickPipes を使用して MySQL から ClickHouse Cloud へデータを取り込む機能は、現在パブリックベータです。
:::

MySQL ClickPipe は、MySQL および MariaDB データベースから ClickHouse Cloud へデータを取り込むための、フルマネージドで高い耐障害性を備えた手段を提供します。単発のインジェストを行うための **一括ロード** と、継続的なインジェストのための **Change Data Capture（CDC: 変更データキャプチャ）** の両方をサポートします。

MySQL ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できます。将来的には、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) および [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を使用して、プログラムから MySQL ClickPipes をデプロイおよび管理できるようになる予定です。

## 前提条件 \{#prerequisites\}

[//]: # "TODO Binlog レプリケーションの設定は、一度限りのインジェストパイプには不要です。これはこれまで混乱の原因となってきたため、ユーザーを必要以上に身構えさせないように、バルクロードに必要な最小限の要件も提示する必要があります。"

作業を始める前に、MySQL データベースが binlog レプリケーション用に正しく設定されていることを確認する必要があります。設定手順は MySQL のデプロイ方法によって異なるため、以下の該当するガイドに従ってください。

### サポートされているデータソース \{#supported-data-sources\}

| 名前                 | ロゴ | 詳細           |
|----------------------|------|-------------------|
| **Amazon RDS MySQL** <br></br> _1回限りのロード、CDC（変更データキャプチャ）_ |  | [Amazon RDS MySQL](./mysql/source/rds) の構成ガイドに従ってください。 |
| **Amazon Aurora MySQL** <br></br> _1回限りのロード、CDC（変更データキャプチャ）_ |  | [Amazon Aurora MySQL](./mysql/source/aurora) の構成ガイドに従ってください。 |
| **Cloud SQL for MySQL** <br></br> _1回限りのロード、CDC（変更データキャプチャ）_ | |  [Cloud SQL for MySQL](./mysql/source/gcp) の構成ガイドに従ってください。 |
| **Azure Flexible Server for MySQL** <br></br> _1回限りのロード_ |  | [Azure Flexible Server for MySQL](./mysql/source/azure-flexible-server-mysql) の構成ガイドに従ってください。 |
| **Self-hosted MySQL** <br></br> _1回限りのロード、CDC（変更データキャプチャ）_ | |  [Generic MySQL](./mysql/source/generic) の構成ガイドに従ってください。 |
| **Amazon RDS MariaDB** <br></br> _1回限りのロード、CDC（変更データキャプチャ）_ |  | [Amazon RDS MariaDB](./mysql/source/rds_maria) の構成ガイドに従ってください。 |
| **Self-hosted MariaDB** <br></br> _1回限りのロード、CDC（変更データキャプチャ）_ | |  [Generic MariaDB](./mysql/source/generic_maria) の構成ガイドに従ってください。 |

ソース MySQL データベースのセットアップが完了したら、ClickPipe の作成を続行してください。

## ClickPipe を作成する \{#create-your-clickpipe\}

ClickHouse Cloud アカウントにログインしていることを確認します。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)

1. ClickHouse Cloud コンソールで、対象の ClickHouse Cloud Service に移動します。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側のメニューで `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. `MySQL CDC` タイルを選択します。

<Image img={mysql_tile} alt="MySQL を選択" size="lg" border/>

### ソース MySQL データベース接続を追加する \{#add-your-source-mysql-database-connection\}

4. 前提条件の手順で設定したソース MySQL データベースの接続情報を入力します。

   :::info
   接続情報の追加を始める前に、ファイアウォールのルールで ClickPipes の IP アドレスをホワイトリストに登録していることを確認してください。以下のページで [ClickPipes の IP アドレス一覧](../index.md#list-of-static-ips) を確認できます。
   詳細については、[このページの先頭](#prerequisites) にリンクされているソース MySQL セットアップガイドを参照してください。
   :::

   <Image img={mysql_connection_details} alt="接続情報を入力する" size="lg" border/>

#### （オプション）SSH トンネリングをセットアップする \{#optional-set-up-ssh-tunneling\}

ソースの MySQL データベースがインターネットから直接アクセスできない場合は、SSH トンネリングの詳細を指定できます。

1. 「Use SSH Tunnelling」トグルを有効にします。
2. SSH 接続情報を入力します。

   <Image img={ssh_tunnel} alt="SSH トンネリング" size="lg" border/>

3. キーベース認証を使用する場合は、「Revoke and generate key pair」をクリックして新しいキーペアを生成し、生成された公開鍵を SSH サーバー上の `~/.ssh/authorized_keys` にコピーします。
4. 「Verify Connection」をクリックして、接続を確認します。

:::note
ClickPipes が SSH トンネルを確立できるように、SSH バスティオンホストに対するファイアウォールルールで [ClickPipes の IP アドレス](../clickpipes#list-of-static-ips) を必ずホワイトリストに追加してください。
:::

接続情報の入力が完了したら、`Next` をクリックします。

#### 高度な設定を構成する \{#advanced-settings\}

必要に応じて高度な設定を構成できます。各設定の概要は次のとおりです。

- **Sync interval**: ClickPipes がソースデータベースの変更をポーリングする間隔です。これは転送先の ClickHouse サービスにも影響します。コストに敏感なユーザーには、この値を高め（`3600` 以上）に設定しておくことを推奨します。
- **Parallel threads for initial load**: 初回スナップショットを取得する際に使用される並列ワーカーの数です。多数のテーブルがあり、初回スナップショット取得に使用する並列ワーカー数を制御したい場合に有用です。この設定はテーブル単位で適用されます。
- **Pull batch size**: 1 回のバッチで取得する行数です。ベストエフォートの設定であり、すべての場合においてこの値が厳密に守られるとは限りません。
- **Snapshot number of rows per partition**: 初回スナップショット時に各パーティションで取得される行数です。テーブル内の行数が多く、各パーティションで取得する行数を制御したい場合に有用です。
- **Snapshot number of tables in parallel**: 初回スナップショット時に並列で取得されるテーブル数です。多数のテーブルがあり、並列で取得するテーブル数を制御したい場合に有用です。

### テーブルを設定する \{#configure-the-tables\}

5. ここで、ClickPipe の宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

6. ソースの MySQL データベースからレプリケーション対象とするテーブルを選択できます。テーブルを選択する際に、宛先の ClickHouse データベース側でテーブル名を変更したり、特定のカラムを除外したりすることもできます。

### 権限を確認して ClickPipe を開始する \{#review-permissions-and-start-the-clickpipe\}

7. 権限のドロップダウンメニューから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt="権限を確認する" size="lg" border/>

最後に、よくある問題とその解決方法の詳細については、["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) ページを参照してください。

## 次のステップ \{#whats-next\}

[//]: # "TODO 既存のPostgreSQL向けガイドと同様に、MySQL 固有の移行ガイドとベストプラクティスを作成する。現在の移行ガイドは MySQL テーブルエンジンを参照しているが、これは理想的ではない。"

MySQL から ClickHouse Cloud へのデータをレプリケートするための ClickPipe のセットアップが完了したら、最適なパフォーマンスを得るために、データのクエリやモデリングの方法に注力できます。MySQL の CDC（変更データキャプチャ）やトラブルシューティングに関する一般的な質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。