---
slug: /engines/table-functions/executable
sidebar_position: 50
sidebar_label: executable
keywords: [udf, user defined function, clickhouse, executable, table, function]
---

# UDFのためのexecutableテーブル関数

`executable`テーブル関数は、**stdout**に行を出力するスクリプトで定義されたユーザー定義関数（UDF）の出力に基づいてテーブルを作成します。実行可能スクリプトは`users_scripts`ディレクトリに保存され、任意のソースからデータを読み取ることができます。ClickHouseサーバーに実行可能スクリプトを実行するために必要なすべてのパッケージがインストールされていることを確認してください。たとえば、Pythonスクリプトの場合、サーバーに必要なPythonパッケージがインストールされていることを確認してください。

任意で、結果を**stdin**にストリームする1つ以上の入力クエリを含めることができます。

:::note
通常のUDF関数と`executable`テーブル関数および`Executable`テーブルエンジンの間の主な利点は、通常のUDF関数は行数を変更できないことです。たとえば、入力が100行の場合、結果も100行を返す必要があります。`executable`テーブル関数または`Executable`テーブルエンジンを使用すると、スクリプトは希望する任意のデータ変換を行うことができ、複雑な集計を含めることができます。
:::

## 構文 {#syntax}

`executable`テーブル関数は3つのパラメータを必要とし、オプションの入力クエリのリストを受け入れます：

```sql
executable(script_name, format, structure, [input_query...] [,SETTINGS ...])
```

- `script_name`: スクリプトのファイル名。`user_scripts`フォルダに保存されています（`user_scripts_path`設定のデフォルトフォルダ）
- `format`: 生成されるテーブルのフォーマット
- `structure`: 生成されるテーブルのスキーマ
- `input_query`: スクリプトに**stdin**経由で渡される結果を持つオプションのクエリ（またはクエリのコレクション）

:::note
同じ入力クエリで同じスクリプトを繰り返し呼び出す予定がある場合は、[`Executable`テーブルエンジン](../../engines/table-engines/special/executable.md)を使用することを検討してください。
:::

以下のPythonスクリプトは`generate_random.py`と呼ばれ、`user_scripts`フォルダに保存されています。これは、数値`i`を読み込み、`i`個のランダムな文字列を生成し、各文字列の前にタブで区切られた番号を付けて出力します：

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

        # 結果をstdoutにフラッシュ
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

- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。デフォルト値は`false`です。
- `pool_size` — プールのサイズ。`pool_size`として0が指定された場合、プールサイズの制限はありません。デフォルト値は`16`です。
- `max_command_execution_time` — データブロック処理のための実行可能スクリプトコマンドの最大実行時間。秒単位で指定します。デフォルト値は10です。
- `command_termination_timeout` — 実行可能スクリプトは、主要な読み書きループを含んでいる必要があります。テーブル関数が破棄された後、パイプは閉じられ、実行可能ファイルは`command_termination_timeout`秒でシャットダウンを行います。そうしないと、ClickHouseが子プロセスにSIGTERM信号を送信します。秒単位で指定します。デフォルト値は10です。
- `command_read_timeout` - コマンドstdoutからデータを読み取るタイムアウト（ミリ秒単位）。デフォルト値は10000です。
- `command_write_timeout` - コマンドstdinにデータを書き込むタイムアウト（ミリ秒単位）。デフォルト値は10000です。

## スクリプトへのクエリ結果の渡し方 {#passing-query-results-to-a-script}

スクリプトへのクエリ結果の渡し方についての例は、`Executable`テーブルエンジンで[こちら](../../engines/table-engines/special/executable.md#passing-query-results-to-a-script)を確認してください。以下は、`executable`テーブル関数を使用してその例のスクリプトを実行する方法です：

```sql
SELECT * FROM executable(
    'sentiment.py',
    TabSeparated,
    'id UInt64, sentiment Float32',
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```
