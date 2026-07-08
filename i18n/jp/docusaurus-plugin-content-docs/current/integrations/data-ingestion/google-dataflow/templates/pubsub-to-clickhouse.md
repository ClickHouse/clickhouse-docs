---
sidebar_label: 'Pub/Sub から ClickHouse へ'
sidebar_position: 2
slug: /integrations/google-dataflow/templates/pubsub-to-clickhouse
description: 'Google Dataflow テンプレートを使用すると、Pub/Sub から ClickHouse へ JSON メッセージをストリーミングできます'
title: 'Dataflow Pub/Sub から ClickHouse へのテンプレート'
doc_type: 'guide'
keywords: ['Dataflow', 'Pub/Sub', 'PubSub', 'streaming', 'dead-letter']
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import pubsub_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/pubsub-inqueue-job.png'
import dataflow_create_job_from_template_button from '@site/static/images/integrations/data-ingestion/google-dataflow/create_job_from_template_button.png'

# Dataflow Pub/Sub から ClickHouse へのテンプレート \{#dataflow-pubsub-to-clickhouse-template\}

Pub/Sub から ClickHouse へのテンプレートは、Pub/Sub サブスクリプションから JSON でエンコードされたメッセージを読み取り、ClickHouse テーブルに書き込むストリーミング パイプラインです。
解析に失敗したメッセージ、またはターゲット スキーマに対応付けられなかったメッセージは、デッドレター宛先 (ClickHouse テーブル、Pub/Sub トピック、またはその両方) にルーティングされます。

<TOCInline toc={toc} maxHeadingLevel={2} />

## パイプライン要件 \{#pipeline-requirements\}

* ソース Pub/Sub サブスクリプションが存在している必要があります。
* サブスクリプションにパブリッシュされるメッセージは、有効な JSON である必要があります。
* ClickHouse のターゲットテーブルが存在している必要があり、そのカラム名は JSON ペイロード内のフィールド名と一致している必要があります。
* ClickHouse ホストは、Dataflow ワーカーマシンからアクセス可能である必要があります。
* 少なくとも 1 つのデッドレター宛先 (`clickHouseDeadLetterTable` または `deadLetterTopic`) を指定する必要があります。両方を指定した場合、失敗したメッセージは両方の宛先に同時にルーティングされます。
* `clickHouseDeadLetterTable` を設定する場合、デッドレターテーブルは [デッドレター処理](#dead-letter-handling) に示すスキーマで、あらかじめ ClickHouse 内に存在している必要があります。
* `deadLetterTopic` を設定する場合、Pub/Sub トピックはあらかじめ存在している必要があります。

## Template パラメータ \{#template-parameters\}

<br />

<br />

| Parameter Name              | Parameter Description                                                                                                                          | Required | Notes                                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputSubscription`         | メッセージの読み取り元となる Pub/Sub サブスクリプション。例: `projects/<PROJECT_ID>/subscriptions/<SUBSCRIPTION_NAME>`。                                                 | ✅        | メッセージは JSON エンコードされている必要があります。                                                                                                                                       |
| `clickHouseUrl`             | ClickHouse のエンドポイント URL。SSL 接続には `https://` (ClickHouse Cloud) 、非 SSL 接続には `http://` を使用します。例: `https://<HOST>:8443` または `http://<HOST>:8123`。 | ✅        | ClickHouse Cloud では、ポート `8443` の HTTPS エンドポイントを使用します。                                                                                                                |
| `clickHouseDatabase`        | ターゲットテーブルが存在する ClickHouse データベースの名前。例: `default`。                                                                                              | ✅        |                                                                                                                                                                      |
| `clickHouseTable`           | データの書き込み先となる ClickHouse テーブルの名前。                                                                                                               | ✅        | パイプラインを実行する前に、このテーブルが存在している必要があります。                                                                                                                                  |
| `clickHouseUsername`        | ClickHouse での認証に使用するユーザー名。                                                                                                                     | ✅        |                                                                                                                                                                      |
| `clickHousePassword`        | ClickHouse での認証に使用するパスワード。                                                                                                                     | ✅        |                                                                                                                                                                      |
| `clickHouseDeadLetterTable` | 失敗したメッセージの書き込み先となる ClickHouse テーブル。例: `my_table_dead_letter`。                                                                                  |          | `clickHouseDeadLetterTable` または `deadLetterTopic` の少なくとも一方を指定する必要があります。このテーブルは、[デッドレター処理](#dead-letter-handling) に示されているデッドレター用スキーマであらかじめ作成されている必要があります。 |
| `deadLetterTopic`           | 失敗したメッセージの発行先となる Pub/Sub トピック。例: `projects/<PROJECT_ID>/topics/<TOPIC_NAME>`。                                                                  |          | `clickHouseDeadLetterTable` または `deadLetterTopic` の少なくとも一方を指定する必要があります。失敗したペイロードは、`errorMessage` と `failedAt` をメッセージ属性として設定してこのトピックに発行されます。                          |
| `windowSeconds`             | 時間ベースのバッチ処理ウィンドウの継続時間 (秒) 。                                                                                                                    |          | `batchRowCount` との関係については、[バッチ処理とウィンドウ化](#batching-and-windowing) を参照してください。どちらも設定しない場合、combined モードではデフォルトで `30s` と `1000` 行が使用されます。                      |
| `batchRowCount`             | ClickHouse にフラッシュする前に蓄積する行数。                                                                                                                   |          | `windowSeconds` との関係については、[バッチ処理とウィンドウ化](#batching-and-windowing) を参照してください。                                                                               |
| `maxInsertBlockSize`        | ClickHouse に送信する `INSERT` ステートメントあたりの最大行数。デフォルトは `1,000,000` です。                                                                               |          | `ClickHouseIO` のオプションです。                                                                                                                                             |
| `maxRetries`                | ClickHouse への insert が失敗した場合の最大再試行回数。デフォルトは `5` です。                                                                                            |          | `ClickHouseIO` のオプションです。                                                                                                                                             |
| `insertDeduplicate`         | レプリケートテーブルでの `INSERT` クエリに対して deduplication を有効にするかどうか。デフォルトは `true` です。                                                                       |          | `ClickHouseIO` のオプションです。                                                                                                                                             |
| `insertQuorum`              | レプリケートテーブルに対する `INSERT` クエリで、指定した数のレプリカが書き込みを確認し、データ追加が線形化されるまで待機します。`0` はクォーラム書き込みを無効にします。                                                    |          | `ClickHouseIO` のオプションです。デフォルトの server settings では無効です。                                                                                                               |
| `insertDistributedSync`     | 有効にすると、分散テーブルに対する `INSERT` クエリは、データがクラスター内のすべてのノードに送信されるまで待機します。デフォルトは `true` です。                                                              |          | `ClickHouseIO` のオプションです。                                                                                                                                             |

:::note
すべての `ClickHouseIO` パラメータのデフォルト値は、[`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) を参照してください。
:::

## メッセージ形式とスキーマのマッピング \{#message-format-and-schema-mapping\}

Pub/Sub メッセージは JSON オブジェクトである必要があり、その最上位のフィールド名は ClickHouse のターゲットテーブルのカラム名と完全に一致していなければなりません。

受信メッセージをターゲットテーブルにマッピングするため、パイプラインは起動時に次の処理を実行します。

1. ClickHouse のターゲットテーブルのスキーマを取得します。
2. その ClickHouse スキーマから Beam `Row` スキーマを構築します。
3. 受信した各 Pub/Sub メッセージについて JSON ペイロードを解析し、ClickHouse スキーマで定義されたフィールドを読み取って行を組み立てます。

<br />

:::important
JSON のフィールド名は ClickHouse のカラム名と完全に一致している必要があります (一致では大文字と小文字が区別されます) 。メッセージ内のフィールドのうち、ClickHouse のカラムに対応しないものは無視されます。ClickHouse のカラムに対応するフィールドが JSON ペイロード内に存在しない場合、パイプラインはそのカラムに `NULL` を書き込もうとします。これは、そのカラムが [`Nullable`](../../../sql-reference/data-types/nullable) として宣言されている場合にのみ成功します。解析に失敗したメッセージ、値をカラム型に変換できないメッセージ、または非 Nullable カラムに `NULL` を書き込もうとするメッセージは、デッドレターの宛先にルーティングされます。
:::

### 型変換 \{#type-conversion\}

JSON 値は、対応する ClickHouse のカラム型に変換されます。

| ClickHouse Type                                                                    | 注記                                                              |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`Float32`](../../../sql-reference/data-types/float)                               | `Float.valueOf` を使用して解析されます。                                    |
| [`Float64`](../../../sql-reference/data-types/float)                               | `Double.valueOf` を使用して解析されます。                                   |
| [`Date`](../../../sql-reference/data-types/date)                                   | ISO-8601 形式の日付文字列として解析されます。                                     |
| [`DateTime`](../../../sql-reference/data-types/datetime)                           | ISO-8601 形式の日時文字列として解析されます (例: `2026-01-15T12:34:56Z`) 。        |
| [`Array(T)`](../../../sql-reference/data-types/array)                              | JSON 配列です。各要素は要素型 `T` に変換されます。空の配列、または配列が存在しない場合は空配列になります。      |
| Integer types (`Int8`/`Int16`/`Int32`/`Int64`, `UInt8`/`UInt16`/`UInt32`/`UInt64`) | JSON の数値、またはその文字列表現から解析されます。                                    |
| [`String`](../../../sql-reference/data-types/string)                               | テキストのフィールドではそのまま使用されます。テキスト以外の JSON ノードは、JSON 文字列形式にシリアライズされます。 |

## バッチ処理とウィンドウ化 \{#batching-and-windowing\}

このパイプラインはストリーミング方式であるため、受信した行は ClickHouse にフラッシュされる前にウィンドウに蓄積されます。ウィンドウ化の戦略は、指定するパラメーターに応じて選択されます。

| `windowSeconds` | `batchRowCount` | 動作                                                       |
| --------------- | --------------- | -------------------------------------------------------- |
| 設定済み            | 未設定             | `windowSeconds` に基づく時間ベースの固定ウィンドウ。                       |
| 未設定             | 設定済み            | カウントトリガー付きのグローバルウィンドウ。`batchRowCount` 行ごとにトリガーされます。      |
| 両方設定済み          | 両方設定済み          | 複合トリガー付きのグローバルウィンドウ。先に満たされた条件 (時間 **または** 行数) でトリガーされます。 |
| どちらも未設定         | どちらも未設定         | 既定値を使う複合モード: `30` 秒または `1000` 行のいずれか早い方。                 |

これらの値を調整することで、レイテンシと `INSERT` 効率のトレードオフを調整できます。ウィンドウを小さくするとエンドツーエンドのレイテンシは低下し、ウィンドウを大きくすると `INSERT` バッチの回数は減る一方で、1 回あたりのサイズは大きくなります。

## デッドレター処理 \{#dead-letter-handling\}

JSON のパース、スキーマのマッピング、または型の強制変換に失敗したメッセージは、設定されたデッドレター宛先にルーティングされます。`clickHouseDeadLetterTable` または `deadLetterTopic` の少なくとも一方を指定する必要があります。両方が設定されている場合、失敗したメッセージはその両方に送信されます。

### ClickHouse デッドレターテーブル \{#clickhouse-dead-letter-table\}

`clickHouseDeadLetterTable` が設定されている場合、デッドレターテーブルは次の固定スキーマで事前に作成されている必要があります。

| カラム             | 型          | 説明                                          |
| --------------- | ---------- | ------------------------------------------- |
| `raw_message`   | `String`   | 元の Pub/Sub メッセージのペイロードを UTF-8 テキストとして格納します。 |
| `error_message` | `String`   | その行が失敗した理由を示す例外メッセージです。                     |
| `stack_trace`   | `String`   | 失敗時に取得された完全な Java スタックトレースです。               |
| `failed_at`     | `DateTime` | その行が失敗した時点の処理時刻のタイムスタンプです。                  |

単一ノードのデプロイメント向けの最小定義:

```sql
CREATE TABLE my_table_dead_letter (
    raw_message   String,
    error_message String,
    stack_trace   String,
    failed_at     DateTime
) ENGINE = MergeTree()
ORDER BY failed_at;
```

:::note
デプロイ環境に合わせて、エンジンと `ORDER BY` 句を調整してください。レプリケートテーブルには `ReplicatedMergeTree` を使用し、分散構成では `ON CLUSTER` を追加し、必要に応じてパーティション化や有効期限 (TTL) を調整してください。
:::

### Pub/Sub デッドレタートピック \{#pubsub-dead-letter-topic\}

`deadLetterTopic` が設定されている場合、失敗した各メッセージは次の情報を付加してそのトピックに再公開されます。

* **Payload**: 元のメッセージのバイト列。
* **Attribute** `errorMessage`: 失敗時に記録された例外メッセージ。
* **Attribute** `failedAt`: 行の失敗時点における処理時刻のタイムスタンプ。

これにより、基盤となるスキーマやプロデューサーの問題を解消した後で、失敗したメッセージを容易に再処理できます。

## テンプレートの実行 \{#running-the-template\}

Pub/Sub から ClickHouse への テンプレートは Google Cloud Console から利用できます。

:::note
テンプレートの設定要件と前提条件を十分に理解するため、このドキュメント、特に上記の各セクションを必ず確認してください。
:::

Google Cloud Console にサインインし、Dataflow を検索します。

1. `CREATE JOB FROM TEMPLATE` ボタンをクリックします。
   <Image img={dataflow_create_job_from_template_button} border alt="Dataflow コンソール" />

2. テンプレートのフォームが開いたら、ジョブ名を入力し、使用するリージョンを選択します。

   {/* PLACEHOLDER: add screenshot of the Pub/Sub から ClickHouse への template initial form (job name + region) */ }

3. `Dataflow Template` の入力欄に `ClickHouse` または `Pub/Sub` と入力し、`Pub/Sub から ClickHouse への` テンプレートを選択します。

   {/* PLACEHOLDER: add screenshot of selecting the "Pub/Sub から ClickHouse への" template from the dropdown */ }

4. テンプレートを選択すると、フォームが展開されます。以下を入力します。

   * Pub/Sub の入力サブスクリプション。形式は `projects/<PROJECT_ID>/subscriptions/<SUBSCRIPTION_NAME>` です。
   * ClickHouse の エンドポイント URL。ClickHouse Cloud の場合は `https://<HOST>:8443` を使用します。
   * ClickHouse のデータベース、ターゲットテーブル、ユーザー名、パスワード。
   * 少なくとも 1 つのデッドレターの宛先。ClickHouse テーブルまたは Pub/Sub トピック (あるいはその両方) を指定します。

   {/* PLACEHOLDER: add screenshot of the expanded Pub/Sub から ClickHouse への template form showing the required fields and the dead-letter section */ }

5. 必要に応じて、[Template パラメータ](#template-parameters) セクションの説明に従って、バッチ処理 (`windowSeconds`、`batchRowCount`) や `ClickHouseIO` のチューニングパラメータを調整します。

### ジョブを監視する \{#monitor-the-job\}

ジョブのステータスを監視するには、Google Cloud Console の [Dataflow Jobs タブ](https://console.cloud.google.com/dataflow/jobs) に移動します。ここでは、進捗やエラーを含むジョブの詳細を確認できます。

<Image img={pubsub_inqueue_job} size="lg" border alt="実行中の Pub/Sub から ClickHouse へのジョブが表示された Dataflow コンソール" />

このテンプレートは、`PubSubToClickHouse` ネームスペース配下に次のカスタムメトリクスも出力します。これらは Dataflow ジョブのページで確認できます。

| Metric                  | Type         | Description                                 |
| ----------------------- | ------------ | ------------------------------------------- |
| `messages-received`     | カウンター        | パース処理のステップで受信した Pub/Sub メッセージの総数。           |
| `rows-parsed-ok`        | カウンター        | 正常に行へ変換され、メイン出力にルーティングされたメッセージ。             |
| `rows-parse-failed`     | カウンター        | パースまたはスキーマのマッピングに失敗し、デッドレターにルーティングされたメッセージ。 |
| `message-payload-bytes` | Distribution | 受信した Pub/Sub メッセージのペイロードサイズ (バイト単位) の分布。    |

## トラブルシューティング \{#troubleshooting\}

### メモリ制限 (合計) 超過エラー (コード 241) \{#code-241-dbexception-memory-limit-total-exceeded\}

このエラーは、大きなバッチのデータを処理中に ClickHouse のメモリが不足すると発生します。この問題を解決するには、次の対応を行ってください。

* インスタンスのリソースを増やす: より多くのメモリを備えた大きなインスタンスに ClickHouse server をアップグレードし、データ処理の負荷に対応します。
* バッチサイズを小さくする: Dataflow ジョブの設定で `batchRowCount` (および/または `maxInsertBlockSize`) を減らし、ClickHouse に送信するデータの chunk を小さくして、バッチごとのメモリ消費を抑えます。

### すべてのメッセージがデッドレター宛先に送られる \{#all-messages-going-to-dlq\}

最も一般的な原因は次のとおりです。

* JSON のフィールド名が ClickHouse のカラム名と完全に一致していない (照合では大文字と小文字が区別されます) 。
* JSON の値をカラム型に変換できない (たとえば、`DateTime` カラムに ISO-8601 形式ではない文字列が入っている場合) 。
* パイプラインの起動後にターゲットテーブルのスキーマが変更された。スキーマは起動時に 1 回だけ取得されます。スキーマ変更を適用した後、ジョブを再起動してください。

根本原因を特定するには、ClickHouse のデッドレターテーブルにある `error_message` カラムと `stack_trace` カラム (または Pub/Sub のデッドレターメッセージの `errorMessage` 属性) を確認してください。

### パイプラインは開始するが、ClickHouse に行が届かない \{#no-rows-arriving\}

* サブスクリプションがメッセージを受信していることを確認します。Dataflow ジョブページで `messages-received` メトリクスを確認してください。
* 時間ベースモード (`windowSeconds` のみ) では、行がフラッシュされるのはウィンドウ境界でのみです。フラッシュが発生していることを確認するには、`windowSeconds` を小さくしてください。
* Dataflow ワーカーと ClickHouse エンドポイント間のネットワーク到達性を確認します (ファイアウォール、VPC ピアリング、または Private Service Connect) 。

## Templateのソースコード \{#template-source-code\}

このTemplateのソースコードは、以下のリポジトリで公開されています。

* [`GoogleCloudPlatform/DataflowTemplates`](https://github.com/GoogleCloudPlatform/DataflowTemplates/tree/main/v2/googlecloud-to-clickhouse) — Google Cloud Platform のアップストリームリポジトリ。
* [`ClickHouse/DataflowTemplates`](https://github.com/ClickHouse/DataflowTemplates) — ClickHouse のフォーク。