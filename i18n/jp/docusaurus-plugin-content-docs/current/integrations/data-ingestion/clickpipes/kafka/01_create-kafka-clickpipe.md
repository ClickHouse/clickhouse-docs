---
sidebar_label: '初めての Kafka ClickPipe を作成する'
description: '初めての Kafka ClickPipe を作成するためのステップバイステップガイド。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: '初めての Kafka ClickPipe の作成'
doc_type: 'guide'
keywords: ['kafka clickpipe の作成', 'kafka', 'clickpipes', 'データソース', 'セットアップガイド']
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


# 最初のKafka ClickPipeの作成 {#creating-your-first-kafka-clickpipe}

> このガイドでは、最初のKafka ClickPipeを作成するプロセスを順を追って説明します。

<VerticalStepper type="numbered" headerLevel="h2">


## データソースに移動 {#1-load-sql-console}

左側のメニューから`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt='インポートを選択' size='md' />


## データソースを選択 {#2-select-data-source}

リストからKafkaデータソースを選択してください。

<Image img={cp_step1} alt='データソースタイプを選択' size='md' />


## データソースの設定 {#3-configure-data-source}

ClickPipeの名前、説明（任意）、認証情報、およびその他の接続詳細を入力してフォームに記入します。

<Image img={cp_step2} alt='接続詳細を入力' size='md' />


## スキーマレジストリの設定（オプション） {#4-configure-your-schema-registry}

Avroストリームには有効なスキーマが必要です。スキーマレジストリの設定方法の詳細については、[スキーマレジストリ](./02_schema-registries.md)を参照してください。


## リバースプライベートエンドポイントの設定（オプション） {#5-configure-reverse-private-endpoint}

ClickPipesがAWS PrivateLinkを使用してKafkaクラスタに接続できるようにするには、リバースプライベートエンドポイントを設定します。

詳細については、[AWS PrivateLinkドキュメント](../aws-privatelink.md)を参照してください。


## トピックを選択 {#6-select-your-topic}

トピックを選択すると、UIにそのトピックのサンプルドキュメントが表示されます。

<Image img={cp_step3} alt='トピックを設定' size='md' />


## 宛先テーブルの設定 {#7-configure-your-destination-table}

次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、設定を変更してください。変更内容は、上部のサンプルテーブルでリアルタイムにプレビューできます。

<Image img={cp_step4a} alt='テーブル、スキーマ、設定の指定' size='md' />

提供されているコントロールを使用して、詳細設定をカスタマイズすることもできます。

<Image img={cp_table_settings} alt='詳細コントロールの設定' size='md' />


## 権限の設定 {#8-configure-permissions}

ClickPipesは、宛先テーブルへのデータ書き込み用に専用ユーザーを作成します。この内部ユーザーには、カスタムロールまたは以下の事前定義されたロールのいずれかを選択できます:

- `Full access`: クラスタへの完全なアクセス権限。宛先テーブルでマテリアライズドビューまたはディクショナリを使用する場合に有用です。
- `Only destination table`: 宛先テーブルへの`INSERT`権限のみ。

<Image img={cp_step5} alt='権限' size='md' />


## セットアップの完了 {#9-complete-setup}

「Create ClickPipe」をクリックすると、ClickPipeが作成され実行されます。作成されたClickPipeはData Sourcesセクションに一覧表示されます。

<Image img={cp_overview} alt='概要を表示' size='md' />

</VerticalStepper>
