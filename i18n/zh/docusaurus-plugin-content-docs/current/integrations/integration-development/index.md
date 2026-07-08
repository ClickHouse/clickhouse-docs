---
slug: /integrations/integration-development
title: '集成开发'
sidebar_label: '概览'
sidebar_position: 1
description: '有关构建、测试和为 ClickHouse 集成编写文档的指南。'
keywords: ['集成开发', '构建集成', '合作伙伴', '集成合作伙伴']
doc_type: 'landing-page'
---

# 集成开发 \{#integration-development\}

如果您正在开发可连接到 ClickHouse 的产品，这些指南可为您提供指引。内容涵盖集成接口、如何验证您的连接器，以及如何在本站发布文档。

:::note[合作伙伴门户]
使用[合作伙伴门户](https://clickhouse.com/partners)注册您的集成并获取合作伙伴资源。以下指南介绍如何构建、测试并为您的连接器编写文档。
:::

## 指南 \{#guides\}

请按以下顺序阅读：

| 指南                                                                              | 涵盖内容                            |
| ------------------------------------------------------------------------------- | ------------------------------- |
| [构建集成](/integrations/integration-development/building-integrations)             | 摄取与消费路径、线协议、客户端以及 user-agent 约定 |
| [测试你的集成](/integrations/integration-development/testing-your-integration)        | 部署模式、数据集、类型覆盖情况，以及在评审前需要报告的事项   |
| [为你的集成编写文档](/integrations/integration-development/documenting-your-integration) | 必需的文档章节、样式规则，以及适用于你的产品页面的 PR 模板 |

完成原型设计和测试后，请将你的集成页面提交到 [`/docs/integrations/<category>/<your-integration>/`](/integrations/integration-development/documenting-your-integration) 下，并向 [`clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs) 提交拉取请求。