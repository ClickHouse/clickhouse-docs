---
sidebar_label: '与模式注册表集成'
description: '如何将 ClickPipes 与模式注册表集成以进行模式管理'
slug: /integrations/clickpipes/kafka/schema-registries
sidebar_position: 1
title: '适用于 Kafka ClickPipe 的模式注册表'
doc_type: 'guide'
keywords: ['schema registries', 'kafka', 'clickpipes', 'avro', 'confluent']
---



# Schema 注册表 {#schema-registries}

ClickPipes 支持用于 Avro 数据流的 Schema 注册表。


## Kafka ClickPipes 支持的注册表 {#supported-schema-registries}

支持与 Confluent Schema Registry API 兼容的 Schema 注册表，包括：

- Confluent Schema Registry
- Redpanda Schema Registry

ClickPipes 目前暂不支持 AWS Glue Schema Registry 或 Azure Schema Registry。如果您需要这些 Schema 注册表的支持，请[联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。


## 配置 {#schema-registry-configuration}

使用 Avro 数据的 ClickPipes 需要配置 Schema Registry。可以通过以下三种方式之一进行配置:

1. 提供 Schema Subject 的完整路径(例如 `https://registry.example.com/subjects/events`)
   - 可选:通过在 URL 后附加 `/versions/[version]` 来引用特定版本(否则 ClickPipes 将获取最新版本)。
2. 提供 Schema ID 的完整路径(例如 `https://registry.example.com/schemas/ids/1000`)
3. 提供 Schema Registry 的根 URL(例如 `https://registry.example.com`)


## 工作原理 {#how-schema-registries-work}

ClickPipes 从配置的 schema registry 中动态检索并应用 Avro schema。

- 如果消息中嵌入了 schema id,则使用该 id 检索 schema。
- 如果消息中未嵌入 schema id,则使用 ClickPipe 配置中指定的 schema id 或 subject 名称检索 schema。
- 如果消息写入时未嵌入 schema id,且 ClickPipe 配置中也未指定 schema id 或 subject 名称,则不会检索 schema,该消息将被跳过,并在 ClickPipes 错误表中记录 `SOURCE_SCHEMA_ERROR`。
- 如果消息不符合 schema,则该消息将被跳过,并在 ClickPipes 错误表中记录 `DATA_PARSING_ERROR`。


## 模式映射 {#schema-mapping}

在检索到的 Avro 模式与 ClickHouse 目标表之间的映射遵循以下规则:

- 如果 Avro 模式包含 ClickHouse 目标映射中未定义的字段,该字段将被忽略。
- 如果 Avro 模式缺少 ClickHouse 目标映射中定义的字段,ClickHouse 列将填充"零"值,例如 0 或空字符串。请注意,ClickPipes 插入操作目前不会计算 DEFAULT 表达式(这是一个临时限制,有待 ClickHouse 服务器默认处理功能的更新)。
- 如果 Avro 模式字段与 ClickHouse 列不兼容,该行/消息的插入将失败,失败信息将记录在 ClickPipes 错误表中。请注意,系统支持多种隐式转换(例如数值类型之间的转换),但并非所有转换都支持(例如,Avro 记录字段无法插入到 Int32 类型的 ClickHouse 列中)。
