---
'sidebar_label': 'BladePipe'
'sidebar_position': 20
'keywords':
- 'clickhouse'
- 'BladePipe'
- 'connect'
- 'integrate'
- 'cdc'
- 'etl'
- 'data integration'
'slug': '/integrations/bladepipe'
'description': 'BladePipe データパイプラインを使用して ClickHouse にデータをストリーミングする'
'title': 'BladePipe を ClickHouse に接続する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import bp_ck_1 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_1.png';
import bp_ck_2 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_2.png';
import bp_ck_3 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_3.png';
import bp_ck_4 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_4.png';
import bp_ck_5 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_5.png';
import bp_ck_6 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_6.png';
import bp_ck_7 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_7.png';
import bp_ck_8 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_8.png';
import bp_ck_9 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_9.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connect BladePipe to ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a>は、サブ秒のレイテンシでリアルタイムのエンドツーエンドデータ統合ツールであり、プラットフォーム間でシームレスなデータフローを促進します。

ClickHouseはBladePipeの事前構築されたコネクタの一つであり、ユーザーはさまざまなソースからClickHouseにデータを自動的に統合できます。このページでは、リアルタイムでClickHouseにデータをロードする方法をステップバイステップで示します。

## Supported sources {#supported-sources}
現在、BladePipeは以下のソースからClickHouseへのデータ統合をサポートしています：
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

さらに多くのソースがサポートされる予定です。

<VerticalStepper headerLevel="h2">
## Download and run BladePipe {#1-run-bladepipe}
1. <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>にログインします。

2. <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a>または<a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>の指示に従ってBladePipe Workerをダウンロードしてインストールします。

  :::note
  代わりに、<a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>をダウンロードして展開することもできます。
  :::

## Add ClickHouse as a target {#2-add-clickhouse-as-a-target}

  :::note
  1. BladePipeはClickHouseバージョン `20.12.3.3` 以上をサポートしています。
  2. ClickHouseをターゲットとして使用するには、ユーザーにSELECT、INSERTおよび一般的なDDL権限があることを確認してください。 
  :::

1. BladePipeで「DataSource」 > 「Add DataSource」をクリックします。

2. `ClickHouse`を選択し、ClickHouseのホストとポート、ユーザー名とパスワードを提供して設定を記入し、「Test Connection」をクリックします。

    <Image img={bp_ck_1} size="lg" border alt="Add ClickHouse as a target" />

3. 下部の「Add DataSource」をクリックすると、ClickHouseインスタンスが追加されます。

## Add MySQL as a source {#3-add-mysql-as-a-source}
このチュートリアルでは、MySQLインスタンスをソースとして使用し、MySQLデータをClickHouseにロードするプロセスを説明します。

:::note
MySQLをソースとして使用するには、ユーザーが<a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">必要な権限</a>を持っていることを確認してください。 
:::

1. BladePipeで「DataSource」 > 「Add DataSource」をクリックします。

2. `MySQL`を選択し、MySQLのホストとポート、ユーザー名とパスワードを提供して設定を記入し、「Test Connection」をクリックします。

    <Image img={bp_ck_2} size="lg" border alt="Add MySQL as a source" />

3. 下部の「Add DataSource」をクリックすると、MySQLインスタンスが追加されます。

## Create a pipeline {#4-create-a-pipeline}

1. BladePipeで「DataJob」 > 「Create DataJob」をクリックします。

2. 追加したMySQLとClickHouseのインスタンスを選択し、「Test Connection」をクリックしてBladePipeがインスタンスに接続されていることを確認します。次に、移動するデータベースを選択します。
   <Image img={bp_ck_3} size="lg" border alt="Select source and target" />

3. DataJob Typeとして「Incremental」を選択し、「Full Data」オプションを選択します。
   <Image img={bp_ck_4} size="lg" border alt="Select sync type" />

4. レプリケートするテーブルを選択します。
   <Image img={bp_ck_5} size="lg" border alt="Select tables" />

5. レプリケートするカラムを選択します。
   <Image img={bp_ck_6} size="lg" border alt="Select columns" />

6. DataJobの作成を確認し、DataJobが自動で実行されます。
    <Image img={bp_ck_8} size="lg" border alt="DataJob is running" />

## Verify the data {#5-verify-the-data}
1. MySQLインスタンスでデータの書き込みを停止し、ClickHouseがデータをマージするのを待ちます。
:::note
ClickHouseの自動マージのタイミングが予測できないため、`OPTIMIZE TABLE xxx FINAL;`コマンドを実行することで手動でマージをトリガーすることができます。この手動マージが常に成功するとは限らないことに注意してください。

代わりに、`CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`コマンドを実行してビューを作成し、そのビューに対してクエリを実行してデータが完全にマージされていることを確認できます。
:::

2. <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">Verification DataJob</a>を作成します。Verification DataJobが完了したら、結果をレビューしてClickHouseのデータがMySQLのデータと同じであることを確認します。
   <Image img={bp_ck_9} size="lg" border alt="Verify data" />
   
</VerticalStepper>
