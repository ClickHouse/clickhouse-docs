---
'description': '系统表对于 C++ 专家和 ClickHouse 工程师非常有用，包含有关 `clickhouse` 二进制文件的自省信息。'
'keywords':
- 'system table'
- 'symbols'
'slug': '/operations/system-tables/symbols'
'title': 'system.symbols'
'doc_type': 'reference'
---

包含有关 `clickhouse` 二进制文件的自省信息。访问此信息需要自省权限。
此表仅对 C++ 专家和 ClickHouse 工程师有用。

列：

- `symbol` ([String](../../sql-reference/data-types/string.md)) — 二进制中的符号名称。它是经过修改的。您可以应用 `demangle(symbol)` 来获取可读名称。
- `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 符号在二进制中的起始地址。
- `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 符号在二进制中的结束地址。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` 的别名。

**示例**

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
