---
slug: /engines/table-engines/special/executable
sidebar_position: 40
sidebar_label:  実行可能
title: "実行可能および実行可能プール テーブルエンジン"
description: "『実行可能』および『実行可能プール』テーブルエンジンを使用すると、行をスクリプトから生成するテーブルを定義できます（**stdout** への行の書き込みによって）。"
---

# 実行可能および実行可能プール テーブルエンジン

『実行可能』および『実行可能プール』テーブルエンジンを使用すると、行をスクリプトから生成するテーブルを定義できます（**stdout** への行の書き込みによって）。実行可能なスクリプトは `users_scripts` ディレクトリに保存され、任意のソースからデータを読み取ることができます。

- `実行可能` テーブル: 各クエリごとにスクリプトが実行されます
- `実行可能プール` テーブル: 永続的なプロセスのプールを維持し、読み取りのためにプールからプロセスを取得します

オプションで、スクリプトが読み取るために結果を **stdin** にストリーム配信する1つ以上の入力クエリを含めることができます。

## 実行可能テーブルの作成 {#creating-an-executable-table}

『実行可能』テーブルエンジンには、スクリプトの名前と受信データの形式の2つのパラメータが必要です。オプションで1つ以上の入力クエリを渡すことができます：

```sql
Executable(script_name, format, [input_query...])
```

以下は `実行可能` テーブルの関連設定です：

- `send_chunk_header`
    - 説明: チャンクを処理する前に、そのチャンクに含まれる行の数を送信します。この設定により、リソースを事前に割り当てるためにスクリプトをより効率的に記述できます
    - デフォルト値: false
- `command_termination_timeout`
    - 説明: コマンドの終了タイムアウト（秒）
    - デフォルト値: 10
- `command_read_timeout`
    - 説明: コマンドの stdout からデータを読み取るためのタイムアウト（ミリ秒）
    - デフォルト値: 10000
- `command_write_timeout`
    - 説明: コマンドの stdin にデータを書き込むためのタイムアウト（ミリ秒）
    - デフォルト値: 10000

例として、以下の Python スクリプトは `my_script.py` という名前で `user_scripts` フォルダに保存されています。このスクリプトは、数 `i` を読み込み、10個のランダムな文字列を生成し、各文字列の前にタブで区切られた数を付加して出力します：

```python
#!/usr/bin/python3

import sys
import string
import random

def main():

    # 入力値の読み取り
    for number in sys.stdin:
        i = int(number)

        # ランダムな行の生成
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # 結果を stdout にフラッシュ
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

以下の `my_executable_table` は、`my_script.py` の出力から構築され、`my_executable_table` から `SELECT` を実行するたびに10個のランダムな文字列を生成します：

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

テーブルの作成はすぐに戻り、スクリプトは実行されません。`my_executable_table` をクエリすると、スクリプトが実行されます：

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

## スクリプトへのクエリ結果の渡し方 {#passing-query-results-to-a-script}

Hacker Newsウェブサイトのユーザーはコメントを残します。Python には、コメントがポジティブ、ネガティブ、またはニュートラルであるかを判断するための自然言語処理ツールキット (`nltk`) が含まれており、コメントに -1（非常にネガティブなコメント）から 1（非常にポジティブなコメント）の間の値を割り当てる `SentimentIntensityAnalyzer` が用意されています。`nltk` を使用してHacker Newsのコメントのセンチメントを計算する `実行可能` テーブルを作成しましょう。

この例では、ここで説明されている `hackernews` テーブルを使用します。`hackernews` テーブルには、`UInt64` 型の `id` カラムと `String` 型の `comment` カラムが含まれています。まず、`実行可能` テーブルを定義します：

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

- ファイル `sentiment.py` は、`user_scripts` フォルダに保存されています（`user_scripts_path` 設定のデフォルトフォルダ）
- `TabSeparated` 形式は、私たちのPythonスクリプトがタブで区切られた値を含む生データの行を生成する必要があることを意味します
- このクエリは `hackernews` から2つのカラムを選択します。Python スクリプトは受信した行からこれらのカラムの値を解析する必要があります

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

私たちのPythonスクリプトに関するいくつかのコメント：

- これを機能させるためには、`nltk.downloader.download('vader_lexicon')` を実行する必要があります。これをスクリプトに置くことも可能ですが、その場合、`sentiment` テーブルに対してクエリを実行するたびにダウンロードされることになります - これは効率的ではありません
- 各 `row` の値は、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` の結果セットの行になります
- 受信行はタブで区切られているため、Python の `split` 関数を使用して `id` と `comment` を解析します
- `polarity_scores` の結果は幾つかの値を持つ JSON オブジェクトです。私たちは、この JSON オブジェクトの `compound` 値を取得することにしました
- ClickHouse の `sentiment` テーブルは `TabSeparated` 形式を使用し、2つのカラムを含むため、`print` 関数はタブでそれらのカラムを区切ることになります

`sentiment` テーブルから行を選択するクエリを実行するたびに、`SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` のクエリが実行され、その結果が `sentiment.py` に渡されます。実際に試してみましょう：

```sql
SELECT *
FROM sentiment
```

返答は次のようになります：

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

## 実行可能プールテーブルの作成 {#creating-an-executablepool-table}

`実行可能プール` の文法は `実行可能` に似ていますが、`実行可能プール` テーブルに特有の関連設定がいくつかあります：

- `pool_size`
    - 説明: プロセスプールのサイズ。サイズが0の場合、サイズの制限はありません
    - デフォルト値: 16
- `max_command_execution_time`
    - 説明: コマンドの最大実行時間（秒）
    - デフォルト値: 10

上記の `sentiment` テーブルを `実行可能` の代わりに `実行可能プール` を使用するように簡単に変換できます：

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

ClickHouse は、クライアントが `sentiment_pooled` テーブルをクエリするときに、必要に応じて4つのプロセスを維持します。
