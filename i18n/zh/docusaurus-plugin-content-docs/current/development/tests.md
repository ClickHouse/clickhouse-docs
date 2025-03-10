---
slug: /development/tests
sidebar_position: 40
sidebar_label: '测试'
---


# 测试

## 功能测试 {#functional-tests}

功能测试是最简单和方便使用的测试。
大多数 ClickHouse 的功能都可以通过功能测试进行测试，并且对于每一次可以这样测试的 ClickHouse 代码的更改都是强制使用的。

每个功能测试都向正在运行的 ClickHouse 服务器发送一个或多个查询，并将结果与参考进行比较。

测试位于 `queries` 目录中。
该目录下有两个子目录：`stateless` 和 `stateful`。
- 无状态测试在没有任何预加载测试数据的情况下运行查询 - 它们通常在测试本身中动态创建小的合成数据集。
- 有状态测试需要来自 ClickHouse 的预加载测试数据，并且对公众可用。

每个测试可以是两种类型之一：`.sql` 和 `.sh`。
- `.sql` 测试是简单的 SQL 脚本，直接传送给 `clickhouse-client`。
- `.sh` 测试是独立运行的脚本。

SQL 测试通常比 `.sh` 测试更可取。
您应该仅在需要测试一些无法通过纯 SQL 进行测试的功能时使用 `.sh` 测试，例如将某些输入数据传入 `clickhouse-client` 或测试 `clickhouse-local`。

:::note
在测试数据类型 `DateTime` 和 `DateTime64` 时，常见的错误是假设服务器使用特定时区（例如 "UTC"）。 实际上并非如此，CI 测试运行中的时区故意进行了随机化。 最简单的解决方法是明确指定测试值的时区，例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器，监听默认端口（9000）。
例如，要运行测试 `01428_hash_set_nan_key`，请切换到存储库文件夹并运行以下命令：

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果（`stderr` 和 `stdout`）被写入位于测试本身旁边的文件 `01428_hash_set_nan_key.[stderr|stdout]`（对于 `queries/0_stateless/foo.sql`，输出将位于 `queries/0_stateless/foo.stdout`）。

请参见 `tests/clickhouse-test --help` 获取 `clickhouse-test` 的所有选项。
您可以运行所有测试或通过提供测试名称的过滤器运行测试子集：`./clickhouse-test substring`。
还有选项可以并行或随机顺序运行测试。

### 添加新测试 {#adding-a-new-test}

要添加新测试，首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。
然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成相应的 `.reference` 文件。

测试只能在数据库 `test` 中创建、删除、选择表等，此数据库会自动提前创建。
可以使用临时表。

要在本地设置与 CI 相同的环境，请安装测试配置（它们将使用 Zookeeper 模拟实现并调整某些设置）

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应该
- 最小化：仅创建最小所需的表、列和复杂性，
- 快速：不超过几秒钟（最好：亚秒级），
- 正确且确定性：仅在待测功能不正常时失败，
- 隔离/无状态：不依赖于环境和时序，
- 详尽：覆盖零、空值、空集合、异常的极端情况（负测试，使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }` 来进行），
- 在测试结束时清理表（以防有残留），
- 确保其他测试不会测试相同的内容（即先执行 grep）。
:::

### 限制测试运行 {#restricting-test-runs}

一个测试可以有零个或多个 _标签_，指定测试在 CI 中运行的上下文限制。

对于 `.sql` 测试，标签放在第一行作为 SQL 注释：

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

对于 `.sh` 测试，标签作为第二行的注释写入：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

可用标签列表：

| 标签名称 | 功能 | 使用示例 |
|---|---|---|
| `disabled` | 测试未运行 | |
| `long` | 测试的执行时间延长至1到10分钟 | |
| `deadlock` | 测试在循环中运行很长时间 | |
| `race` | 同 `deadlock`。更喜欢使用 `deadlock` | |
| `shard` | 服务器需要监听 `127.0.0.*` | |
| `distributed` | 同 `shard`。更喜欢使用 `shard` | |
| `global` | 同 `shard`。更喜欢使用 `shard` | |
| `zookeeper` | 测试要求 Zookeeper 或 ClickHouse Keeper 运行 | 测试使用 `ReplicatedMergeTree` |
| `replica` | 同 `zookeeper`。更喜欢使用 `zookeeper` | |
| `no-fasttest` | 测试未在 [快速测试](continuous-integration.md#fast-test) 下运行 | 测试使用的 `MySQL` 表引擎在快速测试中被禁用 |
| `no-[asan, tsan, msan, ubsan]` | 禁用在带有 [sanitizers](#sanitizers) 的构建中的测试 | 测试在 QEMU 下运行，QEMU 不支持 sanitizers |
| `no-replicated-database` | | |
| `no-ordinary-database` | | |
| `no-parallel` | 禁用与此测试并行运行其他测试 | 测试从 `system` 表中读取，可能会破坏不变量 |
| `no-parallel-replicas` | | |
| `no-debug` | | |
| `no-stress` | | |
| `no-polymorphic-parts` | | |
| `no-random-settings` | | |
| `no-random-merge-tree-settings` | | |
| `no-backward-compatibility-check` | | |
| `no-cpu-x86_64` | | |
| `no-cpu-aarch64` | | |
| `no-cpu-ppc64le` | | |
| `no-s3-storage` | | |

除了上述设置外，您还可以使用 `system.build_options` 中的 `USE_*` 标志来定义某些 ClickHouse 功能的使用。
例如，如果您的测试使用 MySQL 表，则应添加标签 `use-mysql`。

### 指定随机设置的限制 {#specifying-limits-for-random-settings}

测试可以指定允许的设置的最小和最大值，这些设置在测试运行期间可以随机化。

对于 `.sh` 测试，限制作为注释放在标签旁边的行或在没有指定标签的情况下的第二行中：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签作为 SQL 注释放在标签旁边的行或在第一行中：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果需要仅指定一个限制，可以使用 `None` 作为另一个限制。

### 选择测试名称 {#choosing-the-test-name}

测试名称以五位数字前缀开始，后跟描述性名称，例如 `00422_hash_function_constexpr.sql`。
选择前缀时，请查找目录中已存在的最大前缀，并将其加1。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

在此期间，可能会有其他测试添加相同的数字前缀，但这没关系，不会导致任何问题，您不必在稍后更改它。

### 检查必须发生的错误 {#checking-for-an-error-that-must-occur}

有时您想测试一个错误是否因为不正确的查询而发生。我们在 SQL 测试中支持此类特定注释，形式如下：

```sql
select x; -- { serverError 49 }
```

此测试确保服务器返回代码为 49 的未知列 `x` 错误。
如果没有错误，或错误不同，则测试将失败。
如果您想确保在客户端发生错误，请使用 `clientError` 注释。

请勿检查错误消息的特定措辞，未来可能会更改，测试将不必要地中断。
只检查错误代码。
如果现有错误代码对您的需求不够精确，请考虑添加一个新代码。

### 测试分布式查询 {#testing-a-distributed-query}

如果您希望在功能测试中使用分布式查询，可以利用 `remote` 表函数，使用 `127.0.0.{1..2}` 地址让服务器查询自身；或您可以使用如 `test_shard_localhost` 等服务器配置文件中预定义的测试集群。
请记得在测试名称中添加 `shard` 或 `distributed`，以便在 CI 中使用正确的配置运行，服务器已配置为支持分布式查询。

### 处理临时文件 {#working-with-temporary-files}

有时在 shell 测试中，您可能需要动态创建一个文件进行操作。
请记住，一些 CI 检查以并行方式运行测试，因此，如果您在脚本中创建或删除临时文件而没有唯一名称，这可能会导致一些 CI 检查（例如 Flaky）失败。
为避免这种情况，您应该使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME` 为正在运行的测试提供唯一名称的临时文件。
这样可以确保您在设置期间创建或在清理期间删除的文件是该测试唯一使用的文件，而不是正在并行运行的其他测试使用的文件。

## 已知错误 {#known-bugs}

如果我们知道一些可以通过功能测试轻松重现的错误，我们会将准备好的功能测试放在 `tests/queries/bugs` 目录中。
这些测试将在错误修复后移动到 `tests/queries/0_stateless`。

## 集成测试 {#integration-tests}

集成测试允许在集群配置下测试 ClickHouse，以及 ClickHouse 与其他服务器（如 MySQL、Postgres、MongoDB）的交互。
它们对模拟网络分裂、数据包丢失等情况非常有用。
这些测试在 Docker 中运行，同时创建多个带有不同软件的容器。

有关如何运行这些测试，请参阅 `tests/integration/README.md`。

请注意，ClickHouse 与第三方驱动程序的集成未经过测试。
另外，我们目前没有与我们的 JDBC 和 ODBC 驱动程序进行集成测试。

## 单元测试 {#unit-tests}

单元测试在您想要测试的不是整个 ClickHouse，而是某个单独的孤立库或类时非常有用。
您可以使用 `ENABLE_TESTS` CMake 选项启用或禁用测试的构建。
单元测试（以及其他测试程序）位于代码中的 `tests` 子目录中。
要运行单元测试，请键入 `ninja test`。
一些测试使用 `gtest`，但有些只是返回非零退出代码的程序，表明测试失败。

如果代码已经被功能测试覆盖，则不需要单元测试（并且功能测试通常使用起来更简单）。

您可以通过直接调用可执行文件来运行单独的 gtest 检查，例如：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## 性能测试 {#performance-tests}

性能测试允许测量和比较 ClickHouse 某些孤立部分在合成查询上的性能。
性能测试位于 `tests/performance/` 下。
每个测试由一个 `.xml` 文件表示，其中包含测试案例的描述。
测试通过 `docker/test/performance-comparison` 工具运行。有关调用的详细信息，请参阅自述文件。

每个测试在循环中运行一个或多个查询（可能带有参数组合）。

如果您希望在某个场景中改进 ClickHouse 的性能，并且在简单查询中可以观察到改进，强烈建议编写性能测试。
此外，在添加或修改相对孤立且不太模糊的 SQL 函数时，也建议编写性能测试。
在您的测试中使用 `perf top` 或其他 `perf` 工具总是有意义的。

## 测试工具和脚本 {#test-tools-and-scripts}

在 `tests` 目录中的一些程序不是准备好的测试，而是测试工具。
例如，对于 `Lexer` 有一个工具 `src/Parsers/tests/lexer`，只需对标准输入进行标记化并将有色结果写入标准输出。
您可以将这些工具用作代码示例和探索及手动测试。

## 其他测试 {#miscellaneous-tests}

在 `tests/external_models` 中有机器学习模型的测试。
这些测试未进行更新，必须转移到集成测试中。

还有一个专门的测试用于法定插入。
此测试在独立服务器上运行 ClickHouse 集群，并模拟各种故障情况：网络分裂、数据包丢失（在 ClickHouse 节点之间、在 ClickHouse 和 ZooKeeper 之间、在 ClickHouse 服务器和客户端之间等）、`kill -9`、`kill -STOP` 和 `kill -CONT`，如 [Jepsen](https://aphyr.com/tags/Jepsen)。然后测试检查所有已确认的插入是否被写入，以及所有被拒绝的插入是否未被写入。

法定测试是由在 ClickHouse 开源之前的独立团队编写的。
该团队不再与 ClickHouse 合作。
测试是意外用 Java 编写的。
出于这些原因，法定测试必须被重写并转移到集成测试中。

## 手动测试 {#manual-testing}

当您开发新功能时，手动测试也是合理的。
可以按以下步骤进行操作：

构建 ClickHouse。从终端运行 ClickHouse：更改目录到 `programs/clickhouse-server`，并通过 `./clickhouse-server` 运行。默认情况下它将从当前目录使用配置（`config.xml`、`users.xml` 和 `config.d` 及 `users.d` 目录中的文件）。要连接到 ClickHouse 服务器，请运行 `programs/clickhouse-client/clickhouse-client`。

请注意，所有的 ClickHouse 工具（服务器、客户端等）只是指向名为 `clickhouse` 的单个二进制文件的符号链接。
您可以在 `programs/clickhouse` 找到该二进制文件。
所有工具也可以作为 `clickhouse tool` 而不是 `clickhouse-tool` 调用。

或者，您可以安装 ClickHouse 包：无论是来自 ClickHouse 存储库的稳定版本，还是您可以使用 `./release` 在 ClickHouse 源代码根目录中构建包。
然后使用 `sudo clickhouse start` 启动服务器（如果要停止服务器，则使用 `stop` 命令）。
在 `/etc/clickhouse-server/clickhouse-server.log` 中查找日志。

当 ClickHouse 已经安装在您的系统上时，您可以构建新的 `clickhouse` 二进制文件并替换现有的二进制文件：

``` bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

您还可以停止系统的 clickhouse-server，并使用相同的配置但将日志输出到终端来运行您自己的服务器：

``` bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例：

``` bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统的 clickhouse-server 已经在运行，并且您不想停止它，可以在您的 `config.xml` 中更改端口号（或者在 `config.d` 目录中的文件中覆盖它们），提供适当的数据路径，然后运行它。

`clickhouse` 二进制文件几乎没有依赖，并且在广泛的 Linux 发行版上都能正常工作。
要快速测试您对服务器的更改，您可以简单地将新构建的 `clickhouse` 二进制文件 `scp` 到您的服务器上，然后像上述示例那样运行它。

## 构建测试 {#build-tests}

构建测试可以检查在各种替代配置和某些外部系统上构建是否正常。
这些测试也是自动化的。

示例：
- 为 Darwin x86_64 交叉编译（macOS）
- 为 FreeBSD x86_64 交叉编译
- 为 Linux AArch64 交叉编译
- 在 Ubuntu 上使用系统包库中的库构建（不建议）
- 使用库的共享链接进行构建（不建议）

例如，使用系统包构建是不良做法，因为我们无法保证系统将拥有什么确切版本的包。
但是这确实是 Debian 维护者非常需要的。
因此，我们至少必须支持这种构建变体。
另一个例子：共享链接是一个常见的麻烦来源，但对于一些爱好者来说是必需的。

尽管我们无法对所有构建变体运行所有测试，但我们希望检查至少不同的构建变体是否没有破坏。
为此，我们使用构建测试。

我们还测试没有单元太长而无法编译或需要过多 RAM。

我们也测试不存在过大的栈帧。

## 测试协议兼容性 {#testing-for-protocol-compatibility}

当我们扩展 ClickHouse 网络协议时，我们手动测试旧的 clickhouse-client 是否与新的 clickhouse-server 以及新的 clickhouse-client 是否与旧的 clickhouse-server 兼容（只需从相应的包运行二进制文件）。

我们还通过集成测试自动测试一些情况：
- 旧版本的 ClickHouse 写入的数据是否可以被新版本成功读取；
- 在不同 ClickHouse 版本的集群中，分布式查询是否正常工作。

## 来自编译器的帮助 {#help-from-the-compiler}

ClickHouse 的主要代码（位于 `src` 目录中）使用 `-Wall -Wextra -Werror` 进行构建，并启用一些其他警告选项。
虽然这些选项未针对第三方库启用。

Clang 有更多有用的警告 - 您可以通过 `-Weverything` 查看它们并获取一些用于默认构建的警告。

我们始终使用 clang 构建 ClickHouse，无论是用于开发还是生产。
您可以在自己的机器上以调试模式进行构建（以省电），但请注意，在使用 `-O3` 构建时，编译器能够生成更多的警告，因为它能更好地控制流和过程间分析。
在调试模式下使用 clang 构建时，使用调试版本的 `libc++`，这使得在运行时捕获更多的错误变得可能。

## Sanitizers {#sanitizers}

:::note
如果进程（ClickHouse 服务器或客户端）在本地启动时崩溃，您可能需要禁用地址空间布局随机化：`sudo sysctl kernel.randomize_va_space=0`
:::

### 地址消毒器 {#address-sanitizer}

我们在每次提交时运行功能、集成、压力和单元测试，使用 ASan。

### 线程消毒器 {#thread-sanitizer}

我们在每次提交时运行功能、集成、压力和单元测试，使用 TSan。

### 内存消毒器 {#memory-sanitizer}

我们在每次提交时运行功能、集成、压力和单元测试，使用 MSan。

### 未定义行为消毒器 {#undefined-behaviour-sanitizer}

我们在每次提交时运行功能、集成、压力和单元测试，使用 UBSan。
某些第三方库的代码未进行 UO 消毒。

### Valgrind（内存检查） {#valgrind-memcheck}

我们曾经在 Valgrind 下过夜运行功能测试，但现在不再这样做。
这需要多个小时。
目前，`re2` 库中有一个已知的假阳性，请参阅 [这篇文章](https://research.swtch.com/sparse)。

## 模糊测试 {#fuzzing}

ClickHouse 模糊测试实现了 [libFuzzer](https://llvm.org/docs/LibFuzzer.html) 和随机 SQL 查询。
所有的模糊测试都应该在消毒器（地址和未定义）下执行。

LibFuzzer 用于库代码的孤立模糊测试。
模糊测试以测试代码的一部分实现，带有 "_fuzzer" 名称后缀。
模糊测试示例可以在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 找到。
LibFuzzer 特定的配置、字典和语料库存储在 `tests/fuzz` 中。
我们鼓励您为每个处理用户输入的功能编写模糊测试。

模糊测试默认情况下不构建。
要构建模糊测试，必须同时设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。
我们建议在构建模糊测试时禁用 Jemalloc。
用于将 ClickHouse 模糊测试集成到 Google OSS-Fuzz 的配置可以在 `docker/fuzz` 中找到。

我们还使用简单的模糊测试来生成随机 SQL 查询，以检查服务器在执行它们时不会崩溃。
您可以在 `00746_sql_fuzzy.pl` 中找到它。
此测试应该持续运行（过夜及更长时间）。

我们还使用复杂的基于 AST 的查询模糊器，能够找到大量的边界情况。
它在查询的 AST 中进行随机排列和替代。
它会记住先前测试的 AST 节点，在处理后续测试时再用于模糊测试，并以随机顺序进行处理。
您可以在 [这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house) 中了解更多有关此模糊器的信息。

## 压力测试 {#stress-test}

压力测试是模糊测试的另一种情况。
它以随机顺序并行运行所有功能测试，使用单个服务器。
不检查测试的结果。

检查如下：
- 服务器不会崩溃，不会触发调试或消毒器陷阱；
- 没有死锁；
- 数据库结构是一致的；
- 服务器能够在测试后成功停止并再次启动而没有异常。

有五种变体（Debug、ASan、TSan、MSan、UBSan）。

## 线程模糊器 {#thread-fuzzer}

线程模糊器（请不要与线程消毒器混淆）是一种允许随机化线程执行顺序的另一种模糊测试方法。
有助于找到更多特殊情况。

## 安全审计 {#security-audit}

我们的安全团队对 ClickHouse 的功能从安全角度进行了基本审查。

## 静态分析器 {#static-analyzers}

我们在每次提交时运行 `clang-tidy`。
也启用了 `clang-static-analyzer` 检查。
`clang-tidy` 还用于一些风格检查。

我们评估了 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL`。
您将在 `tests/instructions/` 目录中找到使用说明。

如果您将 `CLion` 作为 IDE，可以立即利用一些 `clang-tidy` 检查。

我们还使用 `shellcheck` 对 shell 脚本进行静态分析。

## 加固 {#hardening}

在调试构建中，我们使用自定义分配器，对用户级分配进行 ASLR。

我们还手动保护在分配后预期为只读的内存区域。

在调试构建中，我们还会涉及 `libc` 的定制，确保不调用任何“有害”（过时、不安全、非线程安全）函数。

调试断言被广泛使用。

在调试构建中，如果抛出带有“逻辑错误”代码的异常（意味着存在错误），程序将提前终止。
这允许在发布构建中使用异常，但在调试构建中使其成为断言。

在调试构建中使用调试版本的 jemalloc。
在调试构建中使用调试版本的 libc++。

## 运行时完整性检查 {#runtime-integrity-checks}

存储在磁盘上的数据是经过校验和的。
在 MergeTree 表中的数据通过三种方式同时进行校验和检查*（压缩数据块、未压缩数据块、整个数据块的总校验和）。
在客户端和服务器之间或服务器之间通过网络传输的数据也经过校验和检查。
复制确保副本间的数据完全一致。

这是为了防止故障硬件（存储介质的位腐烂、服务器 RAM 中的位翻转、网络控制器的 RAM 中的位翻转、网络交换机的 RAM 中的位翻转、客户端的 RAM 中的位翻转、网络上的位翻转）。
请注意，位翻转是常见的，甚至在存在 TCP 校验和的情况下（如果您管理数以千计的服务器每天处理数PB的数据）。
[请查看视频（俄文）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供诊断工具，帮助运维工程师找到故障硬件。

\* 而且速度并不慢。

## 代码风格 {#code-style}

代码风格规则在 [这里](style.md) 中描述。

要检查一些常见样式违规，可以使用 `utils/check-style` 脚本。

要强制代码的适当风格，可以使用 `clang-format`。
文件 `.clang-format` 位于源代码根目录，主要对应我们的实际代码风格。
但不建议对现有文件应用 `clang-format`，因为这会使格式变得更糟糕。
您可以使用 `clang-format-diff` 工具，它可以在 clang 源代码库中找到。

或者，您可以尝试使用 `uncrustify` 工具重新格式化您的代码。
配置文件位于源代码根目录的 `uncrustify.cfg` 中。
这比 `clang-format` 测试得更少。

`CLion` 有其自己的代码格式化工具，必须针对我们的代码风格进行调整。

我们还使用 `codespell` 查找代码中的拼写错误。
这也是自动化的。

## 测试覆盖率 {#test-coverage}

我们还追踪测试覆盖率，但仅适用于功能测试，并且仅适用于 clickhouse-server。
这每天进行。

## 测试的测试 {#tests-for-tests}

有一个针对易出错测试的自动化检查。
它会将所有新测试运行 100 次（对于功能测试）或 10 次（对于集成测试）。
如果至少有一次测试失败，便认为该测试是易出错的。

## 测试自动化 {#test-automation}

我们使用 [GitHub Actions](https://github.com/features/actions) 运行测试。

构建作业和测试在每个提交的 Sandbox 中运行。
生成的包和测试结果在 GitHub 上发布，并可以通过直接链接下载。
工件会保存几个月。
当您在 GitHub 上发送拉取请求时，我们会将其标记为“可以测试”，我们的 CI 系统将为您构建 ClickHouse 包（发布版、调试版、带地址消毒器等）。

