---
description: '测试 ClickHouse 和运行测试套件指南'
sidebar_label: '测试'
sidebar_position: 40
slug: /development/tests
title: '测试 ClickHouse'
doc_type: 'guide'
---

# 测试 ClickHouse {#testing-clickhouse}

## 功能测试 {#functional-tests}

功能测试是最简单、最易使用的一类测试。
ClickHouse 的大部分特性都可以通过功能测试来验证，并且对于每一个可以用这种方式测试的 ClickHouse 代码变更，功能测试都是必需的。

每个功能测试都会向正在运行的 ClickHouse 服务器发送一个或多个查询，并将结果与基准结果进行比较。

测试位于 `./tests/queries` 目录中。

每个测试可以是两种类型之一：`.sql` 和 `.sh`。

* `.sql` 测试是通过管道传递给 `clickhouse-client` 的简单 SQL 脚本。
* `.sh` 测试是一个自行运行的脚本。

通常应优先使用 SQL 测试，而不是 `.sh` 测试。
只有当你必须测试某些无法仅通过纯 SQL 触发的功能时，才应使用 `.sh` 测试，例如通过管道向 `clickhouse-client` 传入一些输入数据，或者测试 `clickhouse-local`。

:::note
在测试 `DateTime` 和 `DateTime64` 数据类型时，一个常见错误是误以为服务器会使用某个特定时区（例如 “UTC”）。实际情况并非如此，在 CI 测试运行中，时区是被刻意随机化的。最简单的解决办法是为测试值显式指定时区，例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 在本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器，并监听默认端口（9000）。
例如，要运行测试 `01428_hash_set_nan_key`，切换到代码仓库目录并执行以下命令：

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果（`stderr` 和 `stdout`）会写入文件 `01428_hash_set_nan_key.[stderr|stdout]` 中，这些文件与测试本身位于同一目录下（对于 `queries/0_stateless/foo.sql`，输出将位于 `queries/0_stateless/foo.stdout` 中）。

有关 `clickhouse-test` 的所有选项，请参阅 `tests/clickhouse-test --help`。
可以运行全部测试，或者通过为测试名称提供过滤字符串来运行部分测试：`./clickhouse-test substring`。
也可以选择并行运行测试，或以随机顺序运行测试。

### 添加新测试 {#adding-a-new-test}

要添加新测试，首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。
然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成对应的 `.reference` 文件。

测试只能对预先自动创建好的 `test` 数据库中的表执行创建、删除、查询等操作。
可以使用临时表。

要在本地搭建与 CI 中相同的环境，请安装测试配置（这些配置会使用 Zookeeper 的 mock 实现并调整部分设置）。

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应当

* 尽量精简：只创建最少必需的表、列和必要的复杂度，
* 快速：耗时不应超过几秒（最好是亚秒级），
* 正确且具有确定性：当且仅当被测功能不工作时才失败，
* 隔离/无状态：不要依赖环境和时间，
* 全面：覆盖零值、null、空集、异常等边界情况（负向测试请使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }`），
* 在测试结束时清理表（以防有残留），
* 确保其他测试不会测试相同内容（即先用 grep 检查）。
  :::

### 限制测试运行 {#restricting-test-runs}

一个测试可以具有零个或多个*标签*，用于指定该测试在 CI 中在哪些上下文中运行。

对于 `.sql` 测试，标签以 SQL 注释的形式放在第一行：

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

对于 `.sh` 测试，标签写在第二行的注释中：

```bash
#!/usr/bin/env bash
# Tags: no-fasttest, no-replicated-database
# - no-fasttest: <provide_a_reason_for_the_tag_here>
# - no-replicated-database: <provide_a_reason_here>
```

可用标签列表：

| Tag name                          | 功能说明                                                       | 使用示例                                    |
| --------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| `disabled`                        | 不运行该测试                                                     |                                         |
| `long`                            | 将测试的执行时间从 1 分钟延长到 10 分钟                                    |                                         |
| `deadlock`                        | 将测试长时间循环运行                                                 |                                         |
| `race`                            | 与 `deadlock` 相同。优先使用 `deadlock`                            |                                         |
| `shard`                           | 要求服务器监听 `127.0.0.*`                                        |                                         |
| `distributed`                     | 与 `shard` 相同。优先使用 `shard`                                  |                                         |
| `global`                          | 与 `shard` 相同。优先使用 `shard`                                  |                                         |
| `zookeeper`                       | 测试需要 Zookeeper 或 ClickHouse Keeper 才能运行                    | 测试使用 `ReplicatedMergeTree`              |
| `replica`                         | 与 `zookeeper` 相同。优先使用 `zookeeper`                          |                                         |
| `no-fasttest`                     | 在 [Fast test](continuous-integration.md#fast-test) 中不运行该测试 | 测试使用在 Fast test 中被禁用的 `MySQL` 表引擎       |
| `fasttest-only`                   | 仅在 [Fast test](continuous-integration.md#fast-test) 中运行该测试 |                                         |
| `no-[asan, tsan, msan, ubsan]`    | 在带有 [sanitizers](#sanitizers) 的构建中禁用该测试                    | 测试在 QEMU 下运行，而 QEMU 无法与 sanitizers 配合使用 |
| `no-replicated-database`          |                                                            |                                         |
| `no-ordinary-database`            |                                                            |                                         |
| `no-parallel`                     | 禁止与其他测试并行运行                                                | 测试从 `system` 表读取数据，可能破坏不变式              |
| `no-parallel-replicas`            |                                                            |                                         |
| `no-debug`                        |                                                            |                                         |
| `no-stress`                       |                                                            |                                         |
| `no-polymorphic-parts`            |                                                            |                                         |
| `no-random-settings`              |                                                            |                                         |
| `no-random-merge-tree-settings`   |                                                            |                                         |
| `no-backward-compatibility-check` |                                                            |                                         |
| `no-cpu-x86_64`                   |                                                            |                                         |
| `no-cpu-aarch64`                  |                                                            |                                         |
| `no-cpu-ppc64le`                  |                                                            |                                         |
| `no-s3-storage`                   |                                                            |                                         |

除上述设置外，你还可以使用 `system.build_options` 中的 `USE_*` 标志来定义是否使用特定的 ClickHouse 特性。
例如，如果你的测试使用了 MySQL 表，则应添加标签 `use-mysql`。

### 为随机设置指定限制 {#specifying-limits-for-random-settings}

测试可以为在测试运行期间被随机化的设置指定允许的最小值和最大值。

对于 `.sh` 测试，限制写为一条注释，放在标签所在行的后面；如果没有指定标签，则放在第二行注释中：

```bash
#!/usr/bin/env bash
# Tags: no-fasttest
# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签以 SQL 注释的形式写在相邻的一行，或写在第一行：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果你只需要指定其中一个限制值，可以将另一个设置为 `None`。

### 选择测试名称 {#choosing-the-test-name}

测试名称以五位数字前缀开头，后面跟一个描述性名称，例如 `00422_hash_function_constexpr.sql`。
要选择前缀，先在目录中找到已经存在的最大前缀，然后将其加一。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

与此同时，可能会添加一些具有相同数字前缀的其他测试，但这没问题，不会导致任何问题，你之后也不需要对其进行修改。

### 检查必须出现的错误 {#checking-for-an-error-that-must-occur}

有时你希望测试，当查询不正确时会出现服务器错误。我们在 SQL 测试中为此提供了特殊注解，形式如下：

```sql
SELECT x; -- { serverError 49 }
```

此测试用于确保服务器返回关于未知列 `x` 的、错误码为 49 的错误。
如果没有错误，或者错误不同，则测试会失败。
如果你想确保在客户端一侧触发错误，请使用 `clientError` 注解。

不要检查错误消息的具体措辞，因为它将来可能会改变，从而导致测试不必要地失败。
只检查错误码。
如果现有的错误码对你的需求不够精确，可以考虑新增一个错误码。

### 测试分布式查询 {#testing-a-distributed-query}

如果你想在功能测试中使用分布式查询，可以使用 `remote` 表函数，并使用 `127.0.0.{1..2}` 这些地址让服务器查询自身；或者你也可以在服务器配置文件中使用预定义的测试集群，例如 `test_shard_localhost`。
记得在测试名称中加入 `shard` 或 `distributed` 这样的关键词，以便在 CI 中在正确的配置下运行该测试，即服务器已配置为支持分布式查询。

### 使用临时文件 {#working-with-temporary-files}

有时在 shell 测试中，你可能需要临时创建一个文件用于操作。
请注意，某些 CI 检查会并行运行测试，因此如果你在脚本中创建或删除的临时文件没有唯一名称，就可能导致某些 CI 检查（例如 “Flaky”）失败。
为避免这种情况，你应当使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME`，为临时文件赋予一个对正在运行的测试来说唯一的名称。
这样你就可以确信，在设置阶段创建或在清理阶段删除的文件只被该测试使用，而不是被其他并行运行的测试所使用的文件。

## 已知缺陷 {#known-bugs}

如果我们已经发现一些可以通过功能测试轻松复现的缺陷，就会将准备好的功能测试放在 `tests/queries/bugs` 目录中。
当这些缺陷被修复后，这些测试将被移动到 `tests/queries/0_stateless` 目录中。

## 集成测试 {#integration-tests}

集成测试用于在集群配置下测试 ClickHouse，以及测试 ClickHouse 与其他服务器（如 MySQL、Postgres、MongoDB）的交互。
它们对于模拟网络分区、数据包丢失等情况非常有用。
这些测试在 Docker 中运行，并创建多个包含不同软件的容器。

有关如何运行这些测试，请参阅 `tests/integration/README.md`。

请注意，并不会测试 ClickHouse 与第三方驱动程序的集成。
此外，我们目前没有针对 JDBC 和 ODBC 驱动程序的集成测试。

## 单元测试 {#unit-tests}

当你希望测试的不是整个 ClickHouse，而是某个独立的库或类时，单元测试会非常有用。
你可以通过 `ENABLE_TESTS` CMake 选项来启用或禁用测试的构建。
单元测试（以及其他测试程序）位于代码中的 `tests` 子目录下。
要运行单元测试，输入 `ninja test`。
有些测试使用 `gtest`，但有些只是程序，在测试失败时返回非零退出码。

如果代码已经被功能测试覆盖（而且功能测试通常更简单易用），那么单元测试就不是必需的。

你可以通过直接调用可执行文件来运行单个 gtest 用例，例如：

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## 性能测试 {#performance-tests}

性能测试用于在构造的（合成）查询上测量和比较 ClickHouse 某些独立部分的性能。
性能测试位于 `tests/performance/`。
每个测试由一个 `.xml` 文件表示，其中包含测试用例的描述。
测试通过 `docker/test/performance-comparison` 工具运行。调用方式请参阅 README 文件。

每次测试会在循环中运行一个或多个查询（可能带有不同的参数组合）。

如果你希望在某种场景下改进 ClickHouse 的性能，并且这些改进可以在简单查询上观察到，强烈建议编写性能测试。
当你添加或修改相对独立且不太复杂的 SQL 函数时，也推荐编写性能测试。
在测试过程中使用 `perf top` 或其他 `perf` 工具始终是有帮助的。

## 测试工具和脚本 {#test-tools-and-scripts}

`tests` 目录中的某些程序并不是预先编写好的测试，而是测试工具。
例如，对于 `Lexer`，有一个工具 `src/Parsers/tests/lexer`，它只对 stdin 做词法分析，并将着色后的结果写入 stdout。
你可以将这类工具用作代码示例，也可用于探索和手动测试。

## 其他测试 {#miscellaneous-tests}

在 `tests/external_models` 中有针对机器学习模型的测试。
这些测试目前不再维护，必须迁移为集成测试。

有一个单独的测试用于 quorum 插入。
该测试在独立的服务器上运行 ClickHouse 集群，并模拟各种故障场景：网络分裂、丢包（ClickHouse 节点之间、ClickHouse 与 ZooKeeper 之间、ClickHouse 服务器与客户端之间等）、`kill -9`、`kill -STOP` 和 `kill -CONT`，类似 [Jepsen](https://aphyr.com/tags/Jepsen)。然后该测试检查，所有已确认的插入是否都已写入，以及所有被拒绝的插入是否都未写入。

Quorum 测试是在 ClickHouse 开源之前由一个独立团队编写的。
该团队已不再参与 ClickHouse 的工作。
该测试当时是意外地用 Java 编写的。
出于上述原因，需要将 quorum 测试重写并迁移为集成测试。

## 手动测试 {#manual-testing}

在开发新功能时，对其进行手动测试也是合理的。
你可以按照以下步骤进行：

构建 ClickHouse。从终端运行 ClickHouse：切换目录到 `programs/clickhouse-server` 并通过 `./clickhouse-server` 运行它。默认情况下，它会使用当前目录中的配置（`config.xml`、`users.xml` 以及 `config.d` 和 `users.d` 目录中的文件）。要连接到 ClickHouse 服务器，运行 `programs/clickhouse-client/clickhouse-client`。

请注意，所有 ClickHouse 工具（server、client 等）实际上都只是指向名为 `clickhouse` 的单个二进制文件的符号链接。
你可以在 `programs/clickhouse` 中找到这个二进制文件。
所有工具也都可以通过 `clickhouse tool` 的方式调用，而不是 `clickhouse-tool`。

另外，你也可以安装 ClickHouse 软件包：可以从 ClickHouse 软件仓库安装稳定版发布，或者在 ClickHouse 源码根目录中通过 `./release` 自行构建软件包。
然后通过 `sudo clickhouse start` 启动服务器（或使用 `sudo clickhouse stop` 来停止服务器）。
在 `/etc/clickhouse-server/clickhouse-server.log` 中查看日志。

当你的系统上已经安装了 ClickHouse 时，你可以构建一个新的 `clickhouse` 二进制文件并替换现有的二进制文件：

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

你也可以先停止系统中的 clickhouse-server 服务，然后在使用相同配置的情况下自行启动一个实例，并将日志输出到终端：

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例：

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统中的 clickhouse-server 已经在运行，并且你不想停止它，可以在你的 `config.xml` 中修改端口号（或在 `config.d` 目录中的文件里覆盖这些端口），指定合适的数据路径，然后运行它。

`clickhouse` 二进制可执行文件几乎没有依赖，并且可以在各种 Linux 发行版上运行。
为了在服务器上快速、临时地测试你的修改，你可以直接通过 `scp` 将新构建好的 `clickhouse` 二进制文件复制到服务器上，然后按上述示例的方式运行它。

## 构建测试 {#build-tests}

构建测试用于检查在各种替代配置和某些其他系统上，构建是否正常、不出问题。
这些测试同样是自动化执行的。

示例：
- 为 Darwin x86_64（macOS）进行交叉编译
- 为 FreeBSD x86_64 进行交叉编译
- 为 Linux AArch64 进行交叉编译
- 在 Ubuntu 上使用系统软件包中的库进行构建（不推荐）
- 使用共享库链接方式进行构建（不推荐）

例如，使用系统软件包进行构建是一种不好的实践，因为我们无法保证系统中会有哪些软件包以及它们的确切版本。
但 Debian 维护者确实需要这样做。
因此，我们至少必须支持这种构建方式。
另一个例子：共享库链接是常见的问题来源，但有些爱好者仍然需要它。

尽管我们无法在所有构建变体上运行全部测试，但我们至少希望确保各种构建变体本身没有问题。
为此我们使用构建测试。

我们还会测试不存在过长、以至于难以编译或需要过多内存的翻译单元。

我们也会测试不存在过大的栈帧。

## 测试协议兼容性 {#testing-for-protocol-compatibility}

在对 ClickHouse 网络协议进行扩展时，我们会手动测试旧版本的 clickhouse-client 是否能与新版本的 clickhouse-server 一起工作，以及新版本的 clickhouse-client 是否能与旧版本的 clickhouse-server 一起工作（只需运行相应软件包中的二进制文件）。

我们还通过集成测试自动验证部分情况：
- 旧版本 ClickHouse 写入的数据是否可以被新版本成功读取；
- 在包含不同 ClickHouse 版本的集群中，分布式查询是否可以正常工作。

## 来自编译器的帮助 {#help-from-the-compiler}

主 ClickHouse 代码（位于 `src` 目录）是在启用 `-Wall -Wextra -Werror` 以及若干额外警告的情况下进行构建的。
不过，这些选项不会对第三方库启用。

Clang 提供了更多有用的警告选项——可以通过 `-Weverything` 查看全部警告，然后选择一部分作为默认构建配置。

我们在开发和生产环境中一律使用 clang 来构建 ClickHouse。
可以在本机以调试模式进行构建（以节省笔记本电脑电量），但请注意，编译器在使用 `-O3` 时，由于具备更好的控制流和过程间分析能力，能够生成更多警告。
在使用 clang 以调试模式进行构建时，将会使用 `libc++` 的调试版本，从而可以在运行时捕获更多错误。

## Sanitizer 工具 {#sanitizers}

:::note
如果在本地运行时进程（ClickHouse 服务器或客户端）在启动时崩溃，可能需要禁用地址空间布局随机化：`sudo sysctl kernel.randomize_va_space=0`
:::

### Address sanitizer {#address-sanitizer}

我们会在每次提交时，使用 ASan 运行功能测试、集成测试、压力测试和单元测试。

### Thread sanitizer {#thread-sanitizer}

我们会在每次提交时，使用 TSan 运行功能测试、集成测试、压力测试和单元测试。

### Memory sanitizer {#memory-sanitizer}

我们会在每次提交时，使用 MSan 运行功能测试、集成测试、压力测试和单元测试。

### Undefined behaviour sanitizer {#undefined-behaviour-sanitizer}

我们会在每次提交时，使用 UBSan 运行功能测试、集成测试、压力测试和单元测试。
某些第三方库的代码未启用 UB Sanitizer。

### Valgrind (memcheck) {#valgrind-memcheck}

我们过去会使用 Valgrind 进行功能测试，并运行一整夜，但现在不再这样做。
这通常需要耗费数小时。
当前在 `re2` 库中有一个已知的误报，参见[这篇文章](https://research.swtch.com/sparse)。

## 模糊测试 {#fuzzing}

ClickHouse 的模糊测试既通过 [libFuzzer](https://llvm.org/docs/LibFuzzer.html) 实现，也通过随机 SQL 查询实现。
所有模糊测试都应在启用 Sanitizer（AddressSanitizer 和 UndefinedBehaviorSanitizer）的情况下运行。

LibFuzzer 用于对库代码进行隔离的模糊测试。
模糊器作为测试代码的一部分实现，名称以 `_fuzzer` 作为后缀。
模糊器示例可在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 中找到。
LibFuzzer 专用的配置、字典和语料库存放在 `tests/fuzz` 中。
我们鼓励你为所有处理用户输入的功能编写模糊测试。

模糊器默认不会被构建。
要构建模糊器，需要同时设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。
我们建议在构建模糊器时禁用 Jemalloc。
用于将 ClickHouse 模糊测试集成到 Google OSS-Fuzz 的配置可以在 `docker/fuzz` 中找到。

我们还使用一个简单的模糊测试来生成随机 SQL 查询，并检查服务器在执行这些查询时不会崩溃。
你可以在 `00746_sql_fuzzy.pl` 中找到该测试。
此测试应持续运行（例如通宵及更长时间）。

我们还使用一个更为复杂的基于 AST 的查询模糊器，它能够发现大量边界情况。
它会对查询 AST 进行随机排列和替换。
它会记住前面测试中的 AST 节点，以便在后续测试中按随机顺序处理这些测试时，用这些节点继续进行模糊测试。
你可以在[这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house)中进一步了解此模糊器。

## 压力测试 {#stress-test}

压力测试是模糊测试的另一种形式。
它会在单个服务器上，以随机顺序并行运行所有功能性测试。
不会对测试结果本身进行检查。

会检查以下内容：
- 服务器不会崩溃，不会触发任何调试或 sanitizer 断点/陷阱；
- 不会出现死锁；
- 数据库结构保持一致；
- 测试结束后服务器可以正常停止，并且再次启动时不会抛出异常。

共有五种构建（Debug、ASan、TSan、MSan、UBSan）。

## 线程模糊测试器 {#thread-fuzzer}

线程模糊测试器（请不要与 Thread Sanitizer 混淆）是一种针对线程的模糊测试方式，用于随机化线程的执行顺序。
它有助于发现更多特殊边界情况。

## 安全审计 {#security-audit}

我们的安全团队从安全角度对 ClickHouse 的相关能力进行了初步评估。

## 静态分析器 {#static-analyzers}

我们在每次提交时运行 `clang-tidy`，并启用了 `clang-static-analyzer` 检查。
`clang-tidy` 也用于执行部分代码风格检查。

我们已经评估了 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL`。
你可以在 `tests/instructions/` 目录中找到使用说明。

如果你使用 `CLion` 作为 IDE，可以直接利用其中集成的部分 `clang-tidy` 检查。

我们还使用 `shellcheck` 对 shell 脚本进行静态分析。

## 加固 {#hardening}

在调试构建中，我们使用自定义分配器，对用户态内存分配执行 ASLR 随机化。

我们还会手动保护那些在分配后预期应为只读的内存区域。

在调试构建中，我们还对 libc 做了定制，以确保不会调用任何“有害的”（过时、不安全、非线程安全的）函数。

大量使用调试断言。

在调试构建中，如果抛出了带有 “logical error” 代码的异常（意味着存在 Bug），程序会被立即终止。
这使得在发布构建中可以继续使用异常，而在调试构建中则将其视为断言。

在调试构建中使用 jemalloc 的调试版本。
在调试构建中使用 libc++ 的调试版本。

## 运行时完整性检查 {#runtime-integrity-checks}

存储在磁盘上的数据都会进行校验和。
MergeTree 表中的数据会同时通过三种方式进行校验和*（压缩数据块、未压缩数据块、跨数据块的总校验和）。
在客户端与服务器之间或服务器之间通过网络传输的数据同样会进行校验和。
复制机制确保副本上的数据在比特级完全一致。

这是为了防范故障硬件（存储介质上的位腐烂 bit rot、服务器 RAM 中的比特翻转、网络控制器 RAM 中的比特翻转、网络交换机 RAM 中的比特翻转、客户端 RAM 中的比特翻转、传输线路上的比特翻转）。
请注意，比特翻转很常见，即使在使用 ECC RAM 且启用了 TCP 校验和的情况下也很可能发生（如果你运行成千上万台服务器，每天处理 PB 级数据）。
[观看视频（俄语）](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供诊断功能，帮助运维工程师发现故障硬件。

\* 而且这并不会很慢。

## 代码风格 {#code-style}

代码风格规则见[此处](style.md)。

要检查一些常见的风格违规情况，你可以使用 `utils/check-style` 脚本。

要使你的代码自动符合规范的风格，你可以使用 `clang-format`。
`.clang-format` 文件位于源代码根目录。
它大体上与我们实际的代码风格相对应。
但不推荐将 `clang-format` 应用于现有文件，因为这通常会使格式变得更糟。
你可以使用 `clang-format-diff` 工具，你可以在 clang 源码仓库中找到它。

或者，你也可以尝试使用 `uncrustify` 工具来重新格式化你的代码。
配置文件 `uncrustify.cfg` 位于源代码根目录。
它的测试不如 `clang-format` 充分。

`CLion` 有自带的代码格式化工具，需要根据我们的代码风格进行调整。

我们也使用 `codespell` 来查找代码中的拼写错误。
这也已经实现了自动化。

## 测试覆盖率 {#test-coverage}

我们也会统计测试覆盖率，但仅针对 clickhouse-server 的功能测试。
相关工作会按天执行。

## 测试的测试 {#tests-for-tests}

我们有一个用于检测不稳定测试的自动检查机制。
它会将所有新增的功能测试运行 100 次，或将所有新增的集成测试运行 10 次。
如果某个测试在这些运行中至少有一次失败，就会被视为不稳定测试。

## 测试自动化 {#test-automation}

我们使用 [GitHub Actions](https://github.com/features/actions) 来运行测试。

每次提交都会在 Sandbox 中运行构建任务和测试。
生成的软件包和测试结果会发布到 GitHub，并可通过直接链接下载。
构建产物会被保留数个月。
当你在 GitHub 上提交 pull request 时，我们会将其标记为“can be tested”，CI 系统会为你构建 ClickHouse 软件包（release、debug、带 address sanitizer 等）。
