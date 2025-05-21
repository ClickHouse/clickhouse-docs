---
'description': 'ClickHouse连续集成系统概述'
'sidebar_label': '持续集成 (CI)'
'sidebar_position': 55
'slug': '/development/continuous-integration'
'title': '持续集成 (CI)'
---




# 持续集成 (CI)

当您提交拉取请求时，ClickHouse [持续集成 (CI) 系统](tests.md#test-automation) 将对您的代码运行一些自动化检查。  
在 ClickHouse 团队的某个维护者审核了您的代码并在您的拉取请求中添加了 `can be tested` 标签后，这个过程会开始。  
检查结果在 GitHub 拉取请求页面上列出，如 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks) 中所述。  
如果某个检查失败，您可能需要修复它。  
本页面提供了您可能遇到的检查的概述，以及您可以做什么来修复它们。

如果看起来检查失败与您的更改无关，则可能是某种临时故障或基础设施问题。  
向拉取请求推送一个空的提交以重新启动 CI 检查：

```shell
git reset
git commit --allow-empty
git push
```

如果您不确定该做什么，请向维护者寻求帮助。

## 与主分支合并 {#merge-with-master}

验证 PR 是否可以合并到主分支。  
如果不能，它将失败并显示消息 `Cannot fetch mergecommit`。  
要修复此检查，请根据 [GitHub 文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 解决冲突，或使用 git 将 `master` 分支合并到您的拉取请求分支。

## 文档检查 {#docs-check}

尝试构建 ClickHouse 文档网站。  
如果您更改了文档中的内容，可能会失败。  
最可能的原因是文档中的某些交叉链接错误。  
查看检查报告，寻找 `ERROR` 和 `WARNING` 消息。

## 描述检查 {#description-check}

检查您的拉取请求的描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)。  
您必须为您的更改指定一个变更日志类别（例如，错误修复），并编写一条用户可读的信息以描述 [CHANGELOG.md](../whats-new/changelog/index.md) 中的更改。

## 推送到 DockerHub {#push-to-dockerhub}

构建用于构建和测试的 docker 镜像，然后推送到 DockerHub。

## 标记检查 {#marker-check}

此检查意味着 CI 系统已开始处理拉取请求。  
当其状态为 'pending' 时，表示尚未启动所有检查。  
在所有检查启动后，它会将状态更改为 'success'。

## 风格检查 {#style-check}

对代码库执行各种风格检查。

风格检查作业中的基本检查：

##### cpp {#cpp}
使用 [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 脚本（也可以在本地运行）执行基于简单正则表达式的代码风格检查。  
如果失败，请根据 [代码风格指南](style.md) 修复风格问题。

##### codespell, aspell {#codespell}
检查语法错误和拼写错误。

##### mypy {#mypy}
对 Python 代码执行静态类型检查。

### 本地运行风格检查作业 {#running-style-check-locally}

整个 _风格检查_ 作业可以在 Docker 容器中通过以下命令本地运行：

```sh
python -m ci.praktika run "Style check"
```

要运行特定检查（例如，_cpp_ 检查）：
```sh
python -m ci.praktika run "Style check" --test cpp
```

这些命令拉取 `clickhouse/style-test` Docker 镜像并在容器化环境中运行作业。  
除了 Python 3 和 Docker 外，没有其他依赖项。

## 快速测试 {#fast-test}

通常，这是为 PR 运行的第一个检查。  
它构建 ClickHouse 并运行大多数 [无状态功能测试](tests.md#functional-tests)，但省略了一些。  
如果失败，其他检查将不会启动，直到修复为止。  
查看报告以查看哪些测试失败，然后按照 [这里](development/tests#running-a-test-locally) 所述在本地重现失败。

#### 本地运行快速测试: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

这些命令拉取 `clickhouse/fast-test` Docker 镜像并在容器化环境中运行作业。  
除了 Python 3 和 Docker 外，没有其他依赖项。

## 构建检查 {#build-check}

在各种配置下构建 ClickHouse，以便在后续步骤中使用。  
您必须修复失败的构建。  
构建日志通常提供足够的信息来修复错误，但您可能需要在本地重现失败。  
可以在构建日志中找到 `cmake` 选项，grep 查找 `cmake`。  
使用这些选项并遵循 [通用构建过程](../development/build.md)。

### 报告详情 {#report-details}

- **编译器**: `clang-19`，可选地包含目标平台的名称
- **构建类型**: `Debug` 或 `RelWithDebInfo` (cmake)。
- **清理程序**: `none` (没有清理程序)，`address` (ASan)，`memory` (MSan)，`undefined` (UBSan)，或 `thread` (TSan)。
- **状态**: `success` 或 `fail`
- **构建日志**: 建立和文件复制日志的链接，构建失败时有用。
- **构建时间**。
- **工件**: 构建结果文件（`XXX` 是服务器版本，例如 `20.8.1.4344`）。
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: 主要构建二进制文件。
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: GoogleTest 二进制文件，带有 ClickHouse 单元测试。
  - `performance.tar.zst`: 性能测试的特制包。

## 特殊构建检查 {#special-build-check}
执行静态分析和代码风格检查，使用 `clang-tidy`。报告与 [构建检查](#build-check) 类似。请在构建日志中修复发现的错误。

#### 本地运行 clang-tidy: {#running-clang-tidy-locally}

有一个便利的 `packager` 脚本，可以在 docker 中运行 clang-tidy 构建：
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## 无状态功能测试 {#functional-stateless-tests}
为在各种配置下构建的 ClickHouse 二进制文件运行 [无状态功能测试](tests.md#functional-tests) -- 发布版、调试版、带清理程序等。  
查看报告以查看哪些测试失败，然后按照 [这里](development/tests#functional-tests) 的描述在本地重现失败。  
请注意，您必须使用正确的构建配置进行重现 -- 测试可能在 AddressSanitizer 下失败，但在调试版本中通过。  
从 [CI 构建检查页面](/install/advanced) 下载二进制文件，或在本地构建。

## 有状态功能测试 {#functional-stateful-tests}

运行 [有状态功能测试](tests.md#functional-tests)。  
以与无状态功能测试相同的方式对待它们。  
不同之处在于，它们需要 [clickstream 数据集](../getting-started/example-datasets/metrica.md) 中的 `hits` 和 `visits` 表才能运行。

## 集成测试 {#integration-tests}
运行 [集成测试](tests.md#integration-tests)。

## 修复验证检查 {#bugfix-validate-check}

检查是否有新的测试（功能或集成）或一些更改的测试在构建于主分支的二进制文件上失败。  
当拉取请求有 "pr-bugfix" 标签时，会触发此检查。

## 压力测试 {#stress-test}
同时从多个客户端运行无状态功能测试，以检测与并发相关的错误。如果失败：

* 首先修复所有其他测试失败；
* 查看报告以查找服务器日志并检查可能导致错误的原因。

## 兼容性检查 {#compatibility-check}

检查 `clickhouse` 二进制文件是否在具有旧 libc 版本的发行版上运行。  
如果失败，请向维护者寻求帮助。

## AST 模糊测试 {#ast-fuzzer}
运行随机生成的查询以捕获程序错误。  
如果失败，请向维护者寻求帮助。

## 性能测试 {#performance-tests}
测量查询性能的变化。  
这是运行时较长的检查，耗时接近 6 小时。  
性能测试报告的详细描述见 [此处](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
