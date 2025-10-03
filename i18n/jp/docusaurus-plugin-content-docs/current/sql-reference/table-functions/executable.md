---
description: 'The `executable` table function creates a table based on the output
  of a user-defined function (UDF) that you define in a script that outputs rows to
  **stdout**.'
keywords:
- 'udf'
- 'user defined function'
- 'clickhouse'
- 'executable'
- 'table'
- 'function'
sidebar_label: 'executable'
sidebar_position: 50
slug: '/engines/table-functions/executable'
title: 'executable'
---




# executable テーブル関数 for UDFs

`executable` テーブル関数は、**stdout** に行を出力するスクリプト内で定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouse サーバーに実行可能スクリプトを実行するために必要なすべてのパッケージがインストールされていることを確認してください。たとえば、Python スクリプトの場合、サーバーに必要な Python パッケージがインストールされていることを確認してください。

オプションで、スクリプトが読み取るために**stdin** に結果をストリーム配信する1つ以上の入力クエリを含めることができます。

:::note
普通の UDF 関数と `executable` テーブル関数及び `Executable` テーブルエンジンの間の大きな利点は、普通の UDF 関数は行数を変更できないことです。たとえば、入力が100行の場合、結果は100行を返さなければなりません。`executable` テーブル関数または `Executable` テーブルエンジンを使用する場合、スクリプトは複雑な集計を含む任意のデータ変換を行うことができます。
:::

## 構文 {#syntax}

`executable` テーブル関数は3つのパラメータを必要とし、オプションで入力クエリのリストを受け入れます：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: スクリプトのファイル名。 `user_scripts` フォルダに保存されている（`user_scripts_path` 設定のデフォルトフォルダ）
- `format`: 生成されるテーブルのフォーマット
- `structure`: 生成されるテーブルのスキーマ
- `input_query`: スクリプトに**stdin**経由で渡されるオプションのクエリ（またはクエリの集合）

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す場合は、[`Executable` テーブルエンジン](../../engines/table-engines/special/executable.md) の使用を検討してください。
:::

次の Python スクリプトは `generate_random.py` という名前で `user_scripts` フォルダに保存されています。それは、数値 `i` を読み込み、各文字列の前にタブで区切られた数字を付けて `i` 個のランダムな文字列を出力します。

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

        # stdout に結果をフラッシュする
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

スクリプトを呼び出して10個のランダムな文字列を生成します：

```sql
SELECT * FROM executable('generate_random.py', TabSeparated, 'id UInt32, random String', (SELECT 10))
```

応答は次のようになります：

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
- `pool_size` — プールのサイズ。`pool_size` として0を指定すると、プールサイズに制限はありません。デフォルト値は `16` です。
- `max_command_execution_time` — データブロックを処理するための最大実行可能スクリプトコマンド実行時間。秒単位で指定します。デフォルト値は10です。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含む必要があります。テーブル関数が破棄された後、パイプが閉じ、実行可能ファイルは `command_termination_timeout` 秒以内にシャットダウンする必要があります。これを過ぎると、ClickHouse が子プロセスに SIGTERM シグナルを送信します。秒単位で指定します。デフォルト値は10です。
- `command_read_timeout` - コマンドの stdout からデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値10000です。
- `command_write_timeout` - コマンドの stdin にデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値10000です。

## クエリ結果をスクリプトに渡す {#passing-query-results-to-a-script}

`Executable` テーブルエンジンでの例を確認して、[クエリ結果をスクリプトに渡す方法](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)を見てください。以下は、その例で同じスクリプトを `executable` テーブル関数を使用して実行する方法です：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);

