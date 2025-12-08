---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'Apache Beam を使用して ClickHouse にデータを取り込むことができます'
title: 'Apache Beam と ClickHouse の連携'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', 'ストリーム処理', 'バッチ処理', 'JDBC コネクタ', 'データパイプライン']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Apache Beam と ClickHouse の統合 {#integrating-apache-beam-and-clickhouse}

<ClickHouseSupportedBadge/>

**Apache Beam** は、バッチ処理およびストリーミング（連続）データ処理パイプラインの定義と実行を可能にする、オープンソースの統一プログラミングモデルです。Apache Beam の柔軟性は、ETL（Extract, Transform, Load）処理から複雑なイベント処理、リアルタイム分析まで、幅広いデータ処理シナリオをサポートできる点にあります。
この統合では、基盤となるデータ書き込みレイヤーとして、ClickHouse の公式 [JDBC connector](https://github.com/ClickHouse/clickhouse-java) を活用します。

## インテグレーションパッケージ {#integration-package}

Apache Beam と ClickHouse を統合するために必要なインテグレーションパッケージは、[Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) の一部として保守および開発されています。これは、多くの一般的なデータストレージシステムおよびデータベース向けのインテグレーション用バンドルです。
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` の実装は、[Apache Beam リポジトリ](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse) 内にあります。

## Apache Beam ClickHouse パッケージのセットアップ {#setup-of-the-apache-beam-clickhouse-package}

### パッケージのインストール {#package-installation}

ご利用のパッケージ管理フレームワークに、次の依存関係を追加します：

```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推奨される Beam バージョン
`ClickHouseIO` コネクタは、Apache Beam バージョン `2.59.0` 以降での使用が推奨されます。
それ以前のバージョンでは、コネクタの機能が十分にサポートされない可能性があります。
:::

アーティファクトは [公式 Maven リポジトリ](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)から入手できます。

### コード例 {#code-example}

次の例では、`input.csv` という名前の CSV ファイルを `PCollection` として読み込み、定義済みのスキーマを使用して `Row` オブジェクトに変換し、`ClickHouseIO` を使用してローカルの ClickHouse インスタンスに挿入します。

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
        // Pipeline オブジェクトを作成します。
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // パイプラインにトランスフォームを適用します。
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

        // パイプラインを実行します。
        p.run().waitUntilFinish();
    }
}

```

## サポートされているデータ型 {#supported-data-types}

| ClickHouse                         | Apache Beam                | サポート有無 | 備考                                                                                                                                     |
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
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅            | `FixedBytes` は固定長バイト配列を表す `LogicalType` であり、<br/> `org.apache.beam.sdk.schemas.logicaltypes` に定義されています          |
|                                    | `Schema.TypeName#DECIMAL`  | ❌            |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌            |                                                                                                                                          |

## ClickHouseIO.Write のパラメータ {#clickhouseiowrite-parameters}

次のセッターメソッドを使用して `ClickHouseIO.Write` の設定を調整できます。

| Parameter Setter Function   | Argument Type               | Default Value                 | Description                                              |
|-----------------------------|-----------------------------|-------------------------------|----------------------------------------------------------|
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 挿入する行ブロック内の最大行数。                         |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 挿入に失敗した場合の最大再試行回数。                     |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | 再試行に対する累積バックオフ時間の上限。                 |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 最初の再試行前の初期待機（バックオフ）時間。             |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | `true` の場合、分散テーブルへの挿入操作を同期させます。  |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 挿入操作を確定するために必要なレプリカ数。               |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | `true` の場合、挿入操作に対して重複排除を有効にします。  |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | 対象の ClickHouse テーブルのスキーマ。                   |

## 制限事項 {#limitations}

コネクタを使用する際は、次の制限事項に注意してください:
* 現時点では Sink 操作のみがサポートされています。コネクタは Source 操作をサポートしていません。
* ClickHouse は、`ReplicatedMergeTree` またはその上に構築された `Distributed` テーブルへの挿入時に重複排除を行います。レプリケーションがない場合、通常の MergeTree への挿入では、挿入が失敗してから再試行が成功した場合に重複が発生する可能性があります。ただし、各ブロックはアトミックに挿入され、ブロックサイズは `ClickHouseIO.Write.withMaxInsertBlockSize(long)` を使用して構成できます。重複排除は、挿入されるブロックのチェックサムを利用して実現されます。重複排除の詳細については、[Deduplication](/guides/developer/deduplication) および [Deduplicate insertion config](/operations/settings/settings#insert_deduplicate) を参照してください。
* コネクタは DDL ステートメントを一切実行しないため、対象テーブルはデータを挿入する前に存在している必要があります。

## 関連コンテンツ {#related-content}
* `ClickHouseIO` クラスの[ドキュメント](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)。
* サンプルコード用の `GitHub` リポジトリ [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)。
