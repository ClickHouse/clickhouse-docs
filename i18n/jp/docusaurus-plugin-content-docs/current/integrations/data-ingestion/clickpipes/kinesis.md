---
sidebar_label: 'Amazon Kinesis 向け ClickPipes'
description: 'Amazon Kinesis のデータソースを ClickHouse Cloud にシームレスに接続します。'
slug: /integrations/clickpipes/kinesis
title: 'Amazon Kinesis と ClickHouse Cloud の統合'
doc_type: 'guide'
keywords: ['clickpipes', 'kinesis', 'streaming', 'aws', 'データインジェスト']
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


# Amazon Kinesis と ClickHouse Cloud の統合 \{#integrating-amazon-kinesis-with-clickhouse-cloud\}

## 前提条件 \{#prerequisite\}

[ClickPipes の概要](./index.md)に事前に目を通し、[IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または [IAM Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) を設定している必要があります。ClickHouse Cloud と連携するロールの設定方法については、[Kinesis Role-Based Access ガイド](./secure-kinesis.md)に従ってください。

## 最初の ClickPipe を作成する \{#creating-your-first-clickpipe\}

1. ClickHouse Cloud サービスの SQL Console にアクセスします。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側のメニューで `Data Sources` ボタンを選択し、「ClickPipe をセットアップ」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="データソースタイプを選択" size="lg" border/>

4. ClickPipe に名前、説明（任意）、IAM ロールまたは認証情報、その他の接続情報を入力してフォームを埋めます。

<Image img={cp_step2_kinesis} alt="接続詳細を入力" size="lg" border/>

5. Kinesis Stream と開始オフセットを選択します。UI には、選択したソース（Kafka トピックなど）からのサンプルドキュメントが表示されます。Kinesis ストリームに対して Enhanced Fan-out を有効にして、ClickPipe のパフォーマンスと安定性を向上させることもできます（Enhanced Fan-out の詳細は[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)を参照してください）。

<Image img={cp_step3_kinesis} alt="データフォーマットとトピックを設定" size="lg" border/>

6. 次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。画面上部のサンプルテーブルで、変更内容をリアルタイムにプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、設定を構成" size="lg" border/>

7. 用意されているコントロールを使用して、高度な設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="高度なコントロールを設定" size="lg" border/>

8. あるいは、既存の ClickHouse テーブルにデータを取り込むように選択することもできます。その場合、UI でソースのフィールドを、選択した宛先テーブル内の ClickHouse フィールドにマッピングできるようになります。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

9. 最後に、内部 ClickPipes ユーザーの権限を構成できます。

**Permissions:** ClickPipes は、宛先テーブルにデータを書き込む専用のユーザーを作成します。この内部ユーザーに対して、カスタムロールまたは事前定義されたロールのいずれかを使用してロールを選択できます。

- `Full access`: クラスターへのフルアクセス権を持ちます。宛先テーブルで materialized view または Dictionary を使用する場合に役立ちます。
- `Only destination table`: 宛先テーブルに対する `INSERT` 権限のみを持ちます。

<Image img={cp_step5} alt="権限" border/>

10. 「Complete Setup」をクリックすると、ClickPipe が登録され、サマリーテーブルに一覧表示されるようになります。

<Image img={cp_success} alt="成功通知" size="sm" border/>

11. 登録後、必要に応じて ClickPipe を削除できます。

<Image img={cp_remove} alt="削除通知" size="lg" border/>

12. サマリーテーブルには、ソースまたは ClickHouse の宛先テーブルからサンプルデータを表示するためのコントロールが用意されています。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

また、ClickPipe を削除したり、取り込みジョブのサマリーを表示したりするためのコントロールも用意されています。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

13. **おめでとうございます！** 最初の ClickPipe のセットアップが完了しました。これがストリーミング ClickPipe の場合、リモートデータソースからリアルタイムで継続的にデータを取り込み続けます。それ以外の場合は、バッチ取り込みを行って終了します。

## サポートされているデータ形式 \{#supported-data-formats\}

サポートされている形式は次のとおりです。

- [JSON](/interfaces/formats/JSON)

## 対応しているデータ型 \{#supported-data-types\}

### 標準データ型のサポート \{#standard-types-support\}

現在、ClickPipes でサポートされている ClickHouse のデータ型は次のとおりです。

- 基本的な数値型 - \[U\]Int8/16/32/64、Float32/64、BFloat16
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
- すべての ClickHouse LowCardinality 型
- 上記のいずれかの型（Nullable を含む）をキーと値に使用する Map
- 上記のいずれかの型（Nullable を含む、1 階層のみ）を要素に使用する Tuple および Array
- SimpleAggregateFunction 型（AggregatingMergeTree または SummingMergeTree を宛先とする場合）

### Variant 型サポート \{#variant-type-support\}

ソースデータストリーム内の任意の JSON フィールドに対して、`Variant(String, Int64, DateTime)` のように手動で Variant 型を指定できます。
ClickPipes が使用する正しい Variant サブタイプを判別する仕組み上、Variant 定義内で使用できる整数型や DateTime 型は 1 種類だけに制限されます。例えば、`Variant(Int64, UInt32)` はサポートされません。

### JSON 型サポート \{#json-type-support\}

常に JSON オブジェクトである JSON フィールドは、JSON 型の宛先カラムに割り当てることができます。その際、固定パスやスキップするパスを含めて、宛先カラムを目的の JSON 型に手動で変更する必要があります。 

## Kinesis 仮想カラム \{#kinesis-virtual-columns\}

Kinesis ストリームでは、以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際、`Add Column` ボタンを使用して仮想カラムを追加できます。

| Name             | Description                                                   | Recommended Data Type |
|------------------|---------------------------------------------------------------|-----------------------|
| _key             | Kinesis パーティションキー                                    | String                |
| _timestamp       | Kinesis の推定到着時刻（ミリ秒精度）                         | DateTime64(3)         |
| _stream          | Kinesis ストリーム名                                          | String                |
| _sequence_number | Kinesis シーケンス番号                                        | String                |
| _raw_message     | Kinesis メッセージ全体                                        | String                |

_raw_message フィールドは、完全な Kinesis JSON レコードのみが必要な場合（たとえば ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して下流のマテリアライズドビューを構成する場合など）に使用できます。このようなパイプラインでは、ClickPipes のパフォーマンスを向上させるために、すべての「非仮想」カラムを削除することを検討してください。

## 制限事項 \{#limitations\}

- [DEFAULT](/sql-reference/statements/create/table#default) はサポートされていません。
- 個々のメッセージのサイズは、最小サイズ (XS) のレプリカで運用している場合はデフォルトで 8MB (非圧縮)、それより大きなレプリカでは 16MB (非圧縮) に制限されます。この制限を超えるメッセージはエラーとなり拒否されます。より大きなメッセージが必要な場合は、サポートまでお問い合わせください。

## パフォーマンス \{#performance\}

### バッチ処理 \{#batching\}

ClickPipes はデータを ClickHouse にバッチ単位で挿入します。これは、データベース内に過剰な数のパーツが作成されることにより、クラスターでパフォーマンス上の問題が発生するのを防ぐためです。

バッチは、次のいずれかの条件を満たした時点で挿入されます。

- バッチサイズが最大サイズに達した場合（100,000 行、またはレプリカメモリ 1GB あたり 32MB）
- バッチが開かれてからの経過時間が上限（5 秒）に達した場合

### レイテンシ \{#latency\}

レイテンシ（Kinesis メッセージがストリームに送信されてから、そのメッセージが ClickHouse で利用可能になるまでの時間として定義）は、複数の要因（Kinesis のレイテンシ、ネットワークのレイテンシ、メッセージのサイズ／フォーマットなど）に左右されます。上のセクションで説明した [バッチ処理](#batching) もレイテンシに影響します。想定されるレイテンシを把握するために、必ずご自身のユースケースでテストすることを推奨します。

特定の低レイテンシ要件がある場合は、[こちらからお問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### スケーリング \{#scaling\}

Kinesis 向け ClickPipes は、水平方向および垂直方向の両方にスケールできるように設計されています。デフォルトでは、1 つのコンシューマーを持つコンシューマーグループを作成します。これは、ClickPipe の作成時、または任意のタイミングで **Settings** -> **Advanced Settings** -> **Scaling** から設定できます。

ClickPipes は、アベイラビリティーゾーン間に分散したアーキテクチャにより高可用性を提供します。
この構成には、少なくとも 2 つのコンシューマーへのスケーリングが必要です。

実行中のコンシューマー数に関係なく、フォールトトレランスは設計上備わっています。
コンシューマーまたはその基盤となるインフラストラクチャに障害が発生した場合でも、
ClickPipe はコンシューマーを自動的に再起動し、メッセージ処理を継続します。

## 認証 \{#authentication\}

Amazon Kinesis ストリームにアクセスするには、[IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) を使用できます。IAM ロールの設定方法の詳細については、ClickHouse Cloud と連携するロールの構成手順を説明した [こちらのガイド](./secure-kinesis.md) を参照してください。