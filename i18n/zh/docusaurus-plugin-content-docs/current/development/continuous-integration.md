---
'description': 'ClickHouse 持续集成系统概述'
'sidebar_label': '持续集成 (CI)'
'sidebar_position': 55
'slug': '/development/continuous-integration'
'title': '持续集成 (CI)'
'doc_type': 'reference'
---


# 持续集成（CI）

当您提交拉取请求时，ClickHouse [持续集成（CI）系统](tests.md#test-automation) 会对您的代码运行一些自动检查。这发生在存储库维护者（来自 ClickHouse 团队的某人）筛选您的代码并将 `can be tested` 标签添加到您的拉取请求后。检查结果会在 GitHub 拉取请求页面上列出，如 [GitHub 检查文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks) 中所述。如果某个检查失败，您可能需要修复它。此页面提供您可能遇到的检查概述，以及您可以采取的修复措施。

如果看起来检查失败与您的更改无关，可能是某种瞬时故障或基础设施问题。向拉取请求推送一个空提交以重新启动 CI 检查：

```shell
git reset
git commit --allow-empty
git push
```

如果您不确定该怎么做，可以询问维护者寻求帮助。

## 与主干合并 {#merge-with-master}

验证 PR 是否可以合并到主干。如果不能，它将显示 `Cannot fetch mergecommit` 的消息。要修复此检查，请按照 [GitHub 文档](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) 中的说明解决冲突，或使用 git 将 `master` 分支合并到您的拉取请求分支。

## 文档检查 {#docs-check}

尝试构建 ClickHouse 文档网站。如果您更改了文档中的某些内容，可能会失败。最可能的原因是文档中的某些交叉链接错误。前往检查报告，查看 `ERROR` 和 `WARNING` 消息。

## 描述检查 {#description-check}

检查您的拉取请求的描述是否符合模板 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)。您必须为您的更改指定一个变更日志类别（例如，Bug 修复），并为 [CHANGELOG.md](../whats-new/changelog/index.md) 编写可读性强的描述消息。

## 推送到 DockerHub {#push-to-dockerhub}

构建用于构建和测试的 Docker 镜像，然后将其推送到 DockerHub。

## 标记检查 {#marker-check}

此检查表示 CI 系统已开始处理拉取请求。当它处于“待处理”状态时，表示尚未开始所有检查。在所有检查开始后，状态将更改为“成功”。

## 格式检查 {#style-check}

对代码库执行各种格式检查。

格式检查作业中的基本检查：

##### cpp {#cpp}
使用 [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 脚本（也可以在本地运行）执行简单的基于正则表达式的代码风格检查。如果失败，请根据 [代码风格指南](style.md) 修复格式问题。

##### codespell, aspell {#codespell}
检查语法错误和拼写错误。

##### mypy {#mypy}
对 Python 代码执行静态类型检查。

### 在本地运行格式检查作业 {#running-style-check-locally}

整个 _Style Check_ 作业可以在 Docker 容器中本地运行，命令为：

```sh
python -m ci.praktika run "Style check"
```

要运行特定检查（例如，_cpp_ 检查）：  
```sh
python -m ci.praktika run "Style check" --test cpp
```

这些命令拉取 `clickhouse/style-test` Docker 镜像，并在容器化环境中运行该作业。除了 Python 3 和 Docker 以外，不需要其他依赖项。

## 快速测试 {#fast-test}

通常，这是为 PR 运行的第一个检查。它构建 ClickHouse 并运行大部分 [无状态功能测试](tests.md#functional-tests)，省略一些。如果失败，则在修复之前不会启动进一步的检查。查看报告以了解哪些测试失败，然后根据 [这里](../development/tests#running-a-test-locally) 的说明在本地重现故障。

#### 在本地运行快速测试： {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

这些命令拉取 `clickhouse/fast-test` Docker 镜像，并在容器化环境中运行该作业。除了 Python 3 和 Docker 以外，不需要其他依赖项。

## 构建检查 {#build-check}

在各种配置中构建 ClickHouse，以用于后续步骤。

### 在本地运行构建 {#running-builds-locally}

构建可以在 CI 类似环境中本地运行，命令为：

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

除了 Python 3 和 Docker 以外，不需要其他依赖项。

#### 可用构建作业 {#available-build-jobs}

构建作业名称与 CI 报告中显示的名称完全相同：

**AMD64 构建：**
- `Build (amd_debug)` - 带符号的调试构建
- `Build (amd_release)` - 优化的发布构建
- `Build (amd_asan)` - 地址检测工具构建
- `Build (amd_tsan)` - 线程检测工具构建
- `Build (amd_msan)` - 内存检测工具构建
- `Build (amd_ubsan)` - 未定义行为检测工具构建
- `Build (amd_binary)` - 不带 Thin LTO 的快速发布构建
- `Build (amd_compat)` - 旧系统的兼容构建
- `Build (amd_musl)` - 采用 musl libc 的构建
- `Build (amd_darwin)` - macOS 构建
- `Build (amd_freebsd)` - FreeBSD 构建

**ARM64 构建：**
- `Build (arm_release)` - ARM64 优化发布构建
- `Build (arm_asan)` - ARM64 地址检测工具构建
- `Build (arm_coverage)` - 带覆盖工具的 ARM64 构建
- `Build (arm_binary)` - 不带 Thin LTO 的 ARM64 快速发布构建
- `Build (arm_darwin)` - macOS ARM64 构建
- `Build (arm_v80compat)` - ARMv8.0 兼容构建

**其他架构：**
- `Build (ppc64le)` - PowerPC 64位小端
- `Build (riscv64)` - RISC-V 64位
- `Build (s390x)` - IBM System/390 64位
- `Build (loongarch64)` - LoongArch 64位

如果作业成功，构建结果将保存在 `<repo_root>/ci/tmp/build` 目录中。

**注意：** 对于不在“其他架构”类别中的构建（使用交叉编译），您的本地机器架构必须与所请求的 `BUILD_JOB_NAME` 构建类型匹配，以生成所请求的构建。

#### 示例 {#example-run-local}

要运行本地调试构建：

```bash
python -m ci.praktika run "Build (amd_debug)"
```

如果上述方法对您无效，请使用构建日志中的 cmake 选项，并遵循 [一般构建过程](../development/build.md)。
## 无状态功能测试 {#functional-stateless-tests}

为在各种配置中构建的 ClickHouse 二进制文件运行 [无状态功能测试](tests.md#functional-tests) -- 发布、调试、带有检测工具等。查看报告以了解哪些测试失败，然后根据 [这里](../development/tests#functional-tests) 的说明在本地重现故障。请注意，您必须使用正确的构建配置进行重现 -- 一个测试可能在 AddressSanitizer 下失败，但在 Debug 下通过。请从 [CI 构建检查页面](/install/advanced) 下载二进制文件，或在本地构建它。

## 集成测试 {#integration-tests}

运行 [集成测试](tests.md#integration-tests)。

## Bug 修复验证检查 {#bugfix-validate-check}

检查是否有新的测试（功能或集成）或有一些更改过的测试在使用 master 分支构建的二进制文件时失败。此检查在拉取请求带有 "pr-bugfix" 标签时触发。

## 压力测试 {#stress-test}

从多个客户端并发运行无状态功能测试，以检测与并发相关的错误。如果失败：

    * 首先修复所有其他测试失败；
    * 查看报告以查找服务器日志并检查可能的错误原因。

## 兼容性检查 {#compatibility-check}

检查 `clickhouse` 二进制文件是否在旧 libc 版本的分发版上运行。如果失败，请询问维护者寻求帮助。

## AST 模糊测试 {#ast-fuzzer}

运行随机生成的查询以捕捉程序错误。如果失败，请询问维护者寻求帮助。

## 性能测试 {#performance-tests}

测量查询性能的变化。这是最长的检查，运行时间略少于 6 小时。性能测试报告的详细描述见 [这里](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)。
