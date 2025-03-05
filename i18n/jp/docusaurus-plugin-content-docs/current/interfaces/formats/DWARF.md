---
title: DWARF
slug: /interfaces/formats/DWARF
keywords: [DWARF]
input_format: true
output_format: false
alias: []
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

`DWARF` フォーマットは ELF ファイル（実行ファイル、ライブラリ、またはオブジェクトファイル）から DWARF デバッグシンボルを解析します。 
これは `dwarfdump` に似ていますが、はるかに高速（毎秒数百 MB）で、SQL をサポートしています。 
`.debug_info` セクション内の各デバッグ情報エントリ (DIE) に対して 1 行を生成し、DWARF エンコーディングがツリー内の子リストを終了するために使用する「null」エントリを含みます。

:::info
`.debug_info` はコンパイルユニットに対応する *units* で構成されています：
- 各ユニットは *DIE* のツリーであり、`compile_unit` DIE がそのルートです。
- 各 DIE には *tag* と *attributes* のリストがあります。
- 各属性には *name* と *value* があり（また、値がどのようにエンコードされるかを指定する *form* もあります）。

DIE はソースコードからの要素を表しており、その *tag* によってそれが何の要素であるかを示します。例えば、以下のようなものがあります：

- 関数 (tag = `subprogram`)
- クラス/構造体/列挙型 (`class_type`/`structure_type`/`enumeration_type`)
- 変数 (`variable`)
- 関数の引数 (`formal_parameter`)

ツリー構造は対応するソースコードを反映しています。例えば、`class_type` DIE はクラスのメソッドを表す `subprogram` DIE を含むことができます。
:::

`DWARF` フォーマットは以下のカラムを出力します：

- `offset` - `.debug_info` セクション内の DIE の位置
- `size` - エンコードされた DIE のバイト数（属性を含む）
- `tag` - DIE のタイプ；通常の「DW_TAG_」接頭辞は省略されます
- `unit_name` - この DIE を含むコンパイルユニットの名前
- `unit_offset` - この DIE を含むコンパイルユニットが `.debug_info` セクション内に位置する場所
- `ancestor_tags` - ツリー内の現在の DIE の先祖のタグの配列、内側から外側への順序で
- `ancestor_offsets` - 先祖のオフセット、`ancestor_tags` に平行
- 利便性のために属性配列から複製された一般的な属性のいくつか：
    - `name`
    - `linkage_name` - 修飾された完全修飾名；通常は関数のみが持ちます（しかし全ての関数ではありません）
    - `decl_file` - このエンティティが宣言されたソースコードファイルの名前
    - `decl_line` - このエンティティが宣言されたソースコード内の行番号
- 属性を記述する平行配列：
    - `attr_name` - 属性の名前；通常の「DW_AT_」接頭辞は省略されます
    - `attr_form` - 属性がどのようにエンコードされ解釈されるか；通常の DW_FORM_ 接頭辞は省略されます
    - `attr_int` - 属性の整数値；属性が数値の値を持たない場合は 0
    - `attr_str` - 属性の文字列値；属性が文字列の値を持たない場合は空

## 使用例 {#example-usage}

`DWARF` フォーマットは、関数定義（テンプレートインスタンス化やインクルードされたヘッダーファイルからの関数を含む）が最も多いコンパイルユニットを見つけるために使用できます：

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

3 行が返されました。経過時間：1.487 秒。139.76 百万行を処理、1.12 GB（93.97 百万行/s、752.77 MB/s）。
ピークメモリ使用量：271.92 MiB。
```

## フォーマット設定 {#format-settings}
