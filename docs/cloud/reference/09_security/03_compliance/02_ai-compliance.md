---
title: 'AI compliance'
slug: /cloud/security/ai-compliance
description: 'Overview of AI compliance at ClickHouse'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'Artificial Intelligence', 'AI Governance', 'AI Compliance']
---

ClickHouse leverages AI to assist customers and provide increased functionality in the platform. This document describes where AI is used, options to enable or disable it, and links to other documentation showing how to use it.

:::info AI retention and training
By default, none of our AI features retain customer data or use customer data to train models.
:::

## AI Support {#ai-support}

ClickHouse provides AI functionality for customers to interact with a chat agent for configuration or troubleshooting assistance. The agent uses information from our documentation and case management systems to provide quick response to customer inquiries. ClickHouse collects de-identified AI usage data, such as number of inquiries and feedback like whether a result was good or bad (thumbs up/ thumbs down).  Customers may disable this functionality within the organization settings tab.

## ClickHouse Assistant {#clickhouse-assistant}

[ClickHouse Assistant](/cloud/features/ai-ml/ask-ai) may be enabled at the service level within the SQL console. This feature enables two distinct pieces of functionality:

| Feature              | Description                                                      | Data used                                       | User validation |
|:---------------------|:-----------------------------------------------------------------|:------------------------------------------------|:----------------|
| SQL AI               | Writes, analyzes and recommends improvements for queries         | Service metadata, query text, and prompt inputs | Output is provided to the user for review before query execution | 
| ClickHouse Assistant | Allows users to ask natural language questions and get answers   | Service metadata and content, ClickHouse documentation, and prompt inputs | Output is presented for review, users should validate before use |

## Model context protocol {#model-comtext-protocol}

[ClickHouse MCP](/cloud/features/ai-ml/remote-mcp) enables customers to more easily create their own agents leveraging data in their ClickHouse services. This requires a separate setup and leverages the customer's AI model of choice to process data. ClickHouse does not manage or have access to the customer's AI models.