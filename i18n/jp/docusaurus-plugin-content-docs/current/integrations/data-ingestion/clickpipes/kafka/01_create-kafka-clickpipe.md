---
sidebar_label: 'はじめての Kafka ClickPipe を作成する'
description: 'はじめての Kafka ClickPipe を作成するためのステップバイステップガイドです。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'はじめての Kafka ClickPipe を作成する'
doc_type: 'guide'
keywords: ['Kafka ClickPipe の作成', 'kafka', 'clickpipes', 'データソース', 'セットアップガイド']
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


# はじめての Kafka ClickPipe の作成 {#creating-your-first-kafka-clickpipe}

> 本ガイドでは、Kafka ClickPipe を初めて作成する手順を順を追って説明します。

<VerticalStepper type="numbered" headerLevel="h2">


## データソースに移動する {#1-load-sql-console}
左側メニューで `Data Sources` ボタンを選択し、"Set up a ClickPipe" をクリックします。
<Image img={cp_step0} alt="Select imports" size="md"/>



## データソースを選択する {#2-select-data-source}
一覧から Kafka データソースを選択します。
<Image img={cp_step1} alt="データソースの種類を選択" size="md"/>



## データソースを設定する {#3-configure-data-source}
フォームに、ClickPipe の名前、説明（任意）、認証情報、その他の接続情報を入力します。
<Image img={cp_step2} alt="接続情報を入力する" size="md"/>



## スキーマレジストリを構成する（オプション） {#4-configure-your-schema-registry}
Avro ストリームには有効なスキーマが必要です。スキーマレジストリの設定方法の詳細については、[Schema registries](./02_schema-registries.md) を参照してください。



## リバースプライベートエンドポイントを構成する（任意） {#5-configure-reverse-private-endpoint}
Reverse Private Endpoint を構成して、ClickPipes が AWS PrivateLink を介して Kafka クラスターに接続できるようにします。
詳細については、[AWS PrivateLink ドキュメント](../aws-privatelink.md)を参照してください。



## トピックを選択 {#6-select-your-topic}
トピックを選択すると、そのトピックのサンプルドキュメントが UI に表示されます。
<Image img={cp_step3} alt="トピックを選択" size="md"/>



## 宛先テーブルを設定する {#7-configure-your-destination-table}

次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更してください。画面上部のサンプルテーブルで、変更内容をリアルタイムに確認できます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を指定" size="md"/>

また、用意されているコントロールを使って高度な設定をカスタマイズすることもできます。

<Image img={cp_table_settings} alt="高度な設定用コントロールを設定" size="md"/>



## 権限を設定する {#8-configure-permissions}
ClickPipes は、デスティネーションテーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーには、カスタムロールまたはあらかじめ定義されたロールのいずれかを割り当てることができます。
- `Full access`: クラスター全体へのフルアクセス権を持ちます。デスティネーションテーブルでマテリアライズドビューや Dictionary を使用する場合に役立つことがあります。
- `Only destination table`: デスティネーションテーブルに対する `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="権限" size="md"/>



## セットアップの完了 {#9-complete-setup}

「Create ClickPipe」をクリックすると、ClickPipe が作成されて実行されます。ClickPipe は「Data Sources」セクションに表示されます。

<Image img={cp_overview} alt='概要を表示' size='md' />

</VerticalStepper>
