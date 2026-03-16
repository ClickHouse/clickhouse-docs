---
sidebar_label: 'Apache Flink'
sidebar_position: 1
slug: /integrations/apache-flink
description: 'ClickHouse と連携する Apache Flink の概要'
keywords: ['clickhouse', 'Apache Flink', '移行', 'データ', 'ストリーム処理']
title: 'Flink コネクタ'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Flink コネクタ \{#flink-connector\}

<ClickHouseSupportedBadge />

これは、ClickHouse がサポートする公式の [Apache Flink Sink Connector](https://github.com/ClickHouse/flink-connector-clickhouse) です。Flink の [AsyncSinkBase](https://cwiki.apache.org/confluence/display/FLINK/FLIP-171%3A+Async+Sink) と、公式の ClickHouse [Java client](https://github.com/ClickHouse/clickhouse-java) を使用して構築されています。

このコネクタは Apache Flink の DataStream API をサポートしています。Table API のサポートは、[今後のリリースで予定されています](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42)。

<TOCInline toc={toc} />

## 要件 \{#requirements\}

* Java 11 以降 (Flink 1.17 以降の場合) または 17 以降 (Flink 2.0 以降の場合) 
* Apache Flink 1.17 以降

## Flink バージョン互換性マトリクス \{#flink-compatibility-matrix\}

このコネクタは、Flink 1.17+ と Flink 2.0+ の両方をサポートするため、2 つのアーティファクトに分かれています。使用する Flink バージョンに対応するアーティファクトを選択してください。

| Flink バージョン | アーティファクト                         | ClickHouse Java Client バージョン | 必要な Java |
| ----------- | -------------------------------- | ---------------------------- | -------- |
| 最新          | flink-connector-clickhouse-2.0.0 | 0.9.5                        | Java 17+ |
| 2.0.1       | flink-connector-clickhouse-2.0.0 | 0.9.5                        | Java 17+ |
| 2.0.0       | flink-connector-clickhouse-2.0.0 | 0.9.5                        | Java 17+ |
| 1.20.2      | flink-connector-clickhouse-1.17  | 0.9.5                        | Java 11+ |
| 1.19.3      | flink-connector-clickhouse-1.17  | 0.9.5                        | Java 11+ |
| 1.18.1      | flink-connector-clickhouse-1.17  | 0.9.5                        | Java 11+ |
| 1.17.2      | flink-connector-clickhouse-1.17  | 0.9.5                        | Java 11+ |

:::note
このコネクタは、Flink 1.17.2 より前のバージョンではテストされていません。
:::

## インストールとセットアップ \{#installation--setup\}

### 依存関係として追加 \{#import-as-a-dependency\}

#### Flink 2.0 以降の場合 \{#flink-2\}

<Tabs>
<TabItem value="Maven" label="Maven" default>

```maven
<dependency>
    <groupId>com.clickhouse.flink</groupId>
    <artifactId>flink-connector-clickhouse-2.0.0</artifactId>
    <version>{{ stable_version }}</version>
    <classifier>all</classifier>
</dependency>
```
</TabItem>
<TabItem value="Gradle" label="Gradle">

```gradle
dependencies {
    implementation("com.clickhouse.flink:flink-connector-clickhouse-2.0.0:{{ stable_version }}")
}
```
</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-2.0.0" % {{ stable_version }} classifier "all"
```

</TabItem>
</Tabs>

#### Flink 1.17以降の場合 \{#flink-117\}

<Tabs>
<TabItem value="Maven" label="Maven" default>

```maven
<dependency>
    <groupId>com.clickhouse.flink</groupId>
    <artifactId>flink-connector-clickhouse-1.17</artifactId>
    <version>{{ stable_version }}</version>
    <classifier>all</classifier>
</dependency>
```
</TabItem>
<TabItem value="Gradle" label="Gradle">

```gradle
dependencies {
    implementation("com.clickhouse.flink:flink-connector-clickhouse-1.17:{{ stable_version }}")
}
```
</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-1.17" % {{ stable_version }} classifier "all"
```

</TabItem>
</Tabs>

### バイナリをダウンロードする \{#download-the-binary\}

バイナリ JAR の名前のパターンは次のとおりです。

```bash
flink-connector-clickhouse-${flink_version}-${stable_version}-all.jar
```

ここで:

- `flink_version` は `2.0.0` または `1.17` のいずれかです
- `stable_version` は[安定版アーティファクトのリリースバージョン](https://github.com/ClickHouse/flink-connector-clickhouse/releases)です

利用可能なリリース済みの JAR ファイルはすべて、[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/flink/) で確認できます。

## DataStream APIの使用 \{#using-the-datastream-api\}

### スニペット \{#datastream-snippet\}

生の CSV データを ClickHouse に挿入する場合は、次のようになります。

<Tabs groupId="raw_csv_java_example">
  <TabItem value="Java" label="Java" default>
    ```java
    public static void main(String[] args) {
        // ClickHouseClient を設定
        ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(url, username, password, database, tableName);

        // ElementConverter を作成
        ElementConverter<String, ClickHousePayload> convertorString = new ClickHouseConvertor<>(String.class);

        // シンクを作成し、`setClickHouseFormat` を使用してフォーマットを設定
        ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
                convertorString,
                MAX_BATCH_SIZE,
                MAX_IN_FLIGHT_REQUESTS,
                MAX_BUFFERED_REQUESTS,
                MAX_BATCH_SIZE_IN_BYTES,
                MAX_TIME_IN_BUFFER_MS,
                MAX_RECORD_SIZE_IN_BYTES,
                clickHouseClientConfig
        );

        csvSink.setClickHouseFormat(ClickHouseFormat.CSV);

        // 最後に、DataStream をシンクに接続します。
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        Path csvFilePath = new Path(fileFullName);
        FileSource<String> csvSource = FileSource
                .forRecordStreamFormat(new TextLineInputFormat(), csvFilePath)
                .build();

        env.fromSource(
                csvSource,
                WatermarkStrategy.noWatermarks(),
                "GzipCsvSource"
        ).sinkTo(csvSink);
    }
    ```
  </TabItem>
</Tabs>

その他の例やスニペットは、テストコードで確認できます。

* [flink-connector-clickhouse-1.17](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-1.17/src/test/java/org/apache/flink/connector/clickhouse/sink)
* [flink-connector-clickhouse-2.0.0](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-2.0.0/src/test/java/org/apache/flink/connector/clickhouse/sink)

### クイックスタート例 \{#datastream-quick-start\}

ClickHouse Sink を手軽に始められるよう、Maven ベースの例を用意しています。

* [Flink 1.17+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v1.7/covid)
* [Flink 2.0.0+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v2/covid)

より詳細な手順については、[例ガイド](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/examples/README.md)を参照してください

### DataStream API の接続オプション \{#datastream-api-connection-options\}

#### ClickHouse クライアントオプション \{#client-options\}

| Parameters                  | 説明                                                                                                                            | Default Value | Required |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `url`                       | 完全修飾された ClickHouse の URL                                                                                                      | N/A           | Yes      |
| `username`                  | ClickHouse データベースのユーザー名                                                                                                       | N/A           | Yes      |
| `password`                  | ClickHouse データベースのパスワード                                                                                                       | N/A           | Yes      |
| `database`                  | ClickHouse データベース名                                                                                                            | N/A           | Yes      |
| `table`                     | ClickHouse テーブル名                                                                                                              | N/A           | Yes      |
| `options`                   | Java クライアントの設定オプションのマップ                                                                                                       | Empty map     | No       |
| `serverSettings`            | ClickHouse サーバーのセッション設定のマップ                                                                                                   | Empty map     | No       |
| `enableJsonSupportAsString` | [JSON data type](https://clickhouse.com/docs/sql-reference/data-types/newjson) に対して JSON 形式の文字列を受け取ることを想定する ClickHouse サーバー設定 | true          | No       |

`options` と `serverSettings` は、`Map<String, String>` としてクライアントに渡してください。どちらかに空のマップを指定した場合は、それぞれクライアントまたはサーバーのデフォルト設定が使用されます。

:::note
利用可能なすべての Java クライアントオプションは、[ClientConfigProperties.java](https://github.com/ClickHouse/clickhouse-java/blob/main/client-v2/src/main/java/com/clickhouse/client/api/ClientConfigProperties.java) および [このドキュメントページ](https://clickhouse.com/docs/integrations/language-clients/java/client#configuration) に一覧があります。

利用可能なすべてのサーバーセッション設定は、[このドキュメントページ](https://clickhouse.com/docs/operations/settings/settings) に一覧があります。
:::

例:

<Tabs groupId="client_options_example">
  <TabItem value="Java" label="Java" default>
    ```java
    Map<String, String> javaClientOptions = Map.of(
        ClientConfigProperties.CA_CERTIFICATE.getKey(), "<my_CA_cert>",
        ClientConfigProperties.SSL_CERTIFICATE.getKey(), "<my_SSL_cert>",
        ClientConfigProperties.CLIENT_NETWORK_BUFFER_SIZE.getKey(), "30000",
        ClientConfigProperties.HTTP_MAX_OPEN_CONNECTIONS.getKey(), "5"
    );

    Map<String, String> serverSettings = Map.of(
        "insert_deduplicate", "1"
    );

    ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(
        url,
        username,
        password,
        database,
        tableName,
        javaClientOptions,
        serverSettings,
        false // enableJsonSupportAsString
    );
    ```
  </TabItem>
</Tabs>

#### シンクオプション \{#sink-options\}

以下のオプションは、Flink の `AsyncSinkBase` に直接由来するものです。

| パラメータ                  | 説明                                            | デフォルト値 | 必須 |
| ---------------------- | --------------------------------------------- | ------ | -- |
| `maxBatchSize`         | 1 回のバッチで挿入できるレコードの最大数                         | N/A    | はい |
| `maxInFlightRequests`  | シンクがバックプレッシャーを適用するまでに許可される、進行中リクエストの最大数       | N/A    | はい |
| `maxBufferedRequests`  | バックプレッシャーが適用されるまでに、シンク内でバッファできるレコードの最大数       | N/A    | はい |
| `maxBatchSizeInBytes`  | バッチの最大サイズ (バイト単位) 。送信されるすべてのバッチは、このサイズ以下になります | N/A    | はい |
| `maxTimeInBufferMS`    | フラッシュされるまでにレコードをシンク内に保持できる最大時間                | N/A    | はい |
| `maxRecordSizeInBytes` | シンクが受け入れるレコードの最大サイズ。これを超えるレコードは自動的に拒否されます     | N/A    | はい |

## サポートされているデータ型 \{#supported-data-types\}

以下の表は、Flink から ClickHouse にデータを挿入する際のデータ型変換について、簡単に参照できる一覧です。

### Flink から ClickHouse へのデータ挿入 \{#inserting-data-from-flink-into-clickhouse\}

[//]: # "TODO: Table API のサポートが追加されたら「Flink SQL Type」カラムを追加 "

| Java型               | ClickHouse型       | サポート状況 | シリアライズ方式                      |
| ------------------- | ----------------- | ------ | ----------------------------- |
| `byte`/`Byte`       | `Int8`            | ✅      | `DataWriter.writeInt8`        |
| `short`/`Short`     | `Int16`           | ✅      | `DataWriter.writeInt16`       |
| `int`/`Integer`     | `Int32`           | ✅      | `DataWriter.writeInt32`       |
| `long`/`Long`       | `Int64`           | ✅      | `DataWriter.writeInt64`       |
| `BigInteger`        | `Int128`          | ✅      | `DataWriter.writeInt128`      |
| `BigInteger`        | `Int256`          | ✅      | `DataWriter.writeInt256`      |
| `short`/`Short`     | `UInt8`           | ✅      | `DataWriter.writeUInt8`       |
| `int`/`Integer`     | `UInt8`           | ✅      | `DataWriter.writeUInt8 `      |
| `int`/`Integer`     | `UInt16`          | ✅      | `DataWriter.writeUInt16`      |
| `long`/`Long`       | `UInt32`          | ✅      | `DataWriter.writeUInt32`      |
| `long`/`Long`       | `UInt64`          | ✅      | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt64`          | ✅      | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt128`         | ✅      | `DataWriter.writeUInt128`     |
| `BigInteger`        | `UInt256`         | ✅      | `DataWriter.writeUInt256`     |
| `BigDecimal`        | `Decimal`         | ✅      | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal32`       | ✅      | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal64`       | ✅      | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal128`      | ✅      | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal256`      | ✅      | `DataWriter.writeDecimal`     |
| `float`/`Float`     | `Float`           | ✅      | `DataWriter.writeFloat32`     |
| `double`/`Double`   | `Double`          | ✅      | `DataWriter.writeFloat64`     |
| `boolean`/`Boolean` | `Boolean`         | ✅      | `DataWriter.writeBoolean`     |
| `String`            | `String`          | ✅      | `DataWriter.writeString`      |
| `String`            | `FixedString`     | ✅      | `DataWriter.writeFixedString` |
| `LocalDate`         | `Date`            | ✅      | `DataWriter.writeDate`        |
| `LocalDate`         | `Date32`          | ✅      | `DataWriter.writeDate32`      |
| `LocalDateTime`     | `DateTime`        | ✅      | `DataWriter.writeDateTime`    |
| `ZonedDateTime`     | `DateTime`        | ✅      | `DataWriter.writeDateTime`    |
| `LocalDateTime`     | `DateTime64`      | ✅      | `DataWriter.writeDateTime64`  |
| `ZonedDateTime`     | `DateTime64`      | ✅      | `DataWriter.writeDateTime64`  |
| `int`/`Integer`     | `Time`            | ❌      | 該当なし                          |
| `long`/`Long`       | `Time64`          | ❌      | 該当なし                          |
| `byte`/`Byte`       | `Enum8`           | ✅      | `DataWriter.writeInt8`        |
| `int`/`Integer`     | `Enum16`          | ✅      | `DataWriter.writeInt16`       |
| `java.util.UUID`    | `UUID`            | ✅      | `DataWriter.writeIntUUID`     |
| `String`            | `JSON`            | ✅      | `DataWriter.writeJSON`        |
| `Array<Type>`       | `Array<Type>`     | ✅      | `DataWriter.writeArray`       |
| `Map<K,V>`          | `Map<K,V>`        | ✅      | `DataWriter.writeMap`         |
| `Tuple<Type,..>`    | `Tuple<T1,T2,..>` | ✅      | `DataWriter.writeTuple`       |
| `Object`            | `Variant`         | ❌      | 該当なし                          |

注意:

* 日付操作を行う際は、`ZoneId` を指定する必要があります。
* 10 進数の操作を行う際は、[精度とスケール](https://clickhouse.com/docs/sql-reference/data-types/decimal#decimal-value-ranges)を指定する必要があります。
* ClickHouse が Java の String を JSON として解析できるようにするには、`ClickHouseClientConfig` で `enableJsonSupportAsString` を有効にする必要があります。
* このコネクタでは、入力 DataStream 内の要素を ClickHouse のペイロードにマッピングするために `ElementConvertor` が必要です。そのため、このコネクタは `ClickHouseConvertor` と `POJOConvertor` を提供しており、上記の `DataWriter` のシリアライズメソッドを使用してこのマッピングを実装できます。

## サポートされている入力形式 \{#supported-input-formats\}

利用可能な ClickHouse の入力形式の一覧は、[こちらのドキュメントページ](https://clickhouse.com/docs/interfaces/formats#formats-overview)と [ClickHouseFormat.java](https://github.com/ClickHouse/clickhouse-java/blob/main/clickhouse-data/src/main/java/com/clickhouse/data/ClickHouseFormat.java) で確認できます。

DataStream を ClickHouse のペイロードにシリアライズする際にコネクタが使用する形式を指定するには、`setClickHouseFormat` 関数を使用します。例:

```java
ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
        convertorString,
        MAX_BATCH_SIZE,
        MAX_IN_FLIGHT_REQUESTS,
        MAX_BUFFERED_REQUESTS,
        MAX_BATCH_SIZE_IN_BYTES,
        MAX_TIME_IN_BUFFER_MS,
        MAX_RECORD_SIZE_IN_BYTES,
        clickHouseClientConfig
);
csvSink.setClickHouseFormat(ClickHouseFormat.CSV);
```

:::note
デフォルトでは、`ClickHouseClientConfig` の `setSupportDefault` が明示的に true に設定されている場合は [RowBinaryWithDefaults](https://clickhouse.com/docs/interfaces/formats/RowBinaryWithDefaults)、false に設定されている場合は [RowBinary](https://clickhouse.com/docs/interfaces/formats/RowBinary) を使用します。
:::


## メトリクス \{#metrics\}

このコネクタは、Flink の既存のメトリクスに加えて、以下の追加メトリクスを公開します。

| Metric                                  | 説明                                                                                                                                                                                                    | Type   | Status |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| `numBytesSend`                          | リクエストペイロード内で ClickHouse に送信された総バイト数。*注: このメトリクスは、ネットワーク経由で送信されたシリアライズ済みデータのサイズを測定するため、`system.query_log` 内の ClickHouse の `written_bytes` と異なる場合があります。`written_bytes` は、処理後にストレージへ実際に書き込まれたバイト数を反映します* | カウンタ   | ✅      |
| `numRecordSend`                         | ClickHouse に送信されたレコードの総数                                                                                                                                                                              | カウンタ   | ✅      |
| `numRequestSubmitted`                   | 送信されたリクエストの総数 (実際に実行されたフラッシュ回数)                                                                                                                                                                       | カウンタ   | ✅      |
| `numOfDroppedBatches`                   | 再試行できない障害により破棄されたバッチの総数                                                                                                                                                                               | カウンタ   | ✅      |
| `numOfDroppedRecords`                   | 再試行できない障害により破棄されたレコードの総数                                                                                                                                                                              | カウンタ   | ✅      |
| `totalBatchRetries`                     | 再試行可能な障害により実行されたバッチ再試行の総数                                                                                                                                                                             | カウンタ   | ✅      |
| `writeLatencyHistogram`                 | 書き込み成功時のレイテンシ分布のヒストグラム (ms)                                                                                                                                                                           | ヒストグラム | ✅      |
| `writeFailureLatencyHistogram`          | 書き込み失敗時のレイテンシ分布のヒストグラム (ms)                                                                                                                                                                           | ヒストグラム | ✅      |
| `triggeredByMaxBatchSizeCounter`        | `maxBatchSize` への到達によりトリガーされたフラッシュの総数                                                                                                                                                                 | カウンタ   | ✅      |
| `triggeredByMaxBatchSizeInBytesCounter` | `maxBatchSizeInBytes` への到達によりトリガーされたフラッシュの総数                                                                                                                                                          | カウンタ   | ✅      |
| `triggeredByMaxTimeInBufferMSCounter`   | `maxTimeInBufferMS` への到達によりトリガーされたフラッシュの総数                                                                                                                                                            | カウンタ   | ✅      |
| `actualRecordsPerBatch`                 | 実際のバッチサイズ分布のヒストグラム                                                                                                                                                                                    | ヒストグラム | ✅      |
| `actualBytesPerBatch`                   | バッチあたりの実際のバイト数分布のヒストグラム                                                                                                                                                                               | ヒストグラム | ✅      |

[//]: # "| actualTimeInBuffer           | フラッシュ前にバッファ内に保持されていた実際の時間分布のヒストグラム | Histogram | ❌      |"

## 制限事項 \{#limitations\}

* このシンクは現在、at-least-once の配信保証を提供します。exactly-once セマンティクスに向けた作業は[こちら](https://github.com/ClickHouse/flink-connector-clickhouse/issues/106)で追跡されています。
* このシンクは、処理できないレコードをバッファリングするためのデッドレターキュー (DLQ) をまだサポートしていません。現時点では、コネクタは挿入に失敗したレコードの再挿入を試み、それでも成功しない場合はそれらを破棄します。この機能は[こちら](https://github.com/ClickHouse/flink-connector-clickhouse/issues/105)で追跡されています。
* このシンクは、Flink の Table API または Flink SQL を介した作成をまだサポートしていません。この機能は[こちら](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42)で追跡されています。

## ClickHouse のバージョン互換性とセキュリティ \{#compatibility-and-security\}

* このコネクタは、最新版や head を含む複数の最近の ClickHouse バージョンに対して、日次の CI ワークフローでテストされています。テスト対象のバージョンは、新しい ClickHouse リリースが有効になるのに合わせて定期的に更新されます。コネクタが日次でテストしているバージョンについては、[こちら](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/.github/workflows/tests-nightly.yaml#L15)を参照してください。
* 既知のセキュリティ脆弱性と脆弱性の報告方法については、[ClickHouse のセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)を参照してください。
* セキュリティ修正や新しい改善を見逃さないよう、コネクタは継続的にアップグレードすることを推奨します。
* 移行で問題が発生した場合は、GitHub の [issue](https://github.com/ClickHouse/flink-connector-clickhouse/issues) を作成してください。対応します。

## 高度な使用方法と推奨事項 \{#advanced-and-recommended-usage\}

* 最適なパフォーマンスを得るには、DataStream の要素型が**汎用型**でないことを確認してください。詳しくは、[Flink の型の区別に関するこちらの説明](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/dev/datastream/fault-tolerance/serialization/types_serialization/#flinks-typeinformation-class)を参照してください。汎用型でない要素を使用すると、Kryo によるシリアライズのオーバーヘッドを回避でき、ClickHouse へのスループットが向上します。
* `maxBatchSize` は少なくとも 1000、理想的には 10,000 ～ 100,000 に設定することを推奨します。詳しくは、[バルク挿入に関するこのガイド](https://clickhouse.com/docs/optimize/bulk-inserts)を参照してください。
* OLTP スタイルの重複排除や ClickHouse への upsert を行う場合は、[このドキュメントページ](https://clickhouse.com/docs/guides/developer/deduplication#options-for-deduplication)を参照してください。*注: これは、[以下](#duplicate_batches)で詳しく説明する、再試行時に発生するバッチ重複排除とは異なります。*

## トラブルシューティング \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

以下のエラーが発生することがあります:

```text
com.clickhouse.client.api.ServerException: Code: 33. DB::Exception: Cannot read all data. Bytes read: 9205. Bytes expected: 1100022.: (at row 9) : While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)
```

**原因**: 一般的に、CANNOT&#95;READ&#95;ALL&#95;DATA エラーは、ClickHouse テーブルのスキーマと Flink レコードのスキーマに不整合が生じていることを意味します。これは、いずれか一方または両方が後方互換性のない形で変更された場合に発生します。

**解決策**: ClickHouse テーブルまたはコネクタの入力データ型、あるいはその両方のスキーマを更新し、互換性を持たせてください。必要に応じて、Java 型を ClickHouse 型にどのようにマッピングするかについては、[型マッピング](#inserting-data-from-flink-into-clickhouse)を参照してください。*注: まだ処理中のレコードがある場合は、コネクタの再起動時に Flink の状態をリセットする必要があります。*


### スループットが低い \{#low_throughput\}

ClickHouse への書き込み時に、コネクタのスループットがジョブの並列度 (Flink のタスク数) に応じて向上しないことがあります。

**原因**: ClickHouse のバックグラウンドで実行される[パートのマージ処理](https://clickhouse.com/docs/merges)によって、挿入が遅くなっている可能性があります。これは、設定したバッチサイズが小さすぎる場合、コネクタのフラッシュ頻度が高すぎる場合、またはその両方が重なった場合に発生することがあります。

**解決策**: `numRequestSubmitted` と `actualRecordsPerBatch` のメトリクスを監視し、バッチサイズ (`maxBatchSize`) とフラッシュ頻度をどのように調整すべきか判断してください。また、バッチサイズに関する推奨事項については、[高度な使用方法と推奨される使用方法](#advanced-and-recommended-usage)も参照してください。

[//]: # "TODO: https://github.com/ClickHouse/flink-connector-clickhouse/issues/121 がクローズされたらこのセクションのコメントを解除する"

[//]: # "### ClickHouse テーブルに重複した行バッチが表示される {#duplicate_batches}"

[//]: #

[//]: # "**原因**: 再試行可能な障害により Flink のバッチ内の 1 つ以上のレコードを ClickHouse に挿入できなかった場合、コネクタは**バッチ全体**を再試行します。[挿入の重複排除](https://clickhouse.com/docs/guides/developer/deduplicating-inserts-on-retries#query-level-insert-deduplication)が無効な場合、その結果として重複レコードが ClickHouse テーブルに取り込まれることがあります。そうでない場合は、重複排除ウィンドウまたはその期間が小さすぎて、コネクタが再試行する前にブロックの有効期限が切れている可能性があります。"

[//]: #

[//]: # "**解決策**:"

[//]: # "- テーブルで `Replicated*MergeTree` テーブルエンジンを使用している場合:"

[//]: # "  1. サーバーのセッション設定 `insert_deduplicate=1` を確認してください (必要に応じた設定方法については、上記の[例](#client-options)を参照してください)。`insert_deduplicate` はレプリケーションされたテーブルではデフォルトで有効です。"

[//]: # "  2. 必要に応じて、`MergeTree` テーブル設定の [`replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window) または [`replicated_deduplication_window_seconds`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds) のいずれか、または両方を増やしてください。"

[//]: # "- テーブルでレプリケーションされていない `*MergeTree` テーブルエンジンを使用している場合は、`MergeTree` テーブル設定 [`non_replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#non_replicated_deduplication_window) を増やしてください。"

[//]: #

[//]: # "_注 1: この解決策は [同期挿入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default) に依存しており、Flink コネクタでの使用が推奨されます。サーバーのセッション設定 `async_insert=0` を必ず確認してください。_"

[//]: #

[//]: # "_注 2: `(non_)replicated_deduplication_window` に大きな値を設定すると、比較するエントリが増えるため挿入が遅くなる可能性があります。_"

### ClickHouse テーブルで行が欠落する \{#missing_rows\}

**原因**: バッチは、再試行不可能な障害が発生したか、設定された再試行回数 (`ClickHouseClientConfig.setNumberOfRetries()`で設定可能) 以内に挿入できなかったため、破棄されました。*注: デフォルトでは、コネクタはバッチを破棄する前に、最大 3 回まで再挿入を試行します。*

**解決策**: 根本原因を特定するため、TaskManager のログやスタックトレースを確認してください。

## コントリビューションとサポート \{#contributing-and-support\}

プロジェクトへのコントリビューションや問題の報告をご希望の場合は、ぜひご意見をお寄せください。
issue の作成、改善の提案、または pull request の送信については、[GitHub リポジトリ](https://github.com/ClickHouse/flink-connector-clickhouse)をご覧ください。

コントリビューションを歓迎します。開始する前に、リポジトリ内の[コントリビューションガイド](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/CONTRIBUTING.md)を確認してください。
ClickHouse Flink コネクタの改善にご協力いただきありがとうございます。