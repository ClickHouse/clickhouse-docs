---
description: 'ClickHouse 持续集成系统概述'
sidebar_label: '持续集成（CI）'
sidebar_position: 55
slug: /development/continuous-integration
title: '持续集成（CI）'
doc_type: 'reference'
---



# 持续集成（CI）

当你提交一个 pull request 时，ClickHouse 的[持续集成（CI）系统](tests.md#test-automation)会自动对你的代码执行一系列检查。
这一过程会在仓库维护者（ClickHouse 团队成员）审阅了你的代码，并在你的 pull request 上添加 `can be tested` 标签之后触发。
检查结果会列在 GitHub pull request 页面上，如 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)中所述。
如果某项检查失败，你可能需要进行修复。
本页概述了你可能会遇到的检查类型，以及你可以采取的修复措施。

如果看起来检查失败与你的更改无关，则可能是暂时性故障或基础设施问题。
向该 pull request 推送一个空提交以重新触发 CI 检查：

```shell
git reset
git commit --allow-empty
git push
```

如果你不确定该如何操作，请向项目维护者寻求帮助。


## 与 master 合并 {#merge-with-master}

验证 PR 是否可以合并到 master 分支。
如果无法合并,检查将失败并显示消息 `Cannot fetch mergecommit`。
要修复此问题,请按照 [GitHub 文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 中的说明解决冲突,或使用 git 将 `master` 分支合并到您的 pull request 分支。


## 文档检查 {#docs-check}

尝试构建 ClickHouse 文档网站。
如果您修改了文档中的内容,此检查可能会失败。
最可能的原因是文档中存在错误的交叉链接。
请查看检查报告,查找 `ERROR` 和 `WARNING` 消息。


## 描述检查 {#description-check}

检查您的拉取请求描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)。
您需要为您的更改指定一个变更日志类别(例如,Bug Fix),并编写一条用户可读的消息来描述该更改,以便记录到 [CHANGELOG.md](../whats-new/changelog/index.md) 中


## Docker 镜像 {#docker-image}

构建 ClickHouse 服务器和 Keeper 的 Docker 镜像，以验证其构建正确性。

### 官方 Docker 库测试 {#official-docker-library-tests}

运行来自[官方 Docker 库](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files)的测试，以验证 `clickhouse/clickhouse-server` Docker 镜像工作正常。

要添加新测试,请创建目录 `ci/jobs/scripts/docker_server/tests/$test_name` 并在其中创建脚本 `run.sh`。

有关测试的更多详细信息,请参阅 [CI 作业脚本文档](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server)。


## 标记检查 {#marker-check}

此检查表示 CI 系统已开始处理该拉取请求。
当其状态为 'pending' 时,表示尚未启动所有检查。
所有检查启动后,状态将变更为 'success'。


## 样式检查 {#style-check}

对代码库执行各种样式检查。

样式检查作业中的基本检查：

##### cpp {#cpp}

使用 [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 脚本执行基于正则表达式的简单代码样式检查（该脚本也可以在本地运行）。  
如果检查失败，请根据[代码样式指南](style.md)修复样式问题。

##### codespell, aspell {#codespell}

检查语法错误和拼写错误。

##### mypy {#mypy}

对 Python 代码执行静态类型检查。

### 在本地运行样式检查作业 {#running-style-check-locally}

可以使用以下命令在 Docker 容器中本地运行完整的 _样式检查_ 作业：

```sh
python -m ci.praktika run "Style check"
```

要运行特定的检查（例如 _cpp_ 检查）：

```sh
python -m ci.praktika run "Style check" --test cpp
```

这些命令会拉取 `clickhouse/style-test` Docker 镜像并在容器化环境中运行作业。
除了 Python 3 和 Docker 之外，不需要其他依赖项。


## 快速测试 {#fast-test}

通常这是 PR 运行的第一项检查。
它会构建 ClickHouse 并运行大部分[无状态功能测试](tests.md#functional-tests)，省略部分测试。
如果测试失败，在修复之前不会启动后续检查。
查看报告以了解哪些测试失败，然后按照[此处](/development/tests#running-a-test-locally)所述在本地重现失败情况。

#### 在本地运行快速测试：{#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

这些命令会拉取 `clickhouse/fast-test` Docker 镜像并在容器化环境中运行作业。
除 Python 3 和 Docker 外，无需其他依赖项。


## 构建检查 {#build-check}

在各种配置下构建 ClickHouse,供后续步骤使用。

### 本地运行构建 {#running-builds-locally}

可以使用以下命令在类似 CI 的环境中本地运行构建:

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

除了 Python 3 和 Docker 之外,无需其他依赖项。

#### 可用的构建任务 {#available-build-jobs}

构建任务名称与它们在 CI 报告中显示的完全一致:

**AMD64 构建:**

- `Build (amd_debug)` - 带符号的调试构建
- `Build (amd_release)` - 优化的发布构建
- `Build (amd_asan)` - Address Sanitizer 构建
- `Build (amd_tsan)` - Thread Sanitizer 构建
- `Build (amd_msan)` - Memory Sanitizer 构建
- `Build (amd_ubsan)` - Undefined Behavior Sanitizer 构建
- `Build (amd_binary)` - 不带 Thin LTO 的快速发布构建
- `Build (amd_compat)` - 用于旧系统的兼容性构建
- `Build (amd_musl)` - 使用 musl libc 的构建
- `Build (amd_darwin)` - macOS 构建
- `Build (amd_freebsd)` - FreeBSD 构建

**ARM64 构建:**

- `Build (arm_release)` - ARM64 优化的发布构建
- `Build (arm_asan)` - ARM64 Address Sanitizer 构建
- `Build (arm_coverage)` - 带覆盖率检测的 ARM64 构建
- `Build (arm_binary)` - 不带 Thin LTO 的 ARM64 快速发布构建
- `Build (arm_darwin)` - macOS ARM64 构建
- `Build (arm_v80compat)` - ARMv8.0 兼容性构建

**其他架构:**

- `Build (ppc64le)` - PowerPC 64 位小端序
- `Build (riscv64)` - RISC-V 64 位
- `Build (s390x)` - IBM System/390 64 位
- `Build (loongarch64)` - LoongArch 64 位

如果任务成功,构建结果将在 `<repo_root>/ci/tmp/build` 目录中可用。

**注意:** 对于不在"其他架构"类别中的构建(这些构建使用交叉编译),您的本地机器架构必须与构建类型匹配,才能按照 `BUILD_JOB_NAME` 的要求生成构建。

#### 示例 {#example-run-local}

要运行本地调试构建:

```bash
python -m ci.praktika run "Build (amd_debug)"
```


如果上述方法不适用,请使用构建日志中的 cmake 选项,并按照[通用构建流程](../development/build.md)进行操作。

## 功能性无状态测试 {#functional-stateless-tests}

对以各种配置构建的 ClickHouse 二进制文件运行[无状态功能测试](tests.md#functional-tests)——包括 release、debug、带 sanitizer 等配置。
查看报告以确定哪些测试失败,然后按照[此处](/development/tests#functional-tests)的说明在本地重现失败情况。
注意,您必须使用正确的构建配置来重现问题——某个测试可能在 AddressSanitizer 下失败,但在 Debug 模式下通过。
从 [CI 构建检查页面](/install/advanced)下载二进制文件,或在本地构建。


## 集成测试 {#integration-tests}

运行[集成测试](tests.md#integration-tests)。


## 错误修复验证检查 {#bugfix-validate-check}

检查新测试(功能测试或集成测试)或已修改的测试在使用 master 分支构建的二进制文件运行时是否失败。

当拉取请求带有 "pr-bugfix" 标签时将触发此检查。


## 压力测试 {#stress-test}

从多个客户端并发运行无状态功能测试,以检测并发相关的错误。如果测试失败:

    * 首先修复所有其他测试失败的问题;
    * 查看报告以找到服务器日志,并检查其中可能导致错误的原因。


## 兼容性检查 {#compatibility-check}

检查 `clickhouse` 二进制文件能否在使用旧版本 libc 的发行版上运行。
如果失败,请向维护人员寻求帮助。


## AST 模糊测试器 {#ast-fuzzer}

通过运行随机生成的查询来捕获程序错误。
如果测试失败,请联系维护人员寻求帮助。


## 性能测试 {#performance-tests}

用于衡量查询性能的变化。
这是耗时最长的检查项,运行时间接近 6 小时。
性能测试报告的详细说明请参见[此处](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
