---
description: 'The `Executable` and `ExecutablePool` table engines allow you to define
  a table whose rows are generated from a script that you define (by writing rows
  to **stdout**).'
sidebar_label: 'Executable'
sidebar_position: 40
slug: '/engines/table-engines/special/executable'
title: 'Executable and ExecutablePool Table Engines'
---




# 実行可能および実行プールテーブルエンジン

`Executable` および `ExecutablePool` テーブルエンジンを使用すると、あなたが定義したスクリプトから生成された行を持つテーブルを定義できます（**stdout** に行を書き込むことによって）。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。

- `Executable` テーブル: 各クエリごとにスクリプトが実行されます
- `ExecutablePool` テーブル: 永続的なプロセスのプールを維持し、プールからプロセスを取得して読み込みます

オプションで、スクリプトが読み取るために結果を **stdin** にストリームする1つ以上の入力クエリを含めることができます。

## 実行可能テーブルの作成 {#creating-an-executable-table}

`Executable` テーブルエンジンには、スクリプトの名前と受信データの形式という2つのパラメータが必要です。オプションで、1つ以上の入力クエリを渡すことができます：

```sql
Executable(script_name, format, [input_query...])
```

`Executable` テーブルに関連する設定は以下の通りです：

- `send_chunk_header`
    - 説明: プロセスにチャンクを送信する前に、各チャンク内の行数を送信します。この設定は、リソースを事前に確保するためにスクリプトをより効率的に書くのに役立ちます
    - デフォルト値: false
- `command_termination_timeout`
    - 説明: コマンド終了タイムアウト（秒単位）
    - デフォルト値: 10
- `command_read_timeout`
    - 説明: コマンド stdout からデータを読み取るためのタイムアウト（ミリ秒単位）
    - デフォルト値: 10000
- `command_write_timeout`
    - 説明: コマンド stdin にデータを書き込むためのタイムアウト（ミリ秒単位）
    - デフォルト値: 10000


例を見てみましょう。次の Python スクリプトは `my_script.py` という名で `user_scripts` フォルダに保存されています。このスクリプトは数値 `i` を読み取り、10個のランダムな文字列を出力します。各文字列の前にはタブで区切られた数字が付きます：

```python
#!/usr/bin/python3

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

        # 結果を stdout にフラッシュ
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

次の `my_executable_table` は `my_script.py` の出力から構築されます。これにより、`my_executable_table` から `SELECT` を実行するたびに10個のランダムな文字列が生成されます：

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

テーブルの作成はすぐに戻り、スクリプトは呼び出されません。`my_executable_table` をクエリすると、スクリプトが呼び出されます：

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

Hacker News ウェブサイトのユーザーはコメントを残します。Python には、コメントがポジティブ、ネガティブ、またはニュートラルであるかを判断するための自然言語処理ツールキット（`nltk`）があり、-1（非常にネガティブなコメント）から1（非常にポジティブなコメント）までの値を割り当てることができます。それでは、`nltk` を使用して Hacker News コメントの感情を計算する `Executable` テーブルを作成しましょう。

この例では、[こちら](/engines/table-engines/mergetree-family/invertedindexes/#full-text-search-of-the-hacker-news-dataset)で説明されている `hackernews` テーブルを使用します。`hackernews` テーブルには、`UInt64` 型の `id` カラムと `String` 型の `comment` カラムが含まれています。それでは、`Executable` テーブルを定義して始めましょう：

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

`sentiment` テーブルについてのいくつかのコメント：

- ファイル `sentiment.py` は `user_scripts` フォルダに保存されています（`user_scripts_path` 設定のデフォルトフォルダ）
- `TabSeparated` 形式は、Python スクリプトがタブ区切りの値を含む生データの行を生成する必要があることを意味します
- クエリは `hackernews` から2つのカラムを選択します。Python スクリプトは、受信行からそのカラム値を解析する必要があります

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

私たちの Python スクリプトについてのいくつかのコメント：

- これが機能するためには、`nltk.downloader.download('vader_lexicon')` を実行する必要があります。これはスクリプト内に置くこともできますが、そうすると `sentiment` テーブルのクエリが実行されるたびに毎回ダウンロードされてしまうため、効率的ではありません
- `row` の各値は `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` の結果セットの行になります
- 受信行はタブ区切りであるため、Python の `split` 関数を使用して `id` と `comment` を解析します
- `polarity_scores` の結果は多数の値を持つ JSON オブジェクトです。私たちはこの JSON オブジェクトの `compound` 値を取得することにしました
- `sentiment` テーブルは ClickHouse で `TabSeparated` 形式を使用し、2つのカラムを含むため、私たちの `print` 関数はタブでカラムを区切ります

`sentiment` テーブルから行を選択するクエリを実行するたびに、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` クエリが実行され、その結果が `sentiment.py` に渡されます。これをテストしてみましょう：

```sql
SELECT *
FROM sentiment
```

応答は以下のようになります：

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

`ExecutablePool` の構文は `Executable` と似ていますが、`ExecutablePool` テーブル固有のいくつかの関連設定があります：

- `pool_size`
    - 説明: プロセスプールのサイズ。サイズが0の場合、サイズの制限はありません
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

ClickHouse は、クライアントが `sentiment_pooled` テーブルをクエリする際に、オンデマンドで4つのプロセスを維持します。
