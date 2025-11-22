---
description: '介绍 ClickHouse 对第三方库的使用，以及如何添加和维护第三方库。'
sidebar_label: '第三方库'
sidebar_position: 60
slug: /development/contrib
title: '第三方库'
doc_type: 'reference'
---



# 第三方库

ClickHouse 出于不同目的使用第三方库，例如连接到其他数据库，在从/向磁盘加载或保存数据时对数据进行解码/编码，或实现某些特定的 SQL 函数。
为避免依赖目标系统中已安装的库，每个第三方库都作为 Git 子模块导入到 ClickHouse 的源代码树中，并与 ClickHouse 一同编译和链接。
可以通过以下查询获取第三方库及其许可证列表：

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库是位于 ClickHouse 仓库 `contrib/` 目录中的库。
根据构建选项的不同，某些库可能未被编译，因此其功能在运行时可能不可用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)


## 添加和维护第三方库 {#adding-and-maintaining-third-party-libraries}

每个第三方库必须位于 ClickHouse 代码仓库的 `contrib/` 目录下的专用目录中。
避免将外部代码的副本直接复制到库目录中。
应创建 Git 子模块从外部上游代码仓库拉取第三方代码。

ClickHouse 使用的所有子模块都列在 `.gitmodule` 文件中。

- 如果库可以直接使用(默认情况),可以直接引用上游代码仓库。
- 如果库需要打补丁,请在 [GitHub 上的 ClickHouse 组织](https://github.com/ClickHouse)中创建上游代码仓库的 fork。

在后一种情况下,我们的目标是尽可能将自定义补丁与上游提交隔离开来。
为此,请从要集成的分支或标签创建一个带有 `ClickHouse/` 前缀的分支,例如 `ClickHouse/2024_2`(对应分支 `2024_2`)或 `ClickHouse/release/vX.Y.Z`(对应标签 `release/vX.Y.Z`)。
避免跟踪上游开发分支 `master`/ `main` / `dev`(即在 fork 代码仓库中使用前缀分支 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev`)。
这些分支是不断变化的目标,会使正确的版本管理变得更加困难。
"前缀分支"确保从上游代码仓库拉取到 fork 代码仓库时不会影响自定义的 `ClickHouse/` 分支。
`contrib/` 中的子模块必须仅跟踪已 fork 的第三方代码仓库的 `ClickHouse/` 分支。

补丁仅应用于外部库的 `ClickHouse/` 分支。

有两种方法可以实现:

- 针对 fork 代码仓库中的 `ClickHouse/` 前缀分支进行新的修复,例如 sanitizer 修复。在这种情况下,将修复作为带有 `ClickHouse/` 前缀的分支推送,例如 `ClickHouse/fix-sanitizer-disaster`。然后从新分支针对自定义跟踪分支创建 PR,例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster` 并合并该 PR。
- 更新子模块并需要重新应用早期的补丁。在这种情况下,重新创建旧的 PR 过于繁琐。相反,只需将旧的提交 cherry-pick 到新的 `ClickHouse/` 分支(对应新版本)中。可以随意压缩具有多个提交的 PR 的提交。在最理想的情况下,我们已将自定义补丁贡献回上游,可以在新版本中省略这些补丁。

子模块更新后,在 ClickHouse 中更新子模块以指向 fork 中的新哈希值。

在创建第三方库的补丁时要考虑官方代码仓库,并考虑将补丁贡献回上游代码仓库。
这样可以确保其他人也能从补丁中受益,并且不会成为 ClickHouse 团队的维护负担。
