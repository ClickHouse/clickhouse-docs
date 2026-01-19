---
alias: []
description: 'DWARF 形式のドキュメント'
input_format: true
keywords: ['DWARF']
output_format: false
slug: /interfaces/formats/DWARF
title: 'DWARF'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 \{#description\}

`DWARF` フォーマットは、ELF ファイル（実行ファイル、ライブラリ、またはオブジェクトファイル）から DWARF デバッグシンボルをパースします。  
`dwarfdump` に似ていますが、はるかに高速（数百 MB/s）で動作し、SQL をサポートします。  
`.debug_info` セクション内の各 Debug Information Entry (DIE) ごとに 1 行を出力し、さらに、DWARF エンコーディングがツリー内の子リストを終端するために使用する「null」エントリも含みます。

:::info
`.debug_info` は *unit* から構成されており、これはコンパイル単位に対応します:

- 各 unit は *DIE* の木構造であり、ルートには `compile_unit` DIE が存在します。
- 各 DIE は *tag* と *attribute* のリストを持ちます。
- 各 attribute は *name* と *value*（および、その値がどのようにエンコードされているかを指定する *form*）を持ちます。

DIE はソースコード中のさまざまな要素を表し、その *tag* によって何を表しているかが分かります。例えば次のようなものがあります:

- 関数（tag = `subprogram`）
- クラス / 構造体 / enum（`class_type` / `structure_type` / `enumeration_type`）
- 変数（`variable`）
- 関数引数（`formal_parameter`）

ツリー構造は対応するソースコードを反映しています。例えば、`class_type` DIE は、そのクラスのメソッドを表す `subprogram` DIE を含むことができます。
:::

`DWARF` フォーマットは次の列を出力します:

- `offset` - `.debug_info` セクション内での DIE の位置
- `size` - エンコードされた DIE のバイト数（attribute を含む）
- `tag` - DIE の種類。慣例的な `"DW_TAG_"` プレフィックスは省略されています
- `unit_name` - この DIE を含むコンパイル単位の名前
- `unit_offset` - この DIE を含むコンパイル単位の `.debug_info` セクション内での位置
- `ancestor_tags` - 現在の DIE の祖先となるタグの配列（内側から外側の順）
- `ancestor_offsets` - 祖先のオフセットの配列で、`ancestor_tags` と並行
- 利便性のために、attribute 配列から複製された、よく使われる attribute:
  - `name`
  - `linkage_name` - マングルされた完全修飾名。通常は関数のみに存在します（すべての関数にあるとは限りません）
  - `decl_file` - このエンティティが宣言されたソースコードファイル名
  - `decl_line` - このエンティティが宣言されたソースコード中の行番号
- attribute を表現する並行配列:
  - `attr_name` - attribute の名前。慣例的な `"DW_AT_"` プレフィックスは省略されています
  - `attr_form` - attribute がどのようにエンコードおよび解釈されるか。慣例的な `DW_FORM_` プレフィックスは省略されています
  - `attr_int` - attribute の整数値。attribute に数値がない場合は 0
  - `attr_str` - attribute の文字列値。attribute に文字列がない場合は空文字列

## 使用例 \{#example-usage\}

`DWARF` 形式を使うと、最も多くの関数定義（テンプレートのインスタンス化や、インクルードされたヘッダーファイル内の関数を含む）を持つコンパイル単位を特定できます。

```sql title="Query"
SELECT
    unit_name,
    count() AS c
FROM file('programs/clickhouse', DWARF)
WHERE tag = 'subprogram' AND NOT has(attr_name, 'declaration')
GROUP BY unit_name
ORDER BY c DESC
LIMIT 3
```

```text title="Response"
┌─unit_name──────────────────────────────────────────────────┬─────c─┐
│ ./src/Core/Settings.cpp                                    │ 28939 │
│ ./src/AggregateFunctions/AggregateFunctionSumMap.cpp       │ 23327 │
│ ./src/AggregateFunctions/AggregateFunctionUniqCombined.cpp │ 22649 │
└────────────────────────────────────────────────────────────┴───────┘

3 rows in set. Elapsed: 1.487 sec. Processed 139.76 million rows, 1.12 GB (93.97 million rows/s., 752.77 MB/s.)
Peak memory usage: 271.92 MiB.
```

## 書式設定 \{#format-settings\}