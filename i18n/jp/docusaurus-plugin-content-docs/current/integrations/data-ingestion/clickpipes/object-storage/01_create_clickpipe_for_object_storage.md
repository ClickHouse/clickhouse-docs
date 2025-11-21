---
sidebar_label: '最初のオブジェクトストレージ向け ClickPipe の作成'
description: 'オブジェクトストレージを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/object-storage
title: '最初のオブジェクトストレージ向け ClickPipe を作成する'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

Object Storage ClickPipes は、Amazon S3、Google Cloud Storage、Azure Blob Storage、DigitalOcean Spaces から ClickHouse Cloud へデータを取り込むための、シンプルで堅牢な方法を提供します。一度限りの取り込みと継続的な取り込みの両方をサポートし、exactly-once セマンティクスを実現します。


# 最初のオブジェクトストレージClickPipeを作成する {#creating-your-first-clickpipe}


## 前提条件 {#prerequisite}

- [ClickPipes の概要](../index.md)を理解していること。


## データソースに移動 {#1-load-sql-console}

クラウドコンソールで、左側のメニューから`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします

<Image img={cp_step0} alt='インポートを選択' size='lg' border />


## データソースを選択 {#2-select-data-source}

データソースを選択します。

<Image img={cp_step1} alt='データソースタイプを選択' size='lg' border />


## ClickPipeの設定 {#3-configure-clickpipe}

ClickPipeの名前、説明（任意）、IAMロールまたは認証情報、バケットURLを入力してフォームを完成させます。
bashライクなワイルドカードを使用して複数のファイルを指定できます。
詳細については、[パスでのワイルドカードの使用に関するドキュメント](/integrations/clickpipes/object-storage/reference/#limitations)を参照してください。

<Image
  img={cp_step2_object_storage}
  alt='接続詳細の入力'
  size='lg'
  border
/>


## データ形式の選択 {#4-select-format}

UIには、指定されたバケット内のファイル一覧が表示されます。
データ形式を選択し（現在はClickHouse形式の一部をサポートしています）、継続的な取り込みを有効にするかどうかを指定してください。
（[詳細は以下を参照](/integrations/clickpipes/object-storage/reference/#continuous-ingest)）。

<Image
  img={cp_step3_object_storage}
  alt='データ形式とトピックの設定'
  size='lg'
  border
/>


## テーブル、スキーマ、設定の構成 {#5-configure-table-schema-settings}

次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。
画面の指示に従って、テーブル名、スキーマ、設定を変更してください。
上部のサンプルテーブルで変更内容のリアルタイムプレビューを確認できます。

<Image img={cp_step4a} alt='テーブル、スキーマ、設定の指定' size='lg' border />

提供されているコントロールを使用して詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt='詳細コントロールの設定' size='lg' border />

または、既存のClickHouseテーブルにデータを取り込むこともできます。
その場合、UIを使用してソースのフィールドを選択した宛先テーブルのClickHouseフィールドにマッピングできます。

<Image img={cp_step4b} alt='既存のテーブルの使用' size='lg' border />

:::info
`_path`や`_size`などの[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::


## 権限の設定 {#6-configure-permissions}

最後に、内部ClickPipesユーザーの権限を設定します。

**権限:** ClickPipesは、宛先テーブルへのデータ書き込み用に専用ユーザーを作成します。この内部ユーザーには、カスタムロールまたは以下の事前定義されたロールのいずれかを選択できます:

- `Full access`: クラスタへの完全なアクセス権限。宛先テーブルでマテリアライズドビューまたはDictionaryを使用する場合に必要です。
- `Only destination table`: 宛先テーブルへの`INSERT`権限のみ。

<Image img={cp_step5} alt='権限' size='lg' border />


## セットアップの完了 {#7-complete-setup}

「Complete Setup」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに一覧表示されます。

<Image img={cp_success} alt='成功通知' size='sm' border />

<Image img={cp_remove} alt='削除通知' size='lg' border />

サマリーテーブルには、ソースまたはClickHouseの宛先テーブルからサンプルデータを表示するコントロールが用意されています。

<Image img={cp_destination} alt='宛先を表示' size='lg' border />

また、ClickPipeを削除したり、取り込みジョブのサマリーを表示したりするコントロールも用意されています。

<Image img={cp_overview} alt='概要を表示' size='lg' border />

**おめでとうございます!** 最初のClickPipeのセットアップが正常に完了しました。
ストリーミングClickPipeの場合は、継続的に実行され、リモートデータソースからリアルタイムでデータを取り込みます。
バッチ処理の場合は、バッチを取り込んで完了します。
