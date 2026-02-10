---
sidebar_label: '询问 AI 助手'
slug: /cloud/features/ai-ml/ask-ai
title: '在 Cloud 中询问 AI 助手'
description: '对 ClickHouse Cloud 中 Ask AI 聊天功能的说明'
doc_type: 'reference'
---

# 在 Cloud 中使用 Ask AI 代理 \{#ask-ai-agent-in-cloud\}

“Ask AI” 代理是一种开箱即用的体验，允许用户在其 ClickHouse Cloud 服务中托管的数据之上触发复杂的分析任务。
用户无需编写 SQL 或在各类仪表板间来回切换，只需用自然语言描述他们想要查找的内容。
助手会返回生成的查询、可视化或摘要，并且可以结合当前活动标签页、已保存的查询、schema 细节和仪表板等上下文来提高准确性。
它被设计成一个嵌入式助手，帮助用户快速从问题走向洞察，并从提示快速构建出可用的仪表板或 API。

该体验中还嵌入了一个 “Docs AI” 子代理，可直接在控制台中就 ClickHouse 文档提出具体问题。
用户无需在数百页文档中搜索，只需直接提问，例如 “How do I configure materialized views?” 或 “What&#39;s the difference between ReplacingMergeTree and AggregatingMergeTree?”，即可获得包含相关代码示例和源文档链接的精准答案。

有关更多详细信息，请参阅 [guides](/use-cases/AI_ML/AIChat) 部分。