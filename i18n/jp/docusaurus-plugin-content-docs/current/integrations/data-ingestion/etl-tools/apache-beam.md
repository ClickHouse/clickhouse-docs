---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'ユーザーは Apache Beam を使用して ClickHouse にデータを取り込めます'
title: 'Apache Beam と ClickHouse の連携'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', 'ストリーム処理', 'バッチ処理', 'JDBC コネクタ', 'データパイプライン']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache Beam と ClickHouse の統合

<ClickHouseSupportedBadge/>

**Apache Beam** は、バッチおよびストリーミング（連続的）データ処理パイプラインの定義と実行を可能にする、オープンソースの統合型プログラミングモデルです。Apache Beam の柔軟性は、ETL（Extract, Transform, Load）処理から複雑なイベント処理、リアルタイム分析まで、幅広いデータ処理シナリオをサポートできる点にあります。
この統合では、基盤となるデータ挿入レイヤーとして ClickHouse の公式 [JDBC connector](https://github.com/ClickHouse/clickhouse-java) を活用します。



## 統合パッケージ {#integration-package}

Apache BeamとClickHouseを統合するために必要な統合パッケージは、[Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/)で保守・開発されています。これは、多くの主要なデータストレージシステムおよびデータベースとの統合を提供するバンドルです。
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO`の実装は、[Apache Beamリポジトリ](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse)内に配置されています。


## Apache Beam ClickHouseパッケージのセットアップ {#setup-of-the-apache-beam-clickhouse-package}

### パッケージのインストール {#package-installation}

パッケージ管理フレームワークに以下の依存関係を追加してください:

```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推奨Beamバージョン
`ClickHouseIO`コネクタは、Apache Beamバージョン`2.59.0`以降での使用を推奨します。
それ以前のバージョンでは、コネクタの機能が完全にサポートされない可能性があります。
:::

アーティファクトは[公式Mavenリポジトリ](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)で入手できます。

### コード例 {#code-example}

以下の例では、`input.csv`という名前のCSVファイルを`PCollection`として読み込み、定義されたスキーマを使用してRowオブジェクトに変換し、`ClickHouseIO`を使用してローカルのClickHouseインスタンスに挿入します:

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
        // Pipelineオブジェクトを作成します。
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // パイプラインに変換を適用します。
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


## サポートされるデータ型 {#supported-data-types}

| ClickHouse                         | Apache Beam                | サポート状況 | 備考                                                                                                                                    |
| ---------------------------------- | -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅           | `FixedBytes`は固定長バイト配列を表す`LogicalType`で、<br/>`org.apache.beam.sdk.schemas.logicaltypes`に配置されています |
|                                    | `Schema.TypeName#DECIMAL`  | ❌           |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌           |                                                                                                                                          |


## ClickHouseIO.Write パラメータ {#clickhouseiowrite-parameters}

以下のセッター関数を使用して `ClickHouseIO.Write` の設定を調整できます:

| パラメータセッター関数      | 引数の型                    | デフォルト値                  | 説明                                                            |
| --------------------------- | --------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 挿入する行ブロックの最大サイズ。                                |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 挿入失敗時の最大リトライ回数。                                  |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | リトライ時の累積バックオフの最大期間。                          |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 最初のリトライ前の初期バックオフ期間。                          |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | true の場合、分散テーブルへの挿入操作を同期します。             |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 挿入操作の確認に必要なレプリカ数。                              |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | true の場合、挿入操作で重複排除が有効になります。               |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | 対象の ClickHouse テーブルのスキーマ。                          |


## 制限事項 {#limitations}

コネクタを使用する際は、以下の制限事項を考慮してください：

- 現時点では、Sink操作のみがサポートされています。コネクタはSource操作をサポートしていません。
- ClickHouseは、`ReplicatedMergeTree`または`ReplicatedMergeTree`上に構築された`Distributed`テーブルへの挿入時に重複排除を実行します。レプリケーションがない場合、通常のMergeTreeへの挿入では、挿入が失敗した後に再試行が成功すると重複が発生する可能性があります。ただし、各ブロックはアトミックに挿入され、ブロックサイズは`ClickHouseIO.Write.withMaxInsertBlockSize(long)`を使用して設定できます。重複排除は、挿入されたブロックのチェックサムを使用して実現されます。重複排除の詳細については、[重複排除](/guides/developer/deduplication)および[重複排除挿入設定](/operations/settings/settings#insert_deduplicate)を参照してください。
- コネクタはDDLステートメントを実行しないため、挿入前にターゲットテーブルが存在している必要があります。


## 関連コンテンツ {#related-content}

- `ClickHouseIO` クラスの[ドキュメント](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)
- サンプルの `GitHub` リポジトリ [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)
