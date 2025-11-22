---
description: '测试 ClickHouse 与运行测试套件的指南'
sidebar_label: '测试'
sidebar_position: 40
slug: /development/tests
title: '测试 ClickHouse'
doc_type: 'guide'
---



# 测试 ClickHouse



## 功能测试 {#functional-tests}

功能测试是最简单且最便于使用的测试方式。
ClickHouse 的大多数功能都可以通过功能测试进行测试,对于 ClickHouse 代码中每一个可以通过这种方式测试的变更,都必须使用功能测试。

每个功能测试会向运行中的 ClickHouse 服务器发送一个或多个查询,并将结果与参考结果进行比较。

测试位于 `./tests/queries` 目录中。

每个测试可以是以下两种类型之一:`.sql` 和 `.sh`。

- `.sql` 测试是通过管道传递给 `clickhouse-client` 的简单 SQL 脚本。
- `.sh` 测试是独立运行的脚本。

通常情况下,SQL 测试优于 `.sh` 测试。
只有当您需要测试某些无法通过纯 SQL 实现的功能时,才应使用 `.sh` 测试,例如将某些输入数据通过管道传递给 `clickhouse-client` 或测试 `clickhouse-local`。

:::note
在测试 `DateTime` 和 `DateTime64` 数据类型时,一个常见的错误是假设服务器使用特定的时区(例如 "UTC")。实际情况并非如此,CI 测试运行中的时区是故意随机化的。最简单的解决方法是显式指定测试值的时区,例如 `toDateTime64(val, 3, 'Europe/Amsterdam')`。
:::

### 在本地运行测试 {#running-a-test-locally}

在本地启动 ClickHouse 服务器,监听默认端口(9000)。
例如,要运行测试 `01428_hash_set_nan_key`,请切换到代码仓库文件夹并运行以下命令:

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

测试结果(`stderr` 和 `stdout`)会写入到与测试本身位于同一位置的文件 `01428_hash_set_nan_key.[stderr|stdout]` 中(对于 `queries/0_stateless/foo.sql`,输出将位于 `queries/0_stateless/foo.stdout`)。

有关 `clickhouse-test` 的所有选项,请参阅 `tests/clickhouse-test --help`。
您可以运行所有测试,也可以通过提供测试名称过滤器来运行测试子集:`./clickhouse-test substring`。
还有并行运行测试或以随机顺序运行测试的选项。

### 添加新测试 {#adding-a-new-test}

要添加新测试,首先在 `queries/0_stateless` 目录中创建一个 `.sql` 或 `.sh` 文件。
然后使用 `clickhouse-client < 12345_test.sql > 12345_test.reference` 或 `./12345_test.sh > ./12345_test.reference` 生成相应的 `.reference` 文件。

测试应该只在预先自动创建的数据库 `test` 中创建、删除、查询等表。
可以使用临时表。

要在本地设置与 CI 相同的环境,请安装测试配置(它们将使用 Zookeeper 模拟实现并调整某些设置)

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
测试应该:

- 最小化:仅创建最少必需的表、列和复杂度,
- 快速:不超过几秒钟(更好的是:亚秒级),
- 正确且确定性:当且仅当被测试的功能不工作时才失败,
- 隔离/无状态:不依赖环境和时序
- 全面:覆盖边界情况,如零值、空值、空集、异常(负面测试,使用语法 `-- { serverError xyz }` 和 `-- { clientError xyz }`),
- 在测试结束时清理表(以防有残留),
- 确保其他测试不会测试相同的内容(即先使用 grep 搜索)。
  :::

### 限制测试运行 {#restricting-test-runs}

一个测试可以有零个或多个 _标签_,用于指定测试在 CI 中运行的上下文限制。

对于 `.sql` 测试,标签作为 SQL 注释放置在第一行:

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <在此处提供标签的原因>
-- no-replicated-database: <在此处提供原因>

SELECT 1
```

对于 `.sh` 测试,标签作为注释写在第二行:


```bash
#!/usr/bin/env bash
# Tags: no-fasttest, no-replicated-database
# - no-fasttest: <在此提供该标签的原因>
# - no-replicated-database: <在此提供原因>
```

可用标签列表:

| 标签名称                          | 功能说明                                                            | 使用示例                                                 |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| `disabled`                        | 测试不会运行                                                         |                                                               |
| `long`                            | 测试执行时间从 1 分钟延长至 10 分钟                  |                                                               |
| `deadlock`                        | 测试在循环中长时间运行                                   |                                                               |
| `race`                            | 与 `deadlock` 相同。建议使用 `deadlock`                                   |                                                               |
| `shard`                           | 服务器需要监听 `127.0.0.*`                             |                                                               |
| `distributed`                     | 与 `shard` 相同。建议使用 `shard`                                         |                                                               |
| `global`                          | 与 `shard` 相同。建议使用 `shard`                                         |                                                               |
| `zookeeper`                       | 测试需要 Zookeeper 或 ClickHouse Keeper 才能运行                     | 测试使用 `ReplicatedMergeTree`                               |
| `replica`                         | 与 `zookeeper` 相同。建议使用 `zookeeper`                                 |                                                               |
| `no-fasttest`                     | 测试不在 [Fast test](continuous-integration.md#fast-test) 下运行  | 测试使用 `MySQL` 表引擎,该引擎在 Fast test 中被禁用 |
| `fasttest-only`                   | 测试仅在 [Fast test](continuous-integration.md#fast-test) 下运行 |                                                               |
| `no-[asan, tsan, msan, ubsan]`    | 在使用 [sanitizers](#sanitizers) 的构建中禁用测试                  | 测试在 QEMU 下运行,而 QEMU 不支持 sanitizers     |
| `no-replicated-database`          |                                                                         |                                                               |
| `no-ordinary-database`            |                                                                         |                                                               |
| `no-parallel`                     | 禁止与此测试并行运行其他测试                  | 测试从 `system` 表读取数据,可能会破坏不变性  |
| `no-parallel-replicas`            |                                                                         |                                                               |
| `no-debug`                        |                                                                         |                                                               |
| `no-stress`                       |                                                                         |                                                               |
| `no-polymorphic-parts`            |                                                                         |                                                               |
| `no-random-settings`              |                                                                         |                                                               |
| `no-random-merge-tree-settings`   |                                                                         |                                                               |
| `no-backward-compatibility-check` |                                                                         |                                                               |
| `no-cpu-x86_64`                   |                                                                         |                                                               |
| `no-cpu-aarch64`                  |                                                                         |                                                               |
| `no-cpu-ppc64le`                  |                                                                         |                                                               |
| `no-s3-storage`                   |                                                                         |                                                               |

除了上述设置外,您还可以使用 `system.build_options` 中的 `USE_*` 标志来定义特定 ClickHouse 功能的使用。
例如,如果您的测试使用 MySQL 表,则应添加标签 `use-mysql`。

### 为随机设置指定限制 {#specifying-limits-for-random-settings}

测试可以为在测试运行期间可随机化的设置指定允许的最小值和最大值。

对于 `.sh` 测试,限制以注释形式写在标签旁边的行上,如果未指定标签,则写在第二行:


```bash
#!/usr/bin/env bash
# Tags: no-fasttest
# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

对于 `.sql` 测试，标签以 SQL 注释的形式放置在标签所在行或第一行：

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

如果只需要指定一个限制，可以对另一个使用 `None`。

### 选择测试名称 {#choosing-the-test-name}

测试名称以五位数字前缀开头，后跟描述性名称，例如 `00422_hash_function_constexpr.sql`。
要选择前缀，请找到目录中已存在的最大前缀，然后将其加一。

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

在此期间，可能会添加一些具有相同数字前缀的其他测试，但这没有问题，不会导致任何冲突，您无需在之后更改它。

### 检查必须发生的错误 {#checking-for-an-error-that-must-occur}

有时您需要测试不正确的查询是否会触发服务器错误。我们在 SQL 测试中支持特殊注释，格式如下：

```sql
SELECT x; -- { serverError 49 }
```

此测试确保服务器返回代码为 49 的错误，提示未知列 `x`。
如果没有错误，或者错误代码不同，测试将失败。
如果您需要确保错误发生在客户端，请改用 `clientError` 注释。

不要检查错误消息的具体措辞，它可能会在将来更改，导致测试不必要地失败。
仅检查错误代码。
如果现有错误代码不够精确以满足您的需求，请考虑添加一个新的错误代码。

### 测试分布式查询 {#testing-a-distributed-query}

如果您需要在功能测试中使用分布式查询，可以利用 `remote` 表函数配合 `127.0.0.{1..2}` 地址让服务器查询自身；或者您可以使用服务器配置文件中预定义的测试集群，如 `test_shard_localhost`。
请记住在测试名称中添加 `shard` 或 `distributed` 字样，以便在 CI 中以正确的配置运行，确保服务器配置为支持分布式查询。

### 使用临时文件 {#working-with-temporary-files}

有时在 shell 测试中，您可能需要即时创建一个文件来使用。
请注意，某些 CI 检查会并行运行测试，因此如果您在脚本中创建或删除临时文件时没有使用唯一名称，这可能会导致某些 CI 检查（如 Flaky）失败。
为了避免这个问题，您应该使用环境变量 `$CLICKHOUSE_TEST_UNIQUE_NAME` 为临时文件提供一个对正在运行的测试唯一的名称。
这样，您可以确保在设置期间创建或在清理期间删除的文件仅由该测试使用，而不会与并行运行的其他测试冲突。


## 已知缺陷 {#known-bugs}

如果我们发现某些缺陷可以通过功能测试轻松复现,我们会将准备好的功能测试放置在 `tests/queries/bugs` 目录中。
当缺陷修复后,这些测试将被移动到 `tests/queries/0_stateless` 目录。


## 集成测试 {#integration-tests}

集成测试用于测试 ClickHouse 的集群配置,以及 ClickHouse 与其他服务器(如 MySQL、Postgres、MongoDB)的交互。

这些测试可用于模拟网络分区、数据包丢失等场景。

这些测试在 Docker 环境下运行,会创建多个包含不同软件的容器。

有关如何运行这些测试,请参阅 `tests/integration/README.md`。

请注意,ClickHouse 与第三方驱动程序的集成未包含在测试范围内。

此外,我们目前也没有针对 JDBC 和 ODBC 驱动程序的集成测试。


## 单元测试 {#unit-tests}

当您需要测试单个独立的库或类,而非整个 ClickHouse 时,单元测试非常有用。
您可以通过 `ENABLE_TESTS` CMake 选项启用或禁用测试构建。
单元测试(及其他测试程序)位于代码库各处的 `tests` 子目录中。
运行单元测试,请执行 `ninja test`。
部分测试使用 `gtest`,另一部分则是在测试失败时返回非零退出码的程序。

如果代码已被功能测试覆盖,则无需编写单元测试(且功能测试通常更简单易用)。

您可以直接调用可执行文件来运行单个 gtest 检查,例如:

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```


## 性能测试 {#performance-tests}

性能测试用于测量和比较 ClickHouse 某些独立部分在合成查询上的性能表现。
性能测试位于 `tests/performance/` 目录下。
每个测试由一个 `.xml` 文件表示,其中包含测试用例的描述。
测试通过 `docker/test/performance-comparison` 工具运行。调用方法请参阅 readme 文件。

每个测试会在循环中运行一个或多个查询(可能包含参数组合)。

如果您希望在某些场景中提升 ClickHouse 的性能,并且这些改进可以在简单查询上观察到,强烈建议编写性能测试。
此外,当您添加或修改相对独立且不太晦涩的 SQL 函数时,也建议编写性能测试。
在测试过程中使用 `perf top` 或其他 `perf` 工具总是明智的做法。


## 测试工具和脚本 {#test-tools-and-scripts}

`tests` 目录中的某些程序并非预先准备的测试用例,而是测试工具。
例如,针对 `Lexer`,有一个工具 `src/Parsers/tests/lexer`,它仅对标准输入进行词法分析,并将着色后的结果写入标准输出。
您可以将这类工具用作代码示例,也可用于探索和手动测试。


## 其他测试 {#miscellaneous-tests}

`tests/external_models` 中包含机器学习模型的测试。
这些测试尚未更新,必须迁移到集成测试中。

有一个单独的仲裁插入测试。
该测试在独立服务器上运行 ClickHouse 集群,并模拟各种故障场景:网络分区、数据包丢失(ClickHouse 节点之间、ClickHouse 与 ZooKeeper 之间、ClickHouse 服务器与客户端之间等)、`kill -9`、`kill -STOP` 和 `kill -CONT`,类似于 [Jepsen](https://aphyr.com/tags/Jepsen)。
然后该测试会检查所有已确认的插入是否已写入,以及所有被拒绝的插入是否未写入。

仲裁测试是在 ClickHouse 开源之前由一个独立团队编写的。
该团队已不再参与 ClickHouse 的工作。
该测试意外地使用了 Java 编写。
基于这些原因,仲裁测试必须重写并迁移到集成测试中。


## 手动测试 {#manual-testing}

在开发新功能时,进行手动测试是合理的做法。
您可以按照以下步骤操作:

构建 ClickHouse。从终端运行 ClickHouse:切换到 `programs/clickhouse-server` 目录并使用 `./clickhouse-server` 运行。默认情况下,它将使用当前目录中的配置文件(`config.xml`、`users.xml` 以及 `config.d` 和 `users.d` 目录中的文件)。要连接到 ClickHouse 服务器,请运行 `programs/clickhouse-client/clickhouse-client`。

请注意,所有 ClickHouse 工具(server、client 等)都只是指向名为 `clickhouse` 的单个二进制文件的符号链接。
您可以在 `programs/clickhouse` 找到此二进制文件。
所有工具也可以使用 `clickhouse tool` 而不是 `clickhouse-tool` 的方式调用。

或者,您可以安装 ClickHouse 软件包:可以从 ClickHouse 仓库安装稳定版本,也可以在 ClickHouse 源代码根目录中使用 `./release` 自行构建软件包。
然后使用 `sudo clickhouse start` 启动服务器(或使用 stop 停止服务器)。
日志文件位于 `/etc/clickhouse-server/clickhouse-server.log`。

当系统上已经安装了 ClickHouse 时,您可以构建新的 `clickhouse` 二进制文件并替换现有的二进制文件:

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

您也可以停止系统的 clickhouse-server 并使用相同的配置运行您自己的服务器,但将日志输出到终端:

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

使用 gdb 的示例:

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

如果系统的 clickhouse-server 已经在运行且您不想停止它,可以在 `config.xml` 中更改端口号(或在 `config.d` 目录中的文件中覆盖它们),提供适当的数据路径,然后运行它。

`clickhouse` 二进制文件几乎没有依赖项,可以在各种 Linux 发行版上运行。
要在服务器上快速测试您的更改,您可以直接使用 `scp` 将新构建的 `clickhouse` 二进制文件传输到服务器,然后按照上述示例运行它。


## 构建测试 {#build-tests}

构建测试用于检查在各种替代配置和某些外部系统上构建是否会出现问题。
这些测试同样是自动化的。

示例:

- 为 Darwin x86_64 (macOS) 交叉编译
- 为 FreeBSD x86_64 交叉编译
- 为 Linux AArch64 交叉编译
- 在 Ubuntu 上使用系统软件包中的库进行构建(不推荐)
- 使用库的共享链接进行构建(不推荐)

例如,使用系统软件包进行构建是不良实践,因为我们无法保证系统会安装哪个确切版本的软件包。
但 Debian 维护者确实需要这种方式。
因此,我们至少必须支持这种构建变体。
另一个例子:共享链接是常见的问题来源,但某些爱好者需要它。

尽管我们无法在所有构建变体上运行所有测试,但我们至少希望检查各种构建变体不会出现问题。
为此,我们使用构建测试。

我们还会测试是否存在编译时间过长或需要过多内存的翻译单元。

我们还会测试是否存在过大的栈帧。


## 协议兼容性测试 {#testing-for-protocol-compatibility}

当我们扩展 ClickHouse 网络协议时,会手动测试旧版 clickhouse-client 与新版 clickhouse-server 的兼容性,以及新版 clickhouse-client 与旧版 clickhouse-server 的兼容性(只需运行相应软件包中的二进制文件)。

我们还通过集成测试自动测试以下场景:

- 旧版本 ClickHouse 写入的数据是否能被新版本成功读取;
- 分布式查询在包含不同 ClickHouse 版本的集群中是否能正常工作。


## 来自编译器的帮助 {#help-from-the-compiler}

ClickHouse 主代码(位于 `src` 目录中)使用 `-Wall -Wextra -Werror` 以及一些额外启用的警告选项进行构建。
但这些选项不适用于第三方库。

Clang 提供了更多有用的警告选项 - 您可以使用 `-Weverything` 查看它们,并选择一些添加到默认构建配置中。

我们始终使用 clang 来构建 ClickHouse,无论是开发环境还是生产环境。
您可以在自己的机器上使用调试模式进行构建(以节省笔记本电脑的电量),但请注意,由于更好的控制流和过程间分析,编译器在使用 `-O3` 时能够生成更多警告信息。
使用 clang 在调试模式下构建时,会使用调试版本的 `libc++`,这有助于在运行时捕获更多错误。


## Sanitizers {#sanitizers}

:::note
如果在本地运行时进程(ClickHouse 服务器或客户端)在启动时崩溃,您可能需要禁用地址空间布局随机化:`sudo sysctl kernel.randomize_va_space=0`
:::

### Address sanitizer {#address-sanitizer}

我们在每次提交时都会使用 ASan 运行功能测试、集成测试、压力测试和单元测试。

### Thread sanitizer {#thread-sanitizer}

我们在每次提交时都会使用 TSan 运行功能测试、集成测试、压力测试和单元测试。

### Memory sanitizer {#memory-sanitizer}

我们在每次提交时都会使用 MSan 运行功能测试、集成测试、压力测试和单元测试。

### Undefined behaviour sanitizer {#undefined-behaviour-sanitizer}

我们在每次提交时都会使用 UBSan 运行功能测试、集成测试、压力测试和单元测试。
某些第三方库的代码未针对未定义行为进行检测。

### Valgrind (memcheck) {#valgrind-memcheck}

我们过去会在夜间使用 Valgrind 运行功能测试,但现在不再这样做了。
这需要花费数小时。
目前在 `re2` 库中存在一个已知的误报,请参阅[这篇文章](https://research.swtch.com/sparse)。


## 模糊测试 {#fuzzing}

ClickHouse 的模糊测试通过 [libFuzzer](https://llvm.org/docs/LibFuzzer.html) 和随机 SQL 查询两种方式实现。
所有模糊测试都应使用清理器(Address 和 Undefined)执行。

LibFuzzer 用于对库代码进行隔离的模糊测试。
模糊测试器作为测试代码的一部分实现,并具有 "\_fuzzer" 名称后缀。
模糊测试器示例可以在 `src/Parsers/fuzzers/lexer_fuzzer.cpp` 中找到。
LibFuzzer 特定的配置、字典和语料库存储在 `tests/fuzz` 中。
我们建议您为每个处理用户输入的功能编写模糊测试。

模糊测试器默认不会构建。
要构建模糊测试器,需要同时设置 `-DENABLE_FUZZING=1` 和 `-DENABLE_TESTS=1` 选项。
我们建议在构建模糊测试器时禁用 Jemalloc。
用于将 ClickHouse 模糊测试集成到 Google OSS-Fuzz 的配置可以在 `docker/fuzz` 中找到。

我们还使用简单的模糊测试来生成随机 SQL 查询,并检查服务器在执行这些查询时不会崩溃。
您可以在 `00746_sql_fuzzy.pl` 中找到它。
此测试应持续运行(通宵或更长时间)。

我们还使用基于 AST 的高级查询模糊测试器,它能够发现大量边界情况。
它在查询 AST 中执行随机排列和替换。
它会记住先前测试中的 AST 节点,以便在以随机顺序处理后续测试时使用它们进行模糊测试。
您可以在[这篇博客文章](https://clickhouse.com/blog/fuzzing-click-house)中了解有关此模糊测试器的更多信息。


## 压力测试 {#stress-test}

压力测试是模糊测试的另一种应用场景。它在单个服务器上以随机顺序并行运行所有功能测试。测试结果本身不会被检查。

会检查以下内容：

- 服务器不会崩溃，不会触发调试或sanitizer陷阱；
- 没有死锁；
- 数据库结构保持一致；
- 服务器可以在测试后成功停止并重新启动而不出现异常。

有五种变体（Debug、ASan、TSan、MSan、UBSan）。


## 线程模糊测试器 {#thread-fuzzer}

线程模糊测试器(请勿与线程清理器混淆)是另一种模糊测试方法,可以随机化线程的执行顺序。
它有助于发现更多边界情况。


## 安全审计 {#security-audit}

我们的安全团队从安全角度对 ClickHouse 的功能进行了基础性审查。


## 静态分析器 {#static-analyzers}

我们在每次提交时运行 `clang-tidy`。
同时也启用了 `clang-static-analyzer` 检查。
`clang-tidy` 还用于部分代码风格检查。

我们已评估过 `clang-tidy`、`Coverity`、`cppcheck`、`PVS-Studio`、`tscancode`、`CodeQL` 等工具。
使用说明可在 `tests/instructions/` 目录中找到。

如果您使用 `CLion` 作为 IDE,可以直接使用其内置的部分 `clang-tidy` 检查功能。

我们还使用 `shellcheck` 对 shell 脚本进行静态分析。


## 加固 {#hardening}

在调试构建中,我们使用自定义分配器对用户级分配执行 ASLR(地址空间布局随机化)。

我们还会手动保护那些在分配后应为只读的内存区域。

在调试构建中,我们还对 libc 进行了自定义,以确保不会调用任何"有害"(过时、不安全、非线程安全)函数。

调试断言被广泛使用。

在调试构建中,如果抛出带有"逻辑错误"代码(表明存在 bug)的异常,程序将提前终止。
这使得在发布构建中可以使用异常,但在调试构建中将其作为断言处理。

调试构建使用 jemalloc 的调试版本。
调试构建使用 libc++ 的调试版本。


## 运行时完整性检查 {#runtime-integrity-checks}

磁盘上存储的数据会进行校验和计算。
MergeTree 表中的数据会同时以三种方式进行校验和计算\*(压缩数据块、未压缩数据块、跨块总校验和)。
客户端与服务器之间或服务器之间通过网络传输的数据也会进行校验和计算。
复制机制确保副本上的数据在位级别完全一致。

这些措施用于防范硬件故障(存储介质上的位衰减、服务器内存中的位翻转、网络控制器内存中的位翻转、网络交换机内存中的位翻转、客户端内存中的位翻转、传输线路上的位翻转)。
需要注意的是,位翻转是常见现象,即使使用 ECC 内存并且存在 TCP 校验和的情况下也可能发生(如果您管理着数千台服务器,每天处理 PB 级数据)。
[观看视频(俄语)](https://www.youtube.com/watch?v=ooBAQIe0KlQ)。

ClickHouse 提供诊断功能,帮助运维工程师定位故障硬件。

\* 而且性能不会受到影响。


## 代码风格 {#code-style}

代码风格规则详见[此处](style.md)。

要检查常见的风格违规问题,可以使用 `utils/check-style` 脚本。

要强制代码符合正确的风格,可以使用 `clang-format`。
`.clang-format` 文件位于源代码根目录。
它基本符合我们实际的代码风格。
但不建议对现有文件应用 `clang-format`,因为这会使格式变差。
您可以使用 `clang-format-diff` 工具,该工具可在 clang 源代码仓库中找到。

或者,您也可以尝试使用 `uncrustify` 工具来重新格式化代码。
配置文件为源代码根目录中的 `uncrustify.cfg`。
它的测试程度不如 `clang-format`。

`CLion` 有自己的代码格式化工具,需要针对我们的代码风格进行调整。

我们还使用 `codespell` 来查找代码中的拼写错误。
它同样是自动化的。


## 测试覆盖率 {#test-coverage}

我们也会跟踪测试覆盖率,但仅限于 clickhouse-server 的功能测试。
此操作每日执行。


## 测试的测试 {#tests-for-tests}

系统会自动检查不稳定的测试。
它会将所有新测试运行 100 次(功能测试)或 10 次(集成测试)。
如果测试至少失败一次,则将其视为不稳定测试。


## 测试自动化 {#test-automation}

我们使用 [GitHub Actions](https://github.com/features/actions) 运行测试。

构建任务和测试在 Sandbox 中针对每次提交运行。
生成的软件包和测试结果会发布到 GitHub,可通过直接链接下载。
构建产物会保存数月。
当您在 GitHub 上提交 pull request 时,我们会将其标记为"可以测试",然后我们的 CI 系统将为您构建 ClickHouse 软件包(包括 release 版、debug 版、带 address sanitizer 版等)。
