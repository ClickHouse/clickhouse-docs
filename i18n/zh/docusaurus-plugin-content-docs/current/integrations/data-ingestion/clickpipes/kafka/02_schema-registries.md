---
sidebar_label: '与 Schema Registry 集成'
description: '如何将 ClickPipes 与 Schema Registry 集成以进行 schema 管理。'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: '适用于 Kafka ClickPipe 的 Schema Registry'
doc_type: '指南'
keywords: ['schema registries', 'kafka', 'clickpipes', 'avro', 'confluent']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

ClickPipes 支持与 Schema Registry 集成，以解码采用 Avro 和 Protobuf 编码的 topics。

## Kafka ClickPipes 支持的 Schema Registry \{#supported-schema-registries\}

与 Confluent Schema Registry API 兼容的 Schema Registry 均受支持，包括：

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes 目前尚不支持 AWS Glue Schema Registry 或 Azure Schema Registry。如果您需要支持这些 Schema Registry，请[联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。

## 配置 \{#schema-registry-configuration\}

要在配置 ClickPipes 时集成 Schema Registry ，必须使用以下方法之一：

1. 提供 schema subject 的完整路径 (例如 `https://registry.example.com/subjects/events`) 
   * 可选地，可以在 URL 末尾追加 `/versions/[version]` 来指定特定版本 (否则 ClickPipes 将获取最新版本) 。
2. 提供 schema id 的完整路径 (例如 `https://registry.example.com/schemas/ids/1000`) 
3. 提供 Schema Registry 的根 URL (例如 `https://registry.example.com`)

## 工作原理 \{#how-schema-registries-work\}

ClickPipes 会动态检索并应用已配置的 schema registry 中的 schema。

* 如果消息中嵌入了 schema ID，则会使用该 ID 检索 schema。
* 如果消息中未嵌入 schema ID，则会使用 ClickPipe 配置中指定的 schema ID 或 subject 名称来检索 schema。
* 如果写入消息时未嵌入 schema ID，且 ClickPipe 配置中也未指定 schema ID 或 subject 名称，则不会检索 schema，并会跳过该消息，同时在 ClickPipes 错误表中记录 `SOURCE_SCHEMA_ERROR`。
* 如果消息不符合 schema，则会跳过该消息，同时在 ClickPipes 错误表中记录 `DATA_PARSING_ERROR`。
* 仅适用于 Protobuf schema：ClickPipes 会加载所有作为依赖定义的导入 schema。带外部引用的 Avro schema 暂不支持。

## 模式映射 \{#schema-mapping\}

以下规则适用于检索到的 schema 与 ClickHouse 目标表之间的映射：

* 如果 schema 包含未在 ClickHouse 目标映射中包含的字段，则该字段会被忽略。
* 如果 schema 缺少 ClickHouse 目标映射中定义的字段，则对应的 ClickHouse 列将填充为“零”值，例如 0 或空字符串。请注意，不支持 `DEFAULT` 表达式。
* 如果 schema 字段与 ClickHouse 列不兼容，则该行/消息的插入将失败，并且失败会记录在 ClickPipes 错误表中。请注意，系统支持一些隐式类型转换 (例如数值类型之间) ，但并非全部支持 (例如，Avro 记录字段无法插入到 `Int32` 类型的 ClickHouse 列中) 。