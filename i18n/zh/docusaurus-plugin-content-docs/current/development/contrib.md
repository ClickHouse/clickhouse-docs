---
slug: /development/contrib
sidebar_position: 60
sidebar_label: 第三方库
---


# 第三方库

ClickHouse 使用第三方库来实现不同的功能，例如，连接其他数据库、在从/到磁盘的数据加载/保存过程中进行解码/编码，或实现某些专用 SQL 函数。为了不依赖于目标系统中可用的库， 每个第三方库作为 Git 子模块导入到 ClickHouse 的源树中，并与 ClickHouse 一起编译和链接。可以通过以下查询获取第三方库及其许可证的列表：

``` sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库位于 ClickHouse 仓库的 `contrib/` 目录中。根据构建选项，有些库可能没有被编译，因此它们的功能在运行时可能无法使用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 添加和维护第三方库 {#adding-and-maintaining-third-party-libraries}

每个第三方库必须位于 ClickHouse 仓库 `contrib/` 目录下的专用目录中。避免将外部代码的副本直接放入库目录中。相反，请创建一个 Git 子模块以从外部上游仓库拉取第三方代码。

ClickHouse 使用的所有子模块都列在 `.gitmodule` 文件中。
- 如果库可以按原样使用（默认情况），可以直接引用上游仓库。
- 如果库需要打补丁，请在 [ClickHouse GitHub 组织](https://github.com/ClickHouse) 中创建上游仓库的分支。

在后者的情况下，我们旨在尽可能将自定义补丁与上游提交隔离。为此，从要集成的分支或标签创建一个以 `ClickHouse/` 为前缀的分支，例如 `ClickHouse/2024_2`（对于分支 `2024_2`）或 `ClickHouse/release/vX.Y.Z`（对于标签 `release/vX.Y.Z`）。避免跟随上游开发分支 `master`/ `main` / `dev`（即，在分支库中以 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev` 为前缀的分支）。这样的分支是移动目标，使得适当的版本控制变得更困难。前缀分支确保从上游仓库拉取到分支库时，自定义的 `ClickHouse/` 分支不受影响。`contrib/` 中的子模块只能跟踪分叉第三方库的 `ClickHouse/` 分支。

补丁仅适用于外部库的 `ClickHouse/` 分支。

有两种方法可以做到这一点：
- 如果您希望针对分叉库中的 `ClickHouse/` 前缀分支进行新修复，例如，一个 sanitizer 修复。在这种情况下，以 `ClickHouse/` 前缀推送修复作为分支，例如 `ClickHouse/fix-sanitizer-disaster`。然后从新分支创建 PR 对自定义跟踪分支进行合并，例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster` 并合并 PR。
- 如果您更新了子模块并需要重新应用先前的补丁。在这种情况下，重新创建旧 PR 是多余的。相反，简单地将旧提交拣选到新的 `ClickHouse/` 分支（对应于新版本）。可以随意压缩具有多个提交的 PR 的提交。在最佳情况下，我们将自定义补丁贡献回上游，可以省略新版本中的补丁。

一旦更新了子模块，请在 ClickHouse 中提升该子模块，以指向分叉中的新哈希。

创建第三方库的补丁时，请考虑官方仓库并考虑将补丁再次贡献给上游仓库。这确保其他人也能受益于该补丁，并且不会对 ClickHouse 团队造成维护负担。
