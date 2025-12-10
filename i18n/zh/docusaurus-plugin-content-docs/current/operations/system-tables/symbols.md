---
description: '对 `clickhouse` 二进制文件进行自省所用的系统表，适用于 C++ 专家和 ClickHouse 工程师。'
keywords: ['系统表', '符号']
slug: /operations/system-tables/symbols
title: 'system.symbols'
doc_type: 'reference'
---

包含用于对 `clickhouse` 二进制文件进行自省的信息。访问它需要具有 `introspection` 权限。
此表仅对 C++ 专家和 ClickHouse 工程师有用。

列：

* `symbol` ([String](../../sql-reference/data-types/string.md)) — 二进制文件中的符号名称。它经过名称重整（mangled）。可以使用 `demangle(symbol)` 来获得可读名称。
* `symbol_demangled` ([Nullable(String)](../../sql-reference/data-types/string.md)) — 用于 XRay 插桩的已解重整（demangled）符号。
* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/int-uint.md)) — 在 XRay 插桩映射中的函数 ID。
* `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 符号在二进制文件中的起始地址。
* `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 符号在二进制文件中的结束地址。
* `name` ([String](../../sql-reference/data-types/string.md)) — `event` 的别名。

**示例**

```sql
SELECT * FROM system.symbols WHERE function_id IS NOT NULL LIMIT 5 SETTINGS allow_introspection_functions = 1
```

```text
行 1:
──────
symbol:           _Z15isClickhouseAppNSt3__117basic_string_viewIcNS_11char_traitsIcEEEERNS_6vectorIPcNS_9allocatorIS5_EEEE
symbol_demangled: isClickhouseApp(std::__1::basic_string_view<char, std::__1::char_traits<char>>, std::__1::vector<char*, std::__1::allocator<char*>>&)
function_id:      1
address_begin:    219229312 -- 219.23 million
address_end:      219231408 -- 219.23 million

行 2:
──────
symbol:           main
symbol_demangled: main
function_id:      2
address_begin:    219231872 -- 219.23 million
address_end:      219233485 -- 219.23 million

行 3:
──────
symbol:           _ZN12_GLOBAL__N_19printHelpEiPPc
symbol_demangled: (anonymous namespace)::printHelp(int, char**)
function_id:      3
address_begin:    219233536 -- 219.23 million
address_end:      219233902 -- 219.23 million

行 4:
──────
symbol:           _ZNSt3__110filesystem4pathC2B8se210105IPcvEERKT_NS1_6formatE
symbol_demangled: std::__1::filesystem::path::path[abi:se210105]<char*, void>(char* const&, std::__1::filesystem::path::format)
function_id:      4
address_begin:    219234496 -- 219.23 million
address_end:      219234620 -- 219.23 million

行 5:
──────
symbol:           _ZNSt3__113unordered_setINS_17basic_string_viewIcNS_11char_traitsIcEEEENS_4hashIS4_EENS_8equal_toIS4_EENS_9allocatorIS4_EEEC2ESt16initializer_listIS4_E
symbol_demangled: std::__1::unordered_set<std::__1::basic_string_view<char, std::__1::char_traits<char>>, std::__1::hash<std::__1::basic_string_view<char, std::__1::char_traits<char>>>, std::__1::equal_to<std::__1::basic_string_view<char, std::__1::char_traits<char>>>, std::__1::allocator<std::__1::basic_string_view<char, std::__1::char_traits<char>>>>::unordered_set(std::initializer_list<std::__1::basic_string_view<char, std::__1::char_traits<char>>>)
function_id:      5
address_begin:    219235584 -- 219.24 million
address_end:      219235708 -- 219.24 million
```
