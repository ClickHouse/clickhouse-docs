---
'sidebar_label': '与模式注册表集成'
'description': '如何将 ClickPipes 与模式注册表集成以进行模式管理'
'slug': '/integrations/clickpipes/kafka/schema-registries'
'sidebar_position': 1
'title': 'Kafka ClickPipe 的模式注册表'
'doc_type': 'guide'
---


# Schema registries {#schema-registries}

ClickPipes 支持 Avro 数据流的模式注册中心。

## Supported registries for Kafka ClickPipes {#supported-schema-registries}

支持与 Confluent Schema Registry API 兼容的模式注册中心。这包括：

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes 目前不支持 AWS Glue Schema Registry 或 Azure Schema Registry。如果您需要对这些模式注册中心的支持，请 [联系团队](https://clickhouse.com/company/contact?loc=clickpipes)。

## Configuration {#schema-registry-configuration}

使用 Avro 数据的 ClickPipes 需要一个模式注册中心。这可以通过以下三种方式之一进行配置：

1. 提供模式主题的完整路径（例如 `https://registry.example.com/subjects/events`）
    - 可选地，通过在 URL 后附加 `/versions/[version]` 来引用特定版本（否则 ClickPipes 将检索最新版本）。
2. 提供模式 ID 的完整路径（例如 `https://registry.example.com/schemas/ids/1000`）
3. 提供根模式注册中心的 URL（例如 `https://registry.example.com`）

## How it works {#how-schema-registries-work}

ClickPipes 动态地从配置的模式注册中心检索和应用 Avro 模式。
- 如果消息中嵌入了模式 ID，将使用该 ID 来检索模式。
- 如果消息中未嵌入模式 ID，将使用 ClickPipe 配置中指定的模式 ID 或主题名称来检索模式。
- 如果消息是在未嵌入模式 ID 的情况下写入，并且在 ClickPipe 配置中未指定模式 ID 或主题名称，则将不检索模式，该消息将被跳过，并在 ClickPipes 错误表中记录 `SOURCE_SCHEMA_ERROR`。
- 如果消息不符合模式，则该消息将被跳过，并在 ClickPipes 错误表中记录 `DATA_PARSING_ERROR`。

## Schema mapping {#schema-mapping}

以下规则应用于检索到的 Avro 模式与 ClickHouse 目标表之间的映射：

- 如果 Avro 模式包含 ClickHouse 目标映射中未包含的字段，则该字段将被忽略。
- 如果 Avro 模式缺少 ClickHouse 目标映射中定义的字段，则 ClickHouse 列将填充为“零”值，例如 0 或空字符串。请注意，DEFAULT 表达式目前不会被 ClickPipes 插入评估（这是暂时性限制，待更新 ClickHouse 服务器的默认处理）。
- 如果 Avro 模式字段与 ClickHouse 列不兼容，则该行/消息的插入将失败，失败将记录在 ClickPipes 错误表中。请注意，支持某些隐式转换（例如，在数值类型之间），但并非全部（例如，Avro 记录字段不能插入 Int32 ClickHouse 列）。
