---
description: 'Системная таблица, полезная для экспертов по C++ и инженеров ClickHouse, содержащая
  информацию для интроспекции бинарного файла `clickhouse`.'
keywords: ['system table', 'symbols']
slug: /operations/system-tables/symbols
title: 'system.symbols'
doc_type: 'reference'
---

Содержит информацию для интроспекции бинарного файла `clickhouse`. Для доступа требуется привилегия INTROSPECTION.
Эта таблица полезна только для экспертов по C++ и инженеров ClickHouse.

Столбцы:

* `symbol` ([String](../../sql-reference/data-types/string.md)) — Имя символа в бинарном файле. Оно задекорировано (mangled). Можно применить `demangle(symbol)`, чтобы получить читаемое имя.
* `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Начальный адрес символа в бинарном файле.
* `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Конечный адрес символа в бинарном файле.
* `name` ([String](../../sql-reference/data-types/string.md)) — Синоним для `event`.

**Пример**

```sql
SELECT address_begin, address_end - address_begin AS size, demangle(symbol) FROM system.symbols ORDER BY size DESC LIMIT 10
```

```text
┌─address_begin─┬─────size─┬─demangle(symbol)──────────────────────────────────────────────────────────────────┐
│      25000976 │ 29466000 │ icudt70_dat                                                                       │
│     400605288 │  2097272 │ arena_emap_global                                                                 │
│      18760592 │  1048576 │ CLD2::kQuadChrome1015_2                                                           │
│       9807152 │   884808 │ TopLevelDomainLookupHash::isValid(char const*, unsigned long)::wordlist           │
│      57442432 │   850608 │ llvm::X86Insts                                                                    │
│      55682944 │   681360 │ (anonymous namespace)::X86DAGToDAGISel::SelectCode(llvm::SDNode*)::MatcherTable   │
│      55130368 │   502840 │ (anonymous namespace)::X86InstructionSelector::getMatchTable() const::MatchTable0 │
│     402930616 │   404032 │ qpl::ml::dispatcher::hw_dispatcher::get_instance()::instance                      │
│     274131872 │   356795 │ DB::SettingsTraits::Accessor::instance()::$_0::operator()() const                 │
│      58293040 │   249424 │ llvm::X86InstrNameData                                                            │
└───────────────┴──────────┴───────────────────────────────────────────────────────────────────────────────────┘
```
