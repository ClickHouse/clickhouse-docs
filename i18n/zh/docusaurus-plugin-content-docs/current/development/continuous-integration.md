---
'description': 'ClickHouse 持续集成系统概述'
'sidebar_label': '持续集成 (CI)'
'sidebar_position': 55
'slug': '/development/continuous-integration'
'title': '持续集成 (CI)'
---


# 持续集成 (CI)

当您提交拉取请求时，ClickHouse [持续集成 (CI) 系统](tests.md#test-automation)将对您的代码运行一些自动检查。这在一个仓库维护者（ClickHouse团队的某个成员）审核了您的代码并将 `can be tested` 标签添加到您的拉取请求后发生。检查结果在GitHub拉取请求页面上列出，详细信息请参见 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)。如果某个检查失败，您可能需要修复它。本页面概述了您可能会遇到的检查以及您可以采取的修复措施。

如果检查失败似乎与您的更改无关，这可能是某种暂时性失败或基础设施问题。向拉取请求推送一个空提交以重新启动CI检查：

```shell
git reset
git commit --allow-empty
git push
```

如果您不确定该做什么，请向维护者寻求帮助。

## 与 Master 合并 {#merge-with-master}

验证 PR 是否可以合并到 master。如果不能，检查将失败并显示消息 `Cannot fetch mergecommit`。要修复此检查，请按照 [GitHub 文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 中的说明解决冲突，或使用 git 将 `master` 分支合并到您的拉取请求分支。

## 文档检查 {#docs-check}

尝试构建 ClickHouse 文档网站。如果您更改了文档中的内容，它可能会失败。最可能的原因是文档中的某些交叉链接错误。查看检查报告，寻找 `ERROR` 和 `WARNING` 消息。

## 描述检查 {#description-check}

检查您的拉取请求描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)。您必须为更改指定一个变更日志类别（例如 Bug 修复），并撰写用户可读的消息以描述 [CHANGELOG.md](../whats-new/changelog/index.md) 中的变更。

## 推送到 DockerHub {#push-to-dockerhub}

构建用于构建和测试的docker镜像，然后将其推送到DockerHub。

## 标记检查 {#marker-check}

此检查表示CI系统开始处理拉取请求。当其状态为 'pending' 时，这意味着并非所有检查均已开始。所有检查均已启动后，它会将状态更改为 'success'。

## 风格检查 {#style-check}

对代码库执行各种风格检查。

风格检查作业中的基本检查：

##### cpp {#cpp}
使用 [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 脚本（也可以在本地运行）执行基于正则表达式的简单代码风格检查。如果失败，根据 [代码风格指南](style.md) 修复风格问题。

##### codespell, aspell {#codespell}
检查语法错误和拼写错误。

##### mypy {#mypy}
对 Python 代码执行静态类型检查。

### 在本地运行风格检查作业 {#running-style-check-locally}

整个 _风格检查_ 作业可以在Docker容器中通过以下命令本地运行：

```sh
python -m ci.praktika run "Style check"
```

要运行特定检查（例如，_cpp_ 检查）：
```sh
python -m ci.praktika run "Style check" --test cpp
```

这些命令拉取 `clickhouse/style-test` Docker 镜像并在容器化环境中运行作业。除了 Python 3 和 Docker 外，没有其他依赖项。

## 快速测试 {#fast-test}

通常这是针对PR运行的第一个检查。它构建 ClickHouse 并运行大多数 [无状态功能测试](tests.md#functional-tests)，而省略一些。如果它失败，进一步的检查将不会启动，直到修复它。查看报告以查看哪些测试失败，然后按照 [这里](../development/tests#running-a-test-locally) 中的描述在本地重现故障。

#### 在本地运行快速测试: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

这些命令拉取 `clickhouse/fast-test` Docker 镜像并在容器化环境中运行作业。除了 Python 3 和 Docker 外，没有其他依赖项。

## 构建检查 {#build-check}

以各种配置构建 ClickHouse 以供进一步步骤使用。您必须修复失败的构建。构建日志通常具有足够的信息以修复错误，但您可能需要在本地重现故障。可以在构建日志中找到 `cmake` 选项，grep 查找 `cmake`。使用这些选项并遵循 [通用构建流程](../development/build.md)。

### 报告详情 {#report-details}

- **编译器**: `clang-19`，可选包括目标平台名称
- **构建类型**: `Debug` 或 `RelWithDebInfo` (cmake)。
- **检查器**: `none`（无检查器）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）或 `thread`（TSan）。
- **状态**: `success` 或 `fail`
- **构建日志**: 指向构建和文件复制日志的链接，构建失败时有用。
- **构建时间**。
- **工件**: 构建结果文件（其中 `XXX` 是服务器版本，例如 `20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: 主要构建的二进制文件。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: 包含ClickHouse单元测试的 GoogleTest 二进制文件。
  - `performance.tar.zst`: 用于性能测试的特殊包。

## 特殊构建检查 {#special-build-check}
使用 `clang-tidy` 进行静态分析和代码风格检查。报告类似于 [构建检查](#build-check)。修复构建日志中发现的错误。

#### 在本地运行 clang-tidy: {#running-clang-tidy-locally}

这里有一个便利的 `packager` 脚本在docker中运行clang-tidy构建
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## 无状态功能测试 {#functional-stateless-tests}
对以各种配置构建的 ClickHouse 二进制文件运行 [无状态功能测试](tests.md#functional-tests) -- 发布、调试、带检查器等。查看报告以查看哪些测试失败，然后按照 [这里](../development/tests#functional-tests) 中的描述在本地重现故障。请注意，您必须使用正确的构建配置进行重现 -- 在 AddressSanitizer 下测试可能会失败，但在 Debug 下通过。下载 [CI 构建检查页面](/install/advanced) 中的二进制文件，或在本地构建它。

## 有状态功能测试 {#functional-stateful-tests}

运行 [有状态功能测试](tests.md#functional-tests)。像处理无状态功能测试一样对待它们。不同之处在于它们需要来自 [clickstream 数据集](../getting-started/example-datasets/metrica.md) 的 `hits` 和 `visits` 表才能运行。

## 集成测试 {#integration-tests}
运行 [集成测试](tests.md#integration-tests)。

## 错误修复验证检查 {#bugfix-validate-check}

检查是新测试（功能或集成）还是某些失败的已更改测试，使用与主分支上构建的二进制文件。此检查在拉取请求具有 "pr-bugfix" 标签时触发。

## 压力测试 {#stress-test}
从多个客户端并发运行无状态功能测试，以检测与并发相关的错误。如果失败：

* 首先修复所有其他测试失败；
* 查看报告查找服务器日志，并检查可能导致错误的原因。

## 兼容性检查 {#compatibility-check}

检查 `clickhouse` 二进制文件是否在旧 libc 版本的发行版上运行。如果失败，请向维护者寻求帮助。

## AST Fuzzer {#ast-fuzzer}
运行随机生成的查询以捕捉程序错误。如果失败，请向维护者寻求帮助。

## 性能测试 {#performance-tests}
测量查询性能的变化。这是耗时最长的检查，运行时间略低于6小时。性能测试报告的详细信息请参见 [此处](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
