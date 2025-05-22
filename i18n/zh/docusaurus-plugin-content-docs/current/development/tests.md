---
'description': '测试 ClickHouse 和运行测试套件的指南'
'sidebar_label': '测试'
'sidebar_position': 40
'slug': '/development/tests'
'title': '测试 ClickHouse'
---


# 测试 ClickHouse

## 功能测试 {#functional-tests}

功能测试是使用最简单且最方便。
大多数 ClickHouse 功能都可以通过功能测试进行测试，并且它们对于 ClickHouse 代码中的每个可以通过这种方式测试的更改都是强制使用的。

每个功能测试发送一个或多个查询到运行中的 ClickHouse 服务器，并将结果与参考结果进行比较。

测试位于 `queries` 目录中。
有两个子目录：`stateless` 和 `stateful`。
- 无状态测试在没有任何预加载测试数据的情况下运行查询——它们通常在测试过程中动态创建小的合成数据集。
- 有状态测试需要从 ClickHouse 中预加载测试数据，并且对公众可用。请参见 [持续集成中的有状态测试](continuous-integration.md#functional-stateful-tests)。

每个测试可以是两种类型之一：`.sql` 和 `.sh`。
- `.sql` 测试是简单的 SQL 脚本，通过管道传送到 `clickhouse-client`。
- `.sh` 测试是独立运行的脚本。

通常，SQL 测试比 `.sh` 测试更可取。
您应仅在必须测试某些无法通过纯 SQL 处理的功能时使用 `.sh` 测试，例如将一些输入数据管道到 `clickhouse-client` 或测试 `clickhouse-local`。

:::note
测试数据类型 `DateTime` 和 `DateTime64` 时常见的错误是假设服务器使用特定时区（例如 "UTC"）。实际上并非如此，CI 测试运行中的时区故意是随机化的。最简单的解决方法是明确为测试值指定时区，例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器，监听默认端口（9000）。
要运行例如测试 `01428_hash_set_nan_key`，请切换到仓库文件夹并运行以下命令：

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果（`stderr` 和 `stdout`）被写入到 `01428_hash_set_nan_key.[stderr|stdout]` 文件中，这些文件位于测试本身旁边（对于 `queries/0_stateless/foo.sql`，输出将位于 `queries/0_stateless/foo.stdout`）。

请参见 `tests/clickhouse-test --help` 以获取 `clickhouse-test` 的所有选项。
您可以运行所有测试，或通过提供测试名称的过滤器运行测试子集：`./clickhouse-test substring`。
还可以选择并行运行测试或随机顺序运行测试。

### 添加新测试 {#adding-a-new-test}

要添加新测试，首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。
然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成相应的 `.reference` 文件。

测试应仅在名为 `test` 的数据库中创建、删除、选择等表，该数据库将自动提前创建。
使用临时表是可以的。

为了在本地设置与 CI 中相同的环境，安装测试配置（这些配置将使用 ZooKeeper 模拟实现并调整一些设置）

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应：
- 最小化：仅创建最基本所需的表、列和复杂性，
- 快速：不超过几秒钟（最好：亚秒级），
- 正确且确定性：仅在被测试的功能不工作时失败，
- 孤立/无状态：不依赖于环境和定时
- 考虑周全：覆盖边缘情况，如零、空值、空集合、异常（负面测试，使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }` 进行测试），
- 在测试结束时清理表（以防留下任何数据），
- 确保其他测试不会测试相同的内容（即先 grep）。
:::

### 限制测试运行 {#restricting-test-runs}

测试可以有零个或多个 _标签_，指定测试在 CI 中运行的上下文限制。

对于 `.sql` 测试，标签被放置在第一行作为 SQL 注释：

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

|标签名称 | 功能 | 用法示例 |
|---|---|---|
| `disabled`|  不运行测试 || 
| `long` | 测试执行时间从 1 扩展至 10 分钟 ||
| `deadlock` | 测试在循环中长期运行 ||
| `race` | 与 `deadlock` 相同。更倾向于使用 `deadlock` ||
| `shard` | 服务器需要监听 `127.0.0.*` ||
| `distributed` | 与 `shard` 相同。更倾向于使用 `shard` ||
| `global` | 与 `shard` 相同。更倾向于使用 `shard` ||
| `zookeeper` | 测试需要 Zookeeper 或 ClickHouse Keeper 运行 | 测试使用 `ReplicatedMergeTree` |
| `replica` | 与 `zookeeper` 相同。更倾向于使用 `zookeeper` ||
| `no-fasttest`|  测试在 [快速测试](continuous-integration.md#fast-test) 下不运行 | 测试使用 `MySQL` 表引擎，Fast 测试中禁用|
| `no-[asan, tsan, msan, ubsan]` | 在带有 [sanitizers](#sanitizers) 的构建中禁用测试 | 测试在 QEMU 下运行，不适用于 sanitizers |
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

除了上述设置，您还可以使用来自 `system.build_options` 的 `USE_*` 标志来定义使用某些 ClickHouse 功能。
例如，如果您的测试使用 MySQL 表，则应添加标签 `use-mysql`。

### 指定随机设置的限制 {#specifying-limits-for-random-settings}

测试可以指定可以在测试运行期间随机化的设置的最小和最大允许值。

对于 `.sh` 测试，限制作为注释写在标签旁边的行上或在未指定标签时写在第二行：

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签作为 SQL 注释放在标签旁旁的行上或在第一行：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果您只需要指定一个限制，则可以将另一个限制设置为 `None`。

### 选择测试名称 {#choosing-the-test-name}

测试的名称以五位数字前缀开头，后跟描述性名称，例如 `00422_hash_function_constexpr.sql`。
要选择前缀，请找到目录中已存在的最大前缀并将其加一。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

与此同时，可能会添加其他具有相同数字前缀的测试，但这没问题，并不会导致任何问题，您无需在之后进行更改。

### 检查必须发生的错误 {#checking-for-an-error-that-must-occur}

有时您希望测试不正确查询时是否发生服务器错误。我们支持特殊注释以用于此，在 SQL 测试中以以下形式：

```sql
select x; -- { serverError 49 }
```

此测试确保服务器返回关于未知列 `x` 的错误代码 49。
如果没有错误或错误不同，测试将失败。
如果您希望确保在客户端发生错误，请改用 `clientError` 注释。

不要检查错误消息的特定措辞，它可能会在将来发生变化，导致测试不必要地失败。
只检查错误代码。
如果现有的错误代码对您的需求不够精确，请考虑添加一个新代码。

### 测试分布式查询 {#testing-a-distributed-query}

如果您希望在功能测试中使用分布式查询，可以利用 `remote` 表函数，使用 `127.0.0.{1..2}` 地址让服务器查询自身；或可以在服务器配置文件中使用预定义的测试集群，如 `test_shard_localhost`。
请记得在测试名称中添加 `shard` 或 `distributed` 字眼，以便在 CI 中运行在正确的配置下，其中服务器配置为支持分布式查询。

### 使用临时文件 {#working-with-temporary-files}

有时在 shell 测试中，您可能需要动态创建一个文件进行操作。
请记住，某些 CI 检查会并行运行测试，因此，如果您在脚本中创建或删除临时文件而没有使用唯一名称，这可能导致某些 CI 检查（例如 Flaky）失败。
为了解决此问题，您应使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME` 给正在运行的测试创建的临时文件一个唯一名称。
这样，可以确保您在设置过程中创建或在清理过程中删除的文件是该测试唯一使用的文件，而不是并行运行的其他测试使用的文件。

## 已知错误 {#known-bugs}

如果我们知道可以通过功能测试轻松重现的某些错误，我们会将准备好的功能测试放在 `tests/queries/bugs` 目录中。
这些测试将在修复错误后移至 `tests/queries/0_stateless`。

## 集成测试 {#integration-tests}

集成测试允许在集群配置中测试 ClickHouse 以及 ClickHouse 与其他服务器之间的交互，比如 MySQL、Postgres、MongoDB。
它们有用来模拟网络分裂、数据包丢失等。
这些测试是在 Docker 下运行，并创建多个包含各种软件的容器。

请参见 `tests/integration/README.md` 以了解如何运行这些测试。

请注意，ClickHouse 与第三方驱动程序的集成未经过测试。
此外，我们目前没有与我们的 JDBC 和 ODBC 驱动程序的集成测试。

## 单元测试 {#unit-tests}

单元测试在您想要测试不作为整体的 ClickHouse，而是单个孤立库或类时非常有用。
您可以使用 `ENABLE_TESTS` CMake 选项启用或禁用测试构建。
单元测试（以及其他测试程序）位于代码的 `tests` 子目录中。
要运行单元测试，输入 `ninja test`。
一些测试使用 `gtest`，但某些测试只是返回测试失败时的非零退出代码的程序。

如果代码已经由功能测试覆盖（而且功能测试通常更简单实用），那么就没有必要进行单元测试。

您可以通过直接调用可执行文件来运行单独的 gtest 检查，例如：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## 性能测试 {#performance-tests}

性能测试允许测量和比较 ClickHouse 在合成查询中的某些孤立部分的性能。
性能测试位于 `tests/performance/`。
每个测试用 `.xml` 文件表示，文件中包含测试用例的描述。
使用 `docker/test/performance-comparison` 工具运行测试。有关调用的详细信息，请参见自述文件。

每个测试在循环中运行一个或多个查询（可能是参数组合）。

如果您想要提升 ClickHouse 在某些场景下的性能，并且如果在简单查询中可以观察到改善，强烈建议您编写性能测试。
此外，当您添加或修改相对孤立且不太复杂的 SQL 函数时，也建议编写性能测试。
在测试期间使用 `perf top` 或其他 `perf` 工具总是有意义的。

## 测试工具和脚本 {#test-tools-and-scripts}

`tests` 目录中的某些程序不是准备好的测试，而是测试工具。
例如，对于 `Lexer`，有一个工具 `src/Parsers/tests/lexer`，它仅对标准输入进行标记化并将上色的结果写入标准输出。
您可以将这些工具用作代码示例和探索手动测试。

## 杂项测试 {#miscellaneous-tests}

在 `tests/external_models` 中有机器学习模型的测试。
这些测试未被更新，必须转移到集成测试中。

还有一个针对法定插入的单独测试。
这个测试在独立服务器上运行 ClickHouse 集群并模拟各种故障情况：网络分裂、数据包丢失（在 ClickHouse 节点之间、ClickHouse 和 ZooKeeper 之间、ClickHouse 服务器和客户端之间等）、`kill -9`、`kill -STOP` 和 `kill -CONT`，类似 [Jepsen](https://aphyr.com/tags/Jepsen)。然后测试检查所有确认的插入是否已写入，并且所有拒绝的插入都未写入。

法定测试是由在 ClickHouse 开源之前的一个独立团队编写的。
该团队现在不再参与 ClickHouse。
测试是意外用 Java 编写的。
由于这些原因，法定测试必须重写并移至集成测试。

## 手动测试 {#manual-testing}

在您开发新功能时，手动测试一下也是合理的。
您可以按以下步骤进行：

构建 ClickHouse。从终端运行 ClickHouse：更改目录到 `programs/clickhouse-server` 并使用 `./clickhouse-server` 运行。它将默认使用当前目录中的配置（`config.xml`、`users.xml`以及 `config.d` 和 `users.d` 目录中的文件）。要连接到 ClickHouse 服务器，运行 `programs/clickhouse-client/clickhouse-client`。

请注意，所有 clickhouse 工具（服务器、客户端等）都是指向单个名为 `clickhouse` 的二进制文件的符号链接。
您可以在 `programs/clickhouse` 中找到此二进制文件。
所有工具也可以使用 `clickhouse tool` 而不是 `clickhouse-tool` 来调用。

或者，您可以安装 ClickHouse 包：从 ClickHouse 仓库中获取稳定版本，或者从 ClickHouse 源代码根目录使用 `./release` 为自己构建包。
然后，通过 `sudo clickhouse start` 启动服务器（或停止服务器）。
查看日志文件 `/etc/clickhouse-server/clickhouse-server.log`。

当 ClickHouse 已安装在系统上时，您可以构建一个新的 `clickhouse` 二进制文件并替换现有的二进制文件：

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

您还可以停止系统中的 clickhouse-server，并使用相同的配置但将日志记录到终端运行自己的实例：

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例：

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统中的 clickhouse-server 已在运行，并且您不想停止它，您可以更改 `config.xml` 中的端口号（或在 `config.d` 目录中的文件中覆盖它们），提供适当的数据路径并运行它。

`clickhouse` 二进制文件几乎没有依赖，并且可以在多种 Linux 发行版上运行。
要快速而粗略地测试您的更改，您只需将新构建的 `clickhouse` 二进制文件 `scp` 传送到服务器，然后像上面的示例那样运行它。

## 构建测试 {#build-tests}

构建测试可以检查在各种替代配置和某些外国系统上构建是否未损坏。
这些测试也是自动化的。

示例：
- 为 Darwin x86_64 交叉编译（macOS）
- 为 FreeBSD x86_64 交叉编译
- 为 Linux AArch64 交叉编译
- 在 Ubuntu 上使用系统包中的库构建（不推荐）
- 使用共享链接库构建（不推荐）

例如，使用系统包构建是坏习惯，因为我们无法保证系统将具有确切版本的包。
但这确实是 Debian 维护者所需要的。
因此，我们至少必须支持这种构建变体。
另一个示例是，共享链接是常见的麻烦源，但在某些爱好者中是必需的。

尽管我们无法在所有构建变体上运行所有测试，但我们希望至少检查各种构建变体没有损坏。
为此，我们使用构建测试。

我们还测试没有太长的翻译单元来编译或需要太多的内存。

我们还测试没有太大的栈帧。

## 测试协议兼容性 {#testing-for-protocol-compatibility}

当我们扩展 ClickHouse 网络协议时，我们手动测试旧的 clickhouse-client 是否可以与新的 clickhouse-server 兼容，新版本的 clickhouse-client 是否能够与旧版本的 clickhouse-server 兼容（只需运行相应包中的二进制文件）。

我们还通过集成测试自动测试一些情况：
- 由旧版本 ClickHouse 写入的数据是否可以被新版本成功读取；
- 不同 ClickHouse 版本的集群中，分布式查询是否可以正常工作。

## 编译器提供的帮助 {#help-from-the-compiler}

主要 ClickHouse 代码（位于 `src` 目录中）是通过 `-Wall -Wextra -Werror` 构建的，并启用了一些额外的警告。
虽然这些选项并未启用于第三方库。

Clang 有更有用的警告——您可以通过 `-Weverything` 查找它们并选择某些默认构建。

我们始终使用 clang 来构建 ClickHouse，适用于开发和生产。
您可以在自己的机器上以调试模式构建（以节省笔记本电池），但请注意，编译器在使用 `-O3` 时能够生成更多警告，因为其对控制流和过程间分析有更好的控制。
在调试模式下使用 clang 构建时，将使用调试版本的 `libc++`，可以在运行时捕获更多错误。

## Sanitizers {#sanitizers}

:::note
如果在本地运行时，进程（ClickHouse 服务器或客户端）在启动时崩溃，您可能需要禁用地址空间布局随机化：`sudo sysctl kernel.randomize_va_space=0`
:::

### 地址清理器 {#address-sanitizer}

我们在每个提交基础下以 ASan 运行功能、集成、压力和单元测试。

### 线程清理器 {#thread-sanitizer}

我们在每个提交基础下以 TSan 运行功能、集成、压力和单元测试。

### 内存清理器 {#memory-sanitizer}

我们在每个提交基础下以 MSan 运行功能、集成、压力和单元测试。

### 未定义行为清理器 {#undefined-behaviour-sanitizer}

我们在每个提交基础下以 UBSan 运行功能、集成、压力和单元测试。
某些第三方库的代码未进行 UB 清理。

### Valgrind（内存检查） {#valgrind-memcheck}

我们曾在 Valgrind 下过夜运行功能测试，但现在不再这样做。
这需要多个小时。
目前在 `re2` 函数库中有一个已知误报，详见 [这篇文章](https://research.swtch.com/sparse)。

## 模糊测试 {#fuzzing}

ClickHouse 模糊测试既使用 [libFuzzer](https://llvm.org/docs/LibFuzzer.html)，也使用随机 SQL 查询。
所有模糊测试均应使用清理器（地址和未定义）。

LibFuzzer 用于库代码的孤立模糊测试。
模糊测试器作为测试代码的一部分实现并具有 "_fuzzer" 后缀。
可以在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 中找到模糊测试的示例。
LibFuzzer 特定的配置、字典和语料都存储在 `tests/fuzz` 中。
我们鼓励您为每个处理用户输入的功能编写模糊测试。

模糊测试器默认不构建。
要构建模糊测试器，必须同时设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。
我们建议在构建模糊测试器时禁用 Jemalloc。
配置用于将 ClickHouse 模糊测试集成到 Google OSS-Fuzz 的信息可以在 `docker/fuzz` 中找到。

我们还使用简单的模糊测试生成随机的 SQL 查询，以检查服务器在执行它们时不会崩溃。
您可以在 `00746_sql_fuzzy.pl` 中找到这个测试。
此测试应持续运行（过夜及更长时间）。

我们还使用复杂的基于 AST 的查询模糊测试器，能够找到大量的边缘情况。
它在查询 AST 中进行随机置换和替换。
它会记住先前测试中的 AST 节点，以便在以随机顺序处理后续测试时使用。
您可以在 [这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house) 中了解该模糊测试器的更多信息。

## 压力测试 {#stress-test}

压力测试是另一种模糊测试。
它在单个服务器上以随机顺序并行运行所有功能测试。
测试结果未被检查。

检测的情况包括：
- 服务器不会崩溃，不会触发调试或清理器陷阱；
- 没有死锁；
- 数据库结构是一致的；
- 服务器可以在测试后成功停止并再次启动而没有异常。

有五种变体（调试版、ASan、TSan、MSan、UBSan）。

## 线程模糊器 {#thread-fuzzer}

线程模糊器（请不要与线程清理器混淆）是另一种模糊测试，允许随机化线程执行的顺序。
它有助于发现更多特殊情况。

## 安全审计 {#security-audit}

我们的安全团队对 ClickHouse 的能力从安全角度进行了基本概述。

## 静态分析器 {#static-analyzers}

我们在每个提交基础下运行 `clang-tidy`。
同时启用了 `clang-static-analyzer` 检查。
`clang-tidy` 也用于某些样式检查。

我们评估了 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL`。
您将在 `tests/instructions/` 目录中找到使用说明。

如果您使用 `CLion` 作为 IDE，您可以立即使用一些 `clang-tidy` 检查。

我们还使用 `shellcheck` 进行 shell 脚本的静态分析。

## 加固 {#hardening}

在调试构建中，我们使用自定义分配器，对用户级分配进行 ASLR。

我们还手动保护预计在分配后将保持只读的内存区域。

在调试构建中，我们还涉及了 libc 的定制，确保不会调用“有害”（过时、不安全、非线程安全）的函数。

调试断言得到广泛使用。

在调试构建中，如果抛出具有“逻辑错误”代码的异常（意味着存在 bug），程序会提前终止。
这允许在发布构建中使用异常，但在调试构建中将其视为断言。

调试版本的 jemalloc 被用于调试构建。
调试版本的 libc++ 被用于调试构建。

## 运行时完整性检查 {#runtime-integrity-checks}

存储在磁盘上的数据都进行了校验和计算。
MergeTree 表中的数据以三种方式同时进行校验和计算（压缩数据块、解压缩数据块、跨块总校验和）。
在客户端和服务器之间或服务器之间传输的数据也进行了校验和计算。
复制确保副本上的数据按位相同。

这确保保护免受故障硬件（存储介质中的位腐蚀、服务器的 RAM 中的位翻转、网络控制器的 RAM 中的位翻转、网络交换机的 RAM 中的位翻转、客户端的 RAM 中的位翻转、传输过程中的位翻转）。
请注意，位翻转是常见的，并且可能会发生，即使在 ECC RAM 存在的情况下以及针对 TCP 校验和的实际操作（如果您能够在每天处理数PB数据的数千台服务器中运行）。
[请观看视频（俄语）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供诊断，帮助运维工程师找到故障硬件。

\* 并且并不慢。

## 代码风格 {#code-style}

代码风格规则在 [此处](style.md) 描述。

要检查某些常见造型违规行为，您可以使用 `utils/check-style` 脚本。

要强制代码采用正确的风格，您可以使用 `clang-format`。
文件 `.clang-format` 位于源代码根目录。
它大致与我们的实际代码风格一致。
但不推荐将 `clang-format` 应用到现有文件，因为它会使格式变得更糟。
您可以使用 `clang-format-diff` 工具来处理在 clang 源代码库中找到的格式差异。

另外，您可以尝试使用 `uncrustify` 工具重新格式化代码。
配置位于源代码根目录的 `uncrustify.cfg` 中。
它的测试较少，程度也不如 `clang-format`。

`CLion` 有自己的代码格式化工具，需要针对我们的代码风格进行调整。

我们还使用 `codespell` 查找代码中的拼写错误。
这也是自动化的。

## 测试覆盖率 {#test-coverage}

我们还跟踪测试覆盖率，但仅针对功能测试，并且仅针对 clickhouse-server。
这每天进行一次。

## 测试的测试 {#tests-for-tests}

我们自动检查不稳定的测试。
它运行所有新测试 100 次（功能测试）或 10 次（集成测试）。
如果至少有一次测试失败，则认为其是不稳定的。

## 测试自动化 {#test-automation}

我们使用 [GitHub Actions](https://github.com/features/actions) 运行测试。

构建作业和测试在每个提交的基础上在沙箱中运行。
生成的包和测试结果被发布到 GitHub，可以通过直接链接下载。
工件存储几个月。
当您在 GitHub 上发送拉取请求时，我们将其标记为“可以测试”，我们的 CI 系统将为您构建 ClickHouse 包（发布、调试、带地址清理器等）。


