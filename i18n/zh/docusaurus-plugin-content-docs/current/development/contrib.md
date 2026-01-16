---
description: '介绍 ClickHouse 对第三方库的使用情况，以及如何添加和维护第三方库。'
sidebar_label: '第三方库'
sidebar_position: 60
slug: /development/contrib
title: '第三方库'
doc_type: 'reference'
---

# 第三方库 \\{#third-party-libraries\\}

ClickHouse 出于不同目的会使用第三方库，例如连接到其他数据库、在从磁盘加载/保存到磁盘时对数据进行解码/编码，或实现某些专用 SQL 函数。
为避免依赖目标系统中可用的库，每个第三方库都会作为 Git 子模块导入到 ClickHouse 的源代码树中，并与 ClickHouse 一起编译和链接。
可以通过以下查询获取第三方库及其许可证列表：

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库即为位于 ClickHouse 仓库 `contrib/` 目录下的库。
根据构建选项的不同，部分库可能不会被编译，因此其功能在运行时可能不可用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 添加和维护第三方库 \\{#adding-and-maintaining-third-party-libraries\\}

每个第三方库都必须位于 ClickHouse 仓库 `contrib/` 目录下的一个专用子目录中。
避免直接把外部代码随意拷贝到库目录中。
应当创建一个 Git 子模块，从外部上游仓库拉取第三方代码。

所有被 ClickHouse 使用的子模块都列在 `.gitmodule` 文件中。
- 如果该库可以“即拿即用”（默认情况），你可以直接引用上游仓库。
- 如果该库需要打补丁，则在 [GitHub 上 ClickHouse 组织](https://github.com/ClickHouse)下创建该上游仓库的 fork。

在后一种情况下，我们的目标是尽可能将自定义补丁与上游提交隔离。
为此，请从你想集成的分支或标签上创建一个带有 `ClickHouse/` 前缀的分支，例如 `ClickHouse/2024_2`（对应分支 `2024_2`）或 `ClickHouse/release/vX.Y.Z`（对应标签 `release/vX.Y.Z`）。
避免跟踪上游开发分支 `master` / `main` / `dev`（也就是说，不要在 fork 仓库中使用 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev` 这类以开发分支为基础的前缀分支）。
这些分支是移动目标，会让正确的版本管理更加困难。
这类“前缀分支”可以确保从上游仓库拉取变更到 fork 时不会影响自定义的 `ClickHouse/` 分支。
`contrib/` 中的子模块只能跟踪 fork 的第三方仓库中的 `ClickHouse/` 分支。

补丁只会应用到外部库的 `ClickHouse/` 分支上。

有两种方式可以做到这一点：
- 你希望在 fork 仓库中某个带 `ClickHouse/` 前缀的分支上做一个新的修复，例如 sanitizer 修复。此时，将修复以带有 `ClickHouse/` 前缀的分支推送上去，例如 `ClickHouse/fix-sanitizer-disaster`。然后从这个新分支向自定义跟踪分支创建一个 PR，例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster`，并合并该 PR。
- 你更新了子模块，需要重新应用之前的补丁。在这种情况下，重新创建旧 PR 有些小题大做。相反，只需将较早的提交 cherry-pick 到新的 `ClickHouse/` 分支（对应新版本）即可。对于包含多个提交的 PR，可以酌情将这些提交 squash 成一个。在最理想的情况下，我们已经将自定义补丁回馈到上游，那么在新版本中就可以省略这些补丁。

一旦子模块更新完毕，在 ClickHouse 仓库中更新该子模块，使其指向 fork 中新的提交哈希。

在编写第三方库补丁时要以官方仓库为基准，并考虑将补丁贡献回上游仓库。
这样可以确保其他人也能从补丁中受益，同时不会给 ClickHouse 团队带来额外的维护负担。
