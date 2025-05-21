---
'description': 'Page describing ClickHouse third-party usage and how to add and maintain
  third-party libraries.'
'sidebar_label': 'Third-Party Libraries'
'sidebar_position': 60
'slug': '/development/contrib'
'title': 'Third-Party Libraries'
---




# 第三方库

ClickHouse 使用第三方库来实现不同的功能，例如，连接到其他数据库，在加载/保存数据时对数据进行解码/编码，或实现某些专门的 SQL 函数。
为了独立于目标系统中可用的库，每个第三方库作为 Git 子模块导入到 ClickHouse 的源代码树中，并与 ClickHouse 一起编译和链接。
可以通过以下查询获得第三方库及其许可证的列表：

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

请注意，列出的库位于 ClickHouse 仓库的 `contrib/` 目录中。
根据构建选项，某些库可能未被编译，因此它们的功能在运行时可能不可用。

[示例](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 添加和维护第三方库 {#adding-and-maintaining-third-party-libraries}

每个第三方库必须位于 ClickHouse 仓库的 `contrib/` 目录下的专用目录中。
避免将外部代码复制到库目录中。
相反，创建一个 Git 子模块，以从外部上游仓库获取第三方代码。

ClickHouse 使用的所有子模块都列在 `.gitmodule` 文件中。
- 如果库可以直接使用（默认情况），可以直接引用上游仓库。
- 如果库需要打补丁，请在 [ClickHouse GitHub 组织](https://github.com/ClickHouse) 中创建上游仓库的分支。

在后一种情况下，我们旨在尽可能将自定义补丁与上游提交隔离。
为此，从要集成的分支或标签创建一个前缀为 `ClickHouse/` 的分支，例如 `ClickHouse/2024_2`（对于分支 `2024_2`）或 `ClickHouse/release/vX.Y.Z`（对于标签 `release/vX.Y.Z`）。
避免跟随上游开发分支 `master`/ `main` / `dev`（即，在分叉仓库中前缀分支为 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev`）。
这样的分支是动态的，使得正确版本控制变得更加困难。
"前缀分支" 确保从上游仓库拉取到分叉中时，自定义的 `ClickHouse/` 分支不受影响。
`contrib/` 中的子模块只能跟踪分叉的第三方库的 `ClickHouse/` 分支。

补丁仅适用于外部库的 `ClickHouse/` 分支。

有两种方法可以做到这一点：
- 如果您想在分叉仓库的 `ClickHouse/` 前缀分支上进行新的修复，例如，一个卫生检查修复。在这种情况下，将修复推送为带有 `ClickHouse/` 前缀的分支，例如 `ClickHouse/fix-sanitizer-disaster`。然后从新分支创建针对自定义跟踪分支的 PR，例如 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster`，并合并 PR。
- 如果您更新子模块并需要重新应用先前的补丁。在这种情况下，重新创建旧 PR 是多余的。相反，简单地将较旧的提交选择性地移到新的 `ClickHouse/` 分支中（对应于新版本）。如果 PR 有多个提交，可以自由合并这些提交。在最理想的情况下，我们可以将自定义补丁提交回上游，并可以在新版本中省略这些补丁。

一旦子模块更新完毕，请在 ClickHouse 中提升子模块以指向分叉中的新哈希。

创建第三方库的补丁时考虑到官方仓库，并考虑将补丁贡献回上游仓库。
这确保其他人也能从补丁中受益，并且这对 ClickHouse 团队不会造成维护负担。
