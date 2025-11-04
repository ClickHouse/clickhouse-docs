---
'sidebar_label': '最初の Kafka ClickPipe を作成する'
'description': '最初の Kafka ClickPipe を作成するためのステップバイステップガイド。'
'slug': '/integrations/clickpipes/kafka/create-your-first-kafka-clickpipe'
'sidebar_position': 1
'title': '最初の Kafka ClickPipe の作成'
'doc_type': 'guide'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import Image from '@theme/IdealImage';


# Creating your first Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

> このガイドでは、最初の Kafka ClickPipe を作成するプロセスを説明します。

<VerticalStepper type="numbered" headerLevel="h2">

## データソースに移動 {#1-load-sql-console}
左側のメニューで `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。
<Image img={cp_step0} alt="Select imports" size="md"/>

## データソースを選択 {#2-select-data-source}
リストから Kafka データソースを選択します。
<Image img={cp_step1} alt="Select data source type" size="md"/>

## データソースを設定 {#3-configure-data-source}
名前、説明 (オプション)、資格情報、およびその他の接続詳細を提供して、ClickPipe のフォームに記入します。
<Image img={cp_step2} alt="Fill out connection details" size="md"/>

## スキーマレジストリの設定 (オプション) {#4-configure-your-schema-registry}
Avro ストリームには有効なスキーマが必要です。スキーマレジストリの設定方法については、[Schema registries](./02_schema-registries.md) を参照してください。

## リバースプライベートエンドポイントの設定 (オプション) {#5-configure-reverse-private-endpoint}
ClickPipes が AWS PrivateLink を使用して Kafka クラスターに接続できるように、リバースプライベートエンドポイントを設定します。
詳細については、[AWS PrivateLink documentation](../aws-privatelink.md) を参照してください。

## トピックを選択 {#6-select-your-topic}
トピックを選択すると、UI にトピックからのサンプルドキュメントが表示されます。
<Image img={cp_step3} alt="Set your topic" size="md"/>

## 宛先テーブルを設定 {#7-configure-your-destination-table}

次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。変更のリアルタイムプレビューを上部のサンプルテーブルで確認できます。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="md"/>

提供されたコントロールを使用して高度な設定をカスタマイズすることもできます。

<Image img={cp_table_settings} alt="Set advanced controls" size="md"/>

## 権限を設定 {#8-configure-permissions}
ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーに対して、カスタムロールまたは事前定義されたロールのいずれかを使用してロールを選択できます:
- `Full access`: クラスターへの完全なアクセスを持ちます。宛先テーブルで Materialized View または Dictionary を使用する場合に便利です。
- `Only destination table`: 宛先テーブルに対して `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="Permissions" size="md"/>

## セットアップを完了 {#9-complete-setup}
「Create ClickPipe」をクリックすると、ClickPipe が作成されて実行されます。これにより、Data Sources セクションに表示されるようになります。

<Image img={cp_overview} alt="View overview" size="md"/>

</VerticalStepper>
