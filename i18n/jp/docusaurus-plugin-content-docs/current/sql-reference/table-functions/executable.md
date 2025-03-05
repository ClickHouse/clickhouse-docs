---
slug: /engines/table-functions/executable
sidebar_position: 50
sidebar_label:  executable
keywords: [udf, user defined function, clickhouse, executable, table, function]
title: "executable"
description: "The `executable` table function creates a table based on the output of a user-defined function (UDF) that you define in a script that outputs rows to **stdout**."
---


# UDFのためのexecutableテーブル関数

`executable`テーブル関数は、ユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。このUDFは、**stdout**に行を出力するスクリプトで定義されます。実行可能なスクリプトは`users_scripts`ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouseサーバーに実行可能なスクリプトを実行するために必要なすべてのパッケージがインストールされていることを確認してください。例えば、Pythonスクリプトの場合、サーバーに必要なPythonパッケージがインストールされていることを確認してください。

オプションとして、スクリプトが読み取るために、その結果を**stdin**にストリーミングする1つ以上の入力クエリを含めることができます。

:::note
一般的なUDF関数と`executable`テーブル関数および`Executable`テーブルエンジンの大きな利点は、一般的なUDF関数は行数を変更できないことです。例えば、入力が100行の場合、結果も100行を返す必要があります。`executable`テーブル関数または`Executable`テーブルエンジンを使用する場合、スクリプトは複雑な集計を含む任意のデータ変換を行うことができます。
:::

## 構文 {#syntax}

`executable`テーブル関数は、3つのパラメータを必要とし、オプションとして入力クエリのリストを受け取ります：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: スクリプトのファイル名。`user_scripts`フォルダーに保存されます（デフォルトでは`user_scripts_path`設定のフォルダーです）
- `format`: 生成されるテーブルのフォーマット
- `structure`: 生成されるテーブルのスキーマ
- `input_query`: スクリプトに**stdin**を介して渡される結果を持つオプションのクエリ（またはクエリのコレクション）

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す場合は、[`Executable`テーブルエンジン](../../engines/table-engines/special/executable.md)の使用を検討してください。
:::

以下のPythonスクリプトは`generate_random.py`という名前で、`user_scripts`フォルダーに保存されています。このスクリプトは、数値`i`を読み取り、`i`個のランダムな文字列を生成し、各文字列の前にタブで区切られた番号を出力します：

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

        # 結果をstdoutにフラッシュ
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

スクリプトを呼び出し、10個のランダムな文字列を生成させてみましょう：

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

- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。デフォルト値は`false`です。
- `pool_size` — プールのサイズ。`pool_size`に0を指定すると、プールサイズの制限はありません。デフォルト値は`16`です。
- `max_command_execution_time` — データブロックを処理するための実行可能スクリプトコマンドの最大実行時間。秒単位で指定します。デフォルト値は10です。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含むべきです。テーブル関数が破棄されると、パイプが閉じられ、実行ファイルは`command_termination_timeout`秒以内にシャットダウンする必要があります。さもなければ、ClickHouseは子プロセスにSIGTERMシグナルを送信します。秒単位で指定します。デフォルト値は10です。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。

## スクリプトへのクエリ結果の渡し方 {#passing-query-results-to-a-script}

`Executable`テーブルエンジンの[スクリプトへのクエリ結果の渡し方](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)の例も必ずチェックしてください。ここで、同じスクリプトを使って`executable`テーブル関数で実行する方法を示します：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
