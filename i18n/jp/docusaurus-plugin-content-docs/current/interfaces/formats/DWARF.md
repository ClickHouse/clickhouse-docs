---
alias: []
description: 'DWARFフォーマットのドキュメント'
input_format: true
keywords:
- 'DWARF'
output_format: false
slug: '/interfaces/formats/DWARF'
title: 'DWARF'
---



| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

`DWARF` 形式は ELF ファイル（実行可能ファイル、ライブラリ、またはオブジェクトファイル）から DWARF デバッグシンボルを解析します。 
これは `dwarfdump` に似ていますが、はるかに高速（毎秒数百 MB）で、SQL をサポートしています。 
それは `.debug_info` セクション内の各デバッグ情報エントリ (DIE) に対して 1 行を生成し、DWARF エンコーディングがツリー内の子供のリストを終了するために使用する “null” エントリを含みます。

:::info
`.debug_info` は *ユニット* で構成され、これがコンパイルユニットに対応します: 
- 各ユニットは *DIE* のツリーであり、ルートとして `compile_unit` DIE を持ちます。 
- 各 DIE には *タグ* と *属性* のリストがあります。 
- 各属性には *名前* と *値* （および *形式* があり、これは値のエンコード方法を指定します）が含まれます。 

DIE はソースコードからの項目を表しており、その *タグ* はそれが何の種類のものであるかを示します。例えば、以下のものがあります:

- 関数 (タグ = `subprogram`)
- クラス/構造体/列挙型 (`class_type`/`structure_type`/`enumeration_type`)
- 変数 (`variable`)
- 関数の引数 (`formal_parameter`)

ツリー構造は、対応するソースコードを反映します。例えば、`class_type` DIE はクラスのメソッドを表す `subprogram` DIE を含むことができます。
:::

`DWARF` 形式は以下のカラムを出力します:

- `offset` - `.debug_info` セクション内の DIE の位置
- `size` - エンコードされた DIE のバイト数（属性を含む）
- `tag` - DIE の種類; 従来の "DW_TAG_" プレフィックスは省略されます
- `unit_name` - この DIE を含むコンパイルユニットの名前
- `unit_offset` - `.debug_info` セクション内のこの DIE を含むコンパイルユニットの位置
- `ancestor_tags` - ツリー内の現在の DIE の先祖のタグの配列で、内側から外側へ順に
- `ancestor_offsets` - 先祖のオフセット、`ancestor_tags` に平行
- 利便性のために属性の配列から複製された一般的な属性のいくつか:
    - `name`
    - `linkage_name` - マングルされた完全修飾名; 通常は関数のみが持つ（すべての関数ではないが）
    - `decl_file` - このエンティティが宣言されたソースコードファイルの名前
    - `decl_line` - このエンティティが宣言されたソースコード内の行番号
- 属性を説明する平行配列:
    - `attr_name` - 属性の名前; 従来の "DW_AT_" プレフィックスは省略されています
    - `attr_form` - 属性がどのようにエンコードされ、解釈されるか; 従来の DW_FORM_ プレフィックスは省略されます
    - `attr_int` - 属性の整数値; 属性が数値値を持たない場合は 0
    - `attr_str` - 属性の文字列値; 属性が文字列値を持たない場合は空です

## 使用例 {#example-usage}

`DWARF` 形式は、最も多くの関数定義（テンプレートインスタンスや含まれているヘッダーファイルからの関数を含む）を持つコンパイルユニットを見つけるために使用できます:

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

3 行がセットに含まれています。経過時間: 1.487 秒。139.76 百万行を処理しました。1.12 GB (93.97 百万行/秒, 752.77 MB/秒)。
ピークメモリ使用量: 271.92 MiB。
```

## 形式設定 {#format-settings}
