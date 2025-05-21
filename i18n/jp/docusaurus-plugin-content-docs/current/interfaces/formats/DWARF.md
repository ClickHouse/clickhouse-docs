---
alias: []
description: 'DWARFフォーマットに関するドキュメント'
input_format: true
keywords: ['DWARF']
output_format: false
slug: /interfaces/formats/DWARF
title: 'DWARF'
---

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

`DWARF`フォーマットは、ELFファイル（実行可能ファイル、ライブラリ、またはオブジェクトファイル）からDWARFデバッグシンボルを解析します。 
これは `dwarfdump`に似ていますが、はるかに高速（毎秒数百MB）で、SQLをサポートしています。 
`.debug_info`セクションの各デバッグ情報エントリ（DIE）に対して1行を生成し、DWARFエンコーディングがツリー内の子のリストを終了させるために使用する「null」エントリーも含まれています。

:::info
`.debug_info`は、コンパイルユニットに対応する*ユニット*で構成されています： 
- 各ユニットは、`compile_unit` DIEをルートとした*DIE*のツリーです。 
- 各DIEには*タグ*と*属性*のリストがあります。 
- 各属性には*名前*と*値*（および値のエンコード方式を指定する*フォーム*）があります。 

DIEはソースコードの要素を表し、その*タグ*はそれがどのようなものであるかを示します。例えば、次のようなものがあります：

- 関数（タグ = `subprogram`）
- クラス/構造体/列挙体（`class_type`/`structure_type`/`enumeration_type`）
- 変数（`variable`）
- 関数引数（`formal_parameter`）

ツリー構造は対応するソースコードを反映しています。例えば、`class_type` DIEは、そのクラスのメソッドを表す `subprogram` DIEを含むことができます。
:::

`DWARF`フォーマットは以下のカラムを出力します：

- `offset` - `.debug_info`セクション内のDIEの位置
- `size` - エンコードされたDIE内のバイト数（属性を含む）
- `tag` - DIEのタイプ；従来の"DW_TAG_"プレフィックスは省略されます
- `unit_name` - このDIEを含むコンパイルユニットの名前
- `unit_offset` - `.debug_info`セクション内のこのDIEを含むコンパイルユニットの位置
- `ancestor_tags` - ツリー内の現在のDIEの祖先のタグの配列、最も内側から外側への順序
- `ancestor_offsets` - 祖先のオフセット、`ancestor_tags`に平行
- 便利のために属性配列から複製された一般的な属性：
    - `name`
    - `linkage_name` - マングルされた完全修飾名；通常は関数のみが持っています（ただし、すべての関数が持っているわけではありません）
    - `decl_file` - このエンティティが宣言されたソースコードファイルの名前
    - `decl_line` - このエンティティが宣言されたソースコード内の行番号
- 属性を説明する平行配列：
    - `attr_name` - 属性の名前；従来の"DW_AT_"プレフィックスは省略されます
    - `attr_form` - 属性がどのようにエンコードされ、解釈されるか；従来のDW_FORM_プレフィックスは省略されます
    - `attr_int` - 属性の整数値；属性に数値がない場合は0
    - `attr_str` - 属性の文字列値；属性に文字列値がない場合は空

## 使用例 {#example-usage}

`DWARF`フォーマットを使用すると、関数定義が最も多いコンパイルユニット（テンプレートインスタンスやインクルードされたヘッダーファイルの関数を含む）を見つけることができます：

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
ピークメモリ使用量: 271.92 MiB.
```

## フォーマット設定 {#format-settings}
