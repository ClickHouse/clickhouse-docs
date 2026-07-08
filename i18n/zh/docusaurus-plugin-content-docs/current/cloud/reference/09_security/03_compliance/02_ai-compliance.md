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

具有 `organization:manage` 权限的用户可以查看和修改启用 AI 支持的设置。该设置位于组织设置页面。

ClickHouse 提供 AI 功能，供客户与聊天助手交互，以获取配置或故障排查方面的帮助。该助手会使用我们文档和工单管理系统中的信息，快速回应客户咨询。

## 为改进产品共享数据 \{#sharing-data-for-product-improvement\}

拥有 `organization:manage` 权限的用户可查看和修改用于启用产品改进数据共享的设置。该设置位于组织设置页面。

当为您的组织开启“与 ClickHouse 共享数据以改进产品”的管理员级设置后，ClickHouse 可能会使用您的用户在使用 AI 功能时生成或收集的数据，包括输入、输出、日志和元数据 (但不包括对 ClickHouse Cloud 查询的直接结果) ，用于模型评估 (准确性、性能以及安全性/合规性测试) 、提升服务可靠性、安全性和用户体验，以及开展分析等用途。我们不会将这些数据用于训练、重新训练或微调模型。

## ClickHouse Assistant \{#clickhouse-assistant\}

具有 `service:manage-generative-ai` 权限的用户可以查看并修改用于启用 [ClickHouse Assistant](/cloud/features/ai-ml/ask-ai) 的设置。该设置可在服务设置页面中找到。该功能提供两类不同的能力：

| Feature              | Description       | Data used                    | User validation        |
| :------------------- | :---------------- | :--------------------------- | :--------------------- |
| SQL AI               | 编写和分析查询，并提出改进建议   | 服务元数据、查询文本和提示输入              | 在查询执行前向用户提供输出，供其审阅     |
| ClickHouse Assistant | 允许用户使用自然语言提问并获得答案 | 服务元数据和内容、ClickHouse 文档以及提示输入 | 输出会提供给用户审阅，使用前应由用户自行验证 |

## 模型上下文协议 \{#model-comtext-protocol\}

[ClickHouse MCP](/cloud/features/ai-ml/remote-mcp)让客户能够更轻松地创建自己的智能体，并利用其 ClickHouse 服务中的数据。这需要单独配置，并使用客户自行选择的 AI 模型来处理数据。ClickHouse 不会管理客户的 AI 模型，也无权访问这些模型。