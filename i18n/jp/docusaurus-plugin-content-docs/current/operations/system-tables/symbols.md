---
'description': 'C++専門家とClickHouseエンジニアに役立つシステムテーブルで、`clickhouse`バイナリのイントロスペクションに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'symbols'
'slug': '/operations/system-tables/symbols'
'title': 'system.symbols'
'doc_type': 'reference'
---

`clickhouse` バイナリのインストロスペクションに関する情報を含んでいます。アクセスするにはインストロスペクション権限が必要です。このテーブルはC++の専門家およびClickHouseのエンジニアにのみ有用です。

カラム:

- `symbol` ([String](../../sql-reference/data-types/string.md)) — バイナリ内のシンボル名。マングルされています。読みやすい名前を得るには `demangle(symbol)` を適用できます。
- `address_begin` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイナリ内のシンボルの開始アドレス。
- `address_end` ([UInt64](../../sql-reference/data-types/int-uint.md)) — バイナリ内のシンボルの終了アドレス。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` のエイリアスです。

**例**

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
