---
slug: /engines/table-engines/special/executable
sidebar_position: 40
sidebar_label:  実行可能
title: "実行可能および ExecutablePool テーブルエンジン"
description: "`Executable` および `ExecutablePool` テーブルエンジンは、定義したスクリプトの出力から行を生成するテーブルを定義することを可能にします（行を **stdout** に書き込むことによって）。"
---


# 実行可能および ExecutablePool テーブルエンジン

`Executable` および `ExecutablePool` テーブルエンジンは、定義したスクリプトの出力から行を生成するテーブルを定義することを可能にします（行を **stdout** に書き込むことによって）。 実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。

- `Executable` テーブル: 各クエリでスクリプトが実行されます
- `ExecutablePool` テーブル: 永続プロセスのプールを維持し、読み取りのためにプールからプロセスを取得します

オプションで、スクリプトが読み込むために **stdin** に結果をストリームする1つまたは複数の入力クエリを含めることができます。

## 実行可能テーブルの作成 {#creating-an-executable-table}

`Executable` テーブルエンジンには、スクリプトの名前と受信データの形式という2つのパラメータが必要です。 オプションで1つまたは複数の入力クエリを渡すことができます：

```sql
Executable(script_name, format, [input_query...])
```

`Executable` テーブルの関連設定は次のとおりです：

- `send_chunk_header`
    - 説明: チャンクを処理に送信する前に、各チャンク内の行数を送信します。この設定は、リソースを事前に割り当てるためにスクリプトを書くのに役立ちます
    - デフォルト値: false
- `command_termination_timeout`
    - 説明: コマンドの終了タイムアウト（秒）
    - デフォルト値: 10
- `command_read_timeout`
    - 説明: コマンドの stdout からデータを読み取るためのタイムアウト（ミリ秒）
    - デフォルト値: 10000
- `command_write_timeout`
    - 説明: コマンドの stdin にデータを書くためのタイムアウト（ミリ秒）
    - デフォルト値: 10000


例を見てみましょう。次の Python スクリプトは `my_script.py` という名前で `user_scripts` フォルダーに保存されています。 数値 `i` を読み込み、i 個のランダムな文字列を出力し、それぞれの文字列の前にタブで区切られた数字が表示されます：

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

        # 結果を stdout にフラッシュ
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

次の `my_executable_table` は `my_script.py` の出力から構築され、`my_executable_table` から `SELECT` を実行するたびに 10 のランダムな文字列を生成します：

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

テーブルの作成はすぐに終了し、スクリプトは呼び出されません。 `my_executable_table` をクエリするとスクリプトが呼び出されます：

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

## 結果をスクリプトに渡す {#passing-query-results-to-a-script}

Hacker News ウェブサイトのユーザーはコメントを残します。 Python には、コメントがポジティブ、ネガティブ、ニュートラルのいずれかを判断するための自然言語処理ツールキット（`nltk`）が含まれており、-1（非常にネガティブなコメント）から1（非常にポジティブなコメント）までの値を割り当てることができます。 Hacker News のコメントの感情を計算する `Executable` テーブルを作成してみましょう。

この例では、`hackernews` テーブルを使用しています。このテーブルについては [こちら](/engines/table-engines/mergetree-family/invertedindexes/#full-text-search-of-the-hacker-news-dataset) に記載されています。 `hackernews` テーブルには `UInt64` 型の `id` カラムと `comment` という名前の `String` カラムが含まれています。 `Executable` テーブルを定義してみましょう：

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

- ファイル `sentiment.py` は `user_scripts` フォルダーに保存されています（これは `user_scripts_path` 設定のデフォルトフォルダーです）
- `TabSeparated` 形式は、Python スクリプトがタブで区切られた値を含む生データの行を生成する必要があることを意味します
- クエリは `hackernews` から2つのカラムを選択します。 Python スクリプトは、受信行からこれらのカラムの値を解析する必要があります

以下は `sentiment.py` の定義です：

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

- これを機能させるためには、`nltk.downloader.download('vader_lexicon')` を実行する必要があります。これはスクリプトに書くこともできましたが、その場合、`sentiment` テーブルにクエリが実行されるたびにダウンロードされてしまうので、効率的ではありません
- `row` の各値は `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` の結果セットの行になります
- 受信行はタブで区切られているので、Python の `split` 関数を使用して `id` と `comment` を解析します
- `polarity_scores` の結果は複数の値を持つ JSON オブジェクトです。 この JSON オブジェクトの `compound` 値だけを取得することにしました
- ClickHouse の `sentiment` テーブルは `TabSeparated` 形式を使用し、2つのカラムを含んでいるため、`print` 関数はそれらのカラムをタブで区切ります

`sentiment` テーブルから行を選択するクエリを毎回実行すると、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` のクエリが実行され、その結果が `sentiment.py` に渡されます。テストしてみましょう：

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

`ExecutablePool` の構文は `Executable` と似ていますが、`ExecutablePool` テーブルに固有のいくつかの関連設定があります：

- `pool_size`
    - 説明: プロセスプールのサイズ。 サイズが 0 の場合、サイズ制限はありません
    - デフォルト値: 16
- `max_command_execution_time`
    - 説明: 最大コマンド実行時間（秒）
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

ClickHouse は、クライアントが `sentiment_pooled` テーブルをクエリする際に、オンデマンドで 4 つのプロセスを維持します。
