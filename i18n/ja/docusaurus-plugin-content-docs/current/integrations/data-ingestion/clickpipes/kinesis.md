---
sidebar_label: ClickPipes for Amazon Kinesis
description: あなたの Amazon Kinesis データソースを ClickHouse Cloud にシームレスに接続します。
slug: /integrations/clickpipes/kinesis
---

# Amazon Kinesis と ClickHouse Cloud の統合
## 前提条件 {#prerequisite}
あなたは [ClickPipes 入門](./index.md) に目を通し、[IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) をセットアップしている必要があります。ClickHouse Cloud で機能するロールの設定方法については、[Kinesis ロールベースアクセスガイド](./secure-kinesis.md) を参照してください。

## 最初の ClickPipe の作成 {#creating-your-first-clickpipe}

1. あなたの ClickHouse Cloud サービスの SQL コンソールにアクセスします。

  ![ClickPipes サービス](./images/cp_service.png)

2. 左側のメニューから `Data Sources` ボタンを選択し、「ClickPipe のセットアップ」をクリックします。

  ![インポートを選択](./images/cp_step0.png)

3. データソースを選択します。

  ![データソースの種類を選択](./images/cp_step1.png)

4. ClickPipe に名前、説明（オプション）、IAM ロールまたは認証情報、その他の接続詳細を提供してフォームを記入します。

  ![接続詳細を記入](./images/cp_step2_kinesis.png)

5. Kinesis ストリームと開始オフセットを選択します。UI には、選択したソース（Kafka トピックなど）からのサンプルドキュメントが表示されます。また、Kinesis ストリーム用の Enhanced Fan-out を有効にすることで、ClickPipe のパフォーマンスと安定性を向上させることができます（Enhanced Fan-out の詳細については [こちら](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)を参照）。

  ![データ形式とトピックを設定](./images/cp_step3_kinesis.png)

6. 次のステップでは、新しい ClickHouse テーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、設定を変更してください。上部のサンプルテーブルでリアルタイムプレビューを確認できます。

  ![テーブル、スキーマ、および設定を設定](./images/cp_step4a.png)

  提供されたコントロールを使用して高度な設定もカスタマイズできます。

  ![高度なコントロールを設定](./images/cp_step4a3.png)

7. あるいは、既存の ClickHouse テーブルにデータを取り込むこともできます。その場合、UI は選択した宛先テーブルの ClickHouse フィールドにソースからのフィールドをマッピングすることを許可します。

  ![既存のテーブルを使用](./images/cp_step4b.png)

8. 最後に、内部の ClickPipes ユーザーの権限を設定できます。

  **権限:** ClickPipes は、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーのロールをカスタムロールまたは以下の定義済みロールのいずれかから選択できます：
    - `フルアクセス`: クラスターへのフルアクセスを持つもの。宛先テーブルで Materialized View または Dictionary を使用する場合に便利です。
    - `宛先テーブルのみ`: 宛先テーブルへの `INSERT` 権限のみを持つもの。

  ![権限](./images/cp_step5.png)

9. 「セットアップの完了」をクリックすると、システムはあなたの ClickPipe を登録し、要約テーブルに一覧表示されます。

  ![成功通知](./images/cp_success.png)

  ![削除通知](./images/cp_remove.png)

  要約テーブルには、ClickHouse のソースまたは宛先テーブルからサンプルデータを表示するためのコントロールが提供されます。

  ![宛先を表示](./images/cp_destination.png)

  さらに、ClickPipe を削除し、取り込みジョブの要約を表示するためのコントロールもあります。

  ![概要を表示](./images/cp_overview.png)

10. **おめでとうございます！** あなたは最初の ClickPipe を成功裏に設定しました。これがストリーミング ClickPipe の場合、それはリモートデータソースからリアルタイムでデータを取り込むために継続的に実行されます。それ以外の場合は、バッチを取り込み完了します。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：
- [JSON](../../../interfaces/formats.md/#json)

## サポートされているデータ型 {#supported-data-types}

現在 ClickPipes でサポートされている ClickHouse データ型は以下の通りです：

- 基本数値型 - \[U\]Int8/16/32/64 と Float32/64
- 大整数型 - \[U\]Int128/256
- 十進数型
- ブール型
- 文字列
- 固定文字列
- 日付、Date32
- DateTime、DateTime64（UTC タイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべての ClickHouse LowCardinality 型
- 上記の任意の型（Nullable を含む）を使用した Map
- 上記の任意の型（Nullable を含む、1 階層の深さのみ）を使用した Tuple と Array

## Kinesis 仮想カラム {#kinesis-virtual-columns}

Kinesis ストリーム用に以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際には、`Add Column` ボタンを使用して仮想カラムを追加できます。

| 名前              | 説明                                                      | 推奨データ型        |
|-------------------|----------------------------------------------------------|---------------------|
| _key              | Kinesis パーティションキー                                | 文字列               |
| _timestamp        | Kinesis おおよその到着タイムスタンプ（ミリ秒精度）      | DateTime64(3)       |
| _stream           | Kinesis ストリーム名                                      | 文字列               |
| _sequence_number  | Kinesis シーケンス番号                                    | 文字列               |
| _raw_message      | 完全な Kinesis メッセージ                                 | 文字列               |

_raw_message フィールドは、完全な Kinesis JSON レコードが必要な場合に使用できます（ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して下流のマテリアライズドビューを構成するなど）。そのようなパイプのために、すべての「非仮想」カラムを削除することで ClickPipes のパフォーマンスが向上する場合があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) はサポートされていません。

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipes はデータをバッチで ClickHouse に挿入します。これは、データベース内に多数のパーツを作成するのを防ぎ、クラスターにパフォーマンスの問題を引き起こす可能性があります。

バッチは以下のいずれかの条件が満たされたときに挿入されます：
- バッチサイズが最大サイズ（100,000 行または 20MB）に達した
- バッチが最大の時間（5 秒）開かれたままである

### レイテンシ {#latency}

レイテンシ（Kinesis メッセージがストリームに送信されてからメッセージが ClickHouse で利用可能になるまでの時間）は、いくつかの要因（例：Kinesis レイテンシ、ネットワークレイテンシ、メッセージサイズ/形式）に依存します。上記のセクションで説明されている [バッチ処理](#batching) もレイテンシに影響を与えます。特定のユースケースをテストして、期待されるレイテンシを理解することを常に推奨します。

特定の低レイテンシ要件がある場合は、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### スケーリング {#scaling}

Kinesis 用の ClickPipes は水平方向にスケールするように設計されています。デフォルトでは、1 つのコンシューマを持つコンシューマグループを作成します。
これは、ClickPipe 詳細ビューのスケーリングコントロールで変更できます。

ClickPipes は高可用性を提供し、可用性ゾーンに分散したアーキテクチャです。
これには、少なくとも 2 つのコンシューマのスケーリングが必要です。

実行中のコンシューマの数にかかわらず、フォールトトレランスは設計によって提供されます。
コンシューマまたはその基盤となるインフラストラクチャが失敗した場合、ClickPipe は自動的にコンシューマを再起動し、メッセージの処理を続行します。

## 認証 {#authentication}

Amazon Kinesis ストリームにアクセスするには、[IAM 認証情報](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) または [IAM ロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) を使用できます。IAM ロールのセットアップ方法の詳細については、ClickHouse Cloud で機能するロールの設定方法について [このガイド](./secure-kinesis.md) を参照してください。
