---
date: 2023-06-07
title: "ClickHouse 架构迁移工具"
description: "了解 ClickHouse 架构迁移工具，以及如何随着时间推移管理不断演变的数据库架构（schema）。"
tags: ['工具和实用程序']
keywords: ['自动架构迁移']
---

{frontMatter.description}

{/* 截断标记 */}

# ClickHouse 的 Schema 迁移工具 \{#schema-migration-tools-for-clickhouse\}

## 什么是 Schema 管理？ \{#what-is-schema-management\}

Schema 管理是将版本控制原则应用于数据库 schema 的一种实践方法。它通常包括跟踪并自动化处理对表、列及其关系的变更，从而确保在各个环境中的 schema 更新具有可重复性、可审计性和一致性。当需要为新的用例或性能优化而修改数据库中的数据结构时，就会用到 Schema 管理。

### 为什么这很重要？ \{#why-is-it-important\}

Schema 管理工具可以让你在应用部署的同时自动化执行 schema 变更。Schema 变更通常是部署新应用版本之前的前提条件。这些工具也常被称为“schema 迁移”或“数据库迁移”工具，因为用户是在从一个版本的数据库“迁移”到另一个版本。

如果没有 schema 管理工具，数据库变更将是手工的、容易出错的，并且很难在不同团队和环境之间进行协调。虽然你始终可以直接对数据库执行 DDL，但这些工具提供了版本控制 (将变更作为带版本的代码进行跟踪) 、自动化部署 (在开发/预发布/生产环境之间一致地应用变更) 、回滚支持 (在出现问题时还原变更) 以及审计记录 (记录发生了什么变更以及何时发生) 。对 ClickHouse 来说尤为如此，因为某些 DDL 变更可能代价高昂或不可逆转，因此拥有包含评审步骤的结构化迁移流程就显得格外关键。

### 模式管理方法类型 \{#types-of-schema-management-approaches\}

模式管理工具通常可以分为两大类。

#### 命令式 \{#imperative\}

这些工具使用带版本控制的 SQL 文件来描述如何从状态 A 迁移到状态 B。你在文件中编写显式的 DDL 语句，例如 `CREATE TABLE`、`ALTER TABLE` 或 `DROP COLUMN`。然后工具按顺序运行这些文件，并跟踪哪些已经被应用。在这一类别中，由你明确指定要运行的具体 SQL。

**示例**：*golang-migrate, Goose, Flyway*

#### 声明式 \{#declarative\}

这类工具首先要求用户定义一个「期望状态」的 schema。工具会检测当前数据库与期望状态之间的差异，然后生成并应用所需的迁移。此方法减少了手写迁移和 schema 漂移的问题。在这一类别中，工具会决定要执行的精确 SQL。
**示例**：*Atlas, Liquibase*

还有第三类工具，它们对数据库 schema 结构本身的变更关注较少，而是更侧重于对数据本身进行转换，而非调整 schema 结构。
**示例**：*dbt*
在本文档中，我们将只关注用于数据库 schema 变更的工具。

总体而言，我们建议你选择一种与自己和团队的工作方式相契合的工具。命令式工具可以让你对将要运行的 DDL 拥有完全可见性，但这需要用户投入额外精力来进行 diff 比对并管理 schema 漂移。声明式工具对于自动化大量样板式维护工作和防止 schema 漂移很有价值，但在将生成的计划应用到 ClickHouse 之前，你应始终先进行审阅，以确保不会有意外的数据变更 (mutation) 或昂贵的重写操作被隐藏在自动生成的计划中。

## 选择工具时应考虑的因素 \{#what-to-consider-when-choosing-a-tool\}

### 你的团队已经在用什么工具？ \{#what-does-your-team-already-use\}

你很可能会基于自己熟悉的生态来选择工具。如果你的团队主要是 Go 技术栈，那么 golang-migrate 或 Goose 可能会比较顺手。如果你在 Java 生态中，可能已经在使用 Flyway 或 Liquibase。若你的基础设施团队使用 Terraform 和基础设施即代码 (infrastructure-as-code) 模式，Atlas 的声明式模型可能会非常契合。选择团队已经熟悉的工具是有实际价值的——最好的工具，是那个能够真正被采用并持续使用的工具。

### 你理想的流程是什么？ \{#what-is-your-desired-process\}

思考一下 schema 变更在你们组织内是如何流转的。考虑你是否需要：

* 简单的“写 SQL，在 CI 中运行，然后完成”的工作流 (例如 Goose、golang-migrate)
* 受管控的审批流程、审计记录和 RBAC (例如 Bytebase、Liquidbase)
* 以声明式方式定义 schema，由工具自动计算差异 (例如 Atlas)

选择与您的需求和流程相匹配的工具。

## 推荐工具 \{#recommended-tools\}

这些工具是我们通常基于工具成熟度、与 ClickHouse 的兼容性、社区采用情况以及运维契合度向 ClickHouse 用户推荐的。

### Atlas \{#atlas\}

[Atlas](https://atlasgo.io/guides/clickhouse) 是一款采用声明式方法的 schema-as-code 工具。可以用 HCL 或 SQL 定义期望的 schema 状态，Atlas 会检查当前数据库，计算差异，生成迁移计划并应用——也可以先由您审核再执行。

**为何适用于 ClickHouse：** Atlas 对 ClickHouse 提供一流支持，包括表、视图、materialized view、PROJECTION、分区和 UDF。它在 v0.37 (2025 年 9 月) 中加入了集群支持。支持使用 HCL 和纯 SQL 进行 schema 定义。

**注意事项：** Atlas 会生成迁移计划，但不了解这些计划的*代价*。某个 diff 看起来可能很简单 (例如修改某个列类型) ，但却可能在多 TB 级别的表上触发一次代价高昂的变更操作。务必在执行前审查自动生成的计划。

**最适合：** 希望采用基础设施即代码 (infrastructure-as-code) 工作流并实现自动配置漂移检测的团队。

* **类型：** 声明式
* **语言：** Go (单一二进制)
* **许可证：** Open Core (Apache 2.0 社区版；付费版本提供高级功能)
* **集群支持：** 是

### golang-migrate \{#golang-migrate\}

[golang-migrate](https://github.com/golang-migrate/migrate) 是一个简单且广泛使用的迁移执行工具。您通过带版本号的 SQL 文件编写升级/回滚步骤，该工具会按顺序执行，并在 ClickHouse 数据库中的 `schema_migrations` 表中跟踪状态。

**为何适用于 ClickHouse：** 简单且灵活。您可以精确编写需要在 ClickHouse 上运行的 ClickHouse DDL。它是一个单一的 Go 可执行文件，没有运行时依赖，便于集成到 CI/CD 流水线或 Docker 容器中。

**需要注意的事项：** 如果一个迁移文件包含多个语句，而其中某个在中途失败，数据库可能会处于部分错误状态，需要人工干预。通过遵循“每个文件只包含一个语句”的实践，可以使这一问题保持在可控范围内。

**最适合：** 希望方案简单，并且对在 ClickHouse 实例上运行的 SQL 拥有完全控制权的团队。

* **类型：** 命令式
* **语言：** Go
* **许可证：** 开源 (MIT，免费)
* **集群支持：** 支持

### Goose \{#goose\}

[Goose](https://github.com/pressly/goose) 是另一个基于 Go 的迁移运行器，其理念与 golang-migrate 类似。你编写带有版本号的 SQL 文件 (或在需要复杂逻辑时编写 Go 函数) ，Goose 会按顺序依次执行这些迁移，并在 ClickHouse 中的版本表里跟踪迁移状态。

**为什么适合 ClickHouse：** 与 golang-migrate 具有相同的基本优势——以 SQL 为中心、配置最小化、CLI 简单、易于集成到 CI/CD 中。Goose 还支持将迁移实现为 Go 函数，从而在纯 SQL 无法表达的复杂逻辑场景下提供更高的灵活性。

**需要注意的点：** 不提供 schema diff 或自动生成功能。

**最适合的场景：** 已经在使用 Goose 的团队，或更喜欢它的迁移文件约定而不是 golang-migrate 约定的团队。

* **类型：** 命令式
* **语言：** Go (单一二进制)
* **许可证：** 开源 (MIT，免费)
* **集群支持：** 不支持

## 生态系统中的其他工具 \{#other-tools-in-the-ecosystem\}

以下工具同样可以与 ClickHouse 一起使用。根据你的技术栈和工作流，它们可能更适合你。不过我们通常推荐上文介绍的那些工具。

| 工具                                                                           | 许可证         | 适用场景                                              |
| :--------------------------------------------------------------------------- | :---------- | :------------------------------------------------ |
| [Bytebase](https://www.bytebase.com/)                                        | Open Core   | 适用于需要在多套环境中进行治理、审批工作流以及审计跟踪的大型组织                  |
| [Flyway](https://flywaydb.org/)                                              | Open Source | 已经在团队内将 Flyway 或基于 JVM 的基础设施作为标准方案的团队             |
| [Liquibase](https://www.liquibase.org/)                                      | Open Core   | 在多种数据库间使用 Liquibase 并希望保持一致性的团队                   |
| [clickhouse-migrations](https://www.npmjs.com/package/clickhouse-migrations) | Open Source | 希望使用简单、聚焦于 ClickHouse 的迁移执行工具的 Node/TypeScript 团队 |
| [Houseplant](https://github.com/junehq/houseplant)                           | Open Source | 希望使用支持环境感知、专门面向 ClickHouse 的工具的 Python 团队         |
| [Sqitch](https://sqitch.org/)                                                | Open Source | 偏好使用原生 ClickHouse Client 部署脚本，或在复杂部署中需要显式依赖管理的团队  |
| [Alembic](https://alembic.sqlalchemy.org/) (SQLAlchemy)                      | Open Source | 已经使用 SQLAlchemy 进行数据库访问的 Python 团队                |