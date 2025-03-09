---
slug: /development/continuous-integration
sidebar_position: 55
sidebar_label: 持续集成 (CI)
---


# 持续集成 (CI)

当您提交一个拉取请求时，ClickHouse [持续集成 (CI) 系统](tests.md#test-automation) 会对您的代码进行一些自动检查。这发生在代码库维护者（ClickHouse 团队的某位成员）审核了您的代码并将 `can be tested` 标签添加到您的拉取请求后。检查结果会在 GitHub 拉取请求页面上列出，如 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks) 所述。如果某项检查失败，您可能需要修复它。此页面提供了您可能遇到的检查概述，以及您可以采取的修复措施。

如果看起来检查失败与您的更改无关，可能是某种瞬时故障或基础设施问题。向拉取请求推送一个空提交以重新启动 CI 检查：

```shell
git reset
git commit --allow-empty
git push
```

如果您不确定该怎么做，可以请教维护者。

## 与主分支合并 {#merge-with-master}

验证 PR 是否可以合并到主分支。如果不能，它将以 `Cannot fetch mergecommit` 消息失败。要修复此检查，请按照 [GitHub 文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 中的说明解决冲突，或者使用 git 将 `master` 分支合并到您的拉取请求分支。

## 文档检查 {#docs-check}

尝试构建 ClickHouse 文档网站。如果您更改了文档中的某些内容，它可能会失败。最可能的原因是文档中的某个交叉链接错误。查看检查报告，寻找 `ERROR` 和 `WARNING` 消息。

## 描述检查 {#description-check}

检查您的拉取请求的描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)。您必须为您的更改指定一个变更日志类别（例如，Bug Fix），并为 [CHANGELOG.md](../whats-new/changelog/index.md) 编写用户可读的描述信息。

## 推送到 DockerHub {#push-to-dockerhub}

构建用于构建和测试的 docker 镜像，然后将其推送到 DockerHub。

## 标记检查 {#marker-check}

该检查意味着 CI 系统已经开始处理拉取请求。当它处于 'pending' 状态时，表示并非所有检查尚未开始。所有检查开始后，它的状态将更改为 'success'。

## 风格检查 {#style-check}

使用 [`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style) 二进制文件执行一些简单的基于正则表达式的代码风格检查（请注意，它可以在本地运行）。如果检查失败，请按照 [代码风格指南](style.md) 修复风格错误。

#### 在本地运行风格检查: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output

# 运行所有检查
python3 tests/ci/style_check.py --no-push


# 运行指定的检查脚本 (例如: ./check-mypy)
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy


# 查找目录下所有风格检查脚本:
cd ./utils/check-style


# 检查重复的包含
./check-duplicate-includes.sh


# 检查 C++ 格式
./check-style


# 使用 black 检查 Python 格式
./check-black


# 使用 mypy 检查 Python 类型提示
./check-mypy


# 使用 flake8 检查 Python
./check-flake8


# 使用 codespell 检查代码
./check-typos


# 检查文档拼写
./check-doc-aspell


# 检查空格
./check-whitespaces


# 检查 GitHub actions 工作流
./check-workflows


# 检查子模块
./check-submodules


# 使用 shellcheck 检查 Shell 脚本
./shellcheck-run.sh
```

## 快速测试 {#fast-test}

通常这是为 PR 运行的第一个检查。它构建 ClickHouse 并运行大部分 [无状态功能测试](tests.md#functional-tests)，省略一些测试。如果它失败，其他检查不会在修复之前开始。查看报告以了解哪些测试失败，然后按照 [此处](https://development/tests#running-a-test-locally) 的说明在本地重现故障。

#### 在本地运行快速测试: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse

# 此 docker 命令执行最小的 ClickHouse 构建并对其运行快速测试
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### 状态页面文件 {#status-page-files}

- `runlog.out.log` 是包括所有其他日志的通用日志。
- `test_log.txt`
- `submodule_log.txt` 包含关于克隆和检出所需子模块的消息。
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt` 包含关于 C/C++ 和 Linux 标志检查的消息。

#### 状态页面列 {#status-page-columns}

- *测试名称* 包含测试的名称（不带路径，例如，所有类型的测试都将被简化为名称）。
- *测试状态* -- 其中之一 _Skipped_, _Success_, 或 _Fail_。
- *测试时间，秒* -- 本测试上为空。

## 构建检查 {#build-check}

在各种配置中构建 ClickHouse 以供进一步步骤使用。您必须修复失败的构建。构建日志通常包含足够的信息来修复错误，但您可能需要在本地重现故障。可以在构建日志中找到 `cmake` 选项，使用 grep 搜索 `cmake`。使用这些选项并按照 [一般构建过程](../development/build.md)。

### 报告详情 {#report-details}

- **编译器**: `clang-19`，可选择带有目标平台名称
- **构建类型**: `Debug` 或 `RelWithDebInfo` (cmake)。
- **检验器**: `none`（没有检验器）、`address`（ASan）、`memory`（MSan）、`undefined`（UBSan）或 `thread`（TSan）。
- **状态**: `success` 或 `fail`
- **构建日志**: 链接到构建和文件复制日志，在构建失败时有用。
- **构建时间**。
- **构件**: 构建结果文件（`XXX` 表示服务器版本，例如 `20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: 主要构建二进制文件。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: 包含 ClickHouse 单元测试的 GoogleTest 二进制文件。
  - `performance.tar.zst`: 用于性能测试的特殊包。

## 特殊构建检查 {#special-build-check}

使用 `clang-tidy` 进行静态分析和代码风格检查。报告类似于 [构建检查](#build-check)。修复构建日志中发现的错误。

#### 在本地运行 clang-tidy: {#running-clang-tidy-locally}

有一个便利的 `packager` 脚本在 docker 中运行 clang-tidy 构建
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## 无状态功能测试 {#functional-stateless-tests}

运行 ClickHouse 二进制文件的 [无状态功能测试](tests.md#functional-tests)，这些二进制文件在各种配置下构建 -- release、debug、带检验器等。查看报告以了解哪些测试失败，然后按照 [此处](https://development/tests#functional-tests) 的说明在本地重现故障。请注意，您必须使用正确的构建配置进行重现 -- 测试可能在 AddressSanitizer 下失败，但在 Debug 下通过。可以从 [CI 构建检查页面](https://install#install-a-ci-generated-binary) 下载二进制文件，或在本地构建。

## 有状态功能测试 {#functional-stateful-tests}

运行 [有状态功能测试](tests.md#functional-tests)。与无状态功能测试以相同方式处理。不同之处在于它们需要来自 [clickstream 数据集](../getting-started/example-datasets/metrica.md) 的 `hits` 和 `visits` 表才能运行。

## 集成测试 {#integration-tests}

运行 [集成测试](tests.md#integration-tests)。

## Bugfix 验证检查 {#bugfix-validate-check}

检查是否有新的测试（功能或集成）或者有一些已更改的测试在当前主分支构建的二进制上失败。当拉取请求带有 "pr-bugfix" 标签时，此检查会触发。

## 压力测试 {#stress-test}

从多个客户端并发运行无状态功能测试，以检测与并发相关的错误。如果测试失败：

* 首先修复所有其他测试失败；
* 查看报告寻找服务器日志，并检查它们以找到可能的错误原因。

## 兼容性检查 {#compatibility-check}

检查 `clickhouse` 二进制是否在旧的 libc 版本的发行版上运行。如果失败，请询问维护者以获得帮助。

## AST Fuzzer {#ast-fuzzer}

运行随机生成的查询以捕获程序错误。如果失败，请询问维护者以获得帮助。

## 性能测试 {#performance-tests}

测量查询性能的变化。这是耗时最长的检查，大约需要 6 个小时运行。性能测试报告的详细信息在 [这里](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
