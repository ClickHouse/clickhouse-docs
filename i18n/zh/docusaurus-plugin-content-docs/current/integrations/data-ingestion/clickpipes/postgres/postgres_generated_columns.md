---
title: 'Postgres 生成列：注意事项与最佳实践'
slug: /integrations/clickpipes/postgres/generated_columns
description: '介绍在使用包含 PostgreSQL 生成列的表进行复制时需要重点关注的重要注意事项的页面'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

在对包含 PostgreSQL 生成列的表进行复制时，有一些重要注意事项需要牢记。这些潜在问题可能会影响复制过程以及目标系统中的数据一致性。

## 使用生成列的问题 \{#the-problem-with-generated-columns\}

1. **不会通过 `pgoutput` 发布：** 生成列不会通过 `pgoutput` 逻辑复制插件发布。也就是说，当你将数据从 PostgreSQL 复制到另一个系统时，复制流中不会包含生成列的值。

2. **与主键相关的问题：** 如果生成列是主键的一部分，它会在目标端导致去重问题。由于生成列的值没有被复制，目标系统将缺少正确识别和去重行所需的信息。

3. **与模式变更相关的问题：** 如果你在已经进行复制的表上添加一个生成列，该新列在目标端不会被填充——因为 Postgres 不会为这个新列提供 RelationMessage。随后如果你再向同一张表添加一个非生成的新列，ClickPipe 在尝试对齐模式时，将无法在目标端找到该生成列，从而导致复制过程失败。

## 最佳实践 \{#best-practices\}

为绕开这些限制，请考虑采用以下最佳实践：

1. **在目标端重新创建生成列：** 与其依赖复制过程来处理生成列，建议使用 dbt（data build tool）等工具或其他数据转换机制在目标端重新创建这些列。

2. **避免在主键中使用生成列：** 在设计需要进行复制的表时，最好避免将生成列作为主键的一部分。

## 即将推出的 UI 改进 \{#upcoming-improvements-to-ui\}

在即将发布的版本中，我们计划新增一个 UI，帮助您完成以下任务：

1. **识别包含生成列的表：** UI 将提供一个功能，用于识别包含生成列的表，帮助您了解哪些表受到此问题的影响。

2. **文档和最佳实践：** UI 将提供在副本表中使用生成列的最佳实践，包括关于如何避免常见陷阱的指导。