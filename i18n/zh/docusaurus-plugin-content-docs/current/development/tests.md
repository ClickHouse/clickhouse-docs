---
'description': '测试 ClickHouse 和运行测试套件的指南'
'sidebar_label': '测试'
'sidebar_position': 40
'slug': '/development/tests'
'title': '测试 ClickHouse'
---





# 测试 ClickHouse

## 功能测试 {#functional-tests}

功能测试是最简单和方便使用的测试方式。大多数 ClickHouse 特性可以通过功能测试来验证，并且在任何可以以这种方式测试的 ClickHouse 代码更改中都是强制使用的。

每个功能测试会向正在运行的 ClickHouse 服务器发送一个或多个查询，并将结果与参考结果进行比较。

测试位于 `queries` 目录中。该目录包含两个子目录：`stateless` 和 `stateful`。
- 无状态测试运行没有任何预加载测试数据的查询 - 它们通常在测试本身中动态创建小的合成数据集。
- 有状态测试需要从 ClickHouse 中加载的预加载测试数据，并且这些数据对公众可用。请参见 [有状态测试与持续集成](continuous-integration.md#functional-stateful-tests)。

每个测试可以是两种类型之一：`.sql` 和 `.sh`。
- `.sql` 测试是简单的 SQL 脚本，通过管道传输到 `clickhouse-client`。
- `.sh` 测试是独立运行的脚本。

一般来说，SQL 测试优于 `.sh` 测试。只有在你需要测试一些无法通过纯 SQL 测试的特性时，才使用 `.sh` 测试，例如将一些输入数据管道输入到 `clickhouse-client` 或测试 `clickhouse-local`。

:::note
测试 `DateTime` 和 `DateTime64` 数据类型时的一个常见错误是假设服务器使用特定的时区（例如 "UTC"）。实际上并非如此，CI 测试运行中的时区是故意随机的。最简单的解决方法是明确指定测试值的时区，例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 在本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器，监听默认端口（9000）。例如，要运行测试 `01428_hash_set_nan_key`，请切换到仓库文件夹并运行以下命令：

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果（`stderr` 和 `stdout`）会写入到文件 `01428_hash_set_nan_key.[stderr|stdout]` 中，这些文件位于测试自身旁边（对于 `queries/0_stateless/foo.sql`，输出将在 `queries/0_stateless/foo.stdout` 中）。

有关 `clickhouse-test` 的所有选项，请参见 `tests/clickhouse-test --help`。你可以运行所有测试或通过提供测试名称的过滤器运行一部分测试：`./clickhouse-test substring`。也可以选择并行运行测试或随机顺序运行。

### 添加新测试 {#adding-a-new-test}

要添加新测试，首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成相应的 `.reference` 文件。

测试仅应创建、删除、选择等数据库 `test` 中的表，该数据库会在事先自动创建。使用临时表是可以的。

要在本地设置与 CI 相同的环境，请安装测试配置（它们会使用 Zookeeper 的模拟实现并调整某些设置）。

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应该
- 最小化：仅创建最小所需的表、列和复杂性，
- 快速：不超过几秒钟（最好是亚秒级），
- 正确且具有确定性：只在待测特性不工作时失败，
- 隔离/无状态：不依赖于环境和时间
- 全面：覆盖边界情况，如零、空值、空集合、异常（负面测试，使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }`）进行此测试，
- 在测试结束时清理表（以防有剩余数据），
- 确保其他测试不测试相同内容（即优先进行 grep）。
:::

### 限制测试运行 {#restricting-test-runs}

测试可以具有零个或多个 _标签_，指定测试在 CI 中运行的上下文限制。

对于 `.sql` 测试，标签放在第一行作为 SQL 注释：

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

对于 `.sh` 测试，标签作为注释写在第二行：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

可用标签列表：

|标签名称 | 功能 | 示例用法 |
|---|---|---|
| `disabled`|  测试不会运行 ||
| `long` | 测试执行时间从 1 秒延长至 10 分钟 ||
| `deadlock` | 测试在循环中长时间运行 ||
| `race` | 同 `deadlock`。优先使用 `deadlock` ||
| `shard` | 服务器必须监听 `127.0.0.*` ||
| `distributed` | 同 `shard`。优先使用 `shard` ||
| `global` | 同 `shard`。优先使用 `shard` ||
| `zookeeper` | 测试需要 Zookeeper 或 ClickHouse Keeper 才能运行 | 测试使用 `ReplicatedMergeTree` |
| `replica` | 同 `zookeeper`。优先使用 `zookeeper` ||
| `no-fasttest`|  测试不会在 [快速测试](continuous-integration.md#fast-test) 下运行 | 测试使用的 `MySQL` 表引擎在快速测试中被禁用|
| `no-[asan, tsan, msan, ubsan]` | 禁用带 [sanitizers](#sanitizers) 的构建中的测试 | 测试在 QEMU 下运行，与 sanitizers 不兼容 |
| `no-replicated-database` |||
| `no-ordinary-database` |||
| `no-parallel` | 禁用与此测试并行运行其他测试 | 测试从 `system` 表读取，可能会破坏不变性|
| `no-parallel-replicas` |||
| `no-debug` |||
| `no-stress` |||
| `no-polymorphic-parts` |||
| `no-random-settings` |||
| `no-random-merge-tree-settings` |||
| `no-backward-compatibility-check` |||
| `no-cpu-x86_64` |||
| `no-cpu-aarch64` |||
| `no-cpu-ppc64le` |||
| `no-s3-storage` |||

除了上述设置外，你还可以使用来自 `system.build_options` 的 `USE_*` 标志来定义使用特定的 ClickHouse 功能。例如，如果你的测试使用了 MySQL 表，你应该添加标签 `use-mysql`。

### 指定随机设置的限制 {#specifying-limits-for-random-settings}

测试可以为在测试运行期间可能被随机化的设置指定最小和最大允许值。

对于 `.sh` 测试，限制作为注释编写在标签旁边的行或在未指定标签的情况下的第二行：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签作为 SQL 注释放在标签旁边的行或第一行：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果你需要只指定一个限制，可以为另一个使用 `None`。

### 选择测试名称 {#choosing-the-test-name}

测试名称以五位数字前缀开始，后跟描述性名称，例如 `00422_hash_function_constexpr.sql`。选择前缀时，请查找目录中已经存在的最大的前缀，并将其递增 1。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

此时，可能会添加其他具有相同数字前缀的测试，但这没关系，不会导致任何问题，之后也无需更改它。

### 检查必须发生的错误 {#checking-for-an-error-that-must-occur}

有时你想测试对于不正确查询是否会发生服务器错误。我们在 SQL 测试中支持这种形式的特殊注释：

```sql
select x; -- { serverError 49 }
```

此测试确保服务器返回错误代码为 49 的关于未知列 `x` 的错误。如果没有错误，或者错误不同，则测试将失败。如果你想确保在客户端出现错误，请使用 `clientError` 注释。

请勿检查错误信息的具体措辞，未来可能会更改，而测试也会无谓地失败。只检查错误代码。如果现有的错误代码对于你的需求不够精确，可以考虑添加新的错误代码。

### 测试分布式查询 {#testing-a-distributed-query}

如果你想在功能测试中使用分布式查询，可以使用 `remote` 表函数，地址为 `127.0.0.{1..2}`，让服务器查询自己；或者你可以使用服务器配置文件中定义的测试集群，例如 `test_shard_localhost`。请记得在测试名称中添加关键词 `shard` 或 `distributed`，以便在 CI 中在正确的配置下运行，其中服务器配置为支持分布式查询。

### 处理临时文件 {#working-with-temporary-files}

有时在 shell 测试中你可能需要动态创建一个文件来进行操作。请注意，一些 CI 检查是并行运行测试的，因此，如果你在脚本中创建或删除临时文件而没有使用唯一名称，这可能会导致某些 CI 检查，如 Flaky，出现失败。为避免这种情况，你应该使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME` 来给临时文件命名，确保它在运行的测试中是唯一的。这样可以确保在设置期间创建或在清理期间删除的文件仅由该测试使用，而不是其他并行运行的测试。

## 已知错误 {#known-bugs}

如果我们知道某些错误可以通过功能测试轻松重现，我们会将准备好的功能测试放在 `tests/queries/bugs` 目录中。这些测试将在修复错误后移至 `tests/queries/0_stateless`。

## 集成测试 {#integration-tests}

集成测试允许在集群配置中测试 ClickHouse，并测试 ClickHouse 与其他服务器（如 MySQL、Postgres、MongoDB）之间的交互。这些测试用于模拟网络分割、数据包丢失等情况。测试在 Docker 下运行，创建多个不同软件的容器。

有关如何运行这些测试，请参见 `tests/integration/README.md`。

请注意，ClickHouse 与第三方驱动程序的集成尚未得到测试。目前，我们也没有与 JDBC 和 ODBC 驱动程序的集成测试。

## 单元测试 {#unit-tests}

单元测试在你想要测试一个孤立的库或类，而不是整个 ClickHouse 时非常有用。你可以通过 `ENABLE_TESTS` CMake 选项启用或禁用测试的构建。单元测试（以及其他测试程序）位于代码的 `tests` 子目录中。要运行单元测试，请输入 `ninja test`。一些测试使用 `gtest`，但有些只是返回非零退出代码的程序。

如果代码已经由功能测试覆盖（且功能测试通常更简单），则不必进行单元测试。

你可以通过直接调用可执行文件来运行单独的 gtest 检查，例如：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## 性能测试 {#performance-tests}

性能测试允许在合成查询中测量和比较 ClickHouse 某个孤立部分的性能。性能测试位于 `tests/performance/` 中。每个测试由一个 `.xml` 文件表示，其中包含测试用例的描述。测试通过 `docker/test/performance-comparison` 工具运行。有关调用的信息，请参见自述文件。

每个测试在循环中运行一个或多个查询（可能与参数组合）。

如果你想在某种场景下提高 ClickHouse 的性能，并且如果在简单查询中可以观察到改进，则强烈建议编写性能测试。此外，在你添加或修改 SQL 函数时，推荐编写性能测试，这些函数相对独立且不太复杂。在测试过程中，总是值得使用 `perf top` 或其他 `perf` 工具。

## 测试工具和脚本 {#test-tools-and-scripts}

`tests` 目录中的一些程序不是准备好的测试，而是测试工具。例如，对于 `Lexer` 有一个工具 `src/Parsers/tests/lexer`，它只是对标准输入进行标记化，并将彩色结果写入标准输出。你可以将这些工具作为代码示例使用，也可以用于探索和手动测试。

## 杂项测试 {#miscellaneous-tests}

在 `tests/external_models` 中有针对机器学习模型的测试。这些测试没有更新，必须转移到集成测试中。

还有一个单独的测试用于法定插入。该测试在单独的服务器上运行 ClickHouse 集群，并模拟各种故障情况：网络分裂、数据包丢失（在 ClickHouse 节点之间、ClickHouse 和 ZooKeeper 之间、ClickHouse 服务器和客户端之间等）、`kill -9`、`kill -STOP` 和 `kill -CONT`，如 [Jepsen](https://aphyr.com/tags/Jepsen)。然后测试检查所有已确认的插入已写入，并确保所有被拒绝的插入未被写入。

法定测试是由一个独立团队在 ClickHouse 开源之前编写的。该团队不再与 ClickHouse 合作。测试意外用 Java 编写。出于这些原因，法定测试必须重写并移至集成测试。

## 手动测试 {#manual-testing}

当你开发新特性时，手动测试也是合理的。你可以按照以下步骤进行：

构建 ClickHouse。从终端运行 ClickHouse：切换目录到 `programs/clickhouse-server` 并运行 `./clickhouse-server`。它将默认使用当前目录中的配置文件（`config.xml`、`users.xml` 和 `config.d` 和 `users.d` 目录中的文件）。要连接到 ClickHouse 服务器，运行 `programs/clickhouse-client/clickhouse-client`。

请注意，所有 ClickHouse 工具（服务器、客户端等）只是指向名为 `clickhouse` 的单个二进制文件的符号链接。你可以在 `programs/clickhouse` 中找到这个二进制文件。所有工具也可以作为 `clickhouse tool` 而不是 `clickhouse-tool` 调用。

另外，你可以安装 ClickHouse 软件包：可以从 ClickHouse 仓库获取稳定版本，或从 ClickHouse 源代码根目录使用 `./release` 为自己构建软件包。然后用 `sudo clickhouse start` 启动服务器（或用 `stop` 停止服务器）。查看 `/etc/clickhouse-server/clickhouse-server.log` 中的日志。

当 ClickHouse 已经安装在你的系统上时，你可以构建一个新的 `clickhouse` 二进制文件并替换现有的二进制文件：

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

你也可以停止系统的 ClickHouse 服务器，使用相同的配置但日志记录到终端来运行自己的实例：

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例：

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统 ClickHouse 服务器已经在运行，并且你不想停止它，可以在 `config.xml`（或在 `config.d` 目录中的文件中重载它）中更改端口号，提供适当的数据路径并运行它。

`clickhouse` 二进制文件几乎没有依赖性，并且适用于广泛的 Linux 发行版。为了快速、简便地测试你在服务器上的更改，你可以简单地将新构建的 `clickhouse` 二进制文件 `scp` 到你的服务器上，然后像上面示例中那样运行它。

## 构建测试 {#build-tests}

构建测试允许检查在各种替代配置和某些外部系统上构建是否未损坏。这些测试也是自动化的。

示例：
- 为 Darwin x86_64 (macOS) 交叉编译
- 为 FreeBSD x86_64 交叉编译
- 为 Linux AArch64 交叉编译
- 使用来自系统包的库在 Ubuntu 上构建（不建议）
- 使用库的共享链接构建（不建议）

例如，使用系统包构建是一种不良实践，因为我们无法保证系统将具有哪些确切版本的包。但这确实是 Debian 维护者所需的。因此，我们至少必须支持这种构建变体。另一个示例：共享链接是常见的问题来源，但某些爱好者需要它。

尽管我们无法在所有构建变体上运行所有测试，但我们希望至少检查各种构建变体未损坏。为此，我们使用构建测试。 

我们还测试没有单元过长导致编译失败或需要过多 RAM 的情况。

我们还测试没有过大的栈帧。

## 测试协议兼容性 {#testing-for-protocol-compatibility}

当我们扩展 ClickHouse 网络协议时，我们手动测试旧的 clickhouse-client 是否可以与新的 clickhouse-server 一起工作，以及新的 clickhouse-client 是否可以与旧的 clickhouse-server 一起工作（仅通过运行对应软件包中的二进制文件）。

我们还通过集成测试自动测试某些情况：
- 由旧版本 ClickHouse 写入的数据能否成功被新版本读取；
- 在不同 ClickHouse 版本的集群中，分布式查询是否可以工作。

## 来自编译器的帮助 {#help-from-the-compiler}

主要的 ClickHouse 代码（位于 `src` 目录中）使用 `-Wall -Wextra -Werror` 进行构建，并启用一些附加警告。尽管这些选项未在第三方库中启用。

Clang 还有更多有用的警告 - 你可以通过 `-Weverything` 寻找它们，并选择一些进行默认构建。

我们始终使用 clang 来构建 ClickHouse，既用于开发也用于生产。你可以在自己的计算机上以调试模式构建（以节省笔记本电脑的电量），但请注意，编译器能够通过 `-O3` 生成更多警告，因为它对控制流和过程间分析有更好的控制。当在调试模式下使用 clang 构建时，会使用调试版本的 `libc++`，这可以在运行时捕获更多错误。

## Sanitizers {#sanitizers}

:::note
如果在本地运行时过程（ClickHouse 服务器或客户端）启动时崩溃，则可能需要禁用地址空间布局随机化： `sudo sysctl kernel.randomize_va_space=0`
:::

### 地址清理器 {#address-sanitizer}

我们在每次提交时使用 ASan 运行功能、集成、压力和单元测试。

### 线程清理器 {#thread-sanitizer}

我们在每次提交时使用 TSan 运行功能、集成、压力和单元测试。

### 内存清理器 {#memory-sanitizer}

我们在每次提交时使用 MSan 运行功能、集成、压力和单元测试。

### 未定义行为清理器 {#undefined-behaviour-sanitizer}

我们在每次提交时使用 UBSan 运行功能、集成、压力和单元测试。一些第三方库的代码未经过 UB 的清理。

### Valgrind (内存检查) {#valgrind-memcheck}

我们过去在 Valgrind 下过夜运行功能测试，但现在不再这样做。它需要几个小时。目前在 `re2` 库中已知一个假阳性，参见 [这篇文章](https://research.swtch.com/sparse)。

## 模糊测试 {#fuzzing}

ClickHouse 通过使用 [libFuzzer](https://llvm.org/docs/LibFuzzer.html) 和随机 SQL 查询实现模糊测试。所有模糊测试应在清理器（地址和未定义）下执行。

LibFuzzer 用于独立模糊测试库代码。模糊测试器作为测试代码的一部分实现，并具有 "_fuzzer" 后缀。模糊测试器示例可以在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 中找到。LibFuzzer 特定的配置、字典和语料库存储在 `tests/fuzz` 中。我们鼓励你为每个处理用户输入的功能编写模糊测试。

模糊测试器默认情况下不构建。要构建模糊测试器，必须设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。我们建议在构建模糊测试器时禁用 Jemalloc。集成 ClickHouse 的模糊测试到 Google OSS-Fuzz 的配置可以在 `docker/fuzz` 中找到。

我们还使用简单的模糊测试生成随机 SQL 查询，并检查服务器在执行它们时不会崩溃。你可以在 `00746_sql_fuzzy.pl` 中找到该测试。此测试应持续运行（过夜及更长时间）。

我们还使用复杂的基于 AST 的查询模糊测试器，能够找到大量边界情况。它在查询 AST 中执行随机排列和替换。它记住之前测试的 AST 节点，以便在随机顺序处理后续测试时用于模糊测试。你可以在 [这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house) 中了解更多关于这个模糊测试器的信息。

## 压力测试 {#stress-test}

压力测试是另一种模糊测试。它以随机顺序并行运行所有功能测试，使用单个服务器。测试结果不会被检查。

会检查：
- 服务器是否未崩溃，没有触发调试或清理器陷阱；
- 是否没有死锁；
- 数据库结构是否一致；
- 服务器是否在测试后能够成功停止并无异常地重新启动。

有五种变体（Debug、ASan、TSan、MSan、UBSan）。

## 线程模糊测试器 {#thread-fuzzer}

线程模糊测试器（请不要与线程清理器混淆）是一种模糊测试，允许随机化线程的执行顺序。它帮助查找更多特殊情况。

## 安全审计 {#security-audit}

我们的安全团队对 ClickHouse 能力进行了从安全角度的基本概述。

## 静态分析器 {#static-analyzers}

我们在每次提交时运行 `clang-tidy`。`clang-static-analyzer` 检查也已启用。`clang-tidy` 还用于一些风格检查。

我们评估了 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode` 和 `CodeQL`。你在 `tests/instructions/` 目录中会发现使用说明。

如果你使用 `CLion` 作为 IDE，可以直接使用一些 `clang-tidy` 检查。

我们还使用 `shellcheck` 对脚本进行静态分析。

## 加固 {#hardening}

在调试构建中，我们使用自定义分配器来进行用户级分配的 ASLR。

我们还手动保护在分配后应保持只读的内存区域。

在调试构建中，我们还会自定义 libc，确保不会调用任何“有害”（过时、不安全、不线程安全）函数。

调试断言被广泛使用。

在调试构建中，如果抛出包含“逻辑错误”代码（意味着有一个bug）的异常，程序会提前终止。这允许在发布构建中使用异常，但在调试构建中将其视为断言。

调试版本的 jemalloc 被用于调试构建中。调试版本的 libc++ 被用于调试构建中。

## 运行时完整性检查 {#runtime-integrity-checks}

存储在磁盘上的数据经过校验和。MergeTree 表中的数据以三种方式进行校验和检测（压缩数据块、未压缩数据块、块的总校验和）。通过网络在客户端和服务器之间或服务器之间传输的数据也经过校验和。复制确保副本上的数据比特完全相同。

保护硬件故障（存储介质上的比特腐烂、服务器 RAM 中的比特翻转、网络控制器 RAM 中的比特翻转、网络交换机 RAM 中的比特翻转、客户端 RAM 中的比特翻转、线上的比特翻转）是必要的。请注意，比特翻转是常见的，即使在有 ECC RAM 和 TCP 校验和的情况下也可能发生（如果你设法运行数千台每天处理 PB 数据的服务器）。 [观看视频（俄文）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供诊断帮助运维工程师查找故障硬件。

\*并且这并不缓慢。

## 代码风格 {#code-style}

代码风格规则在 [这里](style.md) 中进行了描述。

要检查一些常见的风格违规，可以使用 `utils/check-style` 脚本。

要强制你的代码遵循正确的风格，可以使用 `clang-format`。文件 `.clang-format` 位于源代码根目录。它大致符合我们实际的代码风格。但不建议将 `clang-format` 应用到现有文件，因为这会使格式变得更糟。你可以使用在 clang 源代码库中找到的 `clang-format-diff` 工具。

或者，你可以尝试使用 `uncrustify` 工具来重新格式化你的代码。配置位于源代码根目录的 `uncrustify.cfg` 中。它经过的测试少于 `clang-format`。

`CLion` 有自己的代码格式化程序，必须根据我们的代码风格进行调整。

我们还使用 `codespell` 来查找代码中的拼写错误。这也是自动化的。

## 测试覆盖率 {#test-coverage}

我们还跟踪测试覆盖率，但仅限于功能测试，并且仅限于 clickhouse-server。该操作每天执行一次。

## 测试的测试 {#tests-for-tests}

有对间歇性测试的自动检查。它运行所有新测试 100 次（对于功能测试）或 10 次（对于集成测试）。如果测试在至少一次失败，则被认为是间歇性测试。

## 测试自动化 {#test-automation}

我们使用 [GitHub Actions](https://github.com/features/actions) 运行测试。

构建作业和测试在每次提交时在沙箱中运行。生成的包和测试结果会发布在 GitHub 上，并可通过直接链接下载。工件储存数月。 当你在 GitHub 上发送拉取请求时，我们将其标记为“可以测试”，我们的 CI 系统会为你构建 ClickHouse 包（发布版、调试版、带地址清理器等）。
