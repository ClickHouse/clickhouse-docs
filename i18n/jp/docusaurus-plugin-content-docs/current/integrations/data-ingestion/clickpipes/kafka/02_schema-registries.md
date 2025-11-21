---
sidebar_label: 'スキーマレジストリとの統合'
description: 'スキーマ管理のために ClickPipes をスキーマレジストリと連携させる方法'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: 'Kafka ClickPipe 用スキーマレジストリ'
doc_type: 'guide'
keywords: ['schema registries', 'kafka', 'clickpipes', 'avro', 'confluent']
---



# スキーマレジストリ {#schema-registries}

ClickPipesは、Avroデータストリームのスキーマレジストリをサポートしています。


## Kafka ClickPipesでサポートされているレジストリ {#supported-schema-registries}

Confluent Schema RegistryとAPI互換性のあるスキーマレジストリがサポートされています。以下が含まれます:

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipesは現在、AWS Glue Schema RegistryおよびAzure Schema Registryをサポートしていません。これらのスキーマレジストリのサポートが必要な場合は、[弊社チームまでお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。


## 設定 {#schema-registry-configuration}

Avroデータを使用するClickPipesには、スキーマレジストリが必要です。設定方法は以下の3通りです:

1. スキーマサブジェクトへの完全なパスを指定する(例:`https://registry.example.com/subjects/events`)
   - オプションとして、URLに`/versions/[version]`を追加することで特定のバージョンを参照できます(指定しない場合、ClickPipesは最新バージョンを取得します)。
2. スキーマIDへの完全なパスを指定する(例:`https://registry.example.com/schemas/ids/1000`)
3. ルートスキーマレジストリのURLを指定する(例:`https://registry.example.com`)


## 動作の仕組み {#how-schema-registries-work}

ClickPipesは、設定されたスキーマレジストリからAvroスキーマを動的に取得し適用します。

- メッセージにスキーマIDが埋め込まれている場合は、そのIDを使用してスキーマを取得します。
- メッセージにスキーマIDが埋め込まれていない場合は、ClickPipe設定で指定されたスキーマIDまたはサブジェクト名を使用してスキーマを取得します。
- メッセージが埋め込みスキーマIDなしで書き込まれており、かつClickPipe設定でスキーマIDまたはサブジェクト名が指定されていない場合は、スキーマは取得されず、メッセージはスキップされ、ClickPipesエラーテーブルに`SOURCE_SCHEMA_ERROR`が記録されます。
- メッセージがスキーマに準拠していない場合は、メッセージはスキップされ、ClickPipesエラーテーブルに`DATA_PARSING_ERROR`が記録されます。


## スキーママッピング {#schema-mapping}

取得したAvroスキーマとClickHouse宛先テーブル間のマッピングには、以下のルールが適用されます:

- AvroスキーマにClickHouse宛先マッピングに含まれていないフィールドが含まれている場合、そのフィールドは無視されます。
- AvroスキーマにClickHouse宛先マッピングで定義されているフィールドが存在しない場合、ClickHouseカラムには0や空文字列などの「ゼロ」値が格納されます。なお、現在ClickPipesの挿入時にはDEFAULT式は評価されません(これはClickHouseサーバーのデフォルト処理の更新待ちの一時的な制限です)。
- AvroスキーマフィールドとClickHouseカラムに互換性がない場合、その行/メッセージの挿入は失敗し、失敗内容はClickPipesエラーテーブルに記録されます。なお、数値型間などいくつかの暗黙的な変換はサポートされていますが、すべてではありません(例えば、AvroレコードフィールドをInt32型のClickHouseカラムに挿入することはできません)。
