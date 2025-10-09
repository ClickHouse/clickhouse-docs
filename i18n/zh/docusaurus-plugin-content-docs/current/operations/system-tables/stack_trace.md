---
'description': '系统表，其中包含所有服务器线程的堆栈跟踪。允许开发人员检查服务器状态。'
'keywords':
- 'system table'
- 'stack_trace'
'slug': '/operations/system-tables/stack_trace'
'title': 'system.stack_trace'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.stack_trace

<SystemTableCloud/>

包含所有服务器线程的堆栈跟踪。允许开发人员检查服务器状态。

要分析堆栈帧，请使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` [反思函数](../../sql-reference/functions/introspection.md)。

列：

- `thread_name` ([String](../../sql-reference/data-types/string.md)) — 线程名称。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 线程标识符。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询标识符，可用于获取有关从 [query_log](../system-tables/query_log.md) 系统表运行的查询的详细信息。
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 一个 [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)，表示存储调用方法的物理地址列表。

:::tip
查看知识库以获取一些实用查询，包括 [如何查看当前运行的线程](/knowledgebase/find-expensive-queries) 和 [用于故障排除的有用查询](/knowledgebase/useful-queries-for-troubleshooting)。
:::

**示例**

启用反思函数：

```sql
SET allow_introspection_functions = 1;
```

从 ClickHouse 对象文件获取符号：

```sql
WITH arrayMap(x -> demangle(addressToSymbol(x)), trace) AS all SELECT thread_name, thread_id, query_id, arrayStringConcat(all, '\n') AS res FROM system.stack_trace LIMIT 1 \G;
```

```text
Row 1:
──────
thread_name: QueryPipelineEx
thread_id:   743490
query_id:    dc55a564-febb-4e37-95bb-090ef182c6f1
res:         memcpy
large_ralloc
arena_ralloc
do_rallocx
Allocator<true, true>::realloc(void*, unsigned long, unsigned long, unsigned long)
HashTable<unsigned long, HashMapCell<unsigned long, char*, HashCRC32<unsigned long>, HashTableNoState, PairNoInit<unsigned long, char*>>, HashCRC32<unsigned long>, HashTableGrowerWithPrecalculation<8ul>, Allocator<true, true>>::resize(unsigned long, unsigned long)
void DB::Aggregator::executeImplBatch<false, false, true, DB::AggregationMethodOneNumber<unsigned long, HashMapTable<unsigned long, HashMapCell<unsigned long, char*, HashCRC32<unsigned long>, HashTableNoState, PairNoInit<unsigned long, char*>>, HashCRC32<unsigned long>, HashTableGrowerWithPrecalculation<8ul>, Allocator<true, true>>, true, false>>(DB::AggregationMethodOneNumber<unsigned long, HashMapTable<unsigned long, HashMapCell<unsigned long, char*, HashCRC32<unsigned long>, HashTableNoState, PairNoInit<unsigned long, char*>>, HashCRC32<unsigned long>, HashTableGrowerWithPrecalculation<8ul>, Allocator<true, true>>, true, false>&, DB::AggregationMethodOneNumber<unsigned long, HashMapTable<unsigned long, HashMapCell<unsigned long, char*, HashCRC32<unsigned long>, HashTableNoState, PairNoInit<unsigned long, char*>>, HashCRC32<unsigned long>, HashTableGrowerWithPrecalculation<8ul>, Allocator<true, true>>, true, false>::State&, DB::Arena*, unsigned long, unsigned long, DB::Aggregator::AggregateFunctionInstruction*, bool, char*) const
DB::Aggregator::executeImpl(DB::AggregatedDataVariants&, unsigned long, unsigned long, std::__1::vector<DB::IColumn const*, std::__1::allocator<DB::IColumn const*>>&, DB::Aggregator::AggregateFunctionInstruction*, bool, bool, char*) const
DB::Aggregator::executeOnBlock(std::__1::vector<COW<DB::IColumn>::immutable_ptr<DB::IColumn>, std::__1::allocator<COW<DB::IColumn>::immutable_ptr<DB::IColumn>>>, unsigned long, unsigned long, DB::AggregatedDataVariants&, std::__1::vector<DB::IColumn const*, std::__1::allocator<DB::IColumn const*>>&, std::__1::vector<std::__1::vector<DB::IColumn const*, std::__1::allocator<DB::IColumn const*>>, std::__1::allocator<std::__1::vector<DB::IColumn const*, std::__1::allocator<DB::IColumn const*>>>>&, bool&) const
DB::AggregatingTransform::work()
DB::ExecutionThreadContext::executeTask()
DB::PipelineExecutor::executeStepImpl(unsigned long, std::__1::atomic<bool>*)
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<DB::PipelineExecutor::spawnThreads()::$_0, void ()>>(std::__1::__function::__policy_storage const*)
ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::worker(std::__1::__list_iterator<ThreadFromGlobalPoolImpl<false>, void*>)
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<ThreadFromGlobalPoolImpl<false>::ThreadFromGlobalPoolImpl<void ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::scheduleImpl<void>(std::__1::function<void ()>, Priority, std::__1::optional<unsigned long>, bool)::'lambda0'()>(void&&)::'lambda'(), void ()>>(std::__1::__function::__policy_storage const*)
void* std::__1::__thread_proxy[abi:v15000]<std::__1::tuple<std::__1::unique_ptr<std::__1::__thread_struct, std::__1::default_delete<std::__1::__thread_struct>>, void ThreadPoolImpl<std::__1::thread>::scheduleImpl<void>(std::__1::function<void ()>, Priority, std::__1::optional<unsigned long>, bool)::'lambda0'()>>(void*)
```

获取 ClickHouse 源代码中的文件名和行号：

```sql
WITH arrayMap(x -> addressToLine(x), trace) AS all, arrayFilter(x -> x LIKE '%/dbms/%', all) AS dbms SELECT thread_name, thread_id, query_id, arrayStringConcat(notEmpty(dbms) ? dbms : all, '\n') AS res FROM system.stack_trace LIMIT 1 \G;
```

```text
Row 1:
──────
thread_name: clickhouse-serv

thread_id: 686
query_id:  cad353e7-1c29-4b2e-949f-93e597ab7a54
res:       /lib/x86_64-linux-gnu/libc-2.27.so
/build/obj-x86_64-linux-gnu/../src/Storages/System/StorageSystemStackTrace.cpp:182
/build/obj-x86_64-linux-gnu/../contrib/libcxx/include/vector:656
/build/obj-x86_64-linux-gnu/../src/Interpreters/InterpreterSelectQuery.cpp:1338
/build/obj-x86_64-linux-gnu/../src/Interpreters/InterpreterSelectQuery.cpp:751
/build/obj-x86_64-linux-gnu/../contrib/libcxx/include/optional:224
/build/obj-x86_64-linux-gnu/../src/Interpreters/InterpreterSelectWithUnionQuery.cpp:192
/build/obj-x86_64-linux-gnu/../src/Interpreters/executeQuery.cpp:384
/build/obj-x86_64-linux-gnu/../src/Interpreters/executeQuery.cpp:643
/build/obj-x86_64-linux-gnu/../src/Server/TCPHandler.cpp:251
/build/obj-x86_64-linux-gnu/../src/Server/TCPHandler.cpp:1197
/build/obj-x86_64-linux-gnu/../contrib/poco/Net/src/TCPServerConnection.cpp:57
/build/obj-x86_64-linux-gnu/../contrib/libcxx/include/atomic:856
/build/obj-x86_64-linux-gnu/../contrib/poco/Foundation/include/Poco/Mutex_POSIX.h:59
/build/obj-x86_64-linux-gnu/../contrib/poco/Foundation/include/Poco/AutoPtr.h:223
/lib/x86_64-linux-gnu/libpthread-2.27.so
/lib/x86_64-linux-gnu/libc-2.27.so
```

**另请参阅**

- [反思函数](../../sql-reference/functions/introspection.md) — 可用的反思函数以及如何使用它们。
- [system.trace_log](../system-tables/trace_log.md) — 包含由采样查询分析器收集的堆栈跟踪。
- [arrayMap](/sql-reference/functions/array-functions#arrayMap) — `arrayMap` 函数的描述和使用示例。
- [arrayFilter](/sql-reference/functions/array-functions#arrayFilter) — `arrayFilter` 函数的描述和使用示例。
