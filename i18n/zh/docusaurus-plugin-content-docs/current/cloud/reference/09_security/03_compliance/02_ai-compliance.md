---
title: 'AI 合规'
slug: /cloud/security/ai-compliance
description: 'ClickHouse 的 AI 合规概览'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '人工智能', 'AI 治理', 'AI 合规']
---

ClickHouse 利用 AI 协助客户，并为平台提供更多功能。本文档介绍了 AI 的应用场景、启用或禁用 AI 的方式，以及介绍其用法的其他相关文档链接。

:::info AI 保留与训练
默认情况下，我们的 AI 功能都不会保留客户数据，也不会使用客户数据训练模型。
:::

## AI 支持 \{#ai-support\}

ClickHouse 提供 AI 功能，供客户与聊天助手交互，以获取配置或故障排查方面的帮助。该助手会使用我们文档和工单管理系统中的信息，快速回应客户咨询。ClickHouse 会收集去标识化的 AI 使用数据，例如咨询次数，以及对结果好坏的反馈 (赞/踩) 。客户可在组织设置选项卡中禁用此功能。

## ClickHouse Assistant \{#clickhouse-assistant\}

可在 SQL 控制台中按服务级别启用 [ClickHouse Assistant](/cloud/features/ai-ml/ask-ai)。该功能提供两类不同的能力：

| Feature              | Description       | Data used                    | User validation        |
| :------------------- | :---------------- | :--------------------------- | :--------------------- |
| SQL AI               | 编写和分析查询，并提出改进建议   | 服务元数据、查询文本和提示输入              | 在查询执行前向用户提供输出，供其审阅     |
| ClickHouse Assistant | 允许用户使用自然语言提问并获得答案 | 服务元数据和内容、ClickHouse 文档以及提示输入 | 输出会提供给用户审阅，使用前应由用户自行验证 |

## 模型上下文协议 \{#model-comtext-protocol\}

[ClickHouse MCP](/cloud/features/ai-ml/remote-mcp)让客户能够更轻松地创建自己的智能体，并利用其 ClickHouse 服务中的数据。这需要单独配置，并使用客户自行选择的 AI 模型来处理数据。ClickHouse 不会管理客户的 AI 模型，也无权访问这些模型。