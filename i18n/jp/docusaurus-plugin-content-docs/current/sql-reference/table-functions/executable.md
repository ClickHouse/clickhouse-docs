---
'description': '`executable` テーブル関数は、スクリプト内で定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。この関数は
  **stdout** に行を出力します。'
'keywords':
- 'udf'
- 'user defined function'
- 'clickhouse'
- 'executable'
- 'table'
- 'function'
'sidebar_label': '実行可能な'
'sidebar_position': 50
'slug': '/engines/table-functions/executable'
'title': '実行可能な'
'doc_type': 'reference'
---


# UDFのためのExecutable Table Function

`executable`テーブル関数は、スクリプト内で定義されたユーザー定義関数（UDF）の出力に基づいてテーブルを作成します。このスクリプトは、行を**stdout**に出力します。実行可能なスクリプトは`users_scripts`ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouseサーバーに実行可能なスクリプトを実行するために必要なすべてのパッケージがインストールされていることを確認してください。たとえば、Pythonスクリプトの場合、サーバーに必要なPythonパッケージがインストールされていることを確認してください。

オプションで、スクリプトが読み取るために**stdin**に結果をストリーミングする1つ以上の入力クエリを含めることができます。

:::note
通常のUDF関数と`executable`テーブル関数および`Executable`テーブルエンジンの間の重要な利点は、通常のUDF関数は行数を変更できないことです。たとえば、入力が100行の場合、結果も100行を返さなければなりません。`executable`テーブル関数または`Executable`テーブルエンジンを使用すると、スクリプトで任意のデータ変換を行うことができ、複雑な集約も含まれます。
:::

## 構文 {#syntax}

`executable`テーブル関数は3つのパラメータを必要とし、オプションで入力クエリのリストを受け入れます：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: スクリプトのファイル名。`user_scripts`フォルダーに保存されます（`user_scripts_path`設定のデフォルトフォルダー）
- `format`: 生成されるテーブルのフォーマット
- `structure`: 生成されるテーブルのテーブルスキーマ
- `input_query`: スクリプトに**stdin**経由で渡される結果を持つオプショナルなクエリ（またはクエリのコレクション）

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す場合は、[`Executable`テーブルエンジン](../../engines/table-engines/special/executable.md)の使用を検討してください。
:::

以下のPythonスクリプトは`generate_random.py`という名前で、`user_scripts`フォルダーに保存されています。このスクリプトは数値`i`を読み取り、各文字列の前にタブで区切られた番号を付けて`i`個のランダム文字列を出力します：

```python
#!/usr/local/bin/python3.9

import sys
import string
import random

def main():

    # Read input value
    for number in sys.stdin:
        i = int(number)

        # Generate some random rows
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Flush results to stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

スクリプトを呼び出して10個のランダム文字列を生成してみましょう：

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

- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。デフォルト値は`false`です。
- `pool_size` — プールのサイズ。`pool_size`に0を指定すると、プールサイズに制限はありません。デフォルト値は`16`です。
- `max_command_execution_time` — データのブロックを処理するための最大実行可能スクリプトコマンドの実行時間。秒単位で指定します。デフォルト値は10です。
- `command_termination_timeout` — 実行可能スクリプトには主な読み書きループが含まれている必要があります。テーブル関数が削除されると、パイプが閉じ、実行可能ファイルは`command_termination_timeout`秒間シャットダウンの時間を持ちます。その後、ClickHouseは子プロセスにSIGTERM信号を送信します。秒単位で指定します。デフォルト値は10です。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。

## スクリプトへのクエリ結果の渡し方 {#passing-query-results-to-a-script}

[スクリプトにクエリ結果を渡す方法](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)に関する`Executable`テーブルエンジンの例をぜひご覧ください。以下は、`executable`テーブル関数を使用してその例の同じスクリプトを実行する方法です：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
