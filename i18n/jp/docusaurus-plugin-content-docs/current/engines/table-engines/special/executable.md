---
description: '`Executable` および `ExecutablePool` テーブルエンジンを使用すると、行を **stdout** に書き出すスクリプトを定義し、そのスクリプトから行が生成されるテーブルを定義できます。'
sidebar_label: 'Executable/ExecutablePool'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Executable および ExecutablePool テーブルエンジン'
doc_type: 'reference'
---



# Executable および ExecutablePool テーブルエンジン

`Executable` および `ExecutablePool` テーブルエンジンを使用すると、スクリプトによって行が生成されるテーブル（スクリプトは行を **stdout** に書き出します）を定義できます。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、あらゆるソースからデータを読み取ることができます。

- `Executable` テーブル: クエリのたびにスクリプトが実行されます
- `ExecutablePool` テーブル: 永続プロセスのプールを維持し、読み取りのためにそのプールからプロセスを取得します

オプションで、1 つ以上の入力クエリを含めることができ、それらの結果を **stdin** にストリーミングしてスクリプトが読み取れるようにできます。



## `Executable` テーブルの作成 {#creating-an-executable-table}

`Executable` テーブルエンジンには2つのパラメータが必要です:スクリプト名と入力データの形式です。オプションで1つ以上の入力クエリを渡すことができます:

```sql
Executable(script_name, format, [input_query...])
```

`Executable` テーブルに関連する設定は以下の通りです:

- `send_chunk_header`
  - 説明: 処理のためにチャンクを送信する前に、各チャンクの行数を送信します。この設定により、リソースを事前に割り当てるなど、より効率的な方法でスクリプトを記述できます
  - デフォルト値: false
- `command_termination_timeout`
  - 説明: コマンド終了のタイムアウト(秒単位)
  - デフォルト値: 10
- `command_read_timeout`
  - 説明: コマンドの標準出力からデータを読み取る際のタイムアウト(ミリ秒単位)
  - デフォルト値: 10000
- `command_write_timeout`
  - 説明: コマンドの標準入力にデータを書き込む際のタイムアウト(ミリ秒単位)
  - デフォルト値: 10000

例を見てみましょう。以下のPythonスクリプトは `my_script.py` という名前で、`user_scripts` フォルダに保存されています。このスクリプトは数値 `i` を読み取り、`i` 個のランダムな文字列を出力します。各文字列の前にはタブで区切られた数値が付きます:

```python
#!/usr/bin/python3

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

        # 結果を標準出力にフラッシュする
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

以下の `my_executable_table` は `my_script.py` の出力から構築されます。`my_executable_table` から `SELECT` を実行するたびに10個のランダムな文字列が生成されます:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

テーブルの作成は即座に完了し、スクリプトは実行されません。`my_executable_table` にクエリを実行すると、スクリプトが呼び出されます:

```sql
SELECT * FROM my_executable_table
```

```response
┌─x─┬─y──────────┐
│ 0 │ BsnKBsNGNH │
│ 1 │ mgHfBCUrWM │
│ 2 │ iDQAVhlygr │
│ 3 │ uNGwDuXyCk │
│ 4 │ GcFdQWvoLB │
│ 5 │ UkciuuOTVO │
│ 6 │ HoKeCdHkbs │
│ 7 │ xRvySxqAcR │
│ 8 │ LKbXPHpyDI │
│ 9 │ zxogHTzEVV │
└───┴────────────┘
```


## クエリ結果をスクリプトに渡す {#passing-query-results-to-a-script}

Hacker Newsウェブサイトのユーザーはコメントを投稿します。Pythonには自然言語処理ツールキット（`nltk`）が含まれており、コメントが肯定的、否定的、または中立的であるかを判定する`SentimentIntensityAnalyzer`が備わっています。これには-1（非常に否定的なコメント）から1（非常に肯定的なコメント）までの値を割り当てる機能も含まれます。`nltk`を使用してHacker Newsのコメントの感情分析を行う`Executable`テーブルを作成しましょう。

この例では、[こちら](/engines/table-engines/mergetree-family/invertedindexes/#hacker-news-dataset)で説明されている`hackernews`テーブルを使用します。`hackernews`テーブルには、`UInt64`型の`id`カラムと、`comment`という名前の`String`カラムが含まれています。まず、`Executable`テーブルを定義することから始めましょう：

```sql
CREATE TABLE sentiment (
   id UInt64,
   sentiment Float32
)
ENGINE = Executable(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```

`sentiment`テーブルに関する補足：

- ファイル`sentiment.py`は`user_scripts`フォルダ（`user_scripts_path`設定のデフォルトフォルダ）に保存されます
- `TabSeparated`形式は、Pythonスクリプトがタブ区切り値を含む生データの行を生成する必要があることを意味します
- クエリは`hackernews`から2つのカラムを選択します。Pythonスクリプトは、受信した行からこれらのカラム値を解析する必要があります

以下は`sentiment.py`の定義です：

```python
#!/usr/local/bin/python3.9

import sys
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

def main():
    sentiment_analyzer = SentimentIntensityAnalyzer()

    while True:
        try:
            row = sys.stdin.readline()
            if row == '':
                break

            split_line = row.split("\t")

            id = str(split_line[0])
            comment = split_line[1]

            score = sentiment_analyzer.polarity_scores(comment)['compound']
            print(id + '\t' + str(score) + '\n', end='')
            sys.stdout.flush()
        except BaseException as x:
            break

if __name__ == "__main__":
    main()
```

Pythonスクリプトに関する補足：

- これを機能させるには、`nltk.downloader.download('vader_lexicon')`を実行する必要があります。これをスクリプト内に配置することもできましたが、その場合`sentiment`テーブルに対してクエリが実行されるたびにダウンロードされることになり、効率的ではありません
- `row`の各値は、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`の結果セットの1行になります
- 受信する行はタブ区切りであるため、Pythonの`split`関数を使用して`id`と`comment`を解析します
- `polarity_scores`の結果は、複数の値を含むJSONオブジェクトです。このJSONオブジェクトから`compound`値のみを取得することにしました
- ClickHouseの`sentiment`テーブルは`TabSeparated`形式を使用し、2つのカラムを含むことを思い出してください。そのため、`print`関数はこれらのカラムをタブで区切ります

`sentiment`テーブルから行を選択するクエリを記述するたびに、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20`クエリが実行され、その結果が`sentiment.py`に渡されます。テストしてみましょう：

```sql
SELECT *
FROM sentiment
```

レスポンスは次のようになります：


```response
┌───────id─┬─sentiment─┐
│  7398199 │    0.4404 │
│ 21640317 │    0.1779 │
│ 21462000 │         0 │
│ 25168863 │         0 │
│ 25168978 │   -0.1531 │
│ 25169359 │         0 │
│ 25169394 │   -0.9231 │
│ 25169766 │    0.4137 │
│ 25172570 │    0.7469 │
│ 25173687 │    0.6249 │
│ 28291534 │         0 │
│ 28291669 │   -0.4767 │
│ 28291731 │         0 │
│ 28291949 │   -0.4767 │
│ 28292004 │    0.3612 │
│ 28292050 │    -0.296 │
│ 28292322 │         0 │
│ 28295172 │    0.7717 │
│ 28295288 │    0.4404 │
│ 21465723 │   -0.6956 │
└──────────┴───────────┘
```


## `ExecutablePool`テーブルの作成 {#creating-an-executablepool-table}

`ExecutablePool`の構文は`Executable`と似ていますが、`ExecutablePool`テーブル固有の関連設定がいくつかあります:

- `pool_size`
  - 説明: プロセスプールのサイズ。サイズが0の場合、サイズ制限はありません
  - デフォルト値: 16
- `max_command_execution_time`
  - 説明: コマンドの最大実行時間(秒)
  - デフォルト値: 10

上記の`sentiment`テーブルを`Executable`の代わりに`ExecutablePool`を使用するように簡単に変換できます:

```sql
CREATE TABLE sentiment_pooled (
   id UInt64,
   sentiment Float32
)
ENGINE = ExecutablePool(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20000)
)
SETTINGS
    pool_size = 4;
```

ClickHouseは、クライアントが`sentiment_pooled`テーブルにクエリを実行する際に、オンデマンドで4つのプロセスを維持します。
