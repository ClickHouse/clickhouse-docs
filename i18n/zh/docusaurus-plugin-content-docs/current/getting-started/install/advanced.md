---
'description': '从源代码编译 ClickHouse 或安装 CI 生成的二进制文件的说明'
'keywords':
- 'ClickHouse'
- 'install'
- 'advanced'
- 'compile from source'
- 'CI generated binary'
'sidebar_label': '高级安装'
'slug': '/install/advanced'
'title': '高级安装方法'
'hide_title': false
'doc_type': 'guide'
---

## 从源代码编译 {#compile-from-source}

要手动编译 ClickHouse，请遵循 [Linux](/development/build.md) 或 [macOS](/development/build-osx.md) 的说明。

您可以编译包并安装它们或在不安装包的情况下使用程序。

```xml
Client: <build_directory>/programs/clickhouse-client
Server: <build_directory>/programs/clickhouse-server
```

您需要手动创建数据和元数据文件夹，并对其进行 `chown` 设置为所需的用户。它们的路径可以在服务器配置中更改 (src/programs/server/config.xml)，默认情况下它们是：

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

在 Gentoo 上，您只需使用 `emerge clickhouse` 从源代码安装 ClickHouse。

## 安装 CI 生成的二进制文件 {#install-a-ci-generated-binary}

ClickHouse 的持续集成 (CI) 基础设施为 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/) 中的每个提交生成专用构建，例如 [sanitized](https://github.com/google/sanitizers) 构建、未优化 (Debug) 构建、交叉编译构建等。虽然此类构建在开发期间通常才有用，但在某些情况下，对用户来说也可能很有趣。

:::note
由于 ClickHouse 的 CI 随着时间而发展，下载 CI 生成构建的确切步骤可能会有所不同。 
此外，CI 可能会删除旧的构建工件，使其无法下载。
:::

例如，要下载 ClickHouse v23.4 的 aarch64 二进制文件，请按照以下步骤操作：

- 找到 v23.4 发布的 GitHub 拉取请求：[Release pull request for branch 23.4](https://github.com/ClickHouse/ClickHouse/pull/49238)
- 点击“提交”，然后点击您要安装的特定版本类似于“将自动生成的版本更新为 23.4.2.1 和贡献者”的提交。
- 点击绿色检查/黄色点/红色叉以打开 CI 检查列表。
- 在列表中点击"Builds"旁边的“详细信息”；这将打开一个类似于 [此页面](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html) 的页面。
- 找到编译器 = "clang-*-aarch64" 的行——会有多行。
- 下载这些构建的工件。
