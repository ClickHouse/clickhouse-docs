---
description: '`executable` テーブル関数は、行を **stdout** に出力するスクリプト内で定義されたユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。'
keywords: ['udf', 'user defined function', 'clickhouse', 'executable', 'table', 'function']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
doc_type: 'reference'
---

# UDF 向け executable テーブル関数 {#executable-table-function-for-udfs}

`executable` テーブル関数は、行を **stdout** に出力するスクリプト内で定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。実行可能スクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouse サーバー上に、そのスクリプトを実行するために必要なパッケージがすべてインストールされていることを確認してください。たとえば、それが Python スクリプトの場合は、サーバーに必要な Python パッケージがインストールされていることを確認してください。

任意で、1 つ以上の入力クエリを指定し、その結果を **stdin** にストリーミングしてスクリプトが読み取れるようにすることができます。

:::note
通常の UDF と `executable` テーブル関数および `Executable` テーブルエンジンとの大きな利点の違いは、通常の UDF では行数を変更できないという点です。たとえば、入力が 100 行であれば、結果も 100 行を返さなければなりません。`executable` テーブル関数または `Executable` テーブルエンジンを使用する場合、スクリプトは複雑な集約を含め、任意のデータ変換を行うことができます。
:::

## 構文 {#syntax}

`executable` テーブル関数は 3 つのパラメーターを必須とし、オプションで入力クエリのリストを引数として受け取ります。

```sql
executable(スクリプト名, フォーマット, 構造, [入力クエリ...] [,SETTINGS ...])
```

* `script_name`: スクリプトのファイル名。`user_scripts` ディレクトリ（`user_scripts_path` 設定のデフォルトディレクトリ）に保存されます
* `format`: 生成されるテーブルの形式
* `structure`: 生成されるテーブルのスキーマ
* `input_query`: オプションのクエリ（またはクエリの集合）で、その結果が **stdin** 経由でスクリプトに渡されます

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す場合は、[`Executable` テーブルエンジン](../../engines/table-engines/special/executable.md)の使用を検討してください。
:::

次の Python スクリプトは `generate_random.py` という名前で、`user_scripts` ディレクトリに保存されています。数値 `i` を読み込み、`i` 個のランダムな文字列を出力します。各文字列の前には番号が付き、その番号と文字列はタブで区切られます。

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # 入力値を読み取る
    for number in sys.stdin:
        i = int(number)

        # ランダムな行を生成
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # 結果を標準出力にフラッシュ
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

スクリプトを実行して、ランダムな文字列を10個生成してみましょう。

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

レスポンスは次のようになります：

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

- `send_chunk_header` - データのチャンクを処理に送信する前に、行数を送信するかどうかを制御します。デフォルト値は `false` です。
- `pool_size` — プールのサイズ。`pool_size` として 0 が指定された場合、プールサイズに制限はありません。デフォルト値は `16` です。
- `max_command_execution_time` — データブロックを処理するための、実行可能スクリプトのコマンド実行時間の最大値。秒単位で指定します。デフォルト値は 10 です。
- `command_termination_timeout` — 実行可能スクリプトには、メインの読み書きループを含める必要があります。テーブル関数が破棄されるとパイプがクローズされ、ClickHouse が子プロセスに SIGTERM シグナルを送信する前に、実行可能ファイルにはシャットダウンのための `command_termination_timeout` 秒が与えられます。秒単位で指定します。デフォルト値は 10 です。
- `command_read_timeout` - コマンドの stdout からデータを読み取るタイムアウト（ミリ秒）。デフォルト値は 10000 です。
- `command_write_timeout` - コマンドの stdin にデータを書き込むタイムアウト（ミリ秒）。デフォルト値は 10000 です。

## クエリ結果をスクリプトに渡す {#passing-query-results-to-a-script}

`Executable` テーブルエンジンの[クエリ結果をスクリプトに渡す方法](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)の例を必ず参照してください。ここでは、その例と同じスクリプトを `executable` テーブル関数を使って実行する方法を示します。

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
