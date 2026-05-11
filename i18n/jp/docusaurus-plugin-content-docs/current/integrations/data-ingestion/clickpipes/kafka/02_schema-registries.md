---
sidebar_label: 'スキーマレジストリとの連携'
description: 'スキーマ管理のために ClickPipes をスキーマレジストリと連携させる方法'
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

ClickPipes は Avro データストリーム用のスキーマレジストリをサポートします。

## Kafka ClickPipes 向けにサポートされているスキーマレジストリ \{#supported-schema-registries\}

Confluent Schema Registry と API 互換性のあるスキーマレジストリがサポートされています。これには次のものが含まれます:

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes は、現時点では AWS Glue Schema Registry や Azure Schema Registry をサポートしていません。これらのスキーマレジストリのサポートが必要な場合は、[当社チームまでお問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## 設定 \{#schema-registry-configuration\}

Avro データを扱う ClickPipes では、スキーマレジストリが必要です。これは次のいずれか 1 つの方法で構成できます。

1. スキーマサブジェクトへの完全なパスを指定する（例: `https://registry.example.com/subjects/events`）
    - 任意で、URL の末尾に `/versions/[version]` を追加して特定のバージョンを参照できます（指定しない場合は、ClickPipes が最新バージョンを取得します）。
2. スキーマ ID への完全なパスを指定する（例: `https://registry.example.com/schemas/ids/1000`）
3. スキーマレジストリのルート URL を指定する（例: `https://registry.example.com`）

## 仕組み \{#how-schema-registries-work\}

ClickPipes は、設定されたスキーマレジストリから Avro スキーマを動的に取得して適用します。

- メッセージ内にスキーマ ID が埋め込まれている場合、その ID を使用してスキーマを取得します。
- メッセージ内にスキーマ ID が埋め込まれていない場合、ClickPipe の設定で指定されたスキーマ ID またはサブジェクト名を使用してスキーマを取得します。
- メッセージが埋め込みスキーマ ID なしで書き込まれており、かつ ClickPipe の設定でスキーマ ID またはサブジェクト名が指定されていない場合、スキーマは取得されず、そのメッセージの処理はスキップされ、`SOURCE_SCHEMA_ERROR` が ClickPipes のエラーテーブルに記録されます。
- メッセージがスキーマに準拠していない場合、そのメッセージの処理はスキップされ、`DATA_PARSING_ERROR` が ClickPipes のエラーテーブルに記録されます。

## スキーママッピング \{#schema-mapping\}

取得された Avro スキーマと ClickHouse の宛先テーブル間のマッピングには、次のルールが適用されます。

- Avro スキーマに、ClickHouse の宛先マッピングに含まれていないフィールドが存在する場合、そのフィールドは無視されます。
- Avro スキーマに、ClickHouse の宛先マッピングで定義されているフィールドが存在しない場合、ClickHouse のカラムには 0 や空文字列などのゼロ値が設定されます。なお、ClickPipes による挿入では、現在のところ DEFAULT 式は評価されません（これは、ClickHouse サーバーのデフォルト処理に関する更新が保留されている、一時的な制限です）。
- Avro スキーマのフィールドと ClickHouse のカラムに互換性がない場合、その行/メッセージの挿入は失敗し、その失敗は ClickPipes のエラーテーブルに記録されます。数値型間のように、いくつかの暗黙的な型変換はサポートされていますが、すべてがサポートされているわけではありません（たとえば、Avro のレコードフィールドを Int32 型の ClickHouse カラムに挿入することはできません）。