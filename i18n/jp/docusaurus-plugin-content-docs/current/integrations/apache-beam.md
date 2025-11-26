---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'Apache Beam を使用して ClickHouse にデータを取り込む'
title: 'Apache Beam と ClickHouse の統合'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', 'stream processing', 'batch processing', 'jdbc connector', 'data pipeline']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Apache Beam と ClickHouse の統合

<ClickHouseSupportedBadge/>

**Apache Beam** は、開発者がバッチ処理とストリーム（連続）データ処理パイプラインの両方を定義および実行できるオープンソースの統一プログラミングモデルです。Apache Beam の柔軟性は、ETL（抽出、変換、ロード）操作から複雑なイベント処理やリアルタイム分析まで、幅広いデータ処理シナリオをサポートできる点にあります。
この統合では、基盤となる挿入レイヤーに ClickHouse の公式 [JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java)を使用しています。

## 統合パッケージ {#integration-package}

Apache Beam と ClickHouse を統合するために必要な統合パッケージは、[Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) — 多くの人気のあるデータストレージシステムやデータベースの統合バンドル — の下で保守および開発されています。
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` の実装は [Apache Beam リポジトリ](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse)内にあります。

## Apache Beam ClickHouse パッケージのセットアップ {#setup-of-the-apache-beam-clickhouse-package}

### パッケージのインストール {#package-installation}

パッケージ管理フレームワークに次の依存関係を追加します:
```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推奨される Beam バージョン
`ClickHouseIO` コネクタは、Apache Beam バージョン `2.59.0` 以降での使用を推奨しています。
それ以前のバージョンでは、コネクタの機能を完全にサポートしていない可能性があります。
:::

アーティファクトは[公式 Maven リポジトリ](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)で見つけることができます。

### コード例 {#code-example}

次の例では、`input.csv` という名前の CSV ファイルを `PCollection` として読み込み、それを（定義されたスキーマを使用して）Row オブジェクトに変換し、`ClickHouseIO` を使用してローカルの ClickHouse インスタンスに挿入します:

```java

package org.example;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.io.TextIO;
import org.apache.beam.sdk.io.clickhouse.ClickHouseIO;
import org.apache.beam.sdk.schemas.Schema;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.values.PCollection;
import org.apache.beam.sdk.values.Row;
import org.joda.time.DateTime;

public class Main {

    public static void main(String[] args) {
        // Create a Pipeline object.
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // Apply transforms to the pipeline.
        PCollection<String> lines = p.apply("ReadLines", TextIO.read().from("src/main/resources/input.csv"));

        PCollection<Row> rows = lines.apply("ConvertToRow", ParDo.of(new DoFn<String, Row>() {
            @ProcessElement
            public void processElement(@Element String line, OutputReceiver<Row> out) {

                String[] values = line.split(",");
                Row row = Row.withSchema(SCHEMA)
                        .addValues(values[0], Short.parseShort(values[1]), DateTime.now())
                        .build();
                out.output(row);
            }
        })).setRowSchema(SCHEMA);

        rows.apply("Write to ClickHouse",
                        ClickHouseIO.write("jdbc:clickhouse://localhost:8123/default?user=default&password=******", "test_table"));

        // Run the pipeline.
        p.run().waitUntilFinish();
    }
}

```

## サポートされているデータ型 {#supported-data-types}

| ClickHouse                         | Apache Beam                | サポート状況 | 備考                                                                                                                                    |
|------------------------------------|----------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅            |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅            | `FixedBytes` は、<br/> `org.apache.beam.sdk.schemas.logicaltypes` にある、<br/> 固定長バイト配列を表す `LogicalType` です |
|                                    | `Schema.TypeName#DECIMAL`  | ❌            |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌            |                                                                                                                                          |

## ClickHouseIO.Write パラメータ {#clickhouseiowrite-parameters}

次のセッター関数を使用して、`ClickHouseIO.Write` の構成を調整できます:

| パラメータセッター関数   | 引数の型               | デフォルト値                 | 説明                                                     |
|-----------------------------|-----------------------------|-------------------------------|-----------------------------------------------------------------|
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 挿入する行のブロックの最大サイズ。                      |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 挿入失敗時の最大リトライ回数。                   |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | リトライ時の最大累積バックオフ期間。                |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 最初のリトライ前の初期バックオフ期間。                |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | true の場合、分散テーブルへの挿入操作を同期します。 |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 挿入操作を確認するために必要なレプリカの数。 |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | true の場合、挿入操作の重複排除が有効になります。        |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | ターゲット ClickHouse テーブルのスキーマ。                          |

## 制限事項 {#limitations}

コネクタを使用する際は、次の制限事項を考慮してください:
* 現時点では、Sink 操作のみがサポートされています。コネクタは Source 操作をサポートしていません。
* ClickHouse は、`ReplicatedMergeTree` または `ReplicatedMergeTree` の上に構築された `Distributed` テーブルに挿入する際に重複排除を実行します。レプリケーションがない場合、通常の MergeTree への挿入は、挿入が失敗してから正常にリトライされると重複が発生する可能性があります。ただし、各ブロックはアトミックに挿入され、ブロックサイズは `ClickHouseIO.Write.withMaxInsertBlockSize(long)` を使用して構成できます。重複排除は、挿入されたブロックのチェックサムを使用して実現されます。重複排除の詳細については、[重複排除](/guides/developer/deduplication)および[重複排除挿入設定](/operations/settings/settings#insert_deduplicate)を参照してください。
* コネクタは DDL ステートメントを実行しないため、挿入前にターゲットテーブルが存在している必要があります。

## 関連コンテンツ {#related-content}
* `ClickHouseIO` クラスの[ドキュメント](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)。
* 例の `Github` リポジトリ [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)。
