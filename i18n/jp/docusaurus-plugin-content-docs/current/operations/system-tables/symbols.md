---
description: 'C++ のエキスパートおよび ClickHouse エンジニア向けの、`clickhouse` バイナリのイントロスペクション情報を含む system テーブルです。'
keywords: ['system table', 'symbols']
slug: /operations/system-tables/symbols
title: 'system.symbols'
doc_type: 'reference'
---

`clickhouse` バイナリのイントロスペクション用の情報を含みます。アクセスするには introspection 権限が必要です。
このテーブルは C++ のエキスパートおよび ClickHouse エンジニアにのみ有用です。

カラム:

* `symbol` ([String](../../sql-reference/data-types/string.md)) — バイナリ内のシンボル名。マングルされています。可読な名前を得るには `demangle(symbol)` を適用できます。
* `symbol_demangled` ([Nullable(String)](../../sql-reference/data-types/string.md)) — XRay 計測に使用されるデマングル済みシンボル。
* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/int-uint.md)) — XRay 計測マップ内の関数 ID。
* `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイナリ内でのシンボルの開始アドレス。
* `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイナリ内でのシンボルの終了アドレス。
* `name` ([String](../../sql-reference/data-types/string.md)) — `event` のエイリアス。

**例**

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
