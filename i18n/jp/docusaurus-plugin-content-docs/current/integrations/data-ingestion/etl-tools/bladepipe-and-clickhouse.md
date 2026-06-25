---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', '接続', '統合', 'CDC', 'etl', 'データ統合']
slug: /integrations/bladepipe
description: 'BladePipe のデータパイプラインを使用してデータを ClickHouse にストリーミングする'
title: 'BladePipe を ClickHouse に接続する'
doc_type: 'guide'
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
import PartnerBadge from '@theme/badges/PartnerBadge';

<PartnerBadge />

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> は、1 秒未満のレイテンシでプラットフォーム間のシームレスなデータフローを実現する、リアルタイムのエンドツーエンド型データ統合ツールです。

ClickHouse は BladePipe の事前構築済みコネクタの 1 つであり、ユーザーはさまざまなソースのデータを自動的に ClickHouse に統合できます。このページでは、データをリアルタイムで ClickHouse にロードする方法を順を追って説明します。

## 対応しているソース \{#supported-sources\}

現在、BladePipe は次のソースから ClickHouse へのデータ統合に対応しています:

* MySQL/MariaDB/AuroraMySQL
* Oracle
* PostgreSQL/AuroraPostgreSQL
* MongoDB
* Kafka
* PolarDB-MySQL
* OceanBase
* TiDB

今後、対応ソースはさらに追加される予定です。

<VerticalStepper headerLevel="h2">
  ## BladePipeをダウンロードして実行する \{#1-run-bladepipe\}

  1. <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>にログインします。

  2. <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a>または<a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>の手順に従って、BladePipe Workerをダウンロードしてインストールします。

  :::note
  または、<a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>をダウンロードしてデプロイすることもできます。
  :::

  ## ClickHouseをターゲットとして追加する \{#2-add-clickhouse-as-a-target\}

  :::note

  1. BladePipeはClickHouseバージョン`20.12.3.3`以降をサポートしています。

  2. ClickHouseをターゲットとして使用するには、ユーザーにSELECT、INSERT、および一般的なDDL権限が付与されていることを確認してください。
     :::

  3. BladePipeで、&quot;DataSource&quot; &gt; &quot;Add DataSource&quot;をクリックします。

  4. `ClickHouse`を選択し、ClickHouseのホストとポート、ユーザー名、パスワードを入力して設定を行い、&quot;Test Connection&quot;をクリックします。

     <Image img={bp_ck_1} size="lg" border alt="ClickHouseをターゲットとして追加" />

  5. 下部の&quot;Add DataSource&quot;をクリックすると、ClickHouseインスタンスが追加されます。

  ## MySQLをソースとして追加する \{#3-add-mysql-as-a-source\}

  このチュートリアルでは、ソースとしてMySQLインスタンスを使用し、MySQLのデータをClickHouseにロードする手順を説明します。

  :::note
  MySQLをソースとして使用するには、ユーザーに<a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">必要な権限</a>があることを確認してください。
  :::

  1. BladePipeで、&quot;DataSource&quot; &gt; &quot;Add DataSource&quot;をクリックします。

  2. `MySQL`を選択し、MySQLのホストとポート、ユーザー名、パスワードを入力して設定を行い、&quot;Test Connection&quot;をクリックします。

     <Image img={bp_ck_2} size="lg" border alt="MySQLをソースとして追加" />

  3. 下部の&quot;Add DataSource&quot;をクリックすると、MySQLインスタンスが追加されます。

  ## パイプラインを作成する \{#4-create-a-pipeline\}

  1. BladePipeで、&quot;DataJob&quot; &gt; &quot;Create DataJob&quot;をクリックします。

  2. 追加したMySQLインスタンスとClickHouseインスタンスを選択し、&quot;Test Connection&quot;をクリックして、BladePipeがそれらのインスタンスに接続できることを確認します。次に、移行するデータベースを選択します。
     <Image img={bp_ck_3} size="lg" border alt="ソースとターゲットを選択" />

  3. DataJob Typeには&quot;Incremental&quot;を選択し、あわせて&quot;Full Data&quot;オプションも選択します。
     <Image img={bp_ck_4} size="lg" border alt="同期タイプを選択" />

  4. レプリケートするテーブルを選択します。
     <Image img={bp_ck_5} size="lg" border alt="テーブルを選択" />

  5. レプリケートするカラムを選択します。
     <Image img={bp_ck_6} size="lg" border alt="カラムを選択" />

  6. DataJobの作成内容を確認すると、DataJobが自動的に実行されます。
     <Image img={bp_ck_8} size="lg" border alt="DataJobの実行中" />

  ## データの検証 \{#5-verify-the-data\}

  1. MySQLインスタンスへのデータ書き込みを停止し、ClickHouseがデータをマージするまで待機します。
     :::note
     ClickHouseの自動マージのタイミングは予測できないため、`OPTIMIZE TABLE xxx FINAL;`コマンドを実行して手動でマージをトリガーすることができます。ただし、手動マージが必ずしも成功するとは限らない点に注意してください。

  または、`CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`コマンドを実行してビューを作成し、そのビューに対してクエリを実行することで、データが完全にマージされていることを確認できます。
  :::

  2. <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">検証DataJob</a>を作成します。検証DataJobが完了したら、結果を確認し、ClickHouse内のデータがMySQL内のデータと一致していることを確認してください。
     <Image img={bp_ck_9} size="lg" border alt="データの検証" />
</VerticalStepper>