---
sidebar_label: 'はじめての Kafka ClickPipe を作成する'
description: 'はじめての Kafka ClickPipe を作成するためのステップバイステップガイドです。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'はじめての Kafka ClickPipe を作成する'
doc_type: 'guide'
keywords: ['Kafka ClickPipe の作成', 'kafka', 'clickpipes', 'データソース', 'セットアップガイド']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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

# Creating your first Kafka ClickPipe \\{#creating-your-first-kafka-clickpipe\\}

> このガイドでは、最初の Kafka ClickPipe を作成する手順を順を追って説明します。

<VerticalStepper type="numbered" headerLevel="h2">

## データソースに移動する \\{#1-load-sql-console\\}
左側メニューの `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。
<Image img={cp_step0} alt="インポートを選択" size="md"/>

## データソースを選択する \\{#2-select-data-source\\}
リストから Kafka のデータソースを選択します。
<Image img={cp_step1} alt="データソースタイプを選択" size="md"/>

## データソースを構成する \\{#3-configure-data-source\\}
ClickPipe の名前、説明（任意）、認証情報、およびその他の接続情報を入力してフォームに必要事項を入力します。
<Image img={cp_step2} alt="接続情報を入力" size="md"/>

## スキーマレジストリを構成する（任意） \\{#4-configure-your-schema-registry\\}
Avro ストリームには有効なスキーマが必要です。スキーマレジストリの設定方法の詳細については、[Schema registries](./02_schema-registries.md) を参照してください。

## Reverse Private Endpoint を構成する（任意） \\{#5-configure-reverse-private-endpoint\\}
ClickPipes が AWS PrivateLink を使用して Kafka クラスターに接続できるようにするには、Reverse Private Endpoint を構成します。
詳細については [AWS PrivateLink のドキュメント](../aws-privatelink.md) を参照してください。

## トピックを選択する \\{#6-select-your-topic\\}
トピックを選択すると、UI にそのトピックからのサンプルドキュメントが表示されます。
<Image img={cp_step3} alt="トピックを設定" size="md"/>

## 宛先テーブルを設定する \\{#7-configure-your-destination-table\\}

次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更してください。画面上部のサンプルテーブルで、変更内容をリアルタイムに確認できます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を指定" size="md"/>

また、用意されているコントロールを使って高度な設定をカスタマイズすることもできます。

<Image img={cp_table_settings} alt="高度な設定用コントロールを設定" size="md"/>

## 権限を構成する \\{#8-configure-permissions\\}
ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。カスタムロール、またはあらかじめ定義されたロールのいずれかを使って、この内部ユーザーのロールを選択できます。
- `Full access`: クラスターへのフルアクセス権を持ちます。宛先テーブルと組み合わせて materialized view や Dictionary を使用する場合に便利です。
- `Only destination table`: 宛先テーブルに対する `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="権限" size="md"/>

## セットアップを完了する \\{#9-complete-setup\\}
「Create ClickPipe」をクリックすると、ClickPipe が作成され実行されます。作成された ClickPipe は Data Sources セクションに一覧表示されます。

<Image img={cp_overview} alt="概要を表示" size="md"/>

</VerticalStepper>