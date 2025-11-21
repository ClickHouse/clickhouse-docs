---
title: 'Postgres 生成列：坑点与最佳实践'
slug: /integrations/clickpipes/postgres/generated_columns
description: '本页介绍在对包含 PostgreSQL 生成列的表进行复制时需要重点关注的重要注意事项'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

在对包含 PostgreSQL 生成列的表进行复制时，有一些重要的注意事项需要牢记。这些坑点可能会影响复制过程以及目标系统中的数据一致性。



## 生成列的问题 {#the-problem-with-generated-columns}

1. **不通过 `pgoutput` 发布：** 生成列不会通过 `pgoutput` 逻辑复制插件发布。这意味着当您将数据从 PostgreSQL 复制到其他系统时，生成列的值不会包含在复制流中。

2. **主键相关问题：** 如果生成列是主键的一部分，可能会在目标端导致去重问题。由于生成列的值不会被复制，目标系统将无法获得正确识别和去重行所需的必要信息。

3. **模式变更相关问题：** 如果您向正在复制的表中添加生成列，新列将不会在目标端填充——因为 Postgres 不会为新列提供 RelationMessage。如果您随后向同一表添加新的非生成列，ClickPipe 在尝试协调模式时将无法在目标端找到生成列，从而导致复制过程失败。


## 最佳实践 {#best-practices}

为了规避这些限制，请考虑以下最佳实践：

1. **在目标端重新创建生成列：** 建议不要依赖复制过程来处理生成列，而是使用 dbt（数据构建工具）或其他数据转换机制在目标端重新创建这些列。

2. **避免在主键中使用生成列：** 在设计需要复制的表时，最好避免将生成列包含在主键中。


## UI 即将改进的功能 {#upcoming-improvements-to-ui}

在即将发布的版本中,我们计划添加 UI 功能以帮助用户完成以下操作:

1. **识别包含生成列的表:** UI 将提供识别包含生成列的表的功能。这将帮助用户了解哪些表受此问题影响。

2. **文档和最佳实践:** UI 将包含在复制表中使用生成列的最佳实践,包括如何避免常见问题的指导。
