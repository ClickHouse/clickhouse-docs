---
slug: /integrations/integration-development/testing-your-integration
sidebar_label: '测试集成'
sidebar_position: 3
title: '测试 ClickHouse 集成'
description: '适用于 ClickHouse Cloud 和自托管开源版集成的基础验证矩阵。'
keywords: ['合作伙伴', '集成', '测试', '验证', '示例数据集', 'ClickHouse Cloud', '开源']
doc_type: 'guide'
---

# 测试您的 ClickHouse 集成 \{#testing-your-clickhouse-integration\}

在提交审核之前，请针对 ClickHouse 的两种部署模式，以及能够在有意义的规模下检验 ClickHouse 类型系统的数据集，对您的集成进行验证。本页说明了在基础要求层面，“已测试”具体意味着什么。正式验证是一个单独的流程，适用于向更高合作伙伴层级推进的合作伙伴。

有关摄取和使用路径，请参见[构建集成](/integrations/integration-development/building-integrations)；有关如何发布结果，请参见[记录您的集成](/integrations/integration-development/documenting-your-integration)。

## 测试矩阵 \{#test-matrix\}

覆盖两种部署模式。大多数客户通常只使用其中一种，而且两者在某些方面 (身份验证、网络、可用功能) 的行为会有所不同。

* **ClickHouse Cloud：**注册[免费试用](https://clickhouse.com/cloud)。Development 层级无需信用卡
* **自托管 (开源) ：**使用 [GitHub releases](https://github.com/ClickHouse/ClickHouse/releases) 中最新的稳定版本。若要通过 Docker 在本地快速启动实例，最快的方式是参考[安装指南](/install)

请同时针对这两种模式进行测试，并在你的集成页面中记录任何功能差距。

## 测试内容 \{#what-to-test\}

**功能正确性。** 覆盖集成暴露出的每一条代码路径：摄取、查询、schema 发现、错误处理和重连。如果你的产品会向最终用户暴露 SQL，请确认 UI 生成的查询能够正确执行并正常返回结果。

**类型系统覆盖。** ClickHouse 支持数组、元组、Map、JSON、Nested、LowCardinality、Decimal、Date 和 DateTime 变体、UUID、IPv4 和 IPv6、枚举以及聚合函数类型。集成通常会在嵌套数组、深度嵌套的元组和 JSON 列上遇到问题。你的客户端库和 UI 应能妥善处理这些情况；至少在失败时要返回可读的错误，而不是静默截断或错误渲染。

**规模。** 按照客户实际会运行的结果集大小和行数进行测试。对于面向用户的 BI，这通常意味着包含数亿到数十亿行的表，以及从单个聚合结果到数万行不等的结果集。无限制读取 (`SELECT *`) 应当以可预测的方式失败或分页，而不是挂起。

**身份验证。** 至少验证一种启用 TLS 的连接。如果你提供了身份验证配置选项，请测试文档中列出的每一种模式 (通过 TLS 使用用户名和密码、mTLS、SSL 客户端证书) 。

**连接生命周期。** 确认在连接中断、服务器重启和慢查询时的行为合理。许多处理最终都源于连接处理问题，而非查询语义本身。

## 推荐的示例数据集 \{#recommended-example-datasets\}

完整的数据集列表可在 [**示例数据集**](/getting-started/example-datasets) 部分查看。以下四个数据集涵盖了大多数集成测试需求：

* **[GitHub events](/getting-started/example-datasets/github-events)：** 31 亿行，包含嵌套事件负载。最适合测试数组、元组和嵌套类型
* **[NYC taxi data](/getting-started/example-datasets/nyc-taxi)：** 数十亿行，具有广为人知的 schema。适合进行吞吐量和读路径测试
* **[Stack Overflow](/getting-started/example-datasets/stackoverflow)：** 多表关系型数据，适用于大量使用 JOIN 的 BI 场景
* **[Hacker News](/getting-started/example-datasets/hacker-news)：** 2800 万行，加载速度快，便于反复试验

对于超大规模验证，请使用 **[WikiStat](/getting-started/example-datasets/wikistat)** (约 0.5 万亿条记录) 。

## 测试中需要收集的信息 \{#what-to-capture-from-your-testing\}

提交集成以供审核时，请提供：

* 已测试的 ClickHouse 版本 (Cloud 和开源版)
* 数据集及大致规模 (行数、磁盘占用大小)
* 你的集成支持和不支持的类型 (这会成为文档中的 **已知限制** 部分)
* 需要特别标注的性能特征，例如结果集达到某些阈值时行为会发生变化

简短的测试报告可以减少审核轮次。一个段落加一张表就够了。