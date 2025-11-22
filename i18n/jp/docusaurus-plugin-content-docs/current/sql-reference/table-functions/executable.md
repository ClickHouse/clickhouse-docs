---
description: 'テーブル関数 `executable` は、**stdout** に行を出力するスクリプト内で定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。'
keywords: ['udf', 'user defined function', 'clickhouse', 'executable', 'table', 'function']
sidebar_label: 'executable'
sidebar_position: 50
slug: /engines/table-functions/executable
title: 'executable'
doc_type: 'reference'
---



# UDF 用 executable テーブル関数

`executable` テーブル関数は、行を **stdout** に出力するスクリプトで定義されたユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouse サーバーに、その実行可能スクリプトを実行するために必要なパッケージがすべてインストールされていることを確認してください。例えば、スクリプトが Python で書かれている場合は、サーバーに必要な Python パッケージがインストールされていることを確認してください。

オプションで、1 つ以上の入力クエリを指定し、その結果を **stdin** にストリーミングしてスクリプトに読み込ませることができます。

:::note
通常の UDF 関数と `executable` テーブル関数および `Executable` テーブルエンジンとの重要な違いは、通常の UDF 関数は行数を変更できないという点です。例えば、入力が 100 行であれば、結果も 100 行を返さなければなりません。`executable` テーブル関数または `Executable` テーブルエンジンを使用する場合、スクリプトは複雑な集約を含む任意のデータ変換を行うことができます。
:::



## 構文 {#syntax}

`executable`テーブル関数は3つのパラメータを必要とし、オプションで入力クエリのリストを受け付けます：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: スクリプトのファイル名。`user_scripts`フォルダ（`user_scripts_path`設定のデフォルトフォルダ）に保存されます
- `format`: 生成されるテーブルのフォーマット
- `structure`: 生成されるテーブルのテーブルスキーマ
- `input_query`: オプションのクエリ（または複数のクエリ）で、その結果が**stdin**経由でスクリプトに渡されます

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す場合は、[`Executable`テーブルエンジン](../../engines/table-engines/special/executable.md)の使用を検討してください。
:::

以下のPythonスクリプトは`generate_random.py`という名前で、`user_scripts`フォルダに保存されています。このスクリプトは数値`i`を読み込み、`i`個のランダムな文字列を出力します。各文字列の前にはタブで区切られた数値が付きます：

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # 入力値を読み込む
    for number in sys.stdin:
        i = int(number)

        # ランダムな行を生成する
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # 結果を標準出力にフラッシュする
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

スクリプトを呼び出して10個のランダムな文字列を生成してみましょう：

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

- `send_chunk_header` - データチャンクを送信する前に行数を送信するかどうかを制御します。デフォルト値は `false` です。
- `pool_size` — プールのサイズ。`pool_size` に 0 を指定した場合、プールサイズに制限はありません。デフォルト値は `16` です。
- `max_command_execution_time` — データブロックを処理する実行可能スクリプトコマンドの最大実行時間。秒単位で指定します。デフォルト値は 10 です。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含む必要があります。テーブル関数が破棄されるとパイプが閉じられ、実行可能ファイルは `command_termination_timeout` 秒間のシャットダウン時間が与えられます。その後、ClickHouse は子プロセスに SIGTERM シグナルを送信します。秒単位で指定します。デフォルト値は 10 です。
- `command_read_timeout` - コマンドの標準出力からデータを読み取る際のタイムアウト(ミリ秒単位)。デフォルト値は 10000 です。
- `command_write_timeout` - コマンドの標準入力にデータを書き込む際のタイムアウト(ミリ秒単位)。デフォルト値は 10000 です。


## クエリ結果をスクリプトに渡す {#passing-query-results-to-a-script}

`Executable`テーブルエンジンの[クエリ結果をスクリプトに渡す方法](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)の例を参照してください。以下は、同じスクリプトを`executable`テーブル関数を使用して実行する方法です:

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
