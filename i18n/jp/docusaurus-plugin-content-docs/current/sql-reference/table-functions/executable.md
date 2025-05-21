---
description: 'この `executable` テーブル関数は、スクリプトで定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。スクリプトは行を **stdout** に出力します。'
keywords: ['udf', 'ユーザー定義関数', 'clickhouse', 'executable', 'table', 'function']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
---


# UDFのための executable テーブル関数

`executable` テーブル関数は、スクリプトで定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。このスクリプトは行を **stdout** に出力します。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouseサーバーに実行可能なスクリプトを実行するのに必要なすべてのパッケージがインストールされていることを確認してください。例えば、Python スクリプトである場合、サーバーには必要な Python パッケージがインストールされている必要があります。

オプションで、スクリプトが読み取るために結果を **stdin** にストリーミングする1つ以上の入力クエリを含めることができます。

:::note
通常の UDF 関数と `executable` テーブル関数および `Executable` テーブルエンジンの間の主な利点は、通常の UDF 関数は行数を変更できないことです。例えば、入力が100行の場合、結果も100行を返さなければなりません。`executable` テーブル関数または `Executable` テーブルエンジンを使用する場合、スクリプトは任意のデータ変換を行うことができ、複雑な集約を含むことができます。
:::

## 構文 {#syntax}

`executable` テーブル関数は3つのパラメータを必要とし、オプションの入力クエリのリストを受け付けます：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: スクリプトのファイル名。`user_scripts` フォルダに保存されている（`user_scripts_path` 設定のデフォルトフォルダ）
- `format`: 生成されるテーブルのフォーマット
- `structure`: 生成されるテーブルのスキーマ
- `input_query`: スクリプトに渡される結果を含むオプションのクエリ（またはクエリのコレクション）

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す場合、 [`Executable` テーブルエンジン](../../engines/table-engines/special/executable.md) の使用を検討してください。
:::

以下は `generate_random.py` という名前の Python スクリプトで、`user_scripts` フォルダに保存されています。これは、数 `i` を読み込み、各文字列の前にタブで区切られた番号が付いた `i` 個のランダムな文字列を出力します。

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # 入力値を読み取る
    for number in sys.stdin:
        i = int(number)

        # ランダムな行を生成する
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # 結果を stdout にフラッシュ
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

このスクリプトを呼び出し、10個のランダムな文字列を生成させます。

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

レスポンスは以下のようになります：

```response
┌─id─┬─random─────┐
│  0 │ xheXXCiSkH │
│  1 │ AqxvHAoTrl │
│  2 │ JYvPCEbIkY │
│  3 │ sWgnqJwGRm │
│  4 │ fTZGrjcLon │
│  5 │ ZQINGktPnd │
│  6 │ YFSvGGoezb │
│  7 │ QyMJJZOOia │
│  8 │ NfiyDDhmcI │
│  9 │ REJRdJpWrg │
└────┴────────────┘
```

## 設定 {#settings}

- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。デフォルト値は `false` です。
- `pool_size` — プールのサイズ。`pool_size` に0を指定すると、プールサイズの制限はありません。デフォルト値は `16` です。
- `max_command_execution_time` — データブロックを処理するための最大実行可能スクリプトコマンド実行時間。秒単位で指定します。デフォルト値は10です。
- `command_termination_timeout` — 実行可能スクリプトには主要な読み書きループが含まれている必要があります。テーブル関数が破棄された後、パイプが閉じられ、実行可能ファイルは `command_termination_timeout` 秒以内にシャットダウンを行う必要があります。それを超える場合、ClickHouseは子プロセスにSIGTERM信号を送信します。秒単位で指定します。デフォルト値は10です。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。

## スクリプトへのクエリ結果の渡し方 {#passing-query-results-to-a-script}

`Executable` テーブルエンジンにおける [スクリプトにクエリ結果を渡す方法](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script) の例もチェックしてください。以下は、`executable` テーブル関数を使用してその例のスクリプトを実行する方法です：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
