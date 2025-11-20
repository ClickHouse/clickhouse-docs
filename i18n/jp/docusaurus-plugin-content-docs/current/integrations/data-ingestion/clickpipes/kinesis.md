---
sidebar_label: 'Amazon Kinesis 用 ClickPipes'
description: 'Amazon Kinesis のデータソースを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/kinesis
title: 'Amazon Kinesis と ClickHouse Cloud の連携'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', 'data ingestion']
---

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

[ClickPipesの概要](./index.md)を確認し、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を設定済みであることが前提となります。ClickHouse Cloudで使用するロールの設定方法については、[Kinesisロールベースアクセスガイド](./secure-kinesis.md)を参照してください。


## 最初のClickPipeの作成 {#creating-your-first-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt='ClickPipes service' size='lg' border />

2. 左側メニューの`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt='Select imports' size='lg' border />

3. データソースを選択します。

<Image img={cp_step1} alt='Select data source type' size='lg' border />

4. ClickPipeの名前、説明(任意)、IAMロールまたは認証情報、その他の接続詳細を入力してフォームに記入します。

<Image
  img={cp_step2_kinesis}
  alt='Fill out connection details'
  size='lg'
  border
/>

5. Kinesis Streamと開始オフセットを選択します。UIには選択したソース(Kafkaトピックなど)からのサンプルドキュメントが表示されます。また、Kinesis StreamsのEnhanced Fan-outを有効にすることで、ClickPipeのパフォーマンスと安定性を向上させることができます(Enhanced Fan-outの詳細については[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)を参照してください)。

<Image
  img={cp_step3_kinesis}
  alt='Set data format and topic'
  size='lg'
  border
/>

6. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、設定を変更します。上部のサンプルテーブルで変更内容をリアルタイムでプレビューできます。

<Image img={cp_step4a} alt='Set table, schema, and settings' size='lg' border />

提供されているコントロールを使用して、詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt='Set advanced controls' size='lg' border />

7. または、既存のClickHouseテーブルにデータを取り込むこともできます。その場合、UIでソースのフィールドを選択した宛先テーブルのClickHouseフィールドにマッピングできます。

<Image img={cp_step4b} alt='Use an existing table' size='lg' border />

8. 最後に、内部ClickPipesユーザーの権限を設定できます。

   **権限:** ClickPipesは宛先テーブルへのデータ書き込み専用のユーザーを作成します。この内部ユーザーに対して、カスタムロールまたは事前定義されたロールのいずれかを選択できます:
   - `Full access`: クラスタへの完全なアクセス権。宛先テーブルでマテリアライズドビューやDictionaryを使用する場合に便利です。
   - `Only destination table`: 宛先テーブルへの`INSERT`権限のみ。

<Image img={cp_step5} alt='Permissions' border />

9. 「Complete Setup」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに表示されます。

<Image img={cp_success} alt='Success notice' size='sm' border />

<Image img={cp_remove} alt='Remove notice' size='lg' border />

サマリーテーブルには、ソースまたはClickHouseの宛先テーブルからサンプルデータを表示するコントロールが用意されています。

<Image img={cp_destination} alt='View destination' size='lg' border />

また、ClickPipeを削除したり、取り込みジョブのサマリーを表示したりするコントロールもあります。

<Image img={cp_overview} alt='View overview' size='lg' border />

10. **おめでとうございます!** 最初のClickPipeのセットアップが完了しました。ストリーミングClickPipeの場合、リモートデータソースからリアルタイムでデータを取り込みながら継続的に実行されます。バッチ処理の場合は、バッチを取り込んで完了します。


## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：

- [JSON](/interfaces/formats/JSON)


## サポートされるデータ型 {#supported-data-types}

### 標準型のサポート {#standard-types-support}

現在、ClickPipesでは以下のClickHouseデータ型がサポートされています：

- 基本数値型 - \[U\]Int8/16/32/64、Float32/64、BFloat16
- 大整数型 - \[U\]Int128/256
- Decimal型
- Boolean
- String
- FixedString
- Date、Date32
- DateTime、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記の型（Nullableを含む）をキーおよび値として使用するMap
- 上記の型（Nullableを含む、深さ1レベルのみ）を要素として使用するTupleおよびArray
- SimpleAggregateFunction型（AggregatingMergeTreeまたはSummingMergeTreeの宛先用）

### Variant型のサポート {#variant-type-support}

ソースデータストリーム内の任意のJSONフィールドに対して、Variant型（例：`Variant(String, Int64, DateTime)`）を手動で指定できます。ClickPipesが使用する正しいバリアントサブタイプを決定する方法の都合上、Variant定義では整数型または日時型のいずれか1つのみを使用できます。例えば、`Variant(Int64, UInt32)`はサポートされていません。

### JSON型のサポート {#json-type-support}

常にJSONオブジェクトであるJSONフィールドは、JSON型の宛先カラムに割り当てることができます。固定パスやスキップパスを含め、宛先カラムを目的のJSON型に手動で変更する必要があります。


## Kinesis仮想カラム {#kinesis-virtual-columns}

Kinesisストリームでは以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名前              | 説明                                                   | 推奨データ型 |
| ----------------- | ------------------------------------------------------------- | --------------------- |
| \_key             | Kinesisパーティションキー                                         | String                |
| \_timestamp       | Kinesis到着タイムスタンプの近似値（ミリ秒精度） | DateTime64(3)         |
| \_stream          | Kinesisストリーム名                                           | String                |
| \_sequence_number | Kinesisシーケンス番号                                       | String                |
| \_raw_message     | Kinesisメッセージ全体                                          | String                |

\_raw_messageフィールドは、完全なKinesis JSONレコードのみが必要な場合に使用できます（例えば、ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のマテリアライズドビューにデータを投入する場合など）。このようなパイプでは、すべての「非仮想」カラムを削除することでClickPipesのパフォーマンスが向上する可能性があります。


## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) はサポートされていません。


## パフォーマンス {#performance}

### バッチ処理 {#batching}

ClickPipesはデータをバッチ単位でClickHouseに挿入します。これは、データベース内に過剰なパートが作成されることを防ぎ、クラスタのパフォーマンス問題を回避するためです。

バッチは、以下のいずれかの条件が満たされた時点で挿入されます:

- バッチサイズが最大サイズに達した場合(レプリカメモリ1GBあたり100,000行または32MB)
- バッチが最大時間開かれている場合(5秒)

### レイテンシ {#latency}

レイテンシ(Kinesisメッセージがストリームに送信されてからClickHouseでメッセージが利用可能になるまでの時間として定義)は、複数の要因(Kinesisのレイテンシ、ネットワークレイテンシ、メッセージサイズ/形式など)に依存します。上記のセクションで説明した[バッチ処理](#batching)もレイテンシに影響します。期待できるレイテンシを把握するため、特定のユースケースでテストを実施することを常に推奨します。

特定の低レイテンシ要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

ClickPipes for Kinesisは、水平方向と垂直方向の両方にスケールするよう設計されています。デフォルトでは、1つのコンシューマーを持つコンシューマーグループを作成します。これは、ClickPipe作成時、または**Settings** -> **Advanced Settings** -> **Scaling**から任意の時点で設定できます。

ClickPipesは、アベイラビリティゾーン分散アーキテクチャにより高可用性を提供します。
これには、少なくとも2つのコンシューマーへのスケーリングが必要です。

実行中のコンシューマー数に関わらず、設計上フォールトトレランスが利用可能です。
コンシューマーまたはその基盤となるインフラストラクチャに障害が発生した場合、
ClickPipeは自動的にコンシューマーを再起動し、メッセージの処理を継続します。


## 認証 {#authentication}

Amazon Kinesisストリームにアクセスするには、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。IAMロールの設定方法の詳細については、ClickHouse Cloudで使用するロールの設定手順を記載した[こちらのガイド](./secure-kinesis.md)を参照してください。
