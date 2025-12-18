---
slug: /migrations/postgresql
pagination_prev: null
pagination_next: null
title: 'PostgreSQL'
description: 'PostgreSQL 迁移章节的入口页面'
doc_type: 'landing-page'
keywords: ['PostgreSQL 迁移', '数据库迁移', 'ClickHouse 迁移', 'CDC（变更数据捕获）复制', '数据迁移']
---

| 页面                                                                                                                 | 描述                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](/migrations/postgresql/overview)                                                                                        | 本章节的概览页面                                                                                                                                                        |
| [Connecting to PostgreSQL](/integrations/postgresql/connecting-to-postgresql)            | 本页面介绍将 PostgreSQL 与 ClickHouse 集成的以下选项：ClickPipes、PeerDB、PostgreSQL 表引擎、MaterializedPostgreSQL 数据库引擎。 |
| [Migrating data](/migrations/postgresql/dataset)   | 从 PostgreSQL 迁移到 ClickHouse 指南的第 1 部分。通过一个实际示例，展示如何使用实时复制（CDC）方法高效地执行迁移。文中介绍的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据传输。                                                                                        |
|[Rewriting PostgreSQL Queries](/migrations/postgresql/rewriting-queries)|从 PostgreSQL 迁移到 ClickHouse 指南的第 2 部分。通过一个实际示例，展示如何使用实时复制（CDC）方法高效地执行迁移。文中介绍的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据传输。|
|[Data modeling techniques](/migrations/postgresql/data-modeling-techniques)|从 PostgreSQL 迁移到 ClickHouse 指南的第 3 部分。通过一个实际示例，展示在从 PostgreSQL 迁移时如何在 ClickHouse 中进行数据建模。|
|[Appendix](/migrations/postgresql/appendix)|与 PostgreSQL 迁移相关的附加信息|