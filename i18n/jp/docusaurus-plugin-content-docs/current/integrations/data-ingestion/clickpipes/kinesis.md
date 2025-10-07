---
'sidebar_label': 'ClickPipes for Amazon Kinesis'
'description': 'あなたのAmazon KinesisデータソースをClickHouse Cloudにシームレスに接続します。'
'slug': '/integrations/clickpipes/kinesis'
'title': 'Amazon KinesisとClickHouse Cloudの統合'
'doc_type': 'guide'
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


# Integrating Amazon Kinesis with ClickHouse Cloud
## Prerequisite {#prerequisite}
ClickPipesの[紹介](./index.md)に目を通し、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を設定していることを確認します。[Kinesisロールベースアクセスガイド](./secure-kinesis.md)を参照して、ClickHouse Cloudで動作するロールの設定方法についての情報を確認してください。

## Creating your first ClickPipe {#creating-your-first-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューから「データソース」ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="データソースタイプを選択" size="lg" border/>

4. フォームに必要事項を入力します。ClickPipeに名前、説明（オプション）、IAMロールまたは認証情報、その他の接続詳細を提供します。

<Image img={cp_step2_kinesis} alt="接続詳細を入力" size="lg" border/>

5. Kinesisストリームと開始オフセットを選択します。UIは選択されたソース（Kafkaトピックなど）からサンプルドキュメントを表示します。また、ClickPipeのパフォーマンスと安定性を向上させるためにKinesisストリームのEnhanced Fan-outを有効にすることもできます（Enhanced Fan-outに関する詳細は[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)で確認できます）。

<Image img={cp_step3_kinesis} alt="データフォーマットとトピックを設定" size="lg" border/>

6. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、設定を変更します。サンプルテーブルの上部で変更のリアルタイムプレビューを見ることができます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を設定" size="lg" border/>

  提供されたコントロールを使用して、詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="詳細コントロールを設定" size="lg" border/>

7. あるいは、既存のClickHouseテーブルにデータを取り込む選択もできます。その場合、UIはソースからのフィールドを選択された宛先テーブル内のClickHouseフィールドにマッピングすることを許可します。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

8. 最後に、内部のClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesは、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザー用にカスタムロールまたは定義済みのロールのいずれかを選択できます：
    - `フルアクセス`: クラスターへのフルアクセスを持つ。宛先テーブルでMaterialized ViewやDictionaryを使用する場合に便利です。
    - `宛先テーブルのみ`: 宛先テーブルへの`INSERT`権限のみを持つ。

<Image img={cp_step5} alt="権限" border/>

9. 「セットアップを完了」をクリックすると、システムはClickPipeを登録し、概要テーブルに表示されます。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

  概要テーブルは、ClickHouseのソースまたは宛先テーブルからサンプルデータを表示するためのコントロールを提供します。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

  さらに、ClickPipeを削除し、取り込みジョブの概要を表示するためのコントロールも備えています。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

10. **おめでとうございます！** 最初のClickPipeを正常に設定しました。これがストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを取り込み続けます。それ以外の場合は、バッチを取り込み、完了します。

## Supported data formats {#supported-data-formats}

サポートされているフォーマットは以下です：
- [JSON](../../../interfaces/formats.md/#json)

## Supported data types {#supported-data-types}

### Standard types support {#standard-types-support}
次のClickHouseデータ型は現在ClickPipesでサポートされています：

- 基本的な数値型 - \[U\]Int8/16/32/64, Float32/64、およびBFloat16
- 大整数型 - \[U\]Int128/256
- 小数型
- ブール型
- 文字列型
- FixedString型
- 日付型、Date32型
- DateTime型、DateTime64型（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記の型（Nullableを含む）を使用したキーと値のマップ
- 上記の型（Nullableを含む、1レベルの深さのみ）を使用した要素のタプルおよび配列
- SimpleAggregateFunction型（AggregatingMergeTreeまたはSummingMergeTree宛先用）

### Variant type support {#variant-type-support}
ソースデータストリーム内の任意のJSONフィールドに対してVariant型（例:`Variant(String, Int64, DateTime)`）を手動で指定できます。ClickPipesが使用するべき正しいバリアントサブタイプを決定する方法のため、Variant定義には整数型または日付時刻型を1つだけ使用できます。例えば、`Variant(Int64, UInt32)`はサポートされていません。

### JSON type support {#json-type-support}
常にJSONオブジェクトであるJSONフィールドは、JSON宛先カラムに割り当てることができます。宛先カラムを希望のJSON型に手動で変更する必要があります。この際、固定されたパスやスキップされたパスも含まれます。

## Kinesis virtual columns {#kinesis-virtual-columns}

Kinesisストリームに対してサポートされている仮想カラムは以下の通りです。新しい宛先テーブルを作成する際は、「カラムを追加」ボタンを使用して仮想カラムを追加できます。

| 名前               | 説明                                                     | 推奨データ型        |
|--------------------|----------------------------------------------------------|---------------------|
| _key               | Kinesisパーティションキー                                 | String              |
| _timestamp         | Kinesis近似到着タイムスタンプ（ミリ秒精度）            | DateTime64(3)       |
| _stream            | Kinesisストリーム名                                      | String              |
| _sequence_number   | Kinesisシーケンス番号                                    | String              |
| _raw_message       | 完全なKinesisメッセージ                                  | String              |

_raw_messageフィールドは、完全なKinesis JSONレコードが必要な場合（例えば、ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のMaterialized Viewを埋めるとき）に使用できます。このようなパイプでは、ClickPipesのパフォーマンスを向上させるために、すべての「非仮想」カラムを削除することが推奨されます。

## Limitations {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## Performance {#performance}

### Batching {#batching}
ClickPipesはバッチでClickHouseにデータを挿入します。これは、パーツがデータベース内で多すぎることを避け、クラスターのパフォーマンス問題を引き起こす可能性があります。

バッチは次のいずれかの条件を満たすと挿入されます：
- バッチサイズが最大サイズ（100,000行または1GBのレプリカメモリあたり32MB）に達した
- バッチが最大期間（5秒）開いていた

### Latency {#latency}

遅延（Kinesisメッセージがストリームに送信され、ClickHouseでメッセージが利用可能になるまでの時間として定義）は、さまざまな要因によって異なります（例：Kinesisの遅延、ネットワークの遅延、メッセージサイズ/フォーマット）。上記のセクションで説明した[バッチ処理](#batching)は、遅延にも影響を与えます。特定のユースケースをテストして期待される遅延を理解することを常に推奨します。

特定の低遅延要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### Scaling {#scaling}

Kinesis向けのClickPipesは、水平および垂直にスケールするように設計されています。デフォルトでは、1つのコンシューマを持つコンシューマグループを作成します。これはClickPipe作成時、または他の任意の時点で**設定** -> **詳細設定** -> **スケーリング**の下で設定することができます。

ClickPipesは、高可用性を提供する可用性ゾーン分散アーキテクチャを持っています。これには、少なくとも2つのコンシューマにスケールする必要があります。

実行中のコンシューマの数にかかわらず、フォールトトレランスは設計上利用可能です。コンシューマまたはその基盤となるインフラストラクチャが失敗した場合、ClickPipeは自動的にコンシューマを再起動し、メッセージの処理を続行します。

## Authentication {#authentication}

Amazon Kinesisストリームにアクセスするには、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。IAMロールの設定方法の詳細については、ClickHouse Cloudで動作するロールの設定方法に関する情報を[こちらのガイド](./secure-kinesis.md)で参照できます。
