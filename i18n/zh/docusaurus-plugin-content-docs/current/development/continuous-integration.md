---
'description': 'ClickHouse持续集成系统概述'
'sidebar_label': '持续集成 (CI)'
'sidebar_position': 55
'slug': '/development/continuous-integration'
'title': '持续集成 (CI)'
---


# 持续集成（CI）

当您提交一个拉取请求时，ClickHouse [持续集成（CI）系统](tests.md#test-automation)会对您的代码运行一些自动化检查。这发生在一个代码库维护者（ClickHouse团队中的某个成员）审查了您的代码并将 `can be tested` 标签添加到您的拉取请求后。检查的结果在GitHub拉取请求页面上列出，具体说明请参见 [GitHub检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)。如果某个检查失败，您可能需要修复它。本页面提供了您可能遇到的检查的概述，以及您可以采取的修复措施。

如果看起来检查失败与您的更改无关，可能是某种临时故障或基础设施问题。向拉取请求推送一个空提交以重新启动CI检查：

```shell
git reset
git commit --allow-empty
git push
```

如果您不确定该怎么办，请寻求维护者的帮助。

## 与主分支合并 {#merge-with-master}

验证拉取请求是否可以合并到主分支。如果不能，它会以 `Cannot fetch mergecommit` 的消息失败。要修复此检查，请按照 [GitHub文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 中的描述解决冲突，或者使用git将 `master` 分支合并到您的拉取请求分支中。

## 文档检查 {#docs-check}

尝试构建ClickHouse文档网站。如果您在文档中更改了某些内容，它可能会失败。最可能的原因是文档中的某些交叉链接是错误的。查看检查报告并寻找 `ERROR` 和 `WARNING` 消息。

## 描述检查 {#description-check}

检查您的拉取请求的描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)。您必须为您的更改指定一个变更日志类别（例如，Bug Fix），并为 [CHANGELOG.md](../whats-new/changelog/index.md) 编写用户可读的描述信息。

## 推送到DockerHub {#push-to-dockerhub}

构建用于构建和测试的docker镜像，然后将其推送到DockerHub。

## 标记检查 {#marker-check}

该检查意味着CI系统已开始处理拉取请求。当其状态为'pending'时，表示不是所有检查都已启动。在所有检查都已启动后，它将状态更改为'success'。

## 风格检查 {#style-check}

对代码库执行各种风格检查。

风格检查作业中的基本检查：

##### cpp {#cpp}
使用 [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 脚本（也可以在本地运行）执行基于简单正则表达式的代码风格检查。  
如果失败，请根据 [代码风格指南](style.md) 修复样式问题。

##### codespell, aspell {#codespell}
检查语法错误和拼写错误。

##### mypy {#mypy}
对Python代码执行静态类型检查。

### 在本地运行风格检查作业 {#running-style-check-locally}

整个 _风格检查_ 作业可以在Docker容器中本地运行，命令为：

```sh
python -m ci.praktika run "Style check"
```

要运行特定检查（例如，_cpp_检查）：
```sh
python -m ci.praktika run "Style check" --test cpp
```

这些命令拉取 `clickhouse/style-test` Docker镜像并在容器化环境中运行该作业。除了Python 3和Docker外，不需要其他依赖项。

## 快速测试 {#fast-test}

通常，这是针对PR运行的第一个检查。它构建ClickHouse并运行大多数 [无状态功能测试](tests.md#functional-tests)，省略一些测试。如果失败，则在修复之前不会启动进一步的检查。查看报告以了解哪些测试失败，然后按照 [此处](../development/tests#running-a-test-locally) 的说明在本地重现故障。

#### 在本地运行快速测试: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

这些命令拉取 `clickhouse/fast-test` Docker镜像并在容器化环境中运行该作业。除了Python 3和Docker外，不需要其他依赖项。

## 构建检查 {#build-check}

在各种配置中构建ClickHouse，以便在后续步骤中使用。您必须修复失败的构建。构建日志通常具有足够的信息来修复错误，但您可能需要在本地重现故障。`cmake` 选项可以在构建日志中找到，使用grep查找 `cmake`。使用这些选项并遵循 [一般构建流程](../development/build.md)。

### 报告详细信息 {#report-details}

- **编译器**: `clang-19`，可选包含目标平台的名称
- **构建类型**: `Debug` 或 `RelWithDebInfo`（cmake）。
- **清理工具**: `none`（无清理工具）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）或 `thread`（TSan）。
- **状态**: `success` 或 `fail`
- **构建日志**: 指向构建和文件复制日志的链接，构建失败时有用。
- **构建时间**。
- **工件**: 构建结果文件（`XXX` 为服务器版本，例如 `20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: 主要构建的二进制文件。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: 包含ClickHouse单元测试的GoogleTest二进制文件。
  - `performance.tar.zst`: 性能测试的特殊包。

## 特殊构建检查 {#special-build-check}

使用 `clang-tidy` 执行静态分析和代码风格检查。报告与 [构建检查](#build-check) 类似。修复构建日志中找到的错误。

#### 在本地运行clang-tidy: {#running-clang-tidy-locally}

有一个方便的 `packager` 脚本，可以在Docker中运行clang-tidy构建
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## 无状态功能测试 {#functional-stateless-tests}

针对以各种配置构建的ClickHouse二进制文件运行 [无状态功能测试](tests.md#functional-tests) -- 发布、调试、带有清理工具等。查看报告以了解哪些测试失败，然后按照 [此处](../development/tests#functional-tests) 的说明在本地重现故障。请注意，您必须使用正确的构建配置进行重现 -- 在AddressSanitizer下测试可能会失败，但在Debug下通过。可以从 [CI构建检查页面](/install/advanced) 下载二进制文件，也可以本地构建。

## 有状态功能测试 {#functional-stateful-tests}

运行 [有状态功能测试](tests.md#functional-tests)。对待它们的方式与无状态功能测试相同。不同的是，它们需要运行 [clickstream数据集](../getting-started/example-datasets/metrica.md) 中的 `hits` 和 `visits` 表。

## 集成测试 {#integration-tests}

运行 [集成测试](tests.md#integration-tests)。

## Bug修复验证检查 {#bugfix-validate-check}

检查是否有新的测试（功能或集成）或者某些修改过的测试在主分支构建的二进制文件中失败。当拉取请求带有 "pr-bugfix" 标签时，会触发此检查。

## 压力测试 {#stress-test}

从多个客户端并发运行无状态功能测试以检测与并发相关的错误。如果失败：

    * 首先修复所有其他测试的失败；
    * 查看报告找到服务器日志，并检查可能导致错误的原因。

## 兼容性检查 {#compatibility-check}

检查 `clickhouse` 二进制文件在旧libc版本的分发版上是否运行。如果失败，请寻求维护者的帮助。

## AST模糊测试 {#ast-fuzzer}

运行随机生成的查询以捕获程序错误。如果失败，请寻求维护者的帮助。

## 性能测试 {#performance-tests}

测量查询性能的变化。这是执行时间最长的检查，运行时间接近6小时。性能测试报告的详细信息请参阅 [这里](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
