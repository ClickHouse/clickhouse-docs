---
sidebar_label: 'ClickPipes for Amazon Kinesis'
description: 'Amazon KinesisデータソースをClickHouse Cloudにシームレスに接続します。'
slug: /integrations/clickpipes/kinesis
title: 'Amazon KinesisとClickHouse Cloudの統合'
---
```

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_kinesis.png';
import cp_step3_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_kinesis.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# Amazon KinesisとClickHouse Cloudの統合
## 前提条件 {#prerequisite}
[ClickPipesの紹介](./index.md)を熟知しており、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を設定していること。 ClickHouse Cloudで動作するロールの設定に関する情報は[Kinesisロールベースアクセスガイド](./secure-kinesis.md)を参照してください。

## 最初のClickPipeの作成 {#creating-your-first-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="データソースタイプの選択" size="lg" border/>

4. フォームに必要事項を入力します。ClickPipeの名前、説明（オプション）、IAMロールまたは認証情報、その他の接続詳細を提供します。

<Image img={cp_step2_kinesis} alt="接続詳細を入力" size="lg" border/>

5. Kinesisストリームと開始オフセットを選択します。UIは選択したソースからのサンプルドキュメントを表示します（Kafkaトピックなど）。ClickPipeのパフォーマンスと安定性を向上させるために、Kinesisストリーム向けのEnhanced Fan-outを有効にすることもできます（Enhanced Fan-outの詳細については[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)を参照）。

<Image img={cp_step3_kinesis} alt="データ形式とトピックの設定" size="lg" border/>

6. 次のステップでは、新しいClickHouseテーブルにデータをインジェストするか、既存のテーブルを再利用するかを選択できます。画面の指示に従ってテーブル名、スキーマ、設定を変更します。上部のサンプルテーブルで変更をリアルタイムでプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定の設定" size="lg" border/>

  提供されたコントロールを使用して、高度な設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="高度なコントロールを設定" size="lg" border/>

7. 代わりに、既存のClickHouseテーブルにデータをインジェストすることも決定できます。その場合、UIは、ソースからのフィールドを選択した宛先テーブルのClickHouseフィールドにマッピングします。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

8. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限：** ClickPipesは、宛先テーブルへのデータ書き込みのために専用のユーザーを作成します。この内部ユーザーには、カスタムロールまたは定義済みロールの1つを使用してロールを選択できます：
    - `フルアクセス`: クラスターへのフルアクセスを持つ。宛先テーブルでMaterialized ViewまたはDictionaryを使用する場合に役立つかもしれません。
    - `宛先テーブルのみ`: 宛先テーブルに対する`INSERT`権限のみ。

<Image img={cp_step5} alt="権限" border/>

9. 「セットアップを完了」をクリックすると、システムはClickPipeを登録し、サマリーテーブルに表示されるようになります。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

  サマリーテーブルは、ClickHouseのソースまたは宛先テーブルからサンプルデータを表示するためのコントロールを提供します。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

  また、ClickPipeを削除するためのコントロールや、インジェストジョブの概要を表示するコントロールも提供されます。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

10. **おめでとうございます！** 最初のClickPipeの設定が成功しました。このストリーミングClickPipeは、リモートデータソースからリアルタイムでデータを継続的にインジェストします。それ以外の場合は、一括インジェストを行い、完了します。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式：
- [JSON](../../../interfaces/formats.md/#json)

## サポートされているデータ型 {#supported-data-types}

現在ClickPipesでサポートされているClickHouseのデータ型は以下の通りです：

- 基本的な数値型 - \[U\]Int8/16/32/64およびFloat32/64
- 大きな整数型 - \[U\]Int128/256
- 小数型
- ブール型
- 文字列
- 固定文字列
- 日付、Date32
- 日時、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記のいずれかの型を使用してキーと値を持つMap（Nullableを含む）
- 上記のいずれかの型を使用して要素を持つTupleおよびArray（Nullableを含む、1レベルの深さのみ）

## Kinesisバーチャルカラム {#kinesis-virtual-columns}

Kinesisストリームに対してサポートされているバーチャルカラムは以下の通りです。新しい宛先テーブルを作成する際には、`Add Column`ボタンを使用してバーチャルカラムを追加できます。

| 名前             | 説明                                                       | 推奨データ型       |
|------------------|-----------------------------------------------------------|--------------------|
| _key             | Kinesisパーティションキー                                  | 文字列             |
| _timestamp       | Kinesis大まかな到着タイムスタンプ（ミリ秒精度）        | DateTime64(3)      |
| _stream          | Kinesisストリーム名                                      | 文字列             |
| _sequence_number | Kinesisシーケンス番号                                    | 文字列             |
| _raw_message     | 完全なKinesisメッセージ                                   | 文字列             |

_raw_messageフィールドは、完全なKinesis JSONレコードが必要な場合（例えば、ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のマテリアライズドビューをポピュレートする場合）に使用できます。このようなパイプでは、すべての「非バーチャル」カラムを削除することでClickPipesのパフォーマンスが向上する場合があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesは、バッチでClickHouseにデータを挿入します。これは、データベース内にあまりにも多くのパーツを作成することを避け、クラスターでのパフォーマンス問題につながる可能性があるためです。

バッチは以下のいずれかの基準が満たされたときに挿入されます：
- バッチサイズが最大サイズに達した場合（100,000行または20MB）
- バッチが最大時間（5秒）オープンされている場合

### レイテンシ {#latency}

レイテンシ（Kinesisメッセージがストリームに送信されてからClickHouseでメッセージが使用可能になるまでの時間として定義）は、Kinesisレイテンシ、ネットワークレイテンシ、メッセージのサイズ/形式などの複数の要因に依存します。上記の[バッチ処理](#batching)もレイテンシに影響を与えます。具体的なユースケースをテストして、期待するレイテンシを理解することを常にお勧めします。

特定の低レイテンシ要件がある場合は、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### スケーリング {#scaling}

Kinesis向けのClickPipesは、水平スケーリングのために設計されています。デフォルトでは、1つのコンシューマを持つコンシューマグループを作成します。
これは、ClickPipeの詳細ビューでスケーリングコントロールで変更することができます。

ClickPipesは高可用性と可用性ゾーン分散アーキテクチャを提供します。
これには、少なくとも2つのコンシューマにスケーリングする必要があります。

実行中のコンシューマの数に関わらず、設計上フォールトトレラント性が利用可能です。
コンシューマまたはその基盤となるインフラストラクチャが故障した場合、
ClickPipeは自動的にコンシューマを再起動し、メッセージの処理を再開します。

## 認証 {#authentication}

Amazon Kinesisストリームにアクセスするには、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。 IAMロールの設定方法の詳細については、ClickHouse Cloudで動作するロールの設定に関する情報は[こちらのガイド](./secure-kinesis.md)を参照してください。
