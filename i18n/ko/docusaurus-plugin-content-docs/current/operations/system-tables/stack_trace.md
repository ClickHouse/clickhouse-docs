---
description: '서버의 모든 스레드에 대한 스택 트레이스를 포함하는 시스템 테이블입니다. 개발자가 서버 상태를 내부적으로 점검할 수 있도록 합니다.'
keywords: ['시스템 테이블', 'stack_trace']
slug: /operations/system-tables/stack_trace
title: 'system.stack_trace'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.stack_trace \{#systemstack_trace\}

<SystemTableCloud />

모든 서버 스레드의 스택 트레이스를 포함합니다. 개발자가 서버 상태를 분석할 수 있도록 합니다.

스택 프레임을 분석하려면 `addressToLine`, `addressToLineWithInlines`, `addressToSymbol`, `demangle` [내부 검사(introspection) 함수](../../sql-reference/functions/introspection.md)를 사용하십시오.

컬럼:

* `thread_name` ([String](../../sql-reference/data-types/string.md)) — 스레드 이름.
* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 스레드 식별자.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — [query&#95;log](../system-tables/query_log.md) 시스템 테이블에서 실행 중이던 쿼리에 대한 세부 정보를 가져오는 데 사용할 수 있는 쿼리 식별자.
* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 호출된 메서드가 저장된 물리적 주소 목록을 나타내는 [스택 트레이스](https://en.wikipedia.org/wiki/Stack_trace).

:::tip
[현재 어떤 스레드가 실행 중인지 확인하는 방법](/knowledgebase/find-expensive-queries)과 [문제 해결에 유용한 쿼리](/knowledgebase/useful-queries-for-troubleshooting)를 포함한 유용한 쿼리는 Knowledge Base에서 확인하십시오.
:::

**예시**

내부 검사(introspection) 함수 활성화:

```sql
SET allow_introspection_functions = 1;
```

ClickHouse 객체 파일에서 심볼 가져오기:

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

ClickHouse 소스 코드에서 파일 이름과 줄 번호 확인하기:

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

**추가 참고**

* [Introspection Functions](../../sql-reference/functions/introspection.md) — 사용할 수 있는 인트로스펙션 함수와 그 사용 방법을 설명합니다.
* [system.trace&#95;log](../system-tables/trace_log.md) — 샘플링 쿼리 프로파일러가 수집한 스택 트레이스를 포함합니다.
* [arrayMap](/sql-reference/functions/array-functions#arrayMap) — `arrayMap` FUNCTION의 설명과 사용 예제를 제공합니다.
* [arrayFilter](/sql-reference/functions/array-functions#arrayFilter) — `arrayFilter` FUNCTION의 설명과 사용 예제를 제공합니다.
