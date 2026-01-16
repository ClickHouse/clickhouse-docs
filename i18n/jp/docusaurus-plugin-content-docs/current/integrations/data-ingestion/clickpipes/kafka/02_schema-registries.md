---
sidebar_label: 'スキーマレジストリとの統合'
description: 'ClickPipes をスキーマレジストリと連携させてスキーマを管理する方法'
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

## Kafka ClickPipes でサポートされているレジストリ \{#supported-schema-registries\}

Confluent Schema Registry と API 互換のスキーマレジストリがサポート対象です。これには次のものが含まれます。

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes は、現時点では AWS Glue Schema Registry および Azure Schema Registry をサポートしていません。これらのスキーマレジストリのサポートが必要な場合は、[こちらから弊社チームまでお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

## 設定 \{#schema-registry-configuration\}

Avro データを使用する ClickPipes では、スキーマレジストリが必要です。これは次の 3 通りのいずれかで設定できます。

1. スキーマサブジェクトへの完全なパスを指定する（例: `https://registry.example.com/subjects/events`）
    - 必要に応じて、URL の末尾に `/versions/[version]` を付与することで特定のバージョンを参照できます（指定がない場合、ClickPipes は最新バージョンを取得します）。
2. スキーマ ID への完全なパスを指定する（例: `https://registry.example.com/schemas/ids/1000`）
3. スキーマレジストリのルート URL を指定する（例: `https://registry.example.com`）

## 仕組み \{#how-schema-registries-work\}

ClickPipes は、設定されているスキーマレジストリから Avro スキーマを動的に取得して適用します。

- メッセージにスキーマ ID が埋め込まれている場合は、その ID を使ってスキーマを取得します。
- メッセージにスキーマ ID が埋め込まれていない場合は、ClickPipe の設定で指定されたスキーマ ID またはサブジェクト名を使ってスキーマを取得します。
- メッセージが埋め込みスキーマ ID なしで送信され、かつ ClickPipe の設定でスキーマ ID またはサブジェクト名が指定されていない場合、スキーマは取得されず、そのメッセージはスキップされ、`SOURCE_SCHEMA_ERROR` が ClickPipes のエラーテーブルに記録されます。
- メッセージがスキーマに準拠していない場合、そのメッセージはスキップされ、`DATA_PARSING_ERROR` が ClickPipes のエラーテーブルに記録されます。

## スキーママッピング \{#schema-mapping\}

取得した Avro スキーマと ClickHouse の宛先テーブルとのマッピングには、次のルールが適用されます。

- Avro スキーマに、ClickHouse の宛先マッピングに含まれていないフィールドが存在する場合、そのフィールドは無視されます。
- Avro スキーマに、ClickHouse の宛先マッピングで定義されているフィールドが存在しない場合、対応する ClickHouse カラムは 0 や空文字列などの「ゼロ」値で埋められます。なお、DEFAULT 式は現在、ClickPipes による挿入では評価されません（これは、ClickHouse サーバー側のデフォルト処理の更新待ちである一時的な制限です）。
- Avro スキーマのフィールドと ClickHouse カラムが非互換である場合、その行／メッセージの挿入は失敗し、その失敗は ClickPipes の errors テーブルに記録されます。なお、（数値型間など）いくつかの暗黙的な型変換はサポートされていますが、すべてがサポートされているわけではありません（たとえば、Avro の record フィールドを Int32 型の ClickHouse カラムに挿入することはできません）。