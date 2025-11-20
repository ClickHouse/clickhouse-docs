---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', 'connect', 'integrate', 'cdc', 'etl', 'data integration']
slug: /integrations/bladepipe
description: 'BladePipe データパイプラインを使用して ClickHouse にデータをストリーミングする'
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


# BladePipe を ClickHouse に接続する

<PartnerBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> は、サブ秒レイテンシで動作するリアルタイムのエンドツーエンドデータ統合ツールであり、プラットフォーム間のシームレスなデータフローを実現します。

ClickHouse は BladePipe にあらかじめ用意されたコネクタの 1 つであり、さまざまなソースからのデータを自動的に ClickHouse に取り込むことができます。このページでは、リアルタイムで ClickHouse にデータをロードする手順を、ステップごとに説明します。



## サポートされているソース {#supported-sources}

現在、BladePipeは以下のソースからClickHouseへのデータ統合をサポートしています：

- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

今後、さらに多くのソースに対応する予定です。


<VerticalStepper headerLevel="h2">
## BladePipeのダウンロードと実行 {#1-run-bladepipe}
1. <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>にログインします。

2. <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Workerのインストール (Docker)</a>または<a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Workerのインストール (バイナリ)</a>の手順に従って、BladePipe Workerをダウンロードしてインストールします。

:::note
または、<a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>をダウンロードしてデプロイすることもできます。
:::


## ClickHouseをターゲットとして追加 {#2-add-clickhouse-as-a-target}

:::note

1. BladePipeはClickHouseバージョン`20.12.3.3`以降をサポートしています。
2. ClickHouseをターゲットとして使用する場合は、ユーザーにSELECT、INSERT、および一般的なDDL権限があることを確認してください。
   :::

3. BladePipeで「DataSource」>「Add DataSource」をクリックします。

4. `ClickHouse`を選択し、ClickHouseのホストとポート、ユーザー名、パスワードを入力して設定を行い、「Test Connection」をクリックします。

   <Image img={bp_ck_1} size='lg' border alt='ClickHouseをターゲットとして追加' />

5. 下部の「Add DataSource」をクリックすると、ClickHouseインスタンスが追加されます。


## MySQLをソースとして追加 {#3-add-mysql-as-a-source}

このチュートリアルでは、MySQLインスタンスをソースとして使用し、MySQLデータをClickHouseにロードするプロセスを説明します。

:::note
MySQLをソースとして使用する場合は、ユーザーが<a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">必要な権限</a>を持っていることを確認してください。
:::

1. BladePipeで、「DataSource」>「Add DataSource」をクリックします。

2. `MySQL`を選択し、MySQLのホストとポート、ユーザー名とパスワードを入力して設定を行い、「Test Connection」をクリックします。

   <Image img={bp_ck_2} size='lg' border alt='MySQLをソースとして追加' />

3. 下部の「Add DataSource」をクリックすると、MySQLインスタンスが追加されます。


## パイプラインの作成 {#4-create-a-pipeline}

1. BladePipeで、「DataJob」>「Create DataJob」をクリックします。

2. 追加したMySQLとClickHouseのインスタンスを選択し、「Test Connection」をクリックしてBladePipeがインスタンスに接続されていることを確認します。次に、移行するデータベースを選択します。

   <Image img={bp_ck_3} size='lg' border alt='ソースとターゲットの選択' />

3. DataJob Typeで「Incremental」を選択し、「Full Data」オプションも併せて選択します。

   <Image img={bp_ck_4} size='lg' border alt='同期タイプの選択' />

4. レプリケーション対象のテーブルを選択します。

   <Image img={bp_ck_5} size='lg' border alt='テーブルの選択' />

5. レプリケーション対象のカラムを選択します。

   <Image img={bp_ck_6} size='lg' border alt='カラムの選択' />

6. DataJobの作成を確認すると、DataJobが自動的に実行されます。
   <Image img={bp_ck_8} size='lg' border alt='DataJobの実行中' />


## データの検証 {#5-verify-the-data}

1. MySQLインスタンスへのデータ書き込みを停止し、ClickHouseがデータをマージするのを待ちます。
   :::note
   ClickHouseの自動マージのタイミングは予測できないため、`OPTIMIZE TABLE xxx FINAL;`コマンドを実行して手動でマージをトリガーすることができます。ただし、手動マージが必ずしも成功するとは限らないことに注意してください。

または、`CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`コマンドを実行してビューを作成し、そのビューに対してクエリを実行することで、データが完全にマージされていることを確認できます。
:::

2. <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">検証DataJob</a>を作成します。検証DataJobが完了したら、結果を確認し、ClickHouse内のデータがMySQL内のデータと一致していることを確認します。
   <Image img={bp_ck_9} size='lg' border alt='データの検証' />

</VerticalStepper>
