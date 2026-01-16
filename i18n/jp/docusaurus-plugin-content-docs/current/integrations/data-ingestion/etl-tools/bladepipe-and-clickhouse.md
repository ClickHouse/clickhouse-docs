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

# BladePipe を ClickHouse に接続する \\{#connect-bladepipe-to-clickhouse\\}

<PartnerBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> は、サブ秒レイテンシでリアルタイムなエンドツーエンドのデータ統合を実現するツールであり、プラットフォーム間のシームレスなデータフローを可能にします。 

ClickHouse は BladePipe にあらかじめ用意されたコネクタの 1 つであり、ユーザーはさまざまなソースから ClickHouse へ自動的にデータを取り込むことができます。このページでは、リアルタイムに ClickHouse にデータをロードする手順を順を追って説明します。

## 対応しているソース \\{#supported-sources\\}
現在、BladePipe は次のソースから ClickHouse へのデータ統合に対応しています:
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

今後、対応ソースはさらに追加される予定です。

<VerticalStepper headerLevel="h2">
## BladePipeのダウンロードと実行 \\{#1-run-bladepipe\\}
1. <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>にログインします。

2. <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a>または<a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>の手順に従い、BladePipe Workerをダウンロードしてインストールします。

:::note
または、<a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>をダウンロードしてデプロイすることもできます。
:::

## ClickHouse をターゲットとして追加する \\{#2-add-clickhouse-as-a-target\\}

  :::note
  1. BladePipe は ClickHouse バージョン `20.12.3.3` 以降をサポートしています。
  2. ClickHouse をターゲットとして使用するには、ユーザーに SELECT、INSERT、および一般的な DDL 実行権限が付与されていることを確認してください。 
  :::

1. BladePipe で「DataSource」>「Add DataSource」をクリックします。

2. `ClickHouse` を選択し、ClickHouse のホストとポート、ユーザー名とパスワードを入力して設定を行い、「Test Connection」をクリックします。

    <Image img={bp_ck_1} size="lg" border alt="ClickHouse をターゲットとして追加する" />

3. 画面下部の「Add DataSource」をクリックすると、ClickHouse インスタンスが追加されます。

## MySQL をソースとして追加する \\{#3-add-mysql-as-a-source\\}
このチュートリアルでは、MySQL インスタンスをソースとして使用し、MySQL データを ClickHouse にロードする手順を説明します。

:::note
MySQL をソースとして使用するには、ユーザーに<a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">必要な権限</a>が付与されていることを確認してください。
:::

1. BladePipe で「DataSource」>「Add DataSource」をクリックします。

2. `MySQL` を選択し、MySQL のホストとポート、ユーザー名とパスワードを入力して設定し、「Test Connection」をクリックします。

    <Image img={bp_ck_2} size="lg" border alt="MySQL をソースとして追加する" />

3. 画面下部の「Add DataSource」をクリックすると、MySQL インスタンスが追加されます。

## パイプラインを作成する \\{#4-create-a-pipeline\\}

1. BladePipe で「DataJob」>「Create DataJob」をクリックします。

2. 追加した MySQL と ClickHouse のインスタンスを選択し、「Test Connection」をクリックして BladePipe がインスタンスに接続できていることを確認します。その後、移行するデータベースを選択します。
   <Image img={bp_ck_3} size="lg" border alt="ソースとターゲットを選択" />

3. DataJob Type として「Incremental」を選択し、「Full Data」オプションも選択します。
   <Image img={bp_ck_4} size="lg" border alt="同期タイプを選択" />

4. レプリケート対象のテーブルを選択します。
   <Image img={bp_ck_5} size="lg" border alt="テーブルを選択" />

5. レプリケート対象の列を選択します。
   <Image img={bp_ck_6} size="lg" border alt="カラムを選択" />

6. DataJob の作成を確認すると、DataJob が自動的に実行されます。
    <Image img={bp_ck_8} size="lg" border alt="DataJob が実行中" />

## データの検証 \\{#5-verify-the-data\\}

1. MySQLインスタンスへのデータ書き込みを停止し、ClickHouseがデータをマージするまで待機します。
   :::note
   ClickHouseの自動マージのタイミングは予測できないため、`OPTIMIZE TABLE xxx FINAL;`コマンドを実行して手動でマージをトリガーすることができます。ただし、手動マージが必ずしも成功するとは限らない点に注意してください。

または、`CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`コマンドを実行してビューを作成し、そのビューに対してクエリを実行することで、データが完全にマージされていることを確認できます。
:::

2. <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">検証DataJob</a>を作成します。検証DataJobが完了したら、結果を確認し、ClickHouse内のデータがMySQL内のデータと一致していることを確認してください。
   <Image img={bp_ck_9} size='lg' border alt='データの検証' />

</VerticalStepper>
