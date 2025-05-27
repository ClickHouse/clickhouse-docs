---
'description': '测试 ClickHouse 和运行测试套件的指南'
'sidebar_label': '测试'
'sidebar_position': 40
'slug': '/development/tests'
'title': '测试 ClickHouse'
---


# 测试 ClickHouse

## 功能测试 {#functional-tests}

功能测试是最简单和方便使用的。
大多数 ClickHouse 功能可以通过功能测试进行测试，对于任何可以以此方式进行测试的 ClickHouse 代码更改，它们都是强制使用的。

每个功能测试向运行中的 ClickHouse 服务器发送一个或多个查询，并将结果与引用进行比较。

测试位于 `queries` 目录。
有两个子目录：`stateless` 和 `stateful`。
- 无状态测试在没有任何预加载测试数据的情况下运行查询 - 它们通常在测试本身内动态创建小的合成数据集。
- 有状态测试需要从 ClickHouse 预加载测试数据，并且它对公众可用。请参见 [状态测试在持续集成中的使用](continuous-integration.md#functional-stateful-tests)。

每个测试可以是两种类型之一：`.sql` 和 `.sh`。
- `.sql` 测试是简单的 SQL 脚本，通过 `clickhouse-client` 管道传输。
- `.sh` 测试是单独运行的脚本。

一般来说，SQL 测试优于 `.sh` 测试。
只有在必须测试一些无法通过纯 SQL 实现的功能时，才应使用 `.sh` 测试，例如将一些输入数据传递到 `clickhouse-client` 或测试 `clickhouse-local`。

:::note
测试数据类型 `DateTime` 和 `DateTime64` 时常见的错误是假设服务器使用特定时区（例如“UTC”）。实际上并非如此，CI 测试运行中的时区是故意随机化的。最简单的解决方法是明确为测试值指定时区，例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 在本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器，监听默认端口（9000）。
例如，要运行测试 `01428_hash_set_nan_key`，请切换到存储库文件夹并运行以下命令：

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果（`stderr` 和 `stdout`）写入到文件 `01428_hash_set_nan_key.[stderr|stdout]` 中，这些文件位于测试本身旁边（对于 `queries/0_stateless/foo.sql`，输出将位于 `queries/0_stateless/foo.stdout` 中）。

请参见 `tests/clickhouse-test --help` 了解 `clickhouse-test` 的所有选项。
您可以运行所有测试，或者通过提供测试名称的过滤器来运行部分测试：`./clickhouse-test substring`。
还有选项可以并行运行测试或随机顺序运行。

### 添加新测试 {#adding-a-new-test}

要添加新测试，首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。
然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成相应的 `.reference` 文件。

测试仅应在自动创建的数据库 `test` 中创建、删除、查询表等。
可以使用临时表。

要在本地设置与 CI 相同的环境，请安装测试配置（它们将使用 Zookeeper 虚拟实现并调整某些设置）

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应
- 最小化：仅创建所需的最少表、列和复杂性，
- 快速：不超过几秒（更好：亚秒级），
- 正确且确定性：仅在被测试功能未正常工作时才失败，
- 隔离/无状态：不依赖于环境和时间
- 详尽：覆盖边界情况，比如零、空值、空集、异常（负测试，使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }` 来实现），
- 在测试结束时清理表（以防有残留），
- 确保其他测试不测试相同内容（即先使用 grep 检查）。
:::

### 限制测试运行 {#restricting-test-runs}

测试可以具有零个或多个 _tags_，指定测试在 CI 中运行的上下文限制。

对于 `.sql` 测试，标签放在第一行作为 SQL 注释：

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

对于 `.sh` 测试，标签作为注释放在第二行：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

可用标签列表：

|标签名称 | 功能 | 用法示例 |
|---|---|---|
| `disabled`| 测试未运行 ||
| `long` | 测试的执行时间从1分钟延长到10分钟 ||
| `deadlock` | 测试在循环中长时间运行 ||
| `race` | 与 `deadlock` 相同。优先选择 `deadlock` ||
| `shard` | 服务器需监听 `127.0.0.*` ||
| `distributed` | 与 `shard` 相同。优先选择 `shard` ||
| `global` | 与 `shard` 相同。优先选择 `shard` ||
| `zookeeper` | 测试需运行 Zookeeper 或 ClickHouse Keeper | 测试使用 `ReplicatedMergeTree` |
| `replica` | 与 `zookeeper` 相同。优先选择 `zookeeper` ||
| `no-fasttest`| 测试不在 [快速测试](continuous-integration.md#fast-test) 下运行 | 测试使用的 `MySQL` 表引擎在快速测试中被禁用 |
| `no-[asan, tsan, msan, ubsan]` | 禁用在具有 [sanitizers](#sanitizers) 的构建中测试 | 测试在 QEMU 下运行，QEMU 不兼容 sanitizers |
| `no-replicated-database` |||
| `no-ordinary-database` |||
| `no-parallel` | 禁止与此测试并行运行其他测试 | 测试从 `system` 表中读取，可能会破坏不变性 |
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

除了以上设置外，您还可以使用 `system.build_options` 中的 `USE_*` 标志来定义 ClickHouse 特定功能的使用。
例如，如果您的测试使用 MySQL 表，则应添加标签 `use-mysql`。

### 为随机设置指定限制 {#specifying-limits-for-random-settings}

测试可以指定随机测试运行中允许的设置的最小值和最大值。

对于 `.sh` 测试，限制作为注释写在标签旁边的行上，或者如果未指定标签，则写在第二行：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签紧邻标签的行中作为 SQL 注释，或在第一行中：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果您只需要指定一个限制，可以对另一个限制使用 `None`。

### 选择测试名称 {#choosing-the-test-name}

测试名称以五位数字前缀开头，后跟描述性名称，例如 `00422_hash_function_constexpr.sql`。
要选择前缀，请找到目录中已存在的最大前缀，并将其递增1。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

与此同时，可能会添加其他具有相同数字前缀的测试，但这没有问题，并不会导致任何问题，您不必在以后更改它。

### 检查必须发生的错误 {#checking-for-an-error-that-must-occur}

有时您想测试不正确的查询是否会发生服务器错误。我们在 SQL 测试中支持特殊注释，形式如下：

```sql
select x; -- { serverError 49 }
```

该测试确保服务器返回代码为49的关于未知列 `x` 的错误。
如果没有错误，或者错误不同，测试将失败。
如果您想确保在客户端发生错误，请使用 `clientError` 注释。

请勿检查错误消息的特定措辞，因为这可能会在未来发生改变，从而不必要地导致测试失败。
只检查错误代码。
如果现有错误代码不够精确以满足您的需求，请考虑添加一个新代码。

### 测试分布式查询 {#testing-a-distributed-query}

如果您希望在功能测试中使用分布式查询，可以利用 `remote` 表函数，使用 `127.0.0.{1..2}` 地址供服务器查询自身；或者可以在服务器配置文件中使用预定义的测试集群，如 `test_shard_localhost`。
记得在测试名称中添加 `shard` 或 `distributed`，以便在 CI 中以正确的配置运行，其中服务器配置为支持分布式查询。

### 处理临时文件 {#working-with-temporary-files}

有时在 Shell 测试中，您可能需要动态创建一个文件以进行处理。
请记住，一些 CI 检查会并行运行测试，因此如果您在脚本中创建或删除一个没有唯一名称的临时文件，这可能会导致某些 CI 检查（例如 Flaky）失败。
为了解决这个问题，您应该使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME` 来为运行中的测试提供唯一的临时文件名。
这样，您可以确保您在设置期间创建或在清理期间删除的文件是该测试唯一使用的文件，而不是其他并行运行的测试中的文件。

## 已知错误 {#known-bugs}

如果我们知道一些可以通过功能测试轻松重现的错误，我们会将准备好的功能测试放在 `tests/queries/bugs` 目录中。
这些测试将在修复错误后移动到 `tests/queries/0_stateless`。

## 集成测试 {#integration-tests}

集成测试允许在集群配置中测试 ClickHouse 以及 ClickHouse 与其他服务器（如 MySQL、Postgres、MongoDB）的交互。
它们可用于模拟网络分裂、数据包丢失等。
这些测试在 Docker 下运行，并创建多个带有不同软件的容器。

请查看 `tests/integration/README.md` 了解如何运行这些测试。

请注意，ClickHouse 与第三方驱动程序的集成未经过测试。
此外，我们目前没有与我们的 JDBC 和 ODBC 驱动程序的集成测试。

## 单元测试 {#unit-tests}

单元测试在您想要测试的不是整个 ClickHouse 而是单个独立库或类时非常有用。
您可以使用 `ENABLE_TESTS` CMake 选项启用或禁用测试的构建。
单元测试（以及其他测试程序）位于代码的 `tests` 子目录中。
要运行单元测试，请键入 `ninja test`。
一些测试使用 `gtest`，但有些只是返回非零退出代码以指示测试失败的程序。

如果代码已由功能测试覆盖，则不必进行单元测试（功能测试通常更简单易用）。

您可以通过直接调用可执行文件来运行单独的 gtest 检查，例如：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## 性能测试 {#performance-tests}

性能测试可测量和比较 ClickHouse 某个独立部分在合成查询中的性能。
性能测试位于 `tests/performance/`。
每个测试由一个包含测试用例描述的 `.xml` 文件表示。
测试使用 `docker/test/performance-comparison` 工具运行。请参见自述文件以获取调用方法。

每个测试在循环中运行一个或多个查询（可能带有参数组合）。

如果您希望在某个场景中改善 ClickHouse 的性能，并且如果改善可以在简单查询上观察到，强烈建议您编写性能测试。
此外，当您添加或修改相对独立且不太晦涩的 SQL 函数时，也建议编写性能测试。
在测试过程中使用 `perf top` 或其他 `perf` 工具总是有意义的。

## 测试工具和脚本 {#test-tools-and-scripts}

在 `tests` 目录中的某些程序不是准备好的测试，而是测试工具。
例如，对于 `Lexer` 有一个工具 `src/Parsers/tests/lexer`，它只对标准输入进行分词，并将彩色结果写入标准输出。
您可以将这些工具用作代码示例以及探索和手动测试之用。

## 杂项测试 {#miscellaneous-tests}

在 `tests/external_models` 中有机器学习模型的测试。
这些测试没有更新，必须转移到集成测试中。

有一个单独的测试用于法定插入。
该测试在单独的服务器上运行 ClickHouse 集群，并模拟各种故障情况：网络分裂、数据包丢失（在 ClickHouse 节点之间、ClickHouse 和 ZooKeeper 之间、ClickHouse 服务器与客户端之间等）、`kill -9`、`kill -STOP` 和 `kill -CONT`，类似于 [Jepsen](https://aphyr.com/tags/Jepsen)。然后测试检查所有确认的插入是否已写入，而所有被拒绝的插入未写入。

法定测试是 ClickHouse 开源之前由一个单独团队编写的。
这个团队现在不再与 ClickHouse 相关。
测试意外地用 Java 编写。
因此，法定测试必须重写并移至集成测试。

## 手动测试 {#manual-testing}

在您开发新功能时，合理地手动测试它。
您可以按照以下步骤进行操作：

构建 ClickHouse。从终端运行 ClickHouse：切换目录到 `programs/clickhouse-server` 并通过 `./clickhouse-server` 运行。它将默认使用当前目录的配置（`config.xml`、`users.xml` 和 `config.d` 和 `users.d` 目录中的文件）。要连接到 ClickHouse 服务器，运行 `programs/clickhouse-client/clickhouse-client`。

请注意，所有 ClickHouse 工具（服务器、客户端等）都是指向名为 `clickhouse` 的单个二进制文件的符号链接。
您可以在 `programs/clickhouse` 中找到该二进制文件。
所有工具也可通过 `clickhouse tool` 代替 `clickhouse-tool` 调用。

或者您可以安装 ClickHouse 软件包：可以是 ClickHouse 存储库中的稳定版本，或您可以使用 `./release` 在 ClickHouse 源代码根目录中为自己构建软件包。
然后使用 `sudo clickhouse start` 启动服务器（或 stop 停止服务器）。
查看 `/etc/clickhouse-server/clickhouse-server.log` 中的日志。

当 ClickHouse 已经在您的系统上安装时，您可以构建新的 `clickhouse` 二进制文件并替换现有的二进制文件：

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

您也可以停止系统 ClickHouse 服务器，并使用相同的配置但将日志记录到终端的方式运行您自己的实例：

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例：

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统 ClickHouse 服务器已经在运行，并且您不想停止它，您可以在 `config.xml` 中更改端口号（或在 `config.d` 目录中的文件中覆盖它们），提供合适的数据路径并运行它。

`clickhouse` 二进制文件几乎没有依赖项，可以跨多个 Linux 发行版工作。
要快速且简便地在服务器上测试您的更改，您只需将新构建的 `clickhouse` 二进制文件 `scp` 到服务器，然后像上面的示例一样运行它。

## 构建测试 {#build-tests}

构建测试允许检查构建在各种替代配置和一些外部系统上的可用性。
这些测试也是自动化的。

示例：
- 为 Darwin x86_64 （macOS）交叉编译
- 为 FreeBSD x86_64 交叉编译
- 为 Linux AArch64 交叉编译
- 在 Ubuntu 上使用系统软件包中的库构建（不推荐）
- 使用共享链接库构建（不推荐）

例如，使用系统软件包的构建是不好的做法，因为我们无法保证系统将具有什么确切版本的包。
但这对于 Debian 维护者确实是非常需要的。
因此，我们至少必须支持这个构建变体。
另一个例子：共享链接是一种常见问题的来源，但一些爱好者需要它。

尽管我们无法在所有构建变体中运行所有测试，但我们希望至少检查各种构建变体是否正常。
为此，我们使用构建测试。

我们还测试没有单元过长而无法编译或需要过多 RAM。

我们还测试没有过大的堆栈帧。

## 测试协议兼容性 {#testing-for-protocol-compatibility}

当我们扩展 ClickHouse 网络协议时，我们手动测试旧的 `clickhouse-client` 是否能与新的 `clickhouse-server` 一起工作，以及新的 `clickhouse-client` 是否能与旧的 `clickhouse-server` 一起工作（简单地从相应包运行二进制文件）。

我们还使用集成测试自动测试一些案例：
- 旧版本的 ClickHouse 写入的数据是否可以被新版本成功读取；
- 不同 ClickHouse 版本的集群中，分布式查询是否正常工作。

## 来自编译器的帮助 {#help-from-the-compiler}

主要的 ClickHouse 代码（位于 `src` 目录）使用 `-Wall -Wextra -Werror` 进行编译，并启用了某些其他警告。
尽管这些选项未针对第三方库启用。

Clang 具有更有用的警告 - 您可以通过 `-Weverything` 查找它们并选择某些默认构建。

我们始终使用 clang 来构建 ClickHouse，用于开发和生产。
您可以在自己的机器上以调试模式构建（以节省您的笔记本电池），但请注意，编译器能够通过更好的控制流和过程间分析生成更多警告，使用 `-O3`。
在调试模式下使用 clang 构建时，使用调试版本的 `libc++`，这允许在运行时捕获更多错误。

## Sanitizers {#sanitizers}

:::note
如果进程（ClickHouse 服务器或客户端）在本地启动时崩溃，您可能需要禁用地址空间布局随机化：`sudo sysctl kernel.randomize_va_space=0`
:::

### 地址清理器 {#address-sanitizer}

我们在每次提交时在 ASan 下运行功能、集成、压力和单元测试。

### 线程清理器 {#thread-sanitizer}

我们在每次提交时在 TSan 下运行功能、集成、压力和单元测试。

### 内存清理器 {#memory-sanitizer}

我们在每次提交时在 MSan 下运行功能、集成、压力和单元测试。

### 未定义行为清理器 {#undefined-behaviour-sanitizer}

我们在每次提交时在 UBSan 下运行功能、集成、压力和单元测试。
一些第三方库的代码未针对 UB 进行清理。

### Valgrind（内存检查） {#valgrind-memcheck}

我们曾经在 Valgrind 下运行功能测试，但现在不再这样做。
它会花费几个小时的时间。
目前，`re2` 库中有一个已知的误报，请参见 [这篇文章](https://research.swtch.com/sparse)。

## 模糊测试 {#fuzzing}

ClickHouse 的模糊测试实现既使用 [libFuzzer](https://llvm.org/docs/LibFuzzer.html) 也使用随机 SQL 查询。
所有模糊测试都应在带有清理器（地址和未定义）的情况下执行。

LibFuzzer 用于库代码的独立模糊测试。
模糊测试器作为测试代码的一部分实现，并具有 "_fuzzer" 名称后缀。
模糊测试器示例可以在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 中找到。
LibFuzzer 特定配置、字典和语料库存储在 `tests/fuzz` 中。我们鼓励您为每个处理用户输入的功能编写模糊测试。

模糊测试器默认情况下并不构建。
要构建模糊测试器，必须设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。
我们建议在构建模糊测试器时禁用 Jemalloc。
将 ClickHouse 模糊测试集成到 Google OSS-Fuzz 使用的配置可以在 `docker/fuzz` 中找到。

我们还使用简单的模糊测试生成随机 SQL 查询，并检查服务器不会因执行它们而崩溃。
您可以在 `00746_sql_fuzzy.pl` 中找到它。
该测试应持续运行（过夜及更长时间）。

我们还使用复杂的基于 AST 的查询模糊测试器，能够找到大量边界情况。
它在查询 AST 中进行随机排列和替换。
在处理它们时，它会记住来自先前测试的 AST 节点，以便为后续测试提供模糊处理，同时以随机顺序处理它们。
您可以在 [这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house) 中了解更多关于此模糊测试器的信息。

## 压力测试 {#stress-test}

压力测试是另一种模糊测试。
它并行以随机顺序运行所有功能测试，使用单一服务器。
测试结果不被检查。

检查内容：
- 服务器不崩溃，没有调试或清理器陷阱触发；
- 没有死锁；
- 数据库结构一致；
- 测试结束后，服务器可以成功停止并再次启动，没有异常。

有五种变体（Debug、ASan、TSan、MSan、UBSan）。

## 线程模糊测试 {#thread-fuzzer}

线程模糊测试（请勿与线程清理器混淆）是一种允许随机化线程执行顺序的模糊测试。
这有助于发现更多特殊情况。

## 安全审计 {#security-audit}

我们的安全团队对 ClickHouse 从安全角度的能力进行了基本概述。

## 静态分析器 {#static-analyzers}

我们在每次提交时运行 `clang-tidy`。
`clang-static-analyzer` 检查也已启用。
`clang-tidy` 也用于某些样式检查。

我们评估了 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL`。
您可以在 `tests/instructions/` 目录中找到使用说明。

如果您使用 `CLion` 作为 IDE，您可以开箱即用地利用一些 `clang-tidy` 检查。

我们还使用 `shellcheck` 对 Shell 脚本进行静态分析。

## 加固 {#hardening}

在调试构建中，我们使用自定义分配器来进行用户级分配的 ASLR。

我们还手动保护预期在分配后为只读的内存区域。

在调试构建中，我们还涉及 `libc` 的定制，以确保不会调用任何“有害”（过时、不安全、非线程安全）函数。

调试断言被广泛使用。

在调试构建中，如果抛出带有“逻辑错误”代码（表明存在错误）的异常，则程序会过早终止。
这允许在发布构建中使用异常，但在调试构建中则将其视为断言。

调试版本的 jemalloc 用于调试构建。
调试版本的 libc++ 用于调试构建。

## 运行时完整性检查 {#runtime-integrity-checks}

存储在磁盘上的数据具有校验和。
MergeTree 表的数据通过三种方式同时进行校验和计算*（压缩的数据块、未压缩的数据块，以及跨块的总校验和）。
在客户端和服务器之间，或服务器之间通过网络传输的数据，也会进行校验和检查。
复制确保副本上的数据位相同。

需要防止有缺陷的硬件（存储介质上的位腐烂、服务器内存中的位翻转、网络控制器内存中的位翻转、网络交换机内存中的位翻转、客户端内存中的位翻转、数据线上的位翻转）。
请注意，位翻转是常见的，并且可能会发生，即便是在使用 ECC RAM 和存在 TCP 校验和的情况下（如果您管理数千个每天处理数PB数据的服务器）。
[请查看视频（俄语）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供诊断工具，帮助运维工程师找到有缺陷的硬件。

\* 并且这并不慢。

## 代码风格 {#code-style}

代码风格规则在 [这里](style.md) 描述。

要检查一些常见的风格违规，您可以使用 `utils/check-style` 脚本。

要强制您的代码遵循正确的风格，您可以使用 `clang-format`。
文件 `.clang-format` 位于源代码根目录。
它大致对应于我们实际的代码风格。
但不推荐对现有文件应用 `clang-format`，因为这会导致格式变得更糟。
您可以使用 `clang-format-diff` 工具，可以在 clang 源代码库中找到。

或者，您可以尝试使用 `uncrustify` 工具来重新格式化您的代码。
配置在源代码根目录的 `uncrustify.cfg` 中。
它的测试不如 `clang-format` 完善。

`CLion` 有自己的代码格式化程序，需要根据我们的代码风格进行调整。

我们还使用 `codespell` 找到代码中的拼写错误。
这也是自动化的。

## 测试覆盖 {#test-coverage}

我们也跟踪测试覆盖率，但仅针对功能测试，并且仅针对 clickhouse-server。
这在每日基础上进行。

## 测试的测试 {#tests-for-tests}

有自动检查脆弱测试的机制。
它运行所有新测试100次（对于功能测试）或10次（对于集成测试）。
如果至少有一次测试失败，它被认为是脆弱的。

## 测试自动化 {#test-automation}

我们使用 [GitHub Actions](https://github.com/features/actions) 运行测试。

构建作业和测试在每次提交时在沙箱中运行。
生成的包和测试结果被发布在 GitHub 上，可以通过直接链接下载。
工件储存几个月。
当您在 GitHub 上提交拉取请求时，我们将其标记为“可以测试”，我们的 CI 系统将为您构建 ClickHouse 包（发布版、调试版、带地址清理器的版本等）。
