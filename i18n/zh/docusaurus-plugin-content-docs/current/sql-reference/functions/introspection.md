---
'description': 'Documentation for Introspection Functions'
'sidebar_label': 'Introspection'
'sidebar_position': 100
'slug': '/sql-reference/functions/introspection'
'title': 'Introspection Functions'
---




# 反射函数

您可以使用本章中描述的函数来检查 [ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format) 和 [DWARF](https://en.wikipedia.org/wiki/DWARF) 以进行查询分析。

:::note    
这些函数执行较慢，并可能带来安全问题。
:::

为了正确操作反射函数：

- 安装 `clickhouse-common-static-dbg` 包。

- 将 [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions) 设置为 1。

        出于安全原因，反射函数默认情况下是禁用的。

ClickHouse 将分析器报告保存到 [trace_log](/operations/system-tables/trace_log) 系统表中。确保该表和分析器已正确配置。

## addressToLine {#addresstoline}

将 ClickHouse 服务器进程中的虚拟内存地址转换为 ClickHouse 源代码中的文件名和行号。

如果您使用官方 ClickHouse 包，则需要安装 `clickhouse-common-static-dbg` 包。

**语法**

```sql
addressToLine(address_of_binary_instruction)
```

**参数**

- `address_of_binary_instruction` ([UInt64](../data-types/int-uint.md)) — 运行进程中指令的地址。

**返回值**

- 源代码文件名和文件中的行号，以冒号分隔。
        例如，`/build/obj-x86_64-linux-gnu/../src/Common/ThreadPool.cpp:199`，其中 `199` 是行号。
- 如果函数无法找到调试信息，则返回二进制的名称。
- 如果地址无效，则返回空字符串。

类型：[String](../../sql-reference/data-types/string.md)。

**示例**

启用反射函数：

```sql
SET allow_introspection_functions=1;
```

从 `trace_log` 系统表中选择第一条字符串：

```sql
SELECT * FROM system.trace_log LIMIT 1 \G;
```

```text
Row 1:
──────
event_date:              2019-11-19
event_time:              2019-11-19 18:57:23
revision:                54429
timer_type:              Real
thread_number:           48
query_id:                421b6855-1858-45a5-8f37-f383409d6d72
trace:                   [140658411141617,94784174532828,94784076370703,94784076372094,94784076361020,94784175007680,140658411116251,140658403895439]
```

`trace` 字段包含采样时的堆栈跟踪。

获取单个地址的源代码文件名和行号：

```sql
SELECT addressToLine(94784076370703) \G;
```

```text
Row 1:
──────
addressToLine(94784076370703): /build/obj-x86_64-linux-gnu/../src/Common/ThreadPool.cpp:199
```

将函数应用于整个堆栈跟踪：

```sql
SELECT
    arrayStringConcat(arrayMap(x -> addressToLine(x), trace), '\n') AS trace_source_code_lines
FROM system.trace_log
LIMIT 1
\G
```

[啟用](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 函数允许通过 `addressToLine` 函数处理 `trace` 数组中的每个单独元素。您在输出的 `trace_source_code_lines` 列中看到的就是此处理结果。

```text
Row 1:
──────
trace_source_code_lines: /lib/x86_64-linux-gnu/libpthread-2.27.so
/usr/lib/debug/usr/bin/clickhouse
/build/obj-x86_64-linux-gnu/../src/Common/ThreadPool.cpp:199
/build/obj-x86_64-linux-gnu/../src/Common/ThreadPool.h:155
/usr/include/c++/9/bits/atomic_base.h:551
/usr/lib/debug/usr/bin/clickhouse
/lib/x86_64-linux-gnu/libpthread-2.27.so
/build/glibc-OTsEL5/glibc-2.27/misc/../sysdeps/unix/sysv/linux/x86_64/clone.S:97
```

## addressToLineWithInlines {#addresstolinewithinlines}

与 `addressToLine` 类似，但返回一个包含所有内联函数的数组。因此，其速度比 `addressToLine` 慢。

:::note
如果您使用官方 ClickHouse 包，则需要安装 `clickhouse-common-static-dbg` 包。
:::

**语法**

```sql
addressToLineWithInlines(address_of_binary_instruction)
```

**参数**

- `address_of_binary_instruction` ([UInt64](../data-types/int-uint.md)) — 运行进程中指令的地址。

**返回值**

- 一个数组，其第一个元素是源代码文件名和行号，以冒号分隔。从第二个元素开始，列出内联函数的源代码文件名、行号和函数名。如果函数无法找到调试信息，则返回一个包含单个元素等于二进制名称的数组，否则如果地址无效，则返回空数组。[Array(String)](../data-types/array.md)。

**示例**

启用反射函数：

```sql
SET allow_introspection_functions=1;
```

应用函数到地址。

```sql
SELECT addressToLineWithInlines(531055181::UInt64);
```

```text
┌─addressToLineWithInlines(CAST('531055181', 'UInt64'))────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['./src/Functions/addressToLineWithInlines.cpp:98','./build_normal_debug/./src/Functions/addressToLineWithInlines.cpp:176:DB::(anonymous namespace)::FunctionAddressToLineWithInlines::implCached(unsigned long) const'] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

将函数应用于整个堆栈跟踪：

```sql
SELECT
    ta, addressToLineWithInlines(arrayJoin(trace) as ta)
FROM system.trace_log
WHERE
    query_id = '5e173544-2020-45de-b645-5deebe2aae54';
```

[啟用](/sql-reference/functions/array-join) 函数将数组拆分为行。

```text
┌────────ta─┬─addressToLineWithInlines(arrayJoin(trace))───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 365497529 │ ['./build_normal_debug/./contrib/libcxx/include/string_view:252']                                                                                                                                                        │
│ 365593602 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:191']                                                                                                                                                                      │
│ 365593866 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365592528 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365591003 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:477']                                                                                                                                                                      │
│ 365590479 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:442']                                                                                                                                                                      │
│ 365590600 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:457']                                                                                                                                                                      │
│ 365598941 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365607098 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365590571 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:451']                                                                                                                                                                      │
│ 365598941 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365607098 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365590571 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:451']                                                                                                                                                                      │
│ 365598941 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365607098 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365590571 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:451']                                                                                                                                                                      │
│ 365598941 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:0']                                                                                                                                                                        │
│ 365597289 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:807']                                                                                                                                                                      │
│ 365599840 │ ['./build_normal_debug/./src/Common/Dwarf.cpp:1118']                                                                                                                                                                     │
│ 531058145 │ ['./build_normal_debug/./src/Functions/addressToLineWithInlines.cpp:152']                                                                                                                                                │
│ 531055181 │ ['./src/Functions/addressToLineWithInlines.cpp:98','./build_normal_debug/./src/Functions/addressToLineWithInlines.cpp:176:DB::(anonymous namespace)::FunctionAddressToLineWithInlines::implCached(unsigned long) const'] │
│ 422333613 │ ['./build_normal_debug/./src/Functions/IFunctionAdaptors.h:21']                                                                                                                                                          │
│ 586866022 │ ['./build_normal_debug/./src/Functions/IFunction.cpp:216']                                                                                                                                                               │
│ 586869053 │ ['./build_normal_debug/./src/Functions/IFunction.cpp:264']                                                                                                                                                               │
│ 586873237 │ ['./build_normal_debug/./src/Functions/IFunction.cpp:334']                                                                                                                                                               │
│ 597901620 │ ['./build_normal_debug/./src/Interpreters/ExpressionActions.cpp:601']                                                                                                                                                    │
│ 597898534 │ ['./build_normal_debug/./src/Interpreters/ExpressionActions.cpp:718']                                                                                                                                                    │
│ 630442912 │ ['./build_normal_debug/./src/Processors/Transforms/ExpressionTransform.cpp:23']                                                                                                                                          │
│ 546354050 │ ['./build_normal_debug/./src/Processors/ISimpleTransform.h:38']                                                                                                                                                          │
│ 626026993 │ ['./build_normal_debug/./src/Processors/ISimpleTransform.cpp:89']                                                                                                                                                        │
│ 626294022 │ ['./build_normal_debug/./src/Processors/Executors/ExecutionThreadContext.cpp:45']                                                                                                                                        │
│ 626293730 │ ['./build_normal_debug/./src/Processors/Executors/ExecutionThreadContext.cpp:63']                                                                                                                                        │
│ 626169525 │ ['./build_normal_debug/./src/Processors/Executors/PipelineExecutor.cpp:213']                                                                                                                                             │
│ 626170308 │ ['./build_normal_debug/./src/Processors/Executors/PipelineExecutor.cpp:178']                                                                                                                                             │
│ 626166348 │ ['./build_normal_debug/./src/Processors/Executors/PipelineExecutor.cpp:329']                                                                                                                                             │
│ 626163461 │ ['./build_normal_debug/./src/Processors/Executors/PipelineExecutor.cpp:84']                                                                                                                                              │
│ 626323536 │ ['./build_normal_debug/./src/Processors/Executors/PullingAsyncPipelineExecutor.cpp:85']                                                                                                                                  │
│ 626323277 │ ['./build_normal_debug/./src/Processors/Executors/PullingAsyncPipelineExecutor.cpp:112']                                                                                                                                 │
│ 626323133 │ ['./build_normal_debug/./contrib/libcxx/include/type_traits:3682']                                                                                                                                                       │
│ 626323041 │ ['./build_normal_debug/./contrib/libcxx/include/tuple:1415']                                                                                                                                                             │
└───────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

## addressToSymbol {#addresstosymbol}

将 ClickHouse 服务器进程中的虚拟内存地址转换为 ClickHouse 对象文件中的符号。

**语法**

```sql
addressToSymbol(address_of_binary_instruction)
```

**参数**

- `address_of_binary_instruction` ([UInt64](../data-types/int-uint.md)) — 运行进程中指令的地址。

**返回值**

- 来自 ClickHouse 对象文件的符号。[String](../data-types/string.md)。
- 如果地址无效，则返回空字符串。[String](../data-types/string.md)。

**示例**

启用反射函数：

```sql
SET allow_introspection_functions=1;
```

从 `trace_log` 系统表中选择第一条字符串：

```sql
SELECT * FROM system.trace_log LIMIT 1 \G;
```

```text
Row 1:
──────
event_date:    2019-11-20
event_time:    2019-11-20 16:57:59
revision:      54429
timer_type:    Real
thread_number: 48
query_id:      724028bf-f550-45aa-910d-2af6212b94ac
trace:         [94138803686098,94138815010911,94138815096522,94138815101224,94138815102091,94138814222988,94138806823642,94138814457211,94138806823642,94138814457211,94138806823642,94138806795179,94138806796144,94138753770094,94138753771646,94138753760572,94138852407232,140399185266395,140399178045583]
```

`trace` 字段包含采样时的堆栈跟踪。

获取单个地址的符号：

```sql
SELECT addressToSymbol(94138803686098) \G;
```

```text
Row 1:
──────
addressToSymbol(94138803686098): _ZNK2DB24IAggregateFunctionHelperINS_20AggregateFunctionSumImmNS_24AggregateFunctionSumDataImEEEEE19addBatchSinglePlaceEmPcPPKNS_7IColumnEPNS_5ArenaE
```

将函数应用于整个堆栈跟踪：

```sql
SELECT
    arrayStringConcat(arrayMap(x -> addressToSymbol(x), trace), '\n') AS trace_symbols
FROM system.trace_log
LIMIT 1
\G
```

[啟用](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 函数允许通过 `addressToSymbols` 函数处理 `trace` 数组中的每个单独元素。您在输出的 `trace_symbols` 列中看到的就是此处理结果。

```text
Row 1:
──────
trace_symbols: _ZNK2DB24IAggregateFunctionHelperINS_20AggregateFunctionSumImmNS_24AggregateFunctionSumDataImEEEEE19addBatchSinglePlaceEmPcPPKNS_7IColumnEPNS_5ArenaE
_ZNK2DB10Aggregator21executeWithoutKeyImplERPcmPNS0_28AggregateFunctionInstructionEPNS_5ArenaE
_ZN2DB10Aggregator14executeOnBlockESt6vectorIN3COWINS_7IColumnEE13immutable_ptrIS3_EESaIS6_EEmRNS_22AggregatedDataVariantsERS1_IPKS3_SaISC_EERS1_ISE_SaISE_EERb
_ZN2DB10Aggregator14executeOnBlockERKNS_5BlockERNS_22AggregatedDataVariantsERSt6vectorIPKNS_7IColumnESaIS9_EERS6_ISB_SaISB_EERb
_ZN2DB10Aggregator7executeERKSt10shared_ptrINS_17IBlockInputStreamEERNS_22AggregatedDataVariantsE
_ZN2DB27AggregatingBlockInputStream8readImplEv
_ZN2DB17IBlockInputStream4readEv
_ZN2DB26ExpressionBlockInputStream8readImplEv
_ZN2DB17IBlockInputStream4readEv
_ZN2DB26ExpressionBlockInputStream8readImplEv
_ZN2DB17IBlockInputStream4readEv
_ZN2DB28AsynchronousBlockInputStream9calculateEv
_ZNSt17_Function_handlerIFvvEZN2DB28AsynchronousBlockInputStream4nextEvEUlvE_E9_M_invokeERKSt9_Any_data
_ZN14ThreadPoolImplI20ThreadFromGlobalPoolE6workerESt14_List_iteratorIS0_E
_ZZN20ThreadFromGlobalPoolC4IZN14ThreadPoolImplIS_E12scheduleImplIvEET_St8functionIFvvEEiSt8optionalImEEUlvE1_JEEEOS4_DpOT0_ENKUlvE_clEv
_ZN14ThreadPoolImplISt6threadE6workerESt14_List_iteratorIS0_E
execute_native_thread_routine
start_thread
clone
```

## demangle {#demangle}

将您可以使用 [addressToSymbol](#addresstosymbol) 函数获取的符号转换为 C++ 函数名称。

**语法**

```sql
demangle(symbol)
```

**参数**

- `symbol` ([String](../data-types/string.md)) — 来自对象文件的符号。

**返回值**

- C++ 函数的名称，如果符号无效则为空字符串。[String](../data-types/string.md)。

**示例**

启用反射函数：

```sql
SET allow_introspection_functions=1;
```

从 `trace_log` 系统表中选择第一条字符串：

```sql
SELECT * FROM system.trace_log LIMIT 1 \G;
```

```text
Row 1:
──────
event_date:    2019-11-20
event_time:    2019-11-20 16:57:59
revision:      54429
timer_type:    Real
thread_number: 48
query_id:      724028bf-f550-45aa-910d-2af6212b94ac
trace:         [94138803686098,94138815010911,94138815096522,94138815101224,94138815102091,94138814222988,94138806823642,94138814457211,94138806823642,94138814457211,94138806823642,94138806795179,94138806796144,94138753770094,94138753771646,94138753760572,94138852407232,140399185266395,140399178045583]
```

`trace` 字段包含采样时的堆栈跟踪。

获取单个地址的函数名称：

```sql
SELECT demangle(addressToSymbol(94138803686098)) \G;
```

```text
Row 1:
──────
demangle(addressToSymbol(94138803686098)): DB::IAggregateFunctionHelper<DB::AggregateFunctionSum<unsigned long, unsigned long, DB::AggregateFunctionSumData<unsigned long> > >::addBatchSinglePlace(unsigned long, char*, DB::IColumn const**, DB::Arena*) const
```

将函数应用于整个堆栈跟踪：

```sql
SELECT
    arrayStringConcat(arrayMap(x -> demangle(addressToSymbol(x)), trace), '\n') AS trace_functions
FROM system.trace_log
LIMIT 1
\G
```

[启用](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 函数允许通过 `demangle` 函数处理 `trace` 数组中的每个单独元素。您在输出的 `trace_functions` 列中看到的就是此处理结果。

```text
Row 1:
──────
trace_functions: DB::IAggregateFunctionHelper<DB::AggregateFunctionSum<unsigned long, unsigned long, DB::AggregateFunctionSumData<unsigned long> > >::addBatchSinglePlace(unsigned long, char*, DB::IColumn const**, DB::Arena*) const
DB::Aggregator::executeWithoutKeyImpl(char*&, unsigned long, DB::Aggregator::AggregateFunctionInstruction*, DB::Arena*) const
DB::Aggregator::executeOnBlock(std::vector<COW<DB::IColumn>::immutable_ptr<DB::IColumn>, std::allocator<COW<DB::IColumn>::immutable_ptr<DB::IColumn> > >, unsigned long, DB::AggregatedDataVariants&, std::vector<DB::IColumn const*, std::allocator<DB::IColumn const*> >&, std::vector<std::vector<DB::IColumn const*, std::allocator<DB::IColumn const*> >, std::allocator<std::vector<DB::IColumn const*, std::allocator<DB::IColumn const*> > > >&, bool&)
DB::Aggregator::executeOnBlock(DB::Block const&, DB::AggregatedDataVariants&, std::vector<DB::IColumn const*, std::allocator<DB::IColumn const*> >&, std::vector<std::vector<DB::IColumn const*, std::allocator<DB::IColumn const*> >, std::allocator<std::vector<DB::IColumn const*, std::allocator<DB::IColumn const*> > > >&, bool&)
DB::Aggregator::execute(std::shared_ptr<DB::IBlockInputStream> const&, DB::AggregatedDataVariants&)
DB::AggregatingBlockInputStream::readImpl()
DB::IBlockInputStream::read()
DB::ExpressionBlockInputStream::readImpl()
DB::IBlockInputStream::read()
DB::ExpressionBlockInputStream::readImpl()
DB::IBlockInputStream::read()
DB::AsynchronousBlockInputStream::calculate()
std::_Function_handler<void (), DB::AsynchronousBlockInputStream::next()::{lambda()#1}>::_M_invoke(std::_Any_data const&)
ThreadPoolImpl<ThreadFromGlobalPool>::worker(std::_List_iterator<ThreadFromGlobalPool>)
ThreadFromGlobalPool::ThreadFromGlobalPool<ThreadPoolImpl<ThreadFromGlobalPool>::scheduleImpl<void>(std::function<void ()>, int, std::optional<unsigned long>)::{lambda()#3}>(ThreadPoolImpl<ThreadFromGlobalPool>::scheduleImpl<void>(std::function<void ()>, int, std::optional<unsigned long>)::{lambda()#3}&&)::{lambda()#1}::operator()() const
ThreadPoolImpl<std::thread>::worker(std::_List_iterator<std::thread>)
execute_native_thread_routine
start_thread
clone
```

## tid {#tid}

返回当前 [Block](/development/architecture/#block) 处理所在线程的 ID。

**语法**

```sql
tid()
```

**返回值**

- 当前线程 ID。[Uint64](/sql-reference/data-types/int-uint#integer-ranges)。

**示例**

查询：

```sql
SELECT tid();
```

结果：

```text
┌─tid()─┐
│  3878 │
└───────┘
```

## logTrace {#logtrace}

为每个 [Block](/development/architecture/#block) 发出跟踪日志消息到服务器日志。

**语法**

```sql
logTrace('message')
```

**参数**

- `message` — 发送到服务器日志的消息。[String](/sql-reference/data-types/string)。

**返回值**

- 总是返回 0。

**示例**

查询：

```sql
SELECT logTrace('logTrace message');
```

结果：

```text
┌─logTrace('logTrace message')─┐
│                            0 │
└──────────────────────────────┘
```
