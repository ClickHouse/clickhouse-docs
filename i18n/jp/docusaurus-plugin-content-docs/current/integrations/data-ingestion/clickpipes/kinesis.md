---
sidebar_label: ClickPipes for Amazon Kinesis
description: Amazon KinesisデータソースをClickHouse Cloudにシームレスに接続します。
slug: /integrations/clickpipes/kinesis
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


# Amazon KinesisとClickHouse Cloudの統合
## 前提条件 {#prerequisite}
[ClickPipesの紹介](./index.md)に目を通し、[IAM資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)をセットアップしたことを確認してください。ClickHouse Cloudで動作するロールのセットアップ方法については[Kinesisロールベースのアクセスガイド](./secure-kinesis.md)を参照してください。

## 最初のClickPipeの作成 {#creating-your-first-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<img src={cp_service} alt="ClickPipesサービス" />

2. 左側のメニューから`データソース`ボタンを選択し、「ClickPipeをセットアップ」をクリックします。

<img src={cp_step0} alt="インポートの選択" />

3. データソースを選択します。

<img src={cp_step1} alt="データソースタイプの選択" />

4. ClickPipeの名前、説明（オプション）、IAMロールまたは資格情報、その他の接続詳細を提供してフォームに記入します。

<img src={cp_step2_kinesis} alt="接続詳細を記入" />

5. Kinesisストリームと開始オフセットを選択します。UIは選択したソースからのサンプルドキュメント（Kafkaトピックなど）を表示します。また、Kinesisストリームのパフォーマンスと安定性を向上させるためにEnhanced Fan-outを有効にすることもできます（Enhanced Fan-outの詳細については[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)を参照してください）。

<img src={cp_step3_kinesis} alt="データ形式とトピックの設定" />

6. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更してください。変更のリアルタイムプレビューが画面の上部に表示されます。

<img src={cp_step4a} alt="テーブル、スキーマ、および設定の設定" />

  提供されているコントロールを使用して、詳細設定をカスタマイズすることもできます。

<img src={cp_step4a3} alt="詳細設定の設定" />

7. あるいは、既存のClickHouseテーブルにデータを取り込むこともできます。その場合、UIはソースから選択した宛先テーブルのClickHouseフィールドへのフィールドをマッピングできるようにします。

<img src={cp_step4b} alt="既存のテーブルを使用" />

8. 最後に、内部ClickPipesユーザーの権限を構成できます。

  **権限:** ClickPipesは、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーの役割は、カスタムロールまたは定義済みの役割のいずれかを使用して選択できます。
    - `フルアクセス`: クラスターへのフルアクセスを提供。これは、宛先テーブルにMaterialized ViewやDictionaryを使用する場合に有用です。
    - `宛先テーブルのみ`: 宛先テーブルへの`INSERT`権限のみを持つ。

<img src={cp_step5} alt="権限" />

9. 「セットアップを完了」をクリックすると、システムはClickPipeを登録し、要約テーブルに表示されるようになります。

<img src={cp_success} alt="成功通知" />

<img src={cp_remove} alt="削除通知" />

  要約テーブルでは、ClickHouse内のソースまたは宛先テーブルからのサンプルデータを表示するコントロールが提供されます。

<img src={cp_destination} alt="宛先の表示" />

  ClickPipeを削除し、取り込みジョブの概要を表示するコントロールもあります。

<img src={cp_overview} alt="概要の表示" />

10. **おめでとうございます！** あなたは最初のClickPipeを正常に設定しました。これがストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを継続的に取り込みます。そうでない場合は、バッチを取り込み、完了します。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです。
- [JSON](../../../interfaces/formats.md/#json)

## サポートされているデータ型 {#supported-data-types}

現在、ClickPipesでサポートされているClickHouseのデータ型は次のとおりです。

- 基本数値型 - \[U\]Int8/16/32/64およびFloat32/64
- 大きな整数型 - \[U\]Int128/256
- 小数型
- ブール値
- 文字列
- FixedString
- 日付、Date32
- DateTime、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記の任意の型（Nullableを含む）を使用するキーと値のあるマップ
- 上記の任意の型（Nullableを含む、1レベル深さのみ）を使用するタプルおよび配列

## Kinesis仮想カラム {#kinesis-virtual-columns}

次の仮想カラムがKinesisストリームに対応しています。新しい宛先テーブルを作成する際に、`カラムを追加`ボタンを使用して仮想カラムを追加できます。

| 名前               | 説明                                                        | 推奨データ型            |
|--------------------|------------------------------------------------------------|------------------------|
| _key               | Kinesisパーティションキー                                   | 文字列                 |
| _timestamp         | Kinesisの近似到着タイムスタンプ（ミリ秒精度）              | DateTime64(3)          |
| _stream            | Kinesisストリーム名                                        | 文字列                 |
| _sequence_number    | Kinesisシーケンス番号                                      | 文字列                 |
| _raw_message       | 完全なKinesisメッセージ                                    | 文字列                 |

_raw_messageフィールドは、完全なKinesis JSONレコードが必要な場合（下流のmaterialized viewをポピュレートするためにClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用する場合など）に使用できます。このようなパイプの場合、ClickPipesのパフォーマンスを改善するために、すべての「非仮想」カラムを削除することが望ましいことがあります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesはデータをClickHouseにバッチ処理で挿入します。これは、データベース内にパーツを多く作成することを避け、クラスターのパフォーマンス問題を引き起こす可能性があります。

バッチが挿入されるのは、以下のいずれかの条件が満たされたときです。
- バッチサイズが最大サイズ（100,000行または20MB）に達した場合
- バッチが最大時間（5秒）オープンされている場合

### 遅延 {#latency}

遅延（Kinesisメッセージがストリームに送信され、メッセージがClickHouseで利用可能になるまでの時間）は、Kinesisの遅延、ネットワークの遅延、メッセージのサイズ/形式など、さまざまな要因に依存します。上記の[バッチ処理](#batching)も遅延に影響を与えます。具体的なユースケースをテストして、期待される遅延を理解することを推奨します。

特定の低遅延要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

Kinesis用のClickPipesは、水平スケーリングを目的としています。デフォルトでは、1つのコンシューマを持つコンシューマグループを作成します。この設定は、ClickPipeの詳細ビューでのスケーリングコントロールを使用して変更できます。

ClickPipesは、高可用性を持つ可用性ゾーン分散アーキテクチャを提供します。これには、少なくとも2つのコンシューマへのスケーリングが必要です。

実行中のコンシューマの数に関わらず、フォールトトレランスは設計上の特徴です。コンシューマまたはその基盤となるインフラストラクチャに障害が発生すると、ClickPipeは自動的にコンシューマを再起動し、メッセージの処理を続行します。

## 認証 {#authentication}

Amazon Kinesisストリームにアクセスするには、[IAM資格情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。IAMロールの設定方法に関する詳細については、ClickHouse Cloudで動作するロールを設定する方法についての[このガイド](./secure-kinesis.md)を参照してください。
