---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'ユーザーはApache Beamを使用してClickHouseにデータを取り込むことができます'
title: 'Apache BeamとClickHouseの統合'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache BeamとClickHouseの統合

<ClickHouseSupportedBadge/>

**Apache Beam** は、開発者がバッチおよびストリーム（連続）データ処理パイプラインを定義および実行できるオープンソースの統一プログラミングモデルです。Apache Beamの柔軟性は、ETL（Extract, Transform, Load）操作から複雑なイベント処理、リアルタイム分析に至るまで、幅広いデータ処理シナリオをサポートする能力にあります。この統合は、基盤となる挿入レイヤーにClickHouseの公式[ JDBCコネクタ](https://github.com/ClickHouse/clickhouse-java)を活用しています。

## 統合パッケージ {#integration-package}

Apache BeamとClickHouseを統合するために必要な統合パッケージは、[Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) の下で維持・開発されています。これは、多くの人気データストレージシステムとデータベースの統合バンドルです。`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` 実装は、[Apache Beamのリポジトリ](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse)にあります。

## Apache Beam ClickHouseパッケージのセットアップ {#setup-of-the-apache-beam-clickhouse-package}

### パッケージのインストール {#package-installation}

次の依存関係をパッケージ管理フレームワークに追加します：
```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推奨Beamバージョン
`ClickHouseIO` コネクタは、Apache Beam バージョン `2.59.0` 以降の使用が推奨されています。以前のバージョンはコネクタの機能を完全にサポートしない場合があります。
:::

アーティファクトは、[公式mavenリポジトリ](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)で見つけることができます。

### コード例 {#code-example}

以下の例は、`input.csv`という名前のCSVファイルを`PCollection`として読み込み、定義されたスキーマを使用してRowオブジェクトに変換し、ローカルのClickHouseインスタンスに`ClickHouseIO`を使用して挿入します：

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
        // パイプラインオブジェクトを作成します。
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

## サポートされているデータ型 {#supported-data-types}

| ClickHouse                         | Apache Beam                | サポート | 注釈                                                                                                                                    |
|------------------------------------|----------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅        | `FixedBytes`は、<br/> `org.apache.beam.sdk.schemas.logicaltypes`にある固定長のバイト配列を表す<br/> `LogicalType`です |
|                                    | `Schema.TypeName#DECIMAL`  | ❌        |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌        |                                                                                                                                          |

## ClickHouseIO.Writeパラメータ {#clickhouseiowrite-parameters}

以下のセッターファンクションで`ClickHouseIO.Write`の設定を調整できます：

| パラメータセッターファンクション   | 引数の型               | デフォルト値                       | 説明                                                       |
|-------------------------------------|-----------------------|-----------------------------------|----------------------------------------------------------|
| `withMaxInsertBlockSize`            | `(long maxInsertBlockSize)` | `1000000`                         | 挿入する行のブロックの最大サイズ。                           |
| `withMaxRetries`                    | `(int maxRetries)`    | `5`                               | 失敗した挿入の最大リトライ回数。                             |
| `withMaxCumulativeBackoff`          | `(Duration maxBackoff)`     | `Duration.standardDays(1000)`    | リトライの最大累積バックオフ期間。                          |
| `withInitialBackoff`                | `(Duration initialBackoff)` | `Duration.standardSeconds(5)`     | 最初のリトライ前の初期バックオフ期間。                       |
| `withInsertDistributedSync`         | `(Boolean sync)`      | `true`                            | trueの場合、分散テーブルの挿入操作を同期します。              |
| `withInsertQuorum`                  | `(Long quorum)`       | `null`                            | 挿入操作を確認するために必要なレプリカの数。                 |
| `withInsertDeduplicate`             | `(Boolean deduplicate)` | `true`                           | trueの場合、挿入操作の重複排除が有効になります。              |
| `withTableSchema`                   | `(TableSchema schema)`      | `null`                          | 対象ClickHouseテーブルのスキーマ。                            |

## 制限事項 {#limitations}

コネクタを使用する際には、以下の制限を考慮してください：
* 現在のところ、Sink操作のみがサポートされています。コネクタはSource操作をサポートしていません。
* ClickHouseは、`ReplicatedMergeTree`または`ReplicatedMergeTree`の上に構築された`Distributed`テーブルに挿入する際に重複排除を行います。レプリケーションがない場合、通常のMergeTreeに挿入すると、挿入が失敗し、その後リトライが成功した場合に重複が発生する可能性があります。ただし、各ブロックは原子的に挿入され、ブロックサイズは`ClickHouseIO.Write.withMaxInsertBlockSize(long)`を使用して設定できます。重複排除は、挿入されたブロックのチェックサムを使用して達成されます。重複排除についての詳細は、[重複排除](/guides/developer/deduplication)および[重複排除挿入設定](/operations/settings/settings#insert_deduplicate)をご覧ください。
* コネクタはDDLステートメントを実行しないため、挿入前に対象テーブルが存在する必要があります。

## 関連コンテンツ {#related-content}
* `ClickHouseIO`クラスの[ドキュメント](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)。
* 例の`Github`リポジトリ [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)。
