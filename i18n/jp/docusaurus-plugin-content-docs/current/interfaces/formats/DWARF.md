---
'alias': []
'description': 'DWARFフォーマットに関するDocumentation'
'input_format': true
'keywords':
- 'DWARF'
'output_format': false
'slug': '/interfaces/formats/DWARF'
'title': 'DWARF'
'doc_type': 'reference'
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

`DWARF` フォーマットは、ELF ファイル (実行可能ファイル、ライブラリ、またはオブジェクトファイル) から DWARF デバッグシンボルを解析します。  
これは `dwarfdump` に似ていますが、はるかに高速 (毎秒数百 MB) で、SQL をサポートしています。  
`.debug_info` セクション内の各デバッグ情報エントリ (DIE) に対して 1 行を生成し、DWARF エンコーディングがツリー内の子のリストを終了するために使用する「null」エントリも含まれます。

:::info
`.debug_info` は *units* で構成されており、これはコンパイルユニットに対応します:  
- 各ユニットは *DIE* のツリーであり、`compile_unit` DIE がそのルートです。  
- 各 DIE には *tag* と *attributes* のリストがあります。  
- 各属性には *name* と *value* (および *form* もあり、これは値がどのようにエンコードされているかを指定します) があります。  

DIE はソースコードからの事物を表し、その *tag* はそれが何の種類のものであるかを示します。例えば、次があります:

- 関数 (tag = `subprogram`)
- クラス / 構造体 / 列挙型 (`class_type` / `structure_type` / `enumeration_type`)
- 変数 (`variable`)
- 関数の引数 (`formal_parameter`)。

ツリー構造は、対応するソースコードを反映しています。例えば、`class_type` DIE は、そのクラスのメソッドを表す `subprogram` DIE を含むことができます。
:::

`DWARF` フォーマットは以下のカラムを出力します:

- `offset` - `.debug_info` セクション内の DIE の位置
- `size` - エンコードされた DIE のバイト数 (属性を含む)
- `tag` - DIE のタイプ; 従来の "DW_TAG_" プレフィックスは省略されます
- `unit_name` - この DIE を含むコンパイルユニットの名前
- `unit_offset` - `.debug_info` セクション内のこの DIE を含むコンパイルユニットの位置
- `ancestor_tags` - ツリー内の現在の DIE の祖先のタグの配列 (内側から外側へ順)
- `ancestor_offsets` - `ancestor_tags` と並行する祖先のオフセット
- 便利のために属性配列から複製された一般的な属性:
  - `name`
  - `linkage_name` - マングルされた完全修飾名; 通常は関数のみが持つ (ただし、すべての関数ではありません)
  - `decl_file` - このエンティティが宣言されたソースコードファイルの名前
  - `decl_line` - このエンティティが宣言されたソースコード内の行番号
- 属性を説明する並行配列:
  - `attr_name` - 属性の名前; 従来の "DW_AT_" プレフィックスは省略されます
  - `attr_form` - 属性がどのようにエンコードされ、解釈されるか; 従来の DW_FORM_ プレフィックスは省略されます
  - `attr_int` - 属性の整数値; 属性に数値値がない場合は 0
  - `attr_str` - 属性の文字列値; 属性に文字列値がない場合は空

## 使用例 {#example-usage}

`DWARF` フォーマットは、最も多くの関数定義を持つコンパイルユニット (テンプレートのインスタンス化やインクルードされたヘッダーファイルからの関数を含む) を見つけるために使用できます:

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

## フォーマット設定 {#format-settings}
