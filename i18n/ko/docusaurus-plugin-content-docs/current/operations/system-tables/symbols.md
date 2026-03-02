---
description: '`clickhouse` 바이너리를 내부적으로 검사할 수 있는 정보를 제공하는 시스템 테이블로, C++ 전문가와 ClickHouse 엔지니어에게 유용합니다.'
keywords: ['system table', 'symbols']
slug: /operations/system-tables/symbols
title: 'system.symbols'
doc_type: 'reference'
---

`clickhouse` 바이너리에 대한 내부 검사(introspection) 정보를 포함합니다. 접근하려면 introspection 권한이 필요합니다.
이 테이블은 C++ 전문가와 ClickHouse 엔지니어에게만 유용합니다.

컬럼:

* `symbol` ([String](../../sql-reference/data-types/string.md)) — 바이너리에서의 심볼 이름입니다. 맹글링되어 있습니다. 사람이 읽을 수 있는 이름을 얻으려면 `demangle(symbol)`을 적용할 수 있습니다.
* `symbol_demangled` ([Nullable(String)](../../sql-reference/data-types/string.md)) — XRay 계측에 사용되는 디맹글링된 심볼입니다.
* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/int-uint.md)) — XRay 계측 맵에서의 함수 ID입니다.
* `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이너리 내에서 심볼이 시작되는 주소입니다.
* `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 바이너리 내에서 심볼이 끝나는 주소입니다.
* `name` ([String](../../sql-reference/data-types/string.md)) — `event`의 별칭입니다.

**예시**

```sql
SELECT * FROM system.symbols WHERE function_id IS NOT NULL LIMIT 5 SETTINGS allow_introspection_functions = 1
```

```text
Row 1:
──────
symbol:           _Z15isClickhouseAppNSt3__117basic_string_viewIcNS_11char_traitsIcEEEERNS_6vectorIPcNS_9allocatorIS5_EEEE
symbol_demangled: isClickhouseApp(std::__1::basic_string_view<char, std::__1::char_traits<char>>, std::__1::vector<char*, std::__1::allocator<char*>>&)
function_id:      1
address_begin:    219229312 -- 219.23 million
address_end:      219231408 -- 219.23 million

Row 2:
──────
symbol:           main
symbol_demangled: main
function_id:      2
address_begin:    219231872 -- 219.23 million
address_end:      219233485 -- 219.23 million

Row 3:
──────
symbol:           _ZN12_GLOBAL__N_19printHelpEiPPc
symbol_demangled: (anonymous namespace)::printHelp(int, char**)
function_id:      3
address_begin:    219233536 -- 219.23 million
address_end:      219233902 -- 219.23 million

Row 4:
──────
symbol:           _ZNSt3__110filesystem4pathC2B8se210105IPcvEERKT_NS1_6formatE
symbol_demangled: std::__1::filesystem::path::path[abi:se210105]<char*, void>(char* const&, std::__1::filesystem::path::format)
function_id:      4
address_begin:    219234496 -- 219.23 million
address_end:      219234620 -- 219.23 million

Row 5:
──────
symbol:           _ZNSt3__113unordered_setINS_17basic_string_viewIcNS_11char_traitsIcEEEENS_4hashIS4_EENS_8equal_toIS4_EENS_9allocatorIS4_EEEC2ESt16initializer_listIS4_E
symbol_demangled: std::__1::unordered_set<std::__1::basic_string_view<char, std::__1::char_traits<char>>, std::__1::hash<std::__1::basic_string_view<char, std::__1::char_traits<char>>>, std::__1::equal_to<std::__1::basic_string_view<char, std::__1::char_traits<char>>>, std::__1::allocator<std::__1::basic_string_view<char, std::__1::char_traits<char>>>>::unordered_set(std::initializer_list<std::__1::basic_string_view<char, std::__1::char_traits<char>>>)
function_id:      5
address_begin:    219235584 -- 219.24 million
address_end:      219235708 -- 219.24 million
```
