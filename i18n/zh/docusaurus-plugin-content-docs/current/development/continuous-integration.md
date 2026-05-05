---
description: 'ClickHouse 持续集成系统概览'
sidebar_label: '持续集成（CI）'
sidebar_position: 55
slug: /development/continuous-integration
title: '持续集成（CI）'
doc_type: 'reference'
---

# 持续集成 (CI) \{#continuous-integration-ci\}

当你提交一个拉取请求时，ClickHouse 的[持续集成 (CI) 系统](tests.md#test-automation)会对你的代码运行一些自动检查。
这会在代码仓库维护者（ClickHouse 团队成员）审查了你的代码并在你的拉取请求上添加 `can be tested` 标签之后进行。
检查结果会显示在 GitHub 的拉取请求页面上，如 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)所述。
如果某项检查失败，你可能需要修复它。
本页面概述了你可能遇到的检查，以及可以采取的修复措施。

如果看起来检查失败与你的更改无关，则可能是暂时性故障或基础设施问题。
向该拉取请求推送一个空提交以重新运行 CI 检查：

```shell
git commit --allow-empty
git push
```

如果你不确定该怎么做，请向维护者寻求帮助。

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


## Running stateless tests \{#running-stateless-tests\}

本地安装并使用默认设置的 ClickHouse 可能适用于某些特定测试用例，但无法正确运行所有测试查询。在 CI 中，每个作业都会安装特定的 ClickHouse 配置（例如 S3 存储、Parallel Replicas），手动复现这些配置可能会很繁琐。为避免这种情况，你可以在本地使用与 CI 相同的编排方式复现任意 CI 作业——无需手动配置。

#### 前置条件 \{#ci-prerequisites\}

* Python 3 (仅限标准库) 
* Docker

如有需要，请先在 Ubuntu 上安装 Docker，然后重新登录：

```sh
sudo apt-get update
sudo apt-get install docker.io
sudo usermod -aG docker "$USER"
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "ipv6": true,
  "ip6tables": true
}
EOF
sudo systemctl restart docker
```


#### 在本地运行 CI 作业 \{#run-ci-job-locally\}

从 CI 报告中任选一个作业，并在本地运行：

```bash
python -m ci.praktika run "<JOB_NAME>"
```

* 始终按 CI 报告中的原样准确引用作业名称 (其中可能包含空格和逗号) ，例如：`"Stateless tests (amd_debug, parallel)"`。这样会使用与 CI 中相同的 ClickHouse 配置，并运行相同的测试。
* 作业名称中的架构和构建类型 (例如 `amd_debug`) 是 CI 特有的标签。在本地运行时，它们不起作用——作业会使用你提供的二进制文件，以及你当前运行所在的架构。作业名称只决定 ClickHouse 配置和测试集 (除非通过 `--test` 覆盖) 。
* 在 CI 中，功能测试会拆分为多个批次，以更高效地利用资源。例如，`"Stateless tests (amd_debug, parallel)"` 和 `"Stateless tests (amd_debug, sequential)"` 合起来覆盖完整范围：可安全并行的测试会并发运行，其余测试则顺序运行。这种拆分通过在可能的情况下最大化并行度来缩短 CI 总耗时。要在本地复现完整的测试范围，请将这两个批次都运行一遍。
* 此外，还有一个 `"Fast test"` CI 作业，它会运行范围有限的功能测试，以验证 ClickHouse 的基本功能——它使用不包含全部可选模块的构建，也是发现回归问题的最快方式。你也可以用同样的方法在本地运行它。将你的 ClickHouse 二进制文件放到默认搜索路径之一 (`./ci/tmp/clickhouse`、`./build/programs/clickhouse` 或 `./clickhouse`) ——否则该作业会先尝试构建 ClickHouse：
  ```bash
  python -m ci.praktika run "Fast test"
  ```


#### 在 CI 作业中运行特定测试 \{#run-specific-tests-within-ci-job\}

使用 `--test` 时，该作业会准备与 CI 中使用的相同 ClickHouse 配置，但仅运行所选测试：

```bash
python -m ci.praktika run "Stateless tests (amd_debug, parallel)" \
  --test 00001_select1
```

* 你可以指定多个测试名称：
  ```bash
  python -m ci.praktika run "Stateless tests (amd_debug, parallel)" \
    --test 00001_select1 00002_log_and_exception_messages_formatting
  ```
* 提示：如果你对 ClickHouse 配置没有特殊要求，只需运行特定测试，请使用别名 `functional`，而不是完整的作业名称：
  ```bash
  python -m ci.praktika run functional --test 00001_select1
  ```


#### 其他自定义选项 \{#additional-customization-options\}

* `--path PATH` — ClickHouse 二进制文件的自定义路径。默认情况下，运行器会按以下顺序搜索：`./ci/tmp/clickhouse`、`./build/programs/clickhouse`、`./clickhouse`。
* `--count N` — 将每个测试重复运行 N 次。
* `--workers N` — 覆盖根据机器容量自动计算出的并行工作线程数。

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
性能测试报告的详细说明见[此处](https://github.com/ClickHouse/ClickHouse/blob/master/tests/performance/scripts/README.md#how-to-read-the-report)。