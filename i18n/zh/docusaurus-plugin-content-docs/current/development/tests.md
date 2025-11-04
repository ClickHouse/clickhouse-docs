---
'description': '关于测试 ClickHouse 和运行测试套件的指南'
'sidebar_label': '测试'
'sidebar_position': 40
'slug': '/development/tests'
'title': '测试 ClickHouse'
'doc_type': 'guide'
---


# 测试 ClickHouse

## 功能测试 {#functional-tests}

功能测试是最简单且使用方便的测试方式。大部分 ClickHouse 功能都可以通过功能测试进行验证，并且对于任何可以通过这种方式测试的 ClickHouse 代码更改，功能测试是强制要求的。

每个功能测试会向运行中的 ClickHouse 服务器发送一个或多个查询，并将结果与参考结果进行比较。

测试位于 `./tests/queries` 目录下。

每个测试可以是两种类型之一：`.sql` 和 `.sh`。
- `.sql` 测试是一个简单的 SQL 脚本，通过 `clickhouse-client` 进行处理。
- `.sh` 测试是一个独立运行的脚本。

通常情况下，SQL 测试优先于 `.sh` 测试。只有在必须测试一些无法通过纯 SQL 实现的功能时，才应使用 `.sh` 测试，比如将一些输入数据传递给 `clickhouse-client` 或测试 `clickhouse-local`。

:::note
在测试数据类型 `DateTime` 和 `DateTime64` 时，常见的错误是认为服务器使用特定的时区（例如 “UTC”）。实际上并非如此，CI 测试运行中的时区是故意随机化的。解决此问题的最简单方法是明确为测试值指定时区，例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器，监听默认端口（9000）。例如，要运行测试 `01428_hash_set_nan_key`，请切换到代码库文件夹并运行以下命令：

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果（`stderr` 和 `stdout`）将写入文件 `01428_hash_set_nan_key.[stderr|stdout]`，这些文件位于测试本身所在的同一目录（例如，对于 `queries/0_stateless/foo.sql`，输出将位于 `queries/0_stateless/foo.stdout`）。

请查看 `tests/clickhouse-test --help` 了解 `clickhouse-test` 的所有选项。您可以运行所有测试或通过提供测试名称过滤器来运行测试的子集：`./clickhouse-test substring`。此外，还可以选择以并行或随机顺序运行测试。

### 添加新测试 {#adding-a-new-test}

要添加新测试，首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成相应的 `.reference` 文件。

测试应该仅创建、删除、选择等数据库 `test` 中的表，该数据库会自动创建。可以使用临时表。

要在本地设置与 CI 相同的环境，安装测试配置（它们将使用 Zookeeper 模拟实现并调整一些设置）

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应该
- 最小化：仅创建最少需要的表、列和复杂性，
- 快速：不超过几秒（最好是毫秒级），
- 正确且确定性：仅在被测试的功能不工作时才失败，
- 隔离/无状态：不依赖于环境和时间
- 全面：覆盖边界案例，如零、空值、空集合、异常（负面测试，使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }`），
- 在测试结束时清理表（防止出现剩余部分），
- 确保其他测试不测试相同的内容（即先进行 grep）。
:::

### 限制测试运行 {#restricting-test-runs}

测试可以有零个或多个 _tags_，用于指定测试在 CI 中运行的限制上下文。

对于 `.sql` 测试，标签放在第一行作为 SQL 注释：

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

对于 `.sh` 测试，标签作为第二行的注释书写：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

可用标签列表：

| 标签名称 | 作用 | 使用示例 |
|---|---|---|
| `disabled`|  测试不运行 ||
| `long` | 测试的执行时间从 1 分钟延长到 10 分钟 ||
| `deadlock` | 测试在循环中长时间运行 ||
| `race` | 与 `deadlock` 相同。优先使用 `deadlock` ||
| `shard` | 服务器需要监听 `127.0.0.*` ||
| `distributed` | 与 `shard` 相同。优先使用 `shard` ||
| `global` | 与 `shard` 相同。优先使用 `shard` ||
| `zookeeper` | 测试需要 Zookeeper 或 ClickHouse Keeper 运行 | 测试使用 `ReplicatedMergeTree` |
| `replica` | 与 `zookeeper` 相同。优先使用 `zookeeper` ||
| `no-fasttest`|  测试在 [快速测试](continuous-integration.md#fast-test) 下不运行 | 测试使用禁用的 `MySQL` 表引擎 |
| `fasttest-only`|  测试仅在 [快速测试](continuous-integration.md#fast-test) 下运行 ||
| `no-[asan, tsan, msan, ubsan]` | 禁用在带有 [sanitizers](#sanitizers) 的构建中的测试 | 测试在不支持 sanitizers 的 QEMU 下运行 |
| `no-replicated-database` |||
| `no-ordinary-database` |||
| `no-parallel` | 禁止与此测试并行运行其他测试 | 测试从 `system` 表读取，可能破坏不变性 |
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

除了上述设置外，您可以使用 `system.build_options` 中的 `USE_*` 标志来定义特定 ClickHouse 功能的使用。例如，如果您的测试使用 MySQL 表，则应添加标签 `use-mysql`。

### 为随机设置指定限制 {#specifying-limits-for-random-settings}

测试可以为在测试运行期间可以随机化的设置指定最小和最大允许值。

对于 `.sh` 测试，限制作为注释写在标签旁边的行中，或者如果没有标签则写在第二行：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签放在标签旁边的 SQL 注释中，或者放在第一行：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果您只需要指定一个限制，可以使用 `None` 作为另一个限制。

### 选择测试名称 {#choosing-the-test-name}

测试的名称以五位数字前缀开头，后跟描述性名称，如 `00422_hash_function_constexpr.sql`。要选择前缀，请查找目录中已存在的最大前缀，然后加 1。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

同时，可能会有其他测试使用相同的数字前缀，但这没关系，并不会导致任何问题，您不必在以后的时间里更改它。

### 检查必须发生的错误 {#checking-for-an-error-that-must-occur}

有时您希望测试错误查询会导致服务器错误。我们在 SQL 测试中支持这种特殊注释，形式如下：

```sql
SELECT x; -- { serverError 49 }
```

此测试确保服务器返回代码为 49 的未知列 `x` 的错误。如果没有错误或错误不同，测试将失败。如果您想确保在客户端发生错误，请使用 `clientError` 注释。

不要检查错误消息的具体措辞，因为将来可能会更改，测试将徒然失败。仅检查错误代码。如果现有错误代码不够精确，可以考虑添加一个新代码。

### 测试分布式查询 {#testing-a-distributed-query}

如果您想在功能测试中使用分布式查询，可以利用 `remote` 表函数，使用 `127.0.0.{1..2}` 地址让服务器自查询；或者您可以在服务器配置文件中使用预定义的测试集群，如 `test_shard_localhost`。请记得在测试名称中添加 `shard` 或 `distributed` 字样，以便在 CI 中以正确的配置运行，其中服务器被配置为支持分布式查询。

### 处理临时文件 {#working-with-temporary-files}

有时在 shell 测试中，您可能需要动态创建一个文件进行处理。请注意，某些 CI 检查会并行运行测试，因此如果您在脚本中创建或删除临时文件而没有唯一名称，可能会导致某些 CI 检查（例如不稳定性检测）失败。为了解决此问题，您应该使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME` 为临时文件指定一个唯一的名称，以便运行的测试所创建或删除的文件是该测试专用的，并不是某个并行运行的其他测试所使用的。

## 已知错误 {#known-bugs}

如果我们知道一些可以通过功能测试轻松重现的错误，我们会将准备好的功能测试放在 `tests/queries/bugs` 目录下。这些测试将在错误修复后移至 `tests/queries/0_stateless`。

## 集成测试 {#integration-tests}

集成测试允许在集群配置中测试 ClickHouse 及其与 MySQL、Postgres、MongoDB 等其他服务器的互动。它们对于模拟网络故障、丢包等情况非常有用。这些测试在 Docker 下运行，并创建多个不同软件的容器。

请参见 `tests/integration/README.md` 了解如何运行这些测试。

请注意，ClickHouse 与第三方驱动程序的集成未经过测试。此外，我们目前没有与 JDBC 和 ODBC 驱动程序的集成测试。

## 单元测试 {#unit-tests}

单元测试在您希望测试单个独立库或类时很有用。您可以使用 `ENABLE_TESTS` CMake 选项启用或禁用测试的构建。单元测试（和其他测试程序）位于代码中的 `tests` 子目录。要运行单元测试，请输入 `ninja test`。一些测试使用 `gtest`，但有些只是返回测试失败时非零退出码的程序。

如果代码已经通过功能测试覆盖（而功能测试通常更易于使用），则没有必要进行单元测试。

您可以通过直接调用可执行文件来运行单独的 gtest 检查，例如：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## 性能测试 {#performance-tests}

性能测试可以测量和比较 ClickHouse 某个隔离部分在合成查询中的性能。性能测试位于 `tests/performance/`。每个测试由一个 `.xml` 文件表示，其中包含测试用例的描述。测试通过 `docker/test/performance-comparison` 工具运行。有关调用的更多信息，请参阅自述文件。

每个测试循环运行一个或多个查询（可能是参数组合）。

如果您想改善 ClickHouse 在某些场景下的性能，并且如果改进可以在简单查询中观察到，强烈建议编写性能测试。此外，当您添加或修改相对独立且不太晦涩的 SQL 函数时，也建议编写性能测试。在测试期间使用 `perf top` 或其他 `perf` 工具总是有意义的。

## 测试工具和脚本 {#test-tools-and-scripts}

在 `tests` 目录中的一些程序不是预备测试，而是测试工具。例如，对于 `Lexer`，有一个工具 `src/Parsers/tests/lexer`，仅对标准输入进行标记化，并将着色结果写入标准输出。您可以使用这些工具作为代码示例以及进行探索和手动测试。

## 杂项测试 {#miscellaneous-tests}

在 `tests/external_models` 中有机器学习模型的测试。这些测试不会被更新，必须迁移到集成测试中。

还有一个单独的测试用于法定插入。该测试在单独的服务器上运行 ClickHouse 集群，并模拟各种故障案例：网络拆分、丢包（在 ClickHouse 节点之间、ClickHouse 和 ZooKeeper 之间、ClickHouse 服务器和客户端之间等），`kill -9`、`kill -STOP` 和 `kill -CONT`，如 [Jepsen](https://aphyr.com/tags/Jepsen) 所示。然后测试检查所有已确认的插入是否已写入，所有被拒绝的插入是否未写入。

法定测试是由独立团队在 ClickHouse 开源之前编写的。这个团队不再与 ClickHouse 一起工作。该测试意外地采用 Java 编写。因此，法定测试必须重写并迁移到集成测试中。

## 手动测试 {#manual-testing}

当您开发新功能时，手动测试也是合理的。您可以通过以下步骤进行手动测试：

构建 ClickHouse。从终端运行 ClickHouse：将目录更改为 `programs/clickhouse-server`，并使用 `./clickhouse-server` 运行它。默认情况下，它将使用当前目录中的配置（`config.xml`、`users.xml` 和 `config.d` 和 `users.d` 目录中的文件）。要连接到 ClickHouse 服务器，请运行 `programs/clickhouse-client/clickhouse-client`。

请注意，所有 ClickHouse 工具（服务器、客户端等）都是指向名为 `clickhouse` 的单个二进制文件的符号链接。您可以在 `programs/clickhouse` 中找到该二进制文件。所有工具也可以以 `clickhouse tool` 的方式调用，而不是 `clickhouse-tool`。

或者，您可以安装 ClickHouse 包：从 ClickHouse 仓库安装稳定版本，或者您可以在 ClickHouse 源代码根目录中使用 `./release` 为自己构建包。然后使用 `sudo clickhouse start` 启动服务器（或使用 `stop` 停止服务器）。查看 `/etc/clickhouse-server/clickhouse-server.log` 中的日志。

当 ClickHouse 已经安装在您的系统上时，您可以构建一个新的 `clickhouse` 二进制文件并替换现有的二进制文件：

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

您还可以停止系统的 clickhouse-server，并使用相同的配置运行您自己的服务器，但将日志输出到终端：

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例：

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统的 clickhouse-server 已经在运行，并且您不想停止它，可以在 `config.xml` 中更改端口号（或在 `config.d` 目录中的文件中覆盖），提供适当的数据路径，然后运行它。

`clickhouse` 二进制文件几乎没有依赖关系，并且可以在广泛的 Linux 发行版上运行。要在服务器上快速测试您的更改，您可以简单地将新构建的 `clickhouse` 二进制文件通过 `scp` 传送到服务器，然后像上面的示例一样运行它。

## 构建测试 {#build-tests}

构建测试允许检查构建在各种替代配置和某些外部系统上是否未损坏。这些测试也是自动化的。

示例：
- 为 Darwin x86_64（macOS）进行交叉编译
- 为 FreeBSD x86_64 进行交叉编译
- 为 Linux AArch64 进行交叉编译
- 在包含来自系统包的库的 Ubuntu 上构建（不推荐）
- 使用共享链接构建库（不推荐）

例如，使用系统包进行构建是一种不良做法，因为我们无法保证系统将具有的确切版本的包。但这确实是 Debian 维护者需要的。出于这个原因，我们至少必须支持这种构建变体。另一个例子：共享链接是一个常见的麻烦来源，但某些爱好者需要它。

尽管我们不能在所有构建变体上运行所有测试，但我们至少想检查各种构建变体是否未损坏。为此，我们使用构建测试。

我们还测试没有翻译单元太长而无法编译或需要太多 RAM 的情况。

我们还测试没有过大的堆栈帧。

## 协议兼容性测试 {#testing-for-protocol-compatibility}

当我们扩展 ClickHouse 网络协议时，我们手动测试旧版 clickhouse-client 是否与新版 clickhouse-server 兼容，以及新版 clickhouse-client 是否与旧版 clickhouse-server 兼容（通过运行相应包中的二进制文件简单测试）。

我们还通过集成测试自动测试某些案例：
- 旧版本的 ClickHouse 写入的数据能否被新版本成功读取；
- 在具有不同 ClickHouse 版本的集群中，分布式查询是否有效。

## 来自编译器的帮助 {#help-from-the-compiler}

主要的 ClickHouse 代码（位于 `src` 目录中）通过 `-Wall -Wextra -Werror` 编译，并打开了一些额外的警告。尽管这些选项未对第三方库启用。

Clang 具有更有用的警告 - 您可以使用 `-Weverything` 查找并选择一些默认构建。

我们始终使用 clang 来构建 ClickHouse，无论是用于开发还是生产。您可以在自己的机器上使用调试模式进行构建（以节省笔记本电脑的电池），但请注意，编译器能够通过 `-O3` 生成更多警告，因为更好的控制流和过程间分析。使用调试模式构建时，使用调试版本的 `libc++`，这有助于在运行时捕获更多错误。

## Sanitizers {#sanitizers}

:::note
如果在本地运行时进程（ClickHouse 服务器或客户端）在启动时崩溃，您可能需要禁用地址空间布局随机化：`sudo sysctl kernel.randomize_va_space=0`
:::

### 地址清理程序 {#address-sanitizer}

我们在每个提交的基础上，在 ASan 下运行功能、集成、压力和单元测试。

### 线程清理程序 {#thread-sanitizer}

我们在每个提交的基础上，在 TSan 下运行功能、集成、压力和单元测试。

### 内存清理程序 {#memory-sanitizer}

我们在每个提交的基础上，在 MSan 下运行功能、集成、压力和单元测试。

### 未定义行为清理程序 {#undefined-behaviour-sanitizer}

我们在每个提交的基础上，在 UBSan 下运行功能、集成、压力和单元测试。一些第三方库的代码没有针对未定义行为进行清理。

### Valgrind（内存检测） {#valgrind-memcheck}

我们过去会在 Valgrind 下过夜运行功能测试，但现在不再这样做。这需要多个小时。目前在 `re2` 库中有一个已知的假阳性，请参阅 [这篇文章](https://research.swtch.com/sparse)。

## 模糊测试 {#fuzzing}

ClickHouse 的模糊测试是通过 [libFuzzer](https://llvm.org/docs/LibFuzzer.html) 和随机 SQL 查询实现的。所有模糊测试都应在带有清理程序（地址和未定义）的情况下进行。

LibFuzzer 用于隔离库代码的模糊测试。模糊程序作为测试代码的一部分实现并带有 "_fuzzer" 名称后缀。模糊测试示例可以在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 中找到。特定于 LibFuzzer 的配置、字典和语料库存储在 `tests/fuzz` 中。我们鼓励您为每个处理用户输入的功能编写模糊测试。

模糊测试程序默认不构建。要构建模糊测试程序，必须设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。我们建议在构建模糊测试程序时禁用 Jemalloc。集成 ClickHouse 模糊测试到 Google OSS-Fuzz 所使用的配置可以在 `docker/fuzz` 中找到。

我们还使用简单的模糊测试生成随机 SQL 查询，并检查服务器在执行这些查询时不会崩溃。您可以在 `00746_sql_fuzzy.pl` 中找到它。此测试应持续运行（过夜及更长时间）。

我们还使用复杂的基于 AST 的查询模糊测试器，能够找到大量边界案例。它在查询 AST中进行随机排列和替换。它将以前测试中的 AST 节点存储下来，以便在处理后续测试时用于模糊测试，同时以随机顺序处理它们。您可以在 [这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house) 中了解更多关于此模糊测试器的信息。

## 压力测试 {#stress-test}

压力测试是另一种模糊测试。它在单个服务器上以随机顺序并行运行所有功能测试。测试结果不会被检查。

已检查：
- 服务器不会崩溃，不会触发调试或清理程序陷阱；
- 没有死锁；
- 数据库结构是一致的；
- 服务器在测试后能够成功停止并重新启动而没有异常。

有五种变体（调试、ASan、TSan、MSan、UBSan）。

## 线程模糊测试器 {#thread-fuzzer}

线程模糊测试器（请不要与线程清理器混淆）是另一种模糊测试，允许随机化线程的执行顺序。这有助于找到更多特殊案例。

## 安全审计 {#security-audit}

我们的安全团队对 ClickHouse 功能进行了基本的安全审计。

## 静态分析器 {#static-analyzers}

我们在每个提交的基础上运行 `clang-tidy`。还启用了 `clang-static-analyzer` 检查。`clang-tidy` 还用于一些风格检查。

我们评估过 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL`。您可以在 `tests/instructions/` 目录中找到使用说明。

如果您使用 `CLion` 作为 IDE，您可以直接利用一些 `clang-tidy` 检查。

我们还使用 `shellcheck` 对 shell 脚本进行静态分析。

## 强化 {#hardening}

在调试构建中，我们使用自定义分配器，对用户级别的内存分配进行 ASLR。

我们还手动保护预期在分配后为只读的内存区域。

在调试构建中，我们还涉及 libc 的定制，以确保不调用“有害”的（过时、不安全、不线程安全的）函数。

在调试构建中大量使用调试断言。

在调试构建中，如果抛出包含“逻辑错误”代码的异常（表示存在错误），程序将提前终止。这允许在发布构建中使用异常，但在调试构建中将其视为断言。

为调试构建使用调试版本的 jemalloc。为调试构建使用调试版本的 libc++。

## 运行时完整性检查 {#runtime-integrity-checks}

存储在磁盘上的数据是进行校验和检测的。MergeTree 表中的数据以三种方式进行校验和检测*（压缩数据块、未压缩数据块、块之间的总校验和）。通过网络在客户端与服务器之间或服务器之间传输的数据也是进行校验和检测的。复制确保副本上的数据是逐位相同的。

这需要保护故障硬件（存储介质上的位腐烂、服务器 RAM 中的位翻转、网络控制器中的位翻转、网络交换机中的位翻转、客户端中的位翻转、数据传输线上的位翻转）。请注意，即使对于 ECC RAM 和存在 TCP 校验和的情况下，位翻转也是常见的，很可能发生（如果您成功地运行数千个服务器，每天处理 PB 的数据）。
[观看视频（俄文）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供了诊断工具，这将帮助运维工程师找到故障硬件。

\*并且并不慢。

## 代码风格 {#code-style}

代码风格规则在 [这里](style.md) 进行描述。

要检查一些常见的风格违规，您可以使用 `utils/check-style` 脚本。

要强制代码采用适当的风格，您可以使用 `clang-format`。文件 `.clang-format` 位于源代码根目录。它主要对应于我们实际的代码风格。但不推荐将 `clang-format` 应用于现有文件，因为这会使格式变得更差。您可以使用 `clang-format-diff` 工具，该工具可以在 clang 源代码仓库中找到。

或者，您可以尝试 `uncrustify` 工具来重新格式化您的代码。配置位于源代码根目录的 `uncrustify.cfg` 中。它的测试程度不如 `clang-format`。

`CLion` 有自己的代码格式化工具，但必须为我们的代码风格进行调整。

我们还使用 `codespell` 查找代码中的拼写错误。这也是自动化的。

## 测试覆盖率 {#test-coverage}

我们还跟踪测试覆盖率，但仅针对功能测试以及仅针对 clickhouse-server。它是每日进行的。

## 测试的测试 {#tests-for-tests}

有自动化检查不稳定测试的功能。它对所有新测试运行 100 次（对于功能测试）或 10 次（对于集成测试）。如果至少有一次测试失败，则视为不稳定测试。

## 测试自动化 {#test-automation}

我们通过 [GitHub Actions](https://github.com/features/actions) 运行测试。

构建任务和测试在每个提交的基础上在 Sandbox 中运行。生成的包和测试结果发布在 GitHub 上，可以通过直接链接下载。工件将存储几个月。 当您在 GitHub 上发送拉取请求时，我们将其标记为“可以测试”，我们的 CI 系统将为您构建 ClickHouse 包（发布版、调试版、带地址清理程序等）。
