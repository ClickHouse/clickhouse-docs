---
alias: []
description: 'DWARF フォーマットのドキュメント'
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

`DWARF`フォーマットは、ELFファイル(実行可能ファイル、ライブラリ、またはオブジェクトファイル)からDWARFデバッグシンボルを解析します。
`dwarfdump`に似ていますが、はるかに高速(数百MB/秒)でSQLをサポートしています。
`.debug_info`セクション内の各デバッグ情報エントリ(DIE)に対して1行を生成し、
ツリー内の子要素のリストを終了するためにDWARFエンコーディングが使用する「null」エントリも含まれます。

:::info
`.debug_info`は_ユニット_で構成されており、これはコンパイル単位に対応します:

- 各ユニットは*DIE*のツリーであり、`compile_unit` DIEをルートとします。
- 各DIEは_タグ_と_属性_のリストを持ちます。
- 各属性は_名前_と_値_を持ちます(また、値のエンコード方法を指定する_形式_も持ちます)。

DIEはソースコードからの要素を表し、その_タグ_がどのような種類の要素であるかを示します。例えば、以下があります:

- 関数(tag = `subprogram`)
- クラス/構造体/列挙型(`class_type`/`structure_type`/`enumeration_type`)
- 変数(`variable`)
- 関数引数(`formal_parameter`)。

ツリー構造は対応するソースコードを反映しています。例えば、`class_type` DIEは、そのクラスのメソッドを表す`subprogram` DIEを含むことができます。
:::

`DWARF`フォーマットは以下のカラムを出力します:

- `offset` - `.debug_info`セクション内のDIEの位置
- `size` - エンコードされたDIEのバイト数(属性を含む)
- `tag` - DIEの型。慣例的な「DW*TAG*」接頭辞は省略されています
- `unit_name` - このDIEを含むコンパイル単位の名前
- `unit_offset` - `.debug_info`セクション内でこのDIEを含むコンパイル単位の位置
- `ancestor_tags` - ツリー内の現在のDIEの祖先のタグの配列。最も内側から最も外側の順
- `ancestor_offsets` - 祖先のオフセット。`ancestor_tags`と並行
- 利便性のために属性配列から複製されたいくつかの一般的な属性:
  - `name`
  - `linkage_name` - マングルされた完全修飾名。通常は関数のみが持ちます(ただし、すべての関数ではありません)
  - `decl_file` - このエンティティが宣言されたソースコードファイルの名前
  - `decl_line` - このエンティティが宣言されたソースコード内の行番号
- 属性を記述する並行配列:
  - `attr_name` - 属性の名前。慣例的な「DW*AT*」接頭辞は省略されています
  - `attr_form` - 属性のエンコードおよび解釈方法。慣例的なDW*FORM*接頭辞は省略されています
  - `attr_int` - 属性の整数値。属性が数値を持たない場合は0
  - `attr_str` - 属性の文字列値。属性が文字列値を持たない場合は空


## 使用例 {#example-usage}

`DWARF`フォーマットを使用して、最も多くの関数定義を持つコンパイル単位を見つけることができます（テンプレートのインスタンス化やインクルードされたヘッダーファイルからの関数を含む）：

```sql title="クエリ"
SELECT
    unit_name,
    count() AS c
FROM file('programs/clickhouse', DWARF)
WHERE tag = 'subprogram' AND NOT has(attr_name, 'declaration')
GROUP BY unit_name
ORDER BY c DESC
LIMIT 3
```

```text title="レスポンス"
┌─unit_name──────────────────────────────────────────────────┬─────c─┐
│ ./src/Core/Settings.cpp                                    │ 28939 │
│ ./src/AggregateFunctions/AggregateFunctionSumMap.cpp       │ 23327 │
│ ./src/AggregateFunctions/AggregateFunctionUniqCombined.cpp │ 22649 │
└────────────────────────────────────────────────────────────┴───────┘

3 rows in set. Elapsed: 1.487 sec. Processed 139.76 million rows, 1.12 GB (93.97 million rows/s., 752.77 MB/s.)
Peak memory usage: 271.92 MiB.
```


## フォーマット設定 {#format-settings}
