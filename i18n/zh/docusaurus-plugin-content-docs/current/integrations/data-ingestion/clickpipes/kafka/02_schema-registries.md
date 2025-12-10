---
sidebar_label: '集成 Schema Registry'
description: '如何将 ClickPipes 与 Schema Registry 集成以进行 schema 管理'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: '适用于 Kafka ClickPipe 的 Schema Registry'
doc_type: 'guide'
keywords: ['schema registries', 'kafka', 'clickpipes', 'avro', 'confluent']
---



# 模式注册表 {#schema-registries}

ClickPipes 支持用于 Avro 数据流的模式注册表（schema registry）。



## Kafka ClickPipes 支持的模式注册表 {#supported-schema-registries}

支持与 Confluent Schema Registry API 兼容的模式注册表服务。这包括：

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes 目前尚不支持 AWS Glue Schema Registry 或 Azure Schema Registry。如果你需要对这些模式注册表的支持，请[联系 ClickHouse 团队](https://clickhouse.com/company/contact?loc=clickpipes)。



## 配置 {#schema-registry-configuration}

使用 Avro 数据的 ClickPipes 需要一个 schema registry。可以通过以下三种方式之一进行配置：

1. 提供 schema subject 的完整路径（例如 `https://registry.example.com/subjects/events`）
    - 可选地，可以在 URL 末尾追加 `/versions/[version]` 来引用特定版本（否则 ClickPipes 将获取最新版本）。
2. 提供 schema ID 的完整路径（例如 `https://registry.example.com/schemas/ids/1000`）
3. 提供 schema registry 的根 URL（例如 `https://registry.example.com`）



## 工作原理 {#how-schema-registries-work}

ClickPipes 会从已配置的 schema registry 中动态检索并应用 Avro schema。
- 如果消息中嵌入了 schema id，则会使用该 id 来检索 schema。
- 如果消息中未嵌入 schema id，则会使用在 ClickPipe 配置中指定的 schema id 或 subject 名称来检索 schema。
- 如果消息在写入时未嵌入 schema id，且在 ClickPipe 配置中也未指定 schema id 或 subject 名称，则不会检索 schema，该消息会被跳过，并在 ClickPipes 错误表中记录 `SOURCE_SCHEMA_ERROR`。
- 如果消息不符合该 schema，则该消息会被跳过，并在 ClickPipes 错误表中记录 `DATA_PARSING_ERROR`。



## 模式映射 {#schema-mapping}

以下规则适用于获取到的 Avro 模式与 ClickHouse 目标表之间的映射：

- 如果 Avro 模式中包含的某个字段未包含在 ClickHouse 目标映射中，则该字段会被忽略。
- 如果 Avro 模式中缺少 ClickHouse 目标映射中定义的字段，则对应的 ClickHouse 列将使用“零值”填充，例如 0 或空字符串。请注意，目前在 ClickPipes 插入中不会评估 DEFAULT 表达式（这是一个临时限制，待 ClickHouse 服务器默认值处理机制更新后将被移除）。
- 如果 Avro 模式中的字段与 ClickHouse 列类型不兼容，则该行/消息的插入将失败，并且失败会被记录在 ClickPipes 错误表中。请注意，支持一些隐式转换（例如数值类型之间），但并非全部支持（例如，Avro 记录字段不能插入到 Int32 类型的 ClickHouse 列中）。
