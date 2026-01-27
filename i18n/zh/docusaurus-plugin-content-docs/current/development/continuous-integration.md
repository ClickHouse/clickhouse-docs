---
description: 'ClickHouse 持续集成系统概览'
sidebar_label: '持续集成（CI）'
sidebar_position: 55
slug: /development/continuous-integration
title: '持续集成（CI）'
doc_type: 'reference'
---

# 持续集成（CI） \{#continuous-integration-ci\}

当你提交一个 pull request 时，ClickHouse 的[持续集成（CI）系统](tests.md#test-automation)会对你的代码运行一些自动检查。
这会在代码仓库维护者（ClickHouse 团队成员）审查了你的代码并在 pull request 上添加 `can be tested` 标签之后进行。
检查结果会显示在 GitHub 的 pull request 页面上，如 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)所述。
如果某项检查失败，你可能需要修复它。
本页面概述了你可能遇到的检查类型，以及可以采取的修复措施。

如果看起来检查失败与你的更改无关，则可能是暂时性故障或基础设施问题。
向该 pull request 推送一个空提交以重新运行 CI 检查：

```shell
git reset
git commit --allow-empty
git push
```

如果你不确定该怎么做，请向维护人员寻求帮助。

## 与 master 合并 \{#merge-with-master\}

验证该 PR 是否可以合并到 master 分支。
如果无法合并，此检查会失败，并显示消息 `Cannot fetch mergecommit`。
要通过此检查，请按照 [GitHub 文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 中的说明解决冲突，或使用 git 将 `master` 分支合并到你的拉取请求分支。

## 文档检查 \{#docs-check\}

尝试构建 ClickHouse 文档网站。
如果你修改了文档中的某些内容，此步骤可能会失败。
最常见的原因是文档中的某个内部链接（交叉引用）有误。
前往检查报告中查找包含 `ERROR` 和 `WARNING` 的消息。

## 描述检查 \{#description-check\}

检查你的 Pull Request 描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) 的要求。
你必须为本次更改指定一个变更日志类别（例如：Bug Fix），并为 [CHANGELOG.md](../whats-new/changelog/index.md) 编写一条面向用户的变更说明。

## Docker image \{#docker-image\}

构建 ClickHouse server 和 keeper 的 Docker 镜像，以验证它们能够成功构建。

### Official docker library tests \{#official-docker-library-tests\}

运行来自 [official Docker library](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files) 的测试，以验证 `clickhouse/clickhouse-server` Docker 镜像工作正常。

要添加新的测试，请创建目录 `ci/jobs/scripts/docker_server/tests/$test_name`，并在其中添加脚本 `run.sh`。

有关这些测试的更多详细信息，请参阅 [CI jobs scripts documentation](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server)。

## 标记检查 \{#marker-check\}

此检查表示 CI 系统已开始处理该拉取请求（pull request）。
当其状态为 `pending` 时，表示尚未启动所有检查。
在所有检查都已启动后，其状态会变为 `success`。

## 样式检查 \{#style-check\}

对代码库执行各种样式检查。

*Style Check* 作业中包含的基础检查：

##### cpp \{#cpp\}

使用 [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 脚本执行基于正则表达式的简单代码样式检查（也可以在本地运行）。\
如果检查失败，请根据[代码样式指南](style.md)修复样式问题。

##### codespell, aspell \{#codespell\}

检查语法错误和拼写错误。

##### mypy \{#mypy\}

对 Python 代码执行静态类型检查。

### 在本地运行样式检查作业 \{#running-style-check-locally\}

可以在 Docker 容器中本地运行完整的 *Style Check* 作业，命令如下：

```sh
python -m ci.praktika run "Style check"
```

要执行特定检查（例如 *cpp* 检查）：

```sh
python -m ci.praktika run "Style check" --test cpp
```

这些命令会拉取 `clickhouse/style-test` Docker 镜像，并在容器化环境中运行该任务。
除 Python 3 和 Docker 外，无需其他任何依赖。

## 快速测试 \{#fast-test\}

通常这是在 PR 上运行的第一个检查。
它会构建 ClickHouse 并运行大部分[无状态功能测试](tests.md#functional-tests)，但会省略部分测试。
如果该步骤失败，在修复之前不会启动后续检查。
查看报告以确定哪些测试失败，然后按照[这里](/development/tests#running-a-test-locally)的说明在本地重现失败。

#### 在本地运行快速测试： \{#running-fast-test-locally\}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

这些命令会拉取 `clickhouse/fast-test` Docker 镜像，并在容器化环境中运行该作业。
只需 Python 3 和 Docker，无需其他依赖。

## 构建检查 \{#build-check\}

以多种配置构建 ClickHouse，以便在后续步骤中使用。

### 在本地运行构建 \{#running-builds-locally\}

可以在类似 CI 的本地环境中运行构建，使用：

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

除了 Python 3 和 Docker 外不需要其他依赖。

#### 可用构建任务 \{#available-build-jobs\}

构建任务名称与 CI 报告中的名称完全一致：

**AMD64 构建：**

* `Build (amd_debug)` - 带调试符号的调试构建
* `Build (amd_release)` - 优化的发布构建
* `Build (amd_asan)` - 使用 Address Sanitizer 的构建
* `Build (amd_tsan)` - 使用 Thread Sanitizer 的构建
* `Build (amd_msan)` - 使用 Memory Sanitizer 的构建
* `Build (amd_ubsan)` - 使用 Undefined Behavior Sanitizer 的构建
* `Build (amd_binary)` - 不带 Thin LTO 的快速发布构建
* `Build (amd_compat)` - 面向旧系统的兼容性构建
* `Build (amd_musl)` - 使用 musl libc 的构建
* `Build (amd_darwin)` - macOS 构建
* `Build (amd_freebsd)` - FreeBSD 构建

**ARM64 构建：**

* `Build (arm_release)` - ARM64 优化发布构建
* `Build (arm_asan)` - ARM64 Address Sanitizer 构建
* `Build (arm_coverage)` - 启用覆盖率插桩的 ARM64 构建
* `Build (arm_binary)` - 不带 Thin LTO 的 ARM64 快速发布构建
* `Build (arm_darwin)` - macOS ARM64 构建
* `Build (arm_v80compat)` - ARMv8.0 兼容性构建

**其他架构：**

* `Build (ppc64le)` - PowerPC 64 位小端
* `Build (riscv64)` - RISC-V 64 位
* `Build (s390x)` - IBM System/390 64 位
* `Build (loongarch64)` - LoongArch 64 位

如果任务成功，构建结果将会保存在 `<repo_root>/ci/tmp/build` 目录中。

**注意：** 对于不属于 “Other Architectures” 类别（该类别使用交叉编译）的构建，你本地机器的架构必须与构建类型一致，才能按照 `BUILD_JOB_NAME` 要求生成构建产物。

#### 示例 \{#example-run-local\}

要在本地运行调试构建：

```bash
python -m ci.praktika run "Build (amd_debug)"
```

如果上述方法不适用于你的情况，请从构建日志中获取 cmake 选项，并按照[通用构建流程](../development/build.md)进行操作。

## Functional stateless tests \{#functional-stateless-tests\}

针对在不同配置（release、debug、启用 sanitizer 等）下构建的 ClickHouse 二进制文件运行[无状态功能测试](tests.md#functional-tests)。
查看报告以了解哪些测试失败，然后按[此处](/development/tests#functional-tests)所述在本地重现这些失败。
请注意，为了成功重现，你必须使用正确的构建配置——某个测试可能在 AddressSanitizer 配置下失败，但在 Debug 配置下通过。
从 [CI 构建检查页面](/install/advanced)下载二进制文件，或在本地自行构建。

## 集成测试 \{#integration-tests\}

执行[集成测试](tests.md#integration-tests)。

## Bugfix validate check \{#bugfix-validate-check\}

检查是否添加了新的测试（功能测试或集成测试），或者是否存在在使用 master 分支构建的二进制文件时会失败的已修改测试。
当拉取请求带有 "pr-bugfix" 标签时，会触发此检查。

## 压力测试 \{#stress-test\}

从多个客户端并发运行无状态功能性测试，以检测与并发相关的错误。如果测试失败：

    * 先修复所有其他测试失败的问题；
    * 查看报告以找到服务器日志，并检查日志以排查可能的错误原因。

## 兼容性检查 \{#compatibility-check\}

检查 `clickhouse` 二进制文件能否在使用旧版 libc 的发行版上运行。
如果检查失败，请联系维护人员寻求帮助。

## AST fuzzer \{#ast-fuzzer\}

运行随机生成的查询以捕获程序错误。
如果运行失败，请联系项目维护者寻求帮助。

## 性能测试 \{#performance-tests\}

衡量查询性能的变化。
这是运行时间最长的检查，耗时略低于 6 小时。
性能测试报告的详细说明见[此处](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
