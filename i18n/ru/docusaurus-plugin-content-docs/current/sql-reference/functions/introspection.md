---
description: 'Документация по функциям интроспекции'
sidebar_label: 'Интроспекция'
sidebar_position: 100
slug: /sql-reference/functions/introspection
title: 'Функции интроспекции'
---


# Функции интроспекции

Вы можете использовать функции, описанные в этой главе, для интроспекции [ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format) и [DWARF](https://en.wikipedia.org/wiki/DWARF) для профилирования запросов.

:::note    
Эти функции медленные и могут вызывать проблемы с безопасностью.
:::

Для корректной работы функций интроспекции:

- Установите пакет `clickhouse-common-static-dbg`.

- Установите настройку [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions) в 1.

        По соображениям безопасности функции интроспекции по умолчанию отключены.

ClickHouse сохраняет отчеты профилировщика в системную таблицу [trace_log](/operations/system-tables/trace_log). Убедитесь, что таблица и профилировщик правильно настроены.

## addressToLine {#addresstoline}

Преобразует виртуальный адрес памяти внутри процесса сервера ClickHouse в имя файла и номер строки в исходном коде ClickHouse.

Если вы используете официальные пакеты ClickHouse, вам необходимо установить пакет `clickhouse-common-static-dbg`.

**Синтаксис**

```sql
addressToLine(address_of_binary_instruction)
```

**Аргументы**

- `address_of_binary_instruction` ([UInt64](../data-types/int-uint.md)) — Адрес инструкции в работающем процессе.

**Возвращаемое значение**

- Имя файла исходного кода и номер строки в этом файле, разделенные двоеточием.
        Например, `/build/obj-x86_64-linux-gnu/../src/Common/ThreadPool.cpp:199`, где `199` — номер строки.
- Имя бинарного файла, если функция не смогла найти отладочную информацию.
- Пустая строка, если адрес недействителен.

Тип: [String](../../sql-reference/data-types/string.md).

**Пример**

Включение функций интроспекции:

```sql
SET allow_introspection_functions=1;
```

Выбор первой строки из системной таблицы `trace_log`:

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

Поле `trace` содержит стек вызовов на момент выборки.

Получение имени файла исходного кода и номера строки для одного адреса:

```sql
SELECT addressToLine(94784076370703) \G;
```

```text
Row 1:
──────
addressToLine(94784076370703): /build/obj-x86_64-linux-gnu/../src/Common/ThreadPool.cpp:199
```

Применение функции ко всему стеку вызовов:

```sql
SELECT
    arrayStringConcat(arrayMap(x -> addressToLine(x), trace), '\n') AS trace_source_code_lines
FROM system.trace_log
LIMIT 1
\G
```

Функция [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) позволяет обработать каждый отдельный элемент массива `trace` с помощью функции `addressToLine`. Результат этой обработки вы видите в столбце `trace_source_code_lines` вывода.

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

Похоже на `addressToLine`, но возвращает массив со всеми инлайн-функциями. В результате этого он медленнее, чем `addressToLine`.

:::note
Если вы используете официальные пакеты ClickHouse, вам необходимо установить пакет `clickhouse-common-static-dbg`.
:::

**Синтаксис**

```sql
addressToLineWithInlines(address_of_binary_instruction)
```

**Аргументы**

- `address_of_binary_instruction` ([UInt64](../data-types/int-uint.md)) — Адрес инструкции в работающем процессе.

**Возвращаемое значение**

- Массив, первый элемент которого — это имя файла исходного кода и номер строки в файле, разделенные двоеточием. Начиная со второго элемента, перечислены имена файлов исходного кода инлайн-функций, номера строк и имена функций. Если функция не смогла найти отладочную информацию, то возвращается массив с единственным элементом, равным имени бинарного файла; в противном случае, если адрес недействителен, возвращается пустой массив. [Array(String)](../data-types/array.md).

**Пример**

Включение функций интроспекции:

```sql
SET allow_introspection_functions=1;
```

Применение функции к адресу.

```sql
SELECT addressToLineWithInlines(531055181::UInt64);
```

```text
┌─addressToLineWithInlines(CAST('531055181', 'UInt64'))────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ['./src/Functions/addressToLineWithInlines.cpp:98','./build_normal_debug/./src/Functions/addressToLineWithInlines.cpp:176:DB::(anonymous namespace)::FunctionAddressToLineWithInlines::implCached(unsigned long) const'] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Применение функции ко всему стеку вызовов:

```sql
SELECT
    ta, addressToLineWithInlines(arrayJoin(trace) as ta)
FROM system.trace_log
WHERE
    query_id = '5e173544-2020-45de-b645-5deebe2aae54';
```

Функция [arrayJoin](/sql-reference/functions/array-join) разбивает массив на строки.

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

Преобразует виртуальный адрес памяти внутри процесса сервера ClickHouse в символ из объектных файлов ClickHouse.

**Синтаксис**

```sql
addressToSymbol(address_of_binary_instruction)
```

**Аргументы**

- `address_of_binary_instruction` ([UInt64](../data-types/int-uint.md)) — Адрес инструкции в работающем процессе.

**Возвращаемое значение**

- Символ из объектных файлов ClickHouse. [String](../data-types/string.md).
- Пустая строка, если адрес недействителен. [String](../data-types/string.md).

**Пример**

Включение функций интроспекции:

```sql
SET allow_introspection_functions=1;
```

Выбор первой строки из системной таблицы `trace_log`:

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

Поле `trace` содержит стек вызовов на момент выборки.

Получение символа для одного адреса:

```sql
SELECT addressToSymbol(94138803686098) \G;
```

```text
Row 1:
──────
addressToSymbol(94138803686098): _ZNK2DB24IAggregateFunctionHelperINS_20AggregateFunctionSumImmNS_24AggregateFunctionSumDataImEEEEE19addBatchSinglePlaceEmPcPPKNS_7IColumnEPNS_5ArenaE
```

Применение функции ко всему стеку вызовов:

```sql
SELECT
    arrayStringConcat(arrayMap(x -> addressToSymbol(x), trace), '\n') AS trace_symbols
FROM system.trace_log
LIMIT 1
\G
```

Функция [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) позволяет обработать каждый отдельный элемент массива `trace` с помощью функции `addressToSymbols`. Результат этой обработки вы видите в столбце `trace_symbols` вывода.

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

Преобразует символ, который вы можете получить с помощью функции [addressToSymbol](#addresstosymbol), в имя функции C++.

**Синтаксис**

```sql
demangle(symbol)
```

**Аргументы**

- `symbol` ([String](../data-types/string.md)) — Символ из объектного файла.

**Возвращаемое значение**

- Имя функции C++, или пустая строка, если символ недействителен. [String](../data-types/string.md).

**Пример**

Включение функций интроспекции:

```sql
SET allow_introspection_functions=1;
```

Выбор первой строки из системной таблицы `trace_log`:

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

Поле `trace` содержит стек вызовов на момент выборки.

Получение имени функции для одного адреса:

```sql
SELECT demangle(addressToSymbol(94138803686098)) \G;
```

```text
Row 1:
──────
demangle(addressToSymbol(94138803686098)): DB::IAggregateFunctionHelper<DB::AggregateFunctionSum<unsigned long, unsigned long, DB::AggregateFunctionSumData<unsigned long> > >::addBatchSinglePlace(unsigned long, char*, DB::IColumn const**, DB::Arena*) const
```

Применение функции ко всему стеку вызовов:

```sql
SELECT
    arrayStringConcat(arrayMap(x -> demangle(addressToSymbol(x)), trace), '\n') AS trace_functions
FROM system.trace_log
LIMIT 1
\G
```

Функция [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) позволяет обработать каждый отдельный элемент массива `trace` с помощью функции `demangle`. Результат этой обработки вы видите в столбце `trace_functions` вывода.

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

Возвращает идентификатор потока, в котором обрабатывается текущий [Block](/development/architecture/#block).

**Синтаксис**

```sql
tid()
```

**Возвращаемое значение**

- Текущий идентификатор потока. [Uint64](/sql-reference/data-types/int-uint#integer-ranges).

**Пример**

Запрос:

```sql
SELECT tid();
```

Результат:

```text
┌─tid()─┐
│  3878 │
└───────┘
```

## logTrace {#logtrace}

Генерирует сообщение трассировки в журнал сервера для каждого [Block](/development/architecture/#block).

**Синтаксис**

```sql
logTrace('message')
```

**Аргументы**

- `message` — Сообщение, которое будет записано в журнал сервера. [String](/sql-reference/data-types/string).

**Возвращаемое значение**

- Всегда возвращает 0.

**Пример**

Запрос:

```sql
SELECT logTrace('logTrace message');
```

Результат:

```text
┌─logTrace('logTrace message')─┐
│                            0 │
└──────────────────────────────┘
```
