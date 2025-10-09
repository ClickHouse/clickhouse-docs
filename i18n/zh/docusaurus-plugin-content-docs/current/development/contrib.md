---
'description': '页面描述 ClickHouse 第三方使用及如何添加和维护第三方库。'
'sidebar_label': '第三方库'
'sidebar_position': 60
'slug': '/development/contrib'
'title': '第三方库'
'doc_type': 'reference'
---


# 第三方库

ClickHouse 利用第三方库来完成不同的任务，例如连接到其他数据库、在从磁盘加载/保存数据时进行解码/编码，或实现某些特定的 SQL 函数。为了独立于目标系统中可用的库，每个第三方库作为 Git 子模块导入到 ClickHouse 的源代码树中，并与 ClickHouse 编译和链接。可以通过以下查询获取第三方库及其许可证的列表：

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库位于 ClickHouse 仓库的 `contrib/` 目录中。根据构建选项，某些库可能未被编译，因此，它们的功能可能在运行时不可用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 添加和维护第三方库 {#adding-and-maintaining-third-party-libraries}

每个第三方库必须位于 ClickHouse 仓库 `contrib/` 目录下的专用目录中。避免将外部代码的副本放入库目录中。相反，创建一个 Git 子模块以从外部上游仓库中拉取第三方代码。

ClickHouse 使用的所有子模块都列在 `.gitmodule` 文件中。
- 如果库可以直接使用（默认情况），您可以直接引用上游仓库。
- 如果库需要打补丁，请在 [ClickHouse GitHub 组织](https://github.com/ClickHouse) 中创建上游仓库的分支。

在后者的情况下，我们的目标是尽可能将自定义补丁与上游提交隔离开。为此，从您想要集成的分支或标签创建一个以 `ClickHouse/` 为前缀的分支，例如 `ClickHouse/2024_2`（针对分支 `2024_2`）或 `ClickHouse/release/vX.Y.Z`（针对标签 `release/vX.Y.Z`）。避免跟随上游开发分支 `master`/ `main` / `dev`（即，分支前缀为 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev`）。这样的分支是流动目标，这使得适当的版本控制变得更加困难。“前缀分支”确保从上游仓库到分叉的提取不会影响自定义的 `ClickHouse/` 分支。`contrib/` 中的子模块只能跟踪分叉的第三方库的 `ClickHouse/` 分支。

补丁仅适用于外部库的 `ClickHouse/` 分支。

有两种方法可以做到这一点：
- 如果您希望在分叉的仓库中针对 `ClickHouse/` 前缀分支进行新的修复，例如一个清理器修复。在这种情况下，将修复作为带有 `ClickHouse/` 前缀的分支推送，例如 `ClickHouse/fix-sanitizer-disaster`。然后从新分支创建一个 PR 针对自定义跟踪分支，例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster` 并合并 PR。
- 如果您更新了子模块并需要重新应用早期补丁。在这种情况下，重新创建旧 PR 是多余的。相反，只需将较旧的提交挑选到新的 `ClickHouse/` 分支中（对应新的版本）。对于曾经有多个提交的 PR，您可以随意合并提交。在最佳情况下，我们已经将自定义补丁贡献回上游，可以在新版本中省略补丁。

一旦子模块更新，提升 ClickHouse 中的子模块以指向分叉中的新哈希。

根据官方仓库创建第三方库的补丁，并考虑将补丁贡献回上游仓库。这样可以确保其他人也可以受益于该补丁，同时不会给 ClickHouse 团队带来维护负担。
