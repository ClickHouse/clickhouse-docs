---
title : DWARF
slug: /interfaces/formats/DWARF
keywords : [DWARF]
input_format: true
output_format: false
alias: []
---

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✔     | ✗       |       |

## 説明 {#description}

`DWARF` 形式は、ELFファイル (実行可能ファイル、ライブラリ、オブジェクトファイル) から DWARF デバッグシンボルを解析します。 
これは `dwarfdump` に似ていますが、はるかに高速で (毎秒数百MB) SQL をサポートしています。 
`.debug_info` セクション内の各デバッグ情報エントリ (DIE) に対して 1 行を生成し、DWARF エンコーディングがツリー内の子リストを終了するために使用する「null」エントリも含まれています。

:::info
`.debug_info` は、コンパイル単位に対応する *ユニット* で構成されています。 
- 各ユニットは *DIE* のツリーで、`compile_unit` DIE がそのルートになります。 
- 各 DIE には *タグ* と *属性* のリストがあります。 
- 各属性には *名前* と *値* (および値がどのようにエンコードされているかを指定する *形式*) があります。 

DIE はソースコードの要素を表し、その *タグ* はそれがどのようなものであるかを示します。 例えば、以下のようなものがあります:

- 関数 (タグ = `subprogram`)
- クラス/構造体/列挙型 (`class_type`/`structure_type`/`enumeration_type`)
- 変数 (`variable`)
- 関数引数 (`formal_parameter`)

ツリー構造は対応するソースコードを反映しています。 例えば、`class_type` DIE は、そのクラスのメソッドを表す `subprogram` DIE を含むことができます。
:::

`DWARF` 形式は、以下のカラムを出力します:

- `offset` - `.debug_info` セクションにおける DIE の位置
- `size` - エンコードされた DIE のバイト数 (属性を含む)
- `tag` - DIE のタイプ; 従来の「DW_TAG_」プレフィックスは省略
- `unit_name` - この DIE を含むコンパイルユニットの名前
- `unit_offset` - `.debug_info` セクション内のこの DIE を含むコンパイルユニットの位置
- `ancestor_tags` - 現在の DIE のツリー内の祖先のタグの配列、内側から外側への順番
- `ancestor_offsets` - 祖先のオフセット、`ancestor_tags` に平行
- 便利のために属性配列から複製された一般的な属性:
    - `name`
    - `linkage_name` - 変更された完全修飾名; 通常は関数のみが持ちます (が、すべての関数が持つわけではありません)
    - `decl_file` - このエンティティが宣言されたソースコードファイルの名前
    - `decl_line` - このエンティティが宣言されたソースコード内の行番号
- 属性を説明する平行配列:
    - `attr_name` - 属性の名前; 従来の「DW_AT_」プレフィックスは省略
    - `attr_form` - 属性がどのようにエンコードされ、解釈されるか; 従来の DW_FORM_ プレフィックスは省略
    - `attr_int` - 属性の整数値; 属性に数値がない場合は 0
    - `attr_str` - 属性の文字列値; 属性に文字列値がない場合は空

## 使用例 {#example-usage}

`DWARF` 形式は、最も多くの関数定義を持つコンパイルユニット (テンプレートインスタンス化やインクルードされたヘッダーファイルの関数を含む) を見つけるために使用できます:

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

3 行のセットです。経過時間: 1.487 秒。139.76百万行、1.12 GB (93.97百万行/秒, 752.77 MB/s。)
ピークメモリ使用量: 271.92 MiB。
```

## フォーマット設定 {#format-settings}
