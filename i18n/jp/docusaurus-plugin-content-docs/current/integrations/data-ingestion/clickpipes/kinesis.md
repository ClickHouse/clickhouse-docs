---
sidebar_label: 'Amazon Kinesis 用 ClickPipes'
description: 'Amazon Kinesis データソースを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/kinesis
title: 'Amazon Kinesis と ClickHouse Cloud の統合'
doc_type: 'ガイド'
keywords: ['clickpipes', 'kinesis', 'ストリーミング', 'aws', 'データインジェスト']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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

# Amazon Kinesis を ClickHouse Cloud と統合する {#integrating-amazon-kinesis-with-clickhouse-cloud}

## 前提条件 {#prerequisite}

事前に [ClickPipes intro](./index.md) に目を通し、[IAM credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) または [IAM Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) を設定しておいてください。ClickHouse Cloud で利用するロールの設定方法については、[Kinesis Role-Based Access guide](./secure-kinesis.md) を参照してください。

## 最初の ClickPipe を作成する {#creating-your-first-clickpipe}

1. 使用している ClickHouse Cloud サービスの SQL Console にアクセスします。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側メニューで `Data Sources` ボタンを選択し、「ClickPipe をセットアップ」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="データソースの種類を選択" size="lg" border/>

4. ClickPipe の名前、説明（任意）、IAM ロールまたは認証情報、その他の接続詳細を入力してフォームを完成させます。

<Image img={cp_step2_kinesis} alt="接続詳細を入力" size="lg" border/>

5. Kinesis Stream と開始オフセットを選択します。UI には、選択したソース（Kafka トピックなど）からのサンプルドキュメントが表示されます。ClickPipe のパフォーマンスと安定性を向上させるために、Kinesis ストリームで Enhanced Fan-out を有効にすることもできます（Enhanced Fan-out の詳細は[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)を参照してください）。

<Image img={cp_step3_kinesis} alt="データ形式とトピックを設定" size="lg" border/>

6. 次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。上部のサンプルテーブルで、変更内容をリアルタイムにプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を構成" size="lg" border/>

7. また、提供されているコントロールを使用して詳細設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="詳細コントロールを設定" size="lg" border/>

8. もしくは、既存の ClickHouse テーブルにデータを取り込むように設定することもできます。その場合、UI では、ソースのフィールドを、選択した宛先テーブル内の ClickHouse のフィールドにマッピングできます。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

9. 最後に、内部 ClickPipes ユーザーの権限を構成できます。

**権限:** ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーに対して、カスタムロールまたはあらかじめ定義されたロールのいずれかを使用してロールを選択できます。

- `Full access`: クラスタへのフルアクセス権を持ちます。宛先テーブルでマテリアライズドビューや Dictionary を使用する場合に便利です。
- `Only destination table`: 宛先テーブルに対する `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="権限" border/>

10. 「セットアップを完了」をクリックすると、システムは ClickPipe を登録し、サマリー テーブルに一覧表示されるようになります。

<Image img={cp_success} alt="成功メッセージ" size="sm" border/>

<Image img={cp_remove} alt="削除メッセージ" size="lg" border/>

11. サマリー テーブルでは、ClickHouse 内のソースまたは宛先テーブルからサンプルデータを表示するためのコントロールが提供されます。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

12. また、ClickPipe を削除したり、取り込みジョブのサマリーを表示したりするためのコントロールも提供されます。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

13. **おめでとうございます！** これで最初の ClickPipe のセットアップが完了しました。ストリーミング ClickPipe の場合は、リモートデータソースからリアルタイムでデータを継続的に取り込み続けます。そうでない場合は、バッチを取り込んだあとに完了します。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下のとおりです:

- [JSON](/interfaces/formats/JSON)

## サポートされているデータ型 {#supported-data-types}

### 標準データ型のサポート {#standard-types-support}

ClickPipes で現在サポートされている ClickHouse のデータ型は次のとおりです。

- 基本数値型 - \[U\]Int8/16/32/64、Float32/64、および BFloat16
- 大きな整数型 - \[U\]Int128/256
- Decimal 型
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64（UTC タイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべての ClickHouse の LowCardinality 型
- 上記のいずれかの型（Nullable を含む）をキーおよび値に使用する Map 型
- 上記のいずれかの型（Nullable を含む、1 段階のネストのみ）を要素に使用する Tuple 型および Array 型
- SimpleAggregateFunction 型（AggregatingMergeTree または SummingMergeTree を宛先とする場合）

### Variant 型のサポート {#variant-type-support}
ソースデータストリーム内の任意の JSON フィールドに対して、`Variant(String, Int64, DateTime)` のような Variant 型を手動で指定できます。
ClickPipes が使用する正しい Variant のサブタイプを判定する仕組み上、Variant 定義内で使用できる整数型または日時型は 1 種類のみです。
たとえば、`Variant(Int64, UInt32)` はサポートされません。

### JSON 型のサポート {#json-type-support}

常に JSON オブジェクトである JSON フィールドは、JSON 型の宛先カラムに割り当てることができます。固定パスやスキップされたパスを含め、目的の JSON 型に
宛先カラムを手動で変更する必要があります。 

## Kinesis 仮想カラム {#kinesis-virtual-columns}

Kinesis ストリームでは、次の仮想カラムがサポートされています。新しい宛先テーブルを作成する際、`Add Column` ボタンを使用して仮想カラムを追加できます。

| Name             | Description                                                            | Recommended Data Type |
|------------------|------------------------------------------------------------------------|-----------------------|
| _key             | Kinesis パーティションキー                                             | String                |
| _timestamp       | Kinesis おおよその到着タイムスタンプ（ミリ秒精度）                    | DateTime64(3)         |
| _stream          | Kinesis ストリーム名                                                   | String                |
| _sequence_number | Kinesis シーケンス番号                                                 | String                |
| _raw_message     | Kinesis メッセージ全体                                                 | String                |

_raw_message フィールドは、Kinesis JSON レコード全体のみが必要な場合（ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して下流のマテリアライズドビューを作成する場合など）に使用できます。そのようなパイプでは、「非仮想」カラムをすべて削除することで ClickPipes のパフォーマンスが向上する場合があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) はサポートされていません。

## パフォーマンス {#performance}

### バッチ処理 {#batching}

ClickPipes はデータを ClickHouse にバッチ単位で挿入します。これは、データベース内に過度に多くのパーツが作成されてクラスターのパフォーマンス問題につながることを防ぐためです。

バッチは、次のいずれかの条件を満たしたときに挿入されます：
- バッチサイズが最大サイズ（レプリカメモリ 1GB あたり 100,000 行または 32MB）に達した場合
- バッチが開かれている時間が最大値（5 秒）に達した場合

### レイテンシ {#latency}

レイテンシ（Kinesis メッセージがストリームに送信されてから、そのメッセージが ClickHouse で利用可能になるまでの時間として定義）は、複数の要因（Kinesis のレイテンシ、ネットワークのレイテンシ、メッセージサイズ／フォーマットなど）に依存します。上記セクションで説明した [バッチ処理](#batching) もレイテンシに影響します。想定されるレイテンシを把握するために、必ずお客様のユースケースでテストすることを推奨します。

低レイテンシの要件がある場合は、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### スケーリング {#scaling}

ClickPipes for Kinesis は、水平方向および垂直方向の両方にスケールするように設計されています。デフォルトでは、1 つのコンシューマを持つコンシューマグループを作成します。これは ClickPipe 作成時、またはそれ以降いつでも **Settings** -> **Advanced Settings** -> **Scaling** から設定できます。

ClickPipes は、アベイラビリティゾーンに分散したアーキテクチャにより高可用性を提供します。
そのためには、少なくとも 2 つのコンシューマへのスケーリングが必要です。

実行中のコンシューマ数にかかわらず、フォールトトレランスは設計上備わっています。
コンシューマまたはその基盤インフラストラクチャに障害が発生した場合でも、
ClickPipe はコンシューマを自動的に再起動し、メッセージ処理を継続します。

## 認証 {#authentication}

Amazon Kinesis ストリームにアクセスするには、[IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。IAM ロールの設定方法の詳細については、ClickHouse Cloud で利用できるロールの設定方法を説明した[このガイド](./secure-kinesis.md)を参照してください。