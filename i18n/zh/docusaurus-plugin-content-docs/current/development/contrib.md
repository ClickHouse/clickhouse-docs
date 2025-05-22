---
'description': '页面描述 ClickHouse 第三方使用以及如何添加和维护第三方库。'
'sidebar_label': '第三方库'
'sidebar_position': 60
'slug': '/development/contrib'
'title': '第三方库'
---


# 第三方库

ClickHouse 使用第三方库来实现不同的功能，例如，连接到其他数据库、在加载/保存数据到/从磁盘时解码/编码数据，或实现某些专门的 SQL 函数。
为了独立于目标系统中可用的库，每个第三方库被作为 Git 子模块导入到 ClickHouse 的源代码树中，并与 ClickHouse 编译和链接。
可以通过以下查询获取第三方库及其许可证的列表：

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库是位于 ClickHouse 仓库的 `contrib/` 目录中的库。
根据构建选项，某些库可能未被编译，因此它们的功能在运行时可能不可用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 添加和维护第三方库 {#adding-and-maintaining-third-party-libraries}

每个第三方库必须位于 ClickHouse 仓库的 `contrib/` 目录下的专用目录中。
避免将外部代码的副本直接放入库目录中。
相反，创建一个 Git 子模块以从外部上游仓库拉取第三方代码。

ClickHouse 使用的所有子模块都列在 `.gitmodule` 文件中。
- 如果库可以直接使用（默认情况），可以直接引用上游仓库。
- 如果库需要打补丁，则在 [ClickHouse GitHub 组织](https://github.com/ClickHouse) 中创建上游仓库的分叉。

在后一种情况下，我们的目标是尽可能将自定义补丁与上游提交隔离。
为此，从您要集成的分支或标签创建一个前缀为 `ClickHouse/` 的分支，例如 `ClickHouse/2024_2`（对于分支 `2024_2`）或 `ClickHouse/release/vX.Y.Z`（对于标签 `release/vX.Y.Z`）。
避免跟随上游开发分支 `master`/ `main` / `dev`（即，在分叉仓库中前缀分支为 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev`）。
此类分支是移动目标，会使适当版本管理变得更加困难。
“前缀分支”确保从上游仓库到分叉的拉取将不会影响自定义的 `ClickHouse/` 分支。
`contrib/` 中的子模块只能追踪分叉的第三方仓库的 `ClickHouse/` 分支。

补丁只应用于外部库的 `ClickHouse/` 分支。

有两种方法可以做到这一点：
- 您希望在分叉仓库的 `ClickHouse/` 前缀分支上进行新的修复，例如一个 sanitizer 修复。在这种情况下，将修复作为前缀为 `ClickHouse/` 的分支推送，例如 `ClickHouse/fix-sanitizer-disaster`。然后从新分支创建一个 PR，目标为自定义跟踪分支，例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster` 并合并 PR。
- 您更新了子模块并需要重新应用早先的补丁。在这种情况下，重新创建旧的 PR 是多余的。相反，只需将较旧的提交 cherry-pick 到新的 `ClickHouse/` 分支（对应新版本）。可以随意压缩有多个提交的 PR 的提交。在最好的情况下，我们会将自定义补丁回馈给上游，并可以省略新版本中的补丁。

一旦子模块被更新，请在 ClickHouse 中将子模块更新到指向分叉中的新哈希。

创建第三方库的补丁时，请考虑官方仓库并考虑将补丁贡献回上游仓库。
这确保其他人也能受益于补丁，并且它不会给 ClickHouse 团队带来维护负担。
