---
alias: []
description: 'RowBinaryWithNamesAndTypesAndDefaults フォーマットに関するドキュメント'
input_format: true
keywords: ['RowBinaryWithNamesAndTypesAndDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithNamesAndTypesAndDefaults
title: 'RowBinaryWithNamesAndTypesAndDefaults'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✗  |       |

## 説明 \{#description\}

[`RowBinaryWithNamesAndTypes`](./RowBinaryWithNamesAndTypes.md) フォーマットに似ていますが、各セルの前に 1 バイトが追加されており、そのカラムの `DEFAULT` 値を使うかどうかを示します。これは [`RowBinaryWithDefaults`](./RowBinaryWithDefaults.md) フォーマットとまったく同じです。この組み合わせにより、スキーマの変化に対応した `INSERT` をサポートします。書き込み側はヘッダーからカラムを省略でき (その場合は対象カラムの `DEFAULT` が適用されます) 、さらに送信するカラムについては、個々のセルごとに「そのカラムの `DEFAULT` を使う」と指定できるため、これを `NULL` と混同せずに扱えます。

このフォーマットは入力専用です。

## ワイヤ形式 \{#wire-format\}

ヘッダーは [`RowBinaryWithNamesAndTypes`](./RowBinaryWithNamesAndTypes.md) と同じです。

1. カラム数 `N` を表す `VarUInt`。
2. カラム名を格納した、長さプレフィックス付き `String` が `N` 個。
3. `N` 個のカラム型。テキスト名、または compact なバイナリエンコーディングのいずれかで、`output_format_binary_encode_types_in_binary_format` / `input_format_binary_decode_types_in_binary_format` 設定で制御されます。

ヘッダーの後では、各行は `N` 個のセルで構成されます。各セルは次のとおりです。

* `UInt8` のマーカーバイト 1 バイト。
  * `0x01` — 対象カラムの `DEFAULT` 式を使用します。後続する値バイトはありません。
  * `0x00` — 値が続き、カラム型の `RowBinary` シリアライザーでシリアライズされます。`Nullable(T)` の場合、値バイトは `Nullable` の null バイト (非 null は `0`、NULL は `1`) で始まり、非 null の場合はその後に内部の値が続きます。

## デフォルト値と NULL \{#defaults-vs-null\}

セルごとのデフォルトマーカーと、`Nullable` に組み込まれた null バイトは、それぞれ独立しています。`Nullable(UInt32) DEFAULT 42` のカラムは、各行について次の 3 通りの方法で送信できます。

| Bytes     | Meaning                                     |
| --------- | ------------------------------------------- |
| `01`      | `DEFAULT 42` を使用します。                        |
| `00 01`   | 値側の経路を取り、その後 `Nullable` 型によって `NULL` を表します。 |
| `00 00 …` | 値側の経路を取り、その後 null ではない内部値が続きます。             |

## スキーマの進化 \{#schema-evolution\}

| Case                            | Behavior                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| ファイルのヘッダーにカラムがまったく存在しない         | ターゲット側で `insertDefaultsForNotSeenColumns` によって補完される。`defaults_for_omitted_fields` が有効な場合に限られる。                           |
| ヘッダーにカラムが存在し、cell マーカーが `0x01`  | 各行で `insertDefault` が実行される。                                                                                              |
| ヘッダーにカラムが存在し、cell マーカーが `0x00`  | 値は通常どおりパースされる。                                                                                                           |
| ヘッダーに余分なカラムがあり、ターゲットテーブルには存在しない | `input_format_skip_unknown_fields = 1` の場合、暗黙的に破棄される (最初にマーカーが消費され、`0x01` ならそれ以上は何も行われず、`0x00` なら型付きの値がパースされたうえで破棄される) 。 |

## 使用例 \{#example-usage\}

```sql title="Query"
SELECT * FROM format(
    'RowBinaryWithNamesAndTypesAndDefaults',
    'x Nullable(UInt32) DEFAULT 42',
    unhex('01' || '0178' || '10' || hex('Nullable(UInt32)') || '01')
);
```

```response title="Response"
┌──x─┐
│ 42 │
└────┘
```

* ヘッダーには、`Nullable(UInt32)` 型の `x` という名前のカラムが 1 つ含まれます。
* その 1 つのセルにはマーカー `0x01` が使われており、「`DEFAULT 42` を使用する」ことを意味します。

## フォーマット設定 \{#format-settings\}

<RowBinaryFormatSettings />