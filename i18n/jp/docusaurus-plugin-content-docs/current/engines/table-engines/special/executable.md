---
description: '`Executable` および `ExecutablePool` テーブルエンジンを使用すると、スクリプトの標準出力（**stdout**）に行を書き出すことで、そのスクリプトから行が生成されるテーブルを定義できます。'
sidebar_label: 'Executable/ExecutablePool'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: '`Executable` および `ExecutablePool` テーブルエンジン'
doc_type: 'reference'
---

# Executable および ExecutablePool テーブルエンジン {#executable-and-executablepool-table-engines}

`Executable` および `ExecutablePool` テーブルエンジンを使用すると、（行を **stdout** に書き出すことで）ユーザー定義のスクリプトによって行が生成されるテーブルを定義できます。実行可能スクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。

* `Executable` テーブル: クエリごとにスクリプトが実行されます
* `ExecutablePool` テーブル: 永続プロセスのプールを維持し、読み取り時にそのプールからプロセスを取得します

オプションとして、1 つ以上の入力用クエリを含めることができ、その結果を **stdin** にストリームしてスクリプトが読み取れるようにできます。

## `Executable` テーブルの作成 {#creating-an-executable-table}

`Executable` テーブルエンジンには、スクリプト名と入力データの形式という 2 つのパラメータを指定する必要があります。必要に応じて、1 つ以上の入力クエリを渡すこともできます。

```sql
Executable(script_name, format, [input_query...])
```

`Executable` テーブルに関連する設定は次のとおりです：

* `send_chunk_header`
  * 説明: チャンクを処理に送る前に、そのチャンク内の行数を送信します。この設定を有効にすると、スクリプト側でリソースを事前割り当てするなど、より効率的な記述が可能になります。
  * デフォルト値: false
* `command_termination_timeout`
  * 説明: コマンドを終了させるタイムアウト（秒）
  * デフォルト値: 10
* `command_read_timeout`
  * 説明: コマンドの標準出力からデータを読み取るタイムアウト（ミリ秒）
  * デフォルト値: 10000
* `command_write_timeout`
  * 説明: コマンドの標準入力へデータを書き込むタイムアウト（ミリ秒）
  * デフォルト値: 10000

例を見てみましょう。次の Python スクリプトは `my_script.py` という名前で、`user_scripts` フォルダ内に保存されています。数値 `i` を入力として受け取り、`i` 個のランダムな文字列を出力します。各文字列の先頭には、タブ区切りの番号が付与されます：

```python
#!/usr/bin/python3

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

次の `my_executable_table` は `my_script.py` の出力から作成されたもので、`my_executable_table` に対して `SELECT` を実行するたびに 10 個のランダムな文字列を生成します。

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

テーブルを作成しても、スクリプトは呼び出されず、即座に処理が返されます。`my_executable_table` をクエリすると、スクリプトが呼び出されます。

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

Hacker News サイトのユーザーはコメントを投稿します。Python には自然言語処理ツールキット (`nltk`) があり、その中の `SentimentIntensityAnalyzer` を使うと、コメントがポジティブかネガティブかニュートラルかを判定し、-1（非常にネガティブなコメント）から 1（非常にポジティブなコメント）の値を割り当てることができます。`nltk` を使って Hacker News のコメントのセンチメント（感情）を計算する `Executable` テーブルを作成してみましょう。

この例では、[こちら](/engines/table-engines/mergetree-family/textindexes/#hacker-news-dataset) で説明している `hackernews` テーブルを使用します。`hackernews` テーブルには、型が `UInt64` の `id` カラムと、`comment` という名前の `String` 型のカラムがあります。まずは `Executable` テーブルを定義することから始めましょう。

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

`sentiment` テーブルについての補足:

* ファイル `sentiment.py` は `user_scripts` フォルダ（`user_scripts_path` 設定のデフォルトフォルダ）に保存されています
* `TabSeparated` フォーマットは、Python スクリプトがタブ区切りの値を含む生データ行を生成する必要があることを意味します
* クエリは `hackernews` から 2 つのカラムを選択します。Python スクリプトでは、入力として渡される各行からこれらのカラム値をパース（抽出）する必要があります

`sentiment.py` の定義は次のとおりです:

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

Python スクリプトについての補足説明です。

* これを動作させるには、`nltk.downloader.download('vader_lexicon')` を実行する必要があります。これはスクリプト内に含めることもできますが、その場合は `sentiment` テーブルに対してクエリが実行されるたびに毎回ダウンロードされてしまい、非効率です
* `row` のそれぞれの値は、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` の結果セットの 1 行に対応します
* 入力として渡される行はタブ区切りになっているため、Python の `split` 関数を使って `id` と `comment` をパースします
* `polarity_scores` の結果は、いくつかの値を持つ JSON オブジェクトです。ここでは、この JSON オブジェクトから `compound` の値だけを取得することにしました
* ClickHouse の `sentiment` テーブルは `TabSeparated` フォーマットを使用し 2 つのカラムを持っているので、`print` 関数ではそれらのカラムをタブで区切っています

`sentiment` テーブルから行を選択するクエリを記述するたびに、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` クエリが実行され、その結果が `sentiment.py` に渡されます。実際に試してみましょう。

```sql
SELECT *
FROM sentiment
```

レスポンスは次のとおりです。

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

## `ExecutablePool` テーブルの作成 {#creating-an-executablepool-table}

`ExecutablePool` の構文は `Executable` と似ていますが、`ExecutablePool` テーブルに固有の重要な設定がいくつかあります。

* `pool_size`
  * 説明: プロセスプールのサイズ。サイズが 0 の場合はサイズ制限がありません。
  * デフォルト値: 16
* `max_command_execution_time`
  * 説明: コマンドの最大実行時間（秒単位）
  * デフォルト値: 10

上記の `sentiment` テーブルは、`Executable` の代わりに `ExecutablePool` を使用するように容易に変更できます。

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

クライアントが `sentiment_pooled` テーブルをクエリすると、ClickHouse は必要に応じて 4 つのプロセスを起動して維持します。
