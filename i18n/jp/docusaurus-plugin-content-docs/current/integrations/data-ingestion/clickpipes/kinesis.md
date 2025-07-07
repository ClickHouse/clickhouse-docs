---
'sidebar_label': 'ClickPipes for Amazon Kinesis'
'description': 'Seamlessly connect your Amazon Kinesis data sources to ClickHouse
  Cloud.'
'slug': '/integrations/clickpipes/kinesis'
'title': 'Integrating Amazon Kinesis with ClickHouse Cloud'
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
[ClickPipesの紹介](./index.md)に目を通し、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を設定しました。ClickHouse Cloudと連携するロールの設定に関する情報は、[Kinesisロールベースアクセスガイド](./secure-kinesis.md)を参照してください。

## 最初のClickPipeを作成する {#creating-your-first-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipesサービス" size="lg" border/>

2. 左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeの設定」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="データソースの種類を選択" size="lg" border/>

4. ClickPipeの名前、説明（任意）、IAMロールまたは認証情報、及び他の接続の詳細を提供してフォームに記入します。

<Image img={cp_step2_kinesis} alt="接続の詳細を記入" size="lg" border/>

5. Kinesisストリームと開始オフセットを選択します。UIは選択したソース（Kafkaトピックなど）からのサンプルドキュメントを表示します。また、ClickPipeのパフォーマンスと安定性を向上させるために、KinesisストリームのEnhanced Fan-outを有効にすることもできます（Enhanced Fan-outの詳細は[こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)にあります）。

<Image img={cp_step3_kinesis} alt="データ形式とトピックを設定" size="lg" border/>

6. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従ってテーブル名、スキーマ、および設定を変更してください。上部のサンプルテーブルでリアルタイムの変更プレビューを見ることができます。

<Image img={cp_step4a} alt="テーブル、スキーマ、および設定の設定" size="lg" border/>

  また、提供されたコントロールを使用して高度な設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="高度なコントロールを設定" size="lg" border/>

7. あるいは、既存のClickHouseテーブルにデータを取り込むことに決めることもできます。その場合、UIはソースのフィールドを選択した宛先テーブルのClickHouseフィールドにマッピングできるようにします。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

8. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限：** ClickPipesは、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーのロールをカスタムロールまたは定義されたロールのいずれかから選択できます。
    - `フルアクセス`: クラスターへのフルアクセスを持ちます。これは、宛先テーブルにMaterialized ViewやDictionaryを使用する場合に役立ちます。
    - `宛先テーブルのみ`: 宛先テーブルに対する`INSERT`権限のみを持ちます。

<Image img={cp_step5} alt="権限" border/>

9. 「セットアップ完了」をクリックすると、システムがClickPipeを登録し、概要テーブルに表示されます。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

  概要テーブルは、ClickHouse内のソースまたは宛先テーブルからサンプルデータを表示するコントロールを提供します。

<Image img={cp_destination} alt="宛先を表示" size="lg" border/>

  また、ClickPipeを削除したり、取り込みジョブの概要を表示したりするコントロールも提供します。

<Image img={cp_overview} alt="概要を表示" size="lg" border/>

10. **おめでとうございます！** 最初のClickPipeを正常にセットアップしました。これがストリーミングClickPipeの場合、遠隔データソースからリアルタイムでデータを取り込むために継続的に実行されます。そうでない場合は、バッチを取り込み完了します。


## サポートされるデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです：
- [JSON](../../../interfaces/formats.md/#json)

## サポートされるデータ型 {#supported-data-types}

現在ClickPipesでサポートされているClickHouseのデータ型は次のとおりです：

- 基本的な数値型 - \[U\]Int8/16/32/64およびFloat32/64
- 大きな整数型 - \[U\]Int128/256
- 小数型
- ブール型
- 文字列
- 固定文字列
- 日付、Date32
- DateTime、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記の型（Nullableを含む）を使用したキーと値のあるマップ
- 上記の型（Nullableを含む、一階層の深さのみ）を使用した要素のタプルと配列

## Kinesis仮想カラム {#kinesis-virtual-columns}

Kinesisストリームのためにサポートされている仮想カラムは次のとおりです。新しい宛先テーブルを作成する際には、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名前               | 説明                                                   | 推奨データ型          |
|--------------------|-------------------------------------------------------|-----------------------|
| _key               | Kinesisパーティションキー                                     | 文字列                |
| _timestamp         | Kinesisおおよその到着タイムスタンプ（ミリ秒精度）          | DateTime64(3)         |
| _stream            | Kinesisストリーム名                                       | 文字列                |
| _sequence_number   | Kinesisシーケンス番号                                   | 文字列                |
| _raw_message       | 完全なKinesisメッセージ                                   | 文字列                |

_raw_messageフィールドは、完全なKinesis JSONレコードが必要な場合（例：ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、下流のMaterialized Viewを構築する場合）に使用できます。このようなパイプの場合、すべての「非仮想」カラムを削除することでClickPipesのパフォーマンスが向上する可能性があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesは、ClickHouseにデータをバッチで挿入します。これは、データベースに多くのパーツを生成してクラスターのパフォーマンス問題を引き起こさないようにするためです。

バッチは、次のいずれかの条件が満たされたときに挿入されます：
- バッチサイズが最大サイズ（100,000行または20MB）に達した
- バッチが最大時間（5秒）オープンのままであった

### レイテンシ {#latency}

レイテンシ（Kinesisメッセージがストリームに送信されてからメッセージがClickHouseで利用可能になるまでの時間）は、いくつかの要因（例：Kinesisレイテンシ、ネットワークレイテンシ、メッセージサイズ/形式）の影響を受けます。上記のセクションで説明した[バッチ処理](#batching)もレイテンシに影響を与えます。特定のユースケースをテストして、期待できるレイテンシを理解することをお勧めします。

特定の低レイテンシ要件がある場合は、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### スケーリング {#scaling}

Kinesis向けのClickPipesは、水平にスケールするように設計されています。デフォルトでは、1つのコンシューマーを持つコンシューマーグループを作成します。これは、ClickPipeの詳細ビューのスケーリングコントロールで変更できます。

ClickPipesは、高可用性を提供する可用性ゾーン分散アーキテクチャを備えています。これには、少なくとも2つのコンシューマーが必要です。

動作中のコンシューマーの数に関係なく、フォールトトレランスは設計上提供されています。コンシューマーまたはその基盤となるインフラストラクチャが失敗すると、ClickPipeは自動的にコンシューマーを再起動し、メッセージの処理を続行します。

## 認証 {#authentication}

Amazon Kinesisストリームにアクセスするには、[IAM認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)または[IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)を使用できます。IAMロールの設定方法についての詳細は、ClickHouse Cloudと連携するロールの設定に関する情報を[こちらのガイド](./secure-kinesis.md)を参照してください。
