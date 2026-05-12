---
sidebar_label: 'スキーマレジストリとの連携'
description: 'スキーマ管理のために ClickPipes をスキーマレジストリと連携させる方法。'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: 'Kafka ClickPipe 用スキーマレジストリ'
doc_type: 'guide'
keywords: ['スキーマレジストリ', 'kafka', 'clickpipes', 'avro', 'confluent']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# スキーマレジストリ \{#schema-registries\}

ClickPipes は、Avro および Protobuf でエンコードされたトピックをデコードするために、スキーマレジストリとの統合をサポートします。

## Kafka ClickPipes 向けにサポートされているスキーマレジストリ \{#supported-schema-registries\}

Confluent Schema Registry と API 互換性のあるスキーマレジストリがサポートされています。これには次のものが含まれます:

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes は、現時点では AWS Glue Schema Registry や Azure Schema Registry をサポートしていません。これらのスキーマレジストリのサポートが必要な場合は、[当社チームまでお問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## 設定 \{#schema-registry-configuration\}

ClickPipes の設定時に スキーマレジストリ と統合するには、次のいずれかの方法を使用する必要があります。

1. スキーマサブジェクトへの完全なパスを指定する (例: `https://registry.example.com/subjects/events`) 
   * 任意で、URL の末尾に `/versions/[version]` を追加して特定のバージョンを参照できます (指定しない場合は、ClickPipes が最新バージョンを取得します) 。
2. スキーマ ID への完全なパスを指定する (例: `https://registry.example.com/schemas/ids/1000`) 
3. スキーマレジストリのルート URL を指定する (例: `https://registry.example.com`)

## 仕組み \{#how-schema-registries-work\}

ClickPipes は、設定された スキーマレジストリ から スキーマ を動的に取得して適用します。

* メッセージに スキーマ ID が埋め込まれている場合は、その ID を使用して スキーマ を取得します。
* メッセージに スキーマ ID が埋め込まれていない場合は、ClickPipe の設定で指定した スキーマ ID または subject 名を使用して スキーマ を取得します。
* メッセージに埋め込み スキーマ ID がなく、ClickPipe の設定でも スキーマ ID または subject 名が指定されていない場合、スキーマ は取得されず、ClickPipes のエラーテーブルに `SOURCE_SCHEMA_ERROR` が記録され、そのメッセージはスキップされます。
* メッセージが スキーマ に準拠していない場合、そのメッセージはスキップされ、ClickPipes のエラーテーブルに `DATA_PARSING_ERROR` が記録されます。
* Protobuf スキーマ のみ: ClickPipes は、依存関係として定義されたインポート先の スキーマ を読み込みます。外部参照を含む Avro スキーマ は、現時点ではサポートされていません。

## スキーママッピング \{#schema-mapping\}

取得された スキーマ と ClickHouse の宛先テーブル間のマッピングには、次のルールが適用されます。

* スキーマ に、ClickHouse の宛先マッピングに含まれていないフィールドが存在する場合、そのフィールドは無視されます。
* スキーマ に、ClickHouse の宛先マッピングで定義されているフィールドが存在しない場合、ClickHouse のカラムには 0 や空文字列などのゼロ値が設定されます。なお、`DEFAULT` 式はサポートされていません。
* スキーマ のフィールドと ClickHouse のカラムに互換性がない場合、その行/メッセージの挿入は失敗し、その失敗は ClickPipes のエラーテーブルに記録されます。数値型間のように、いくつかの暗黙的な型変換はサポートされていますが、すべてがサポートされているわけではありません (たとえば、Avro のレコードフィールドを `Int32` 型の ClickHouse カラムに挿入することはできません) 。