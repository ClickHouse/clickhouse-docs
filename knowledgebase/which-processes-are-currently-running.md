---
date: 2023-03-24
---

# How to check what code is currently running on a server?

ClickHouse has a built-in debugger and introspection capabilities. For example, you can get the stack traces of every server's thread at runtime by querying the `system.stack_trace` table:

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.stack_trace
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
FORMAT Vertical
SETTINGS allow_introspection_functions = 1;
```

The query result will show the locations in the ClickHouse source code where the threads are running or waiting. (You will need to set `allow_introspection_functions` to `1` to enable the [introspection functions](https://clickhouse.com/docs/en/sql-reference/functions/introspection).) The response looks like:

```response
Row 1:
──────
count(): 144
sym:     pthread_cond_wait

DB::BackgroundSchedulePool::threadFunction()
    /usr/bin/clickhouse

    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 2:
──────
count(): 80
sym:     pthread_cond_wait

std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)
    /usr/bin/clickhouse
DB::MergeTreeBackgroundExecutor<DB::OrdinaryRuntimeQueue>::threadFunction()
    /usr/bin/clickhouse
ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::worker(std::__1::__list_iterator<ThreadFromGlobalPoolImpl<false>, void*>)
    /usr/bin/clickhouse
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<ThreadFromGlobalPoolImpl<false>::ThreadFromGlobalPoolImpl<void ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::scheduleImpl<void>(std::__1::function<void ()>, long, std::__1::optional<unsigned long>, bool)::'lambda0'()>(void&&)::'lambda'(), void ()>>(std::__1::__function::__policy_storage const*)
    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 3:
──────
count(): 55
sym:     pthread_cond_wait

ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::worker(std::__1::__list_iterator<ThreadFromGlobalPoolImpl<false>, void*>)
    /usr/bin/clickhouse
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<ThreadFromGlobalPoolImpl<false>::ThreadFromGlobalPoolImpl<void ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::scheduleImpl<void>(std::__1::function<void ()>, long, std::__1::optional<unsigned long>, bool)::'lambda0'()>(void&&)::'lambda'(), void ()>>(std::__1::__function::__policy_storage const*)
    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 4:
──────
count(): 16
sym:

DB::AsynchronousInsertQueue::processBatchDeadlines(unsigned long)
    /usr/bin/clickhouse

    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 5:
──────
count(): 16
sym:     pthread_cond_wait

std::__1::condition_variable::wait(std::__1::unique_lock<std::__1::mutex>&)
    /usr/bin/clickhouse
DB::MergeTreeBackgroundExecutor<DB::MergeMutateRuntimeQueue>::threadFunction()
    /usr/bin/clickhouse
ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::worker(std::__1::__list_iterator<ThreadFromGlobalPoolImpl<false>, void*>)
    /usr/bin/clickhouse
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<ThreadFromGlobalPoolImpl<false>::ThreadFromGlobalPoolImpl<void ThreadPoolImpl<ThreadFromGlobalPoolImpl<false>>::scheduleImpl<void>(std::__1::function<void ()>, long, std::__1::optional<unsigned long>, bool)::'lambda0'()>(void&&)::'lambda'(), void ()>>(std::__1::__function::__policy_storage const*)
    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 6:
──────
count(): 10
sym:     poll

Poco::Net::SocketImpl::pollImpl(Poco::Timespan&, int)
    /usr/bin/clickhouse
Poco::Net::SocketImpl::poll(Poco::Timespan const&, int)
    /usr/bin/clickhouse
Poco::Net::TCPServer::run()
    /usr/bin/clickhouse
Poco::ThreadImpl::runnableEntry(void*)
    /usr/bin/clickhouse


clone


Row 7:
──────
count(): 9
sym:     pthread_cond_wait

ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 8:
──────
count(): 7
sym:     poll

Poco::Net::SocketImpl::pollImpl(Poco::Timespan&, int)
    /usr/bin/clickhouse
Poco::Net::SocketImpl::poll(Poco::Timespan const&, int)
    /usr/bin/clickhouse
DB::ReadBufferFromPocoSocket::poll(unsigned long) const
    /usr/bin/clickhouse
DB::TCPHandler::runImpl()
    /usr/bin/clickhouse
DB::TCPHandler::run()
    /usr/bin/clickhouse

    /usr/bin/clickhouse
Poco::Net::TCPServerConnection::start()
    /usr/bin/clickhouse
Poco::Net::TCPServerDispatcher::run()
    /usr/bin/clickhouse
Poco::PooledThread::run()
    /usr/bin/clickhouse
Poco::ThreadImpl::runnableEntry(void*)
    /usr/bin/clickhouse


clone


Row 9:
───────
count(): 3
sym:     pthread_cond_wait

Poco::EventImpl::waitImpl()
    /usr/bin/clickhouse
DB::DDLWorker::runCleanupThread()
    /usr/bin/clickhouse
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<ThreadFromGlobalPoolImpl<true>::ThreadFromGlobalPoolImpl<void (DB::DDLWorker::*)(), DB::DDLWorker*>(void (DB::DDLWorker::*&&)(), DB::DDLWorker*&&)::'lambda'(), void ()>>(std::__1::__function::__policy_storage const*)
    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


Row 10:
───────
count(): 3
sym:     pthread_cond_wait

Poco::EventImpl::waitImpl()
    /usr/bin/clickhouse
DB::DDLWorker::runMainThread()
    /usr/bin/clickhouse
void std::__1::__function::__policy_invoker<void ()>::__call_impl<std::__1::__function::__default_alloc_func<ThreadFromGlobalPoolImpl<true>::ThreadFromGlobalPoolImpl<void (DB::DDLWorker::*)(), DB::DDLWorker*>(void (DB::DDLWorker::*&&)(), DB::DDLWorker*&&)::'lambda'(), void ()>>(std::__1::__function::__policy_storage const*)
    /usr/bin/clickhouse
ThreadPoolImpl<std::__1::thread>::worker(std::__1::__list_iterator<std::__1::thread, void*>)
    /usr/bin/clickhouse

    /usr/bin/clickhouse


clone


10 rows in set. Elapsed: 0.026 sec.
```

:::note
If you installed ClickHouse from a **.deb/.rpm/.tgz** you can also install the package with the debug info to see the line numbers from the source code:

```bash
sudo apt install clickhouse-common-static-dbg
```

If you've installed ClickHouse as a single-binary, it already contains the debug info.
:::

:::tip
For more high-level information, check out some of these other system tables:

- [system.processes](https://clickhouse.com/docs/en/operations/system-tables/processes)
- [system.query_log](https://clickhouse.com/docs/en/operations/system-tables/query_log)
- [system.metric_log](https://clickhouse.com/docs/en/operations/system-tables/metric_log)
- [system.asynchronous_metric_log](https://clickhouse.com/docs/en/operations/system-tables/asynchronous_metric_log)
- [system.trace_log](https://clickhouse.com/docs/en/operations/system-tables/trace_log)
- [system.processor_profile_log](https://clickhouse.com/docs/en/operations/system-tables/processors_profile_log)

And there is handy info in the [other system tables](https://clickhouse.com/docs/en/operations/system-tables) also.
:::