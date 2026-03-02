---
sidebar_label: '与 Schema Registry 集成'
description: '如何将 ClickPipes 与 Schema Registry 集成以进行 schema 管理'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: '适用于 Kafka ClickPipe 的 Schema Registry'
doc_type: '指南'
keywords: ['schema registries', 'kafka', 'clickpipes', 'avro', 'confluent']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 模式注册表 \{#schema-registries\}

ClickPipes 支持为 Avro 数据流集成模式注册表。

## Kafka ClickPipes 支持的 Schema Registry \{#supported-schema-registries\}

与 Confluent Schema Registry API 兼容的 Schema Registry 均受支持，包括：

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes 目前尚不支持 AWS Glue Schema Registry 或 Azure Schema Registry。如果您需要支持这些 Schema Registry，请[联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。

## 配置 \{#schema-registry-configuration\}

使用 Avro 数据的 ClickPipes 需要一个 Schema Registry（架构注册中心）。可以通过以下三种方式之一进行配置：

1. 提供 schema subject 的完整路径（例如 `https://registry.example.com/subjects/events`）
    - 可选地，可以在 URL 末尾追加 `/versions/[version]` 来指定特定版本（否则 ClickPipes 将获取最新版本）。
2. 提供 schema id 的完整路径（例如 `https://registry.example.com/schemas/ids/1000`）
3. 提供 Schema Registry 的根 URL（例如 `https://registry.example.com`）

## 工作原理 \{#how-schema-registries-work\}

ClickPipes 会从已配置的 schema registry 动态获取并应用 Avro schema。

- 如果消息中嵌入了 schema id，将使用该 schema id 来获取 schema。
- 如果消息中未嵌入 schema id，将使用在 ClickPipe 配置中指定的 schema id 或 subject name 来获取 schema。
- 如果消息是在没有嵌入 schema id 的情况下写入的，并且在 ClickPipe 配置中也没有指定 schema id 或 subject name，则不会获取 schema，该消息将被跳过，并在 ClickPipes 错误表中记录一条 `SOURCE_SCHEMA_ERROR`。
- 如果消息不符合 schema，则该消息将被跳过，并在 ClickPipes 错误表中记录一条 `DATA_PARSING_ERROR`。

## 模式映射 \{#schema-mapping\}

以下规则适用于检索到的 Avro 模式与 ClickHouse 目标表之间的映射：

- 如果 Avro 模式包含未在 ClickHouse 目标映射中包含的字段，则该字段会被忽略。
- 如果 Avro 模式缺少 ClickHouse 目标映射中定义的字段，则对应的 ClickHouse 列将填充为“零”值，例如 0 或空字符串。请注意，目前在 ClickPipes 插入中不会对 DEFAULT 表达式进行求值（这是一个临时限制，等待对 ClickHouse 服务器默认值处理逻辑的更新）。
- 如果 Avro 模式字段与 ClickHouse 列不兼容，则该行/消息的插入将失败，并且失败会记录在 ClickPipes 错误表中。请注意，系统支持一些隐式类型转换（例如数值类型之间），但并非全部支持（例如，Avro 记录字段无法插入到 Int32 类型的 ClickHouse 列中）。