---
'sidebar_label': 'スキーマレジストリとの統合'
'description': 'スキーマ管理のためにClickPipesとスキーマレジストリを統合する方法'
'slug': '/integrations/clickpipes/kafka/schema-registries'
'sidebar_position': 1
'title': 'Kafka ClickPipeのスキーマレジストリ'
'doc_type': 'guide'
---


# スキーマレジストリ {#schema-registries}

ClickPipesは、Avroデータストリーム用のスキーマレジストリをサポートしています。

## Kafka ClickPipesのためのサポートされているレジストリ {#supported-schema-registries}

Confluent Schema RegistryとAPI互換性のあるスキーマレジストリがサポートされています。これには以下が含まれます：

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipesは、AWS Glue Schema RegistryやAzure Schema Registryをまだサポートしていません。これらのスキーマレジストリのサポートが必要な場合は、[私たちのチームに連絡してください](https://clickhouse.com/company/contact?loc=clickpipes)。

## 設定 {#schema-registry-configuration}

Avroデータを使用するClickPipesには、スキーマレジストリが必要です。これは以下のいずれかの方法で設定できます：

1. スキーマサブジェクトの完全なパスを指定する（例：`https://registry.example.com/subjects/events`）
    - オプションとして、URLの末尾に`/versions/[version]`を追加することで特定のバージョンを参照できます（そうしない場合、ClickPipesは最新のバージョンを取得します）。
2. スキーマIDの完全なパスを指定する（例：`https://registry.example.com/schemas/ids/1000`）
3. ルートスキーマレジストリのURLを提供する（例：`https://registry.example.com`）

## 動作の仕組み {#how-schema-registries-work}

ClickPipesは、構成されたスキーマレジストリからAvroスキーマを動的に取得して適用します。
- メッセージに埋め込まれたスキーマIDがある場合、それを使用してスキーマを取得します。
- メッセージに埋め込まれたスキーマIDがない場合、ClickPipeの設定で指定されたスキーマIDまたはサブジェクト名を使用してスキーマを取得します。
- メッセージが埋め込まれたスキーマIDなしで書き込まれ、ClickPipeの設定でスキーマIDまたはサブジェクト名が指定されていない場合、スキーマは取得されず、メッセージはスキップされ、ClickPipesエラーテーブルに`SOURCE_SCHEMA_ERROR`がログされます。
- メッセージがスキーマに準拠していない場合、そのメッセージはスキップされ、ClickPipesエラーテーブルに`DATA_PARSING_ERROR`がログされます。

## スキーママッピング {#schema-mapping}

取得したAvroスキーマとClickHouseの宛先テーブル間のマッピングには、以下のルールが適用されます：

- AvroスキーマにClickHouse宛先マッピングに含まれていないフィールドが含まれている場合、そのフィールドは無視されます。
- AvroスキーマにClickHouse宛先マッピングで定義されたフィールドが欠落している場合、ClickHouseのカラムは0や空の文字列のような「ゼロ」値で満たされます。なお、DEFAULT式は現在ClickPipesの挿入に対して評価されていません（これはClickHouseサーバーのデフォルト処理の更新を待つ一時的な制限です）。
- AvroスキーマフィールドとClickHouseカラムが互換性がない場合、その行/メッセージの挿入は失敗し、その失敗はClickPipesエラーテーブルに記録されます。なお、いくつかの暗黙の変換（数値型間など）はサポートされていますが、すべてではありません（たとえば、AvroレコードフィールドをInt32 ClickHouseカラムに挿入することはできません）。
