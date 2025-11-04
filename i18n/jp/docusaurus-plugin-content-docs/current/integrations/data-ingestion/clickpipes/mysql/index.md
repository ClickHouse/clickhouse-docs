---
'sidebar_label': 'MySQLからClickHouseへのデータ取り込み'
'description': 'MySQLをClickHouse Cloudにシームレスに接続する方法を説明します。'
'slug': '/integrations/clickpipes/mysql'
'title': 'MySQLからClickHouseへのデータ取り込み (CDCを使用)'
'doc_type': 'guide'
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


# MySQLからClickHouseへのデータの取り込み (CDCを使用)

<BetaBadge/>

:::info
ClickPipesを介してClickHouse CloudにMySQLからデータを取り込む機能は、パブリックベータ版です。
:::

ClickPipesを使用して、ソースのMySQLデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのMySQLデータベースは、オンプレミスまたはAmazon RDS、Google Cloud SQLなどのサービスを使用してクラウドでホストできます。

## 前提条件 {#prerequisites}

開始するには、最初にMySQLデータベースがbinlogレプリケーション用に正しく設定されていることを確認する必要があります。設定手順は、MySQLのデプロイ方法によって異なるため、以下の関連ガイドに従ってください：

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Generic MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [Generic MariaDB](./mysql/source/generic_maria)

ソースのMySQLデータベースが設定されたら、ClickPipeの作成を続けることができます。

## ClickPipeの作成 {#create-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

[//]: # (   TODO update image here)
1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 左側のメニューで`Data Sources`ボタンを選択し、「ClickPipeの設定」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. `MySQL CDC`のタイルを選択します。

<Image img={mysql_tile} alt="Select MySQL" size="lg" border/>

### ソースのMySQLデータベース接続の追加 {#add-your-source-mysql-database-connection}

4. 前提条件のステップで設定したソースのMySQLデータベースの接続詳細を入力します。

   :::info
   接続詳細を追加する前に、ClickPipesのIPアドレスをファイアウォールのルールにホワイトリスト登録していることを確認してください。次のページには[ClickPipes IPアドレスのリスト](../index.md#list-of-static-ips)があります。
   詳細については、[このページの上部](#prerequisites)にリンクされているソースMySQL設定ガイドを参照してください。
   :::

   <Image img={mysql_connection_details} alt="Fill in connection details" size="lg" border/>

#### (オプション) SSHトンネリングの設定 {#optional-set-up-ssh-tunneling}

ソースのMySQLデータベースが公にアクセス不可能な場合は、SSHトンネリングの詳細を指定できます。

1. 「SSHトンネリングを使用」のトグルを有効にします。
2. SSH接続の詳細を入力します。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. キーベースの認証を使用する場合は、「キーの取り消しとペアの生成」をクリックして新しいキーのペアを生成し、生成された公開キーをSSHサーバーの `~/.ssh/authorized_keys` にコピーします。
4. 「接続を確認」をクリックして接続を検証します。

:::note
ClickPipesがSSHトンネルを確立できるように、SSHバスティオンホストのファイアウォールルールに[ClickPipesのIPアドレス](../clickpipes#list-of-static-ips)をホワイトリスト登録してください。
:::

接続詳細が入力されたら、`次へ`をクリックします。

#### 高度な設定の構成 {#advanced-settings}

必要に応じて高度な設定を構成できます。それぞれの設定の簡単な説明は以下の通りです：

- **同期間隔**: これは、ClickPipesがソースデータベースの変更をポーリングする間隔です。これは宛先のClickHouseサービスに影響を与え、コストに敏感なユーザーにはこの値を高く（`3600`以上）設定することを推奨します。
- **初期読み込みのための並列スレッド数**: これは初期スナップショットを取得するために使用される並列ワーカーの数です。大量のテーブルがある場合に、初期スナップショットを取得するために使用される並列ワーカーの数を制御するのに役立ちます。この設定はテーブルごとに適用されます。
- **プルバッチサイズ**: 単一のバッチで取得する行の数です。これは最善の努力に基づく設定であり、すべてのケースで遵守されるとは限りません。
- **パーティションごとのスナップショット行数**: これは、初期スナップショット中に各パーティションで取得される行の数です。テーブルに大量の行がある場合に、各パーティションで取得される行数を制御するのに役立ちます。
- **並列でのスナップショットテーブル数**: これは、初期スナップショット中に並列で取得されるテーブルの数です。大量のテーブルがある場合に、並列で取得されるテーブル数を制御するのに役立ちます。

### テーブルの構成 {#configure-the-tables}

5. ここで、ClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. ソースのMySQLデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際に、宛先のClickHouseデータベースでテーブルの名前を変更したり、特定のカラムを除外したりすることもできます。

### アクセス権限の確認とClickPipeの開始 {#review-permissions-and-start-the-clickpipe}

7. アクセス権限のドロップダウンから「フルアクセス」役割を選択し、「設定を完了」をクリックします。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

最後に、一般的な問題やそれらの解決方法については、["MySQL向けClickPipes FAQ"](/integrations/clickpipes/mysql/faq)ページを参照してください。

## 次は何ですか？ {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

MySQLからClickHouse CloudへのデータレプリケーションのためにClickPipeを設定した後は、最適なパフォーマンスのためにデータをクエリおよびモデル化する方法に焦点を当てることができます。MySQL CDCやトラブルシューティングに関する一般的な質問については、[MySQL FAQsページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。
