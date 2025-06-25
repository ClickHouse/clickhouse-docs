---
'description': '页面描述 ClickHouse 第三方使用以及如何添加和维护第三方库。'
'sidebar_label': '第三方库'
'sidebar_position': 60
'slug': '/development/contrib'
'title': '第三方库'
---


# 第三方库

ClickHouse 利用第三方库来实现不同的功能，例如，连接到其他数据库，在加载/保存数据时对数据进行解码/编码，或实现某些特殊的 SQL 函数。
为了使 ClickHouse 独立于目标系统中可用的库，每个第三方库都作为 Git 子模块导入到 ClickHouse 的源代码树中，并与 ClickHouse 一起编译和链接。
可以通过以下查询获取第三方库及其许可证的列表：

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库是位于 ClickHouse 存储库的 `contrib/` 目录中的库。
根据构建选项，某些库可能未被编译，因此它们的功能在运行时可能不可用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 添加和维护第三方库 {#adding-and-maintaining-third-party-libraries}

每个第三方库必须位于 ClickHouse 存储库的 `contrib/` 目录下的专用目录中。
请避免将外部代码的副本直接放入库目录中。
相反，创建一个 Git 子模块从外部上游存储库中获取第三方代码。

ClickHouse 使用的所有子模块都在 `.gitmodule` 文件中列出。
- 如果库可以按原样使用（默认情况），则可以直接引用上游存储库。
- 如果库需要打补丁，请在 [ClickHouse GitHub 组织](https://github.com/ClickHouse) 中创建上游存储库的分叉。

在后一个情况下，我们旨在尽可能将自定义补丁与上游提交隔离。
为此，从要集成的分支或标签创建一个以 `ClickHouse/` 为前缀的分支，例如 `ClickHouse/2024_2`（对于分支 `2024_2`）或 `ClickHouse/release/vX.Y.Z`（对于标签 `release/vX.Y.Z`）。
请避免跟踪上游开发分支 `master` / `main` / `dev`（即，在分叉库中以 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev` 为前缀的分支）。
这样的分支是移动目标，这使得适当版本控制变得更加困难。
“前缀分支”确保从上游存储库到分叉的拉取不会影响自定义的 `ClickHouse/` 分支。
`contrib/` 中的子模块必须只跟踪分叉的第三方库的 `ClickHouse/` 分支。

补丁仅适用于外部库的 `ClickHouse/` 分支。

有两种方法可以做到这一点：
- 如果您想在分叉库的 `ClickHouse/` 前缀分支上进行新修复，例如一个清理器修复。在这种情况下，将修复推送为一个以 `ClickHouse/` 为前缀的分支，例如 `ClickHouse/fix-sanitizer-disaster`。然后从新分支创建一个 PR，目标为自定义跟踪分支，例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster`，并合并 PR。
- 如果您更新了子模块并需要重新应用早期的补丁。在这种情况下，重新创建旧 PR 是多余的。相反，只需将旧提交 cherry-pick 到新的 `ClickHouse/` 分支（对应于新版本）。如果 PR 具有多个提交，可以自由地将其合并。在最佳情况下，我们已经将自定义补丁贡献回上游，从而在新版本中可以省略补丁。

一旦子模块更新，便在 ClickHouse 中提高子模块的版本以指向分叉中的新哈希。

创建第三方库的补丁时，请考虑官方存储库，并考虑将补丁反馈到上游存储库。
这确保其他人也能从补丁中受益，并且不会给 ClickHouse 团队带来维护负担。
