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

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |



## 説明 {#description}

`DWARF` 形式は、ELF ファイル（実行ファイル、ライブラリ、またはオブジェクトファイル）から DWARF デバッグシンボルをパースします。  
これは `dwarfdump` と似ていますが、はるかに高速（毎秒数百MB）であり、さらに SQL をサポートしています。  
`.debug_info` セクション内の各 Debug Information Entry（DIE）ごとに 1 行を生成し、  
DWARF エンコーディングがツリー内の子リストの終端に使用する「null」エントリも含みます。

:::info
`.debug_info` は *unit* から成り、それぞれがコンパイル単位に対応します:
- 各 unit は *DIE* のツリーであり、ルートとして `compile_unit` DIE を持ちます。
- 各 DIE は *tag* と *attribute* のリストを持ちます。
- 各 attribute は *name* と *value*（および値のエンコード方法を指定する *form*）を持ちます。

DIE はソースコード中の対象を表し、その *tag* によって何を表す DIE なのかが分かります。例えば次のようなものがあります:

- 関数（tag = `subprogram`）
- クラス / 構造体 / 列挙体（`class_type` / `structure_type` / `enumeration_type`）
- 変数（`variable`）
- 関数引数（`formal_parameter`）

このツリー構造は対応するソースコードを反映しています。例えば、`class_type` DIE は、そのクラスのメソッドを表す `subprogram` DIE を子として含むことができます。
:::

`DWARF` 形式は次の列を出力します:

- `offset` - `.debug_info` セクション内での DIE の位置
- `size` - エンコードされた DIE のバイト数（attribute を含む）
- `tag` - DIE の種別。慣例的な `DW_TAG_` 接頭辞は省略されます
- `unit_name` - この DIE を含むコンパイル単位の名前
- `unit_offset` - この DIE を含むコンパイル単位の `.debug_info` セクション内での位置
- `ancestor_tags` - ツリー内で現在の DIE の祖先にあたる tag の配列。内側から外側への順
- `ancestor_offsets` - 祖先の offset。`ancestor_tags` と並行な配列
- いくつかの一般的な attribute を利便性のために attribute 配列から複製した列:
  - `name`
  - `linkage_name` - マングル済みの完全修飾名。通常は関数のみが持ちます（ただしすべての関数ではありません）
  - `decl_file` - このエンティティが宣言されたソースコードファイル名
  - `decl_line` - このエンティティが宣言されたソースコード上の行番号
- attribute を表す並行配列:
  - `attr_name` - attribute の名前。慣例的な `DW_AT_` 接頭辞は省略されます
  - `attr_form` - attribute のエンコードおよび解釈方法。慣例的な `DW_FORM_` 接頭辞は省略されます
  - `attr_int` - attribute の整数値。数値を持たない attribute の場合は 0
  - `attr_str` - attribute の文字列値。文字列値を持たない attribute の場合は空文字列



## 使用例

`DWARF` フォーマットを使用すると、テンプレートのインスタンス化やインクルードされたヘッダーファイル内の関数を含め、最も多くの関数定義を含むコンパイル単位を特定できます。

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

3行のセット。経過時間: 1.487秒。処理済み: 1億3976万行、1.12 GB (9397万行/秒、752.77 MB/秒)
ピークメモリ使用量: 271.92 MiB。
```


## フォーマット設定 {#format-settings}
