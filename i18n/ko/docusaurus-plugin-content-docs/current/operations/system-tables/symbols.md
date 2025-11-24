---
'description': 'C++ 전문가와 ClickHouse 엔지니어에게 유용한 시스템 테이블로, `clickhouse` 바이너리의 내부 정보를
  포함합니다.'
'keywords':
- 'system table'
- 'symbols'
'slug': '/operations/system-tables/symbols'
'title': 'system.symbols'
'doc_type': 'reference'
---

`clickhouse` 바이너리에 대한 자기 검사의 정보를 포함합니다. 접근하려면 자기 검사 권한이 필요합니다.  
이 테이블은 C++ 전문가와 ClickHouse 엔지니어에게만 유용합니다.

컬럼:

- `symbol` ([String](../../sql-reference/data-types/string.md)) — 바이너리에서의 심볼 이름. 이름이 변형되어 있습니다. 읽을 수 있는 이름을 얻으려면 `demangle(symbol)`을 적용할 수 있습니다.
- `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이너리에서 심볼의 시작 주소.
- `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이너리에서 심볼의 끝 주소.
- `name` ([String](../../sql-reference/data-types/string.md)) — `event`의 별칭.

**예제**

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
