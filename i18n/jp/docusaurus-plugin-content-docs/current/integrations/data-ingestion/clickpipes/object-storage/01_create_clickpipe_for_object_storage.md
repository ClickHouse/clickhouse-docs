---
sidebar_label: '最初のオブジェクトストレージ ClickPipe を作成する'
description: 'オブジェクトストレージを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/object-storage
title: '最初のオブジェクトストレージ ClickPipe を作成する'
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

Object Storage ClickPipes は、Amazon S3、Google Cloud Storage、Azure Blob Storage、DigitalOcean Spaces から ClickHouse Cloud へデータを取り込むための、シンプルかつ堅牢な方法を提供します。一度限りのインジェストと継続的なインジェストの両方を、厳密に 1 回だけ処理されるセマンティクスでサポートします。


# 最初のオブジェクトストレージ ClickPipe の作成 {#creating-your-first-clickpipe}



## 前提条件 {#prerequisite}

- [ClickPipes の概要](../index.md) に目を通していること。



## データソースに移動する {#1-load-sql-console}

クラウドコンソールで、左側メニューの `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>



## データソースを選択する {#2-select-data-source}

データソースを選択します。

<Image img={cp_step1} alt="データソースの種類を選択" size="lg" border/>



## ClickPipe を構成する {#3-configure-clickpipe}

ClickPipe に名前、説明（任意）、IAM ロールまたはクレデンシャル、バケット URL を指定してフォームに入力します。
bash 形式のワイルドカードを使用して複数のファイルを指定できます。
詳細については、[パスでのワイルドカードの使用に関するドキュメント](/integrations/clickpipes/object-storage/reference/#limitations)を参照してください。

<Image img={cp_step2_object_storage} alt="接続情報を入力" size="lg" border/>



## データ形式を選択する {#4-select-format}

UI には、指定したバケット内のファイル一覧が表示されます。
データ形式（現在は ClickHouse フォーマットの一部に対応）と、継続的なインジェストを有効にするかどうかを選択します。
（[詳細は以下を参照](/integrations/clickpipes/object-storage/reference/#continuous-ingest)）。

<Image img={cp_step3_object_storage} alt="データ形式とトピックの設定" size="lg" border/>



## テーブル、スキーマ、設定を構成する {#5-configure-table-schema-settings}

次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。
画面の案内に従って、テーブル名、スキーマ、設定を変更してください。
画面上部のサンプルテーブルで、変更内容をリアルタイムにプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を指定する" size="lg" border/>

用意されているコントロールを使用して、詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="詳細コントロールを設定する" size="lg" border/>

また、既存の ClickHouse テーブルにデータを取り込むこともできます。
その場合、UI からソースのフィールドを、選択した宛先テーブルの ClickHouse 側のフィールドにマッピングできます。

<Image img={cp_step4b} alt="既存のテーブルを使用する" size="lg" border/>

:::info
`_path` や `_size` などの[仮想カラム](../../sql-reference/table-functions/s3#virtual-columns)をフィールドにマッピングすることもできます。
:::



## 権限を設定する {#6-configure-permissions}

最後に、ClickPipes の内部ユーザー向けの権限を設定できます。

**権限:** ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーには、カスタムロール、またはあらかじめ定義されたロールのいずれかを選択できます:
- `Full access`: クラスター全体へのフルアクセス権を持ちます。宛先テーブルでマテリアライズドビューまたは Dictionary を使用する場合に必要です。
- `Only destination table`: 宛先テーブルに対する `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="Permissions" size="lg" border/>



## セットアップを完了する {#7-complete-setup}

"Complete Setup" をクリックすると、システムが ClickPipe を登録し、サマリー テーブルに一覧表示されるようになります。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

サマリー テーブルでは、ソース側または ClickHouse 上の宛先テーブルからサンプルデータを表示するための操作を行えます。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

また、ClickPipe を削除したり、取り込みジョブの概要を表示したりするための操作も行えます。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

**おめでとうございます！** 最初の ClickPipe のセットアップが完了しました。
これがストリーミング ClickPipe の場合、リモートデータソースからリアルタイムで継続的にデータを取り込みます。
それ以外の場合は、バッチで取り込み、完了した時点で終了します。
