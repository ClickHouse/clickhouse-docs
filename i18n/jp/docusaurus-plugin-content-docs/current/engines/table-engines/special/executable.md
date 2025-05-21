---
description: ' `Executable` および `ExecutablePool` テーブルエンジンを使用すると、定義したスクリプトから生成される行を持つテーブルを定義できます（行を **stdout** に書き込むことによって）。'
sidebar_label: 'Executable'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Executable および ExecutablePool テーブルエンジン'
---


# Executable および ExecutablePool テーブルエンジン

 `Executable` および `ExecutablePool` テーブルエンジンを使用すると、定義したスクリプトから生成される行を持つテーブルを定義できます（行を **stdout** に書き込むことによって）。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。

- `Executable` テーブル: 各クエリでスクリプトが実行されます
- `ExecutablePool` テーブル: 永続的なプロセスのプールを維持し、プールからプロセスを取得して読み込みます。

オプションで、スクリプトが読み込むために **stdin** に結果をストリームする1つ以上の入力クエリを含めることができます。

## Executable テーブルの作成 {#creating-an-executable-table}

 `Executable` テーブルエンジンには、スクリプトの名前と受信データのフォーマットの2つのパラメータが必要です。必要に応じて、1つ以上の入力クエリをパスすることができます：

```sql
Executable(script_name, format, [input_query...])
```

`Executable` テーブルの関連設定は次のとおりです：

- `send_chunk_header`
    - 説明: チャンクを処理に送信する前に、そのチャンク内の行数を送信します。この設定は、リソースを事前に割り当てるために、スクリプトをより効率的に記述するのに役立ちます
    - デフォルト値: false
- `command_termination_timeout`
    - 説明: コマンド終了タイムアウト（秒単位）
    - デフォルト値: 10
- `command_read_timeout`
    - 説明: コマンドの stdout からデータを読み取るためのタイムアウト（ミリ秒単位）
    - デフォルト値: 10000
- `command_write_timeout`
    - 説明: コマンドの stdin へのデータを書き込むためのタイムアウト（ミリ秒単位）
    - デフォルト値: 10000

例を見てみましょう。以下の Python スクリプトは `my_script.py` という名前で、 `user_scripts` フォルダーに保存されています。このスクリプトは、数値 `i` を読み込み、 `i` 個のランダムな文字列を印刷し、各文字列の前にタブで区切られた数値が続きます：

```python
#!/usr/bin/python3

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

以下の `my_executable_table` は `my_script.py` の出力から作成され、 `my_executable_table` から `SELECT` を実行するたびに10個のランダムな文字列が生成されます：

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

テーブルの作成は直ちに返され、スクリプトは呼び出されません。 `my_executable_table` にクエリを実行すると、スクリプトが呼び出されます：

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

## スクリプトにクエリ結果を渡す {#passing-query-results-to-a-script}

Hacker News ウェブサイトのユーザーはコメントを残します。Python には、コメントがポジティブ、ネガティブ、または中立であるかを判断するための感情分析ツールキット（`nltk`）があり、コメントに -1（非常にネガティブなコメント）から 1（非常にポジティブなコメント）までの値を割り当てます。 `nltk` を使用して Hacker News のコメントの感情を計算する `Executable` テーブルを作成してみましょう。

この例では、[こちら](/engines/table-engines/mergetree-family/invertedindexes/#full-text-search-of-the-hacker-news-dataset)で説明されている `hackernews` テーブルを使用します。 `hackernews` テーブルには `UInt64` 型の `id` カラムと、`comment` という名前の `String` カラムが含まれています。まず、 `Executable` テーブルを定義しましょう：

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

`sentiment` テーブルに関するいくつかのコメント：

- ファイル `sentiment.py` は `user_scripts` フォルダーに保存されています（`user_scripts_path` 設定のデフォルトフォルダー）
- `TabSeparated` フォーマットは、Python スクリプトがタブ区切り値を含む生データの行を生成する必要があることを意味します
- クエリは `hackernews` から 2 つのカラムを選択します。Python スクリプトは受信した行からそれらのカラム値を解析する必要があります

以下が `sentiment.py` の定義です：

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

私たちの Python スクリプトに関するいくつかのコメント：

- これが機能するには、`nltk.downloader.download('vader_lexicon')` を実行する必要があります。これはスクリプトに配置される可能性がありますが、そうすると感情テーブルにクエリされるたびにダウンロードされてしまい、効率的ではありません。
- `row` の各値は `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` の結果セット内の行になります。
- 受信した行はタブ区切りであるため、Python の `split` 関数を使用して `id` と `comment` を解析します。
- `polarity_scores` の結果は、いくつかの値を持つ JSON オブジェクトです。私たちはこの JSON オブジェクトの `compound` 値を取得することに決めました。
- ClickHouse の `sentiment` テーブルは `TabSeparated` フォーマットを使用し、2 つのカラムを含むため、私たちの `print` 関数はタブでそれらのカラムを区切ります。

`sentiment` テーブルから行を選択するクエリを記述するたびに、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` クエリが実行され、結果が `sentiment.py` に渡されます。それをテストしてみましょう：

```sql
SELECT *
FROM sentiment
```

応答は次のようになります：

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

## ExecutablePool テーブルの作成 {#creating-an-executablepool-table}

 `ExecutablePool` の構文は `Executable` に似ていますが、 `ExecutablePool` テーブルに特有のいくつかの重要な設定があります：

- `pool_size`
    - 説明: プロセスプールのサイズ。サイズが 0 の場合、サイズ制限はありません
    - デフォルト値: 16
- `max_command_execution_time`
    - 説明: 最大コマンド実行時間（秒単位）
    - デフォルト値: 10

上記の `sentiment` テーブルを `Executable` の代わりに `ExecutablePool` を使用するように簡単に変換できます：

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

ClickHouse は、クライアントが `sentiment_pooled` テーブルをクエリするときに要求に応じて 4 つのプロセスを維持します。
