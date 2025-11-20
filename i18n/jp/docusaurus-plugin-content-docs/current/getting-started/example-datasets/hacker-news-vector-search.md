---
description: '2,800万件以上の Hacker News 投稿とそのベクトル埋め込みを含むデータセット'
sidebar_label: 'Hacker News ベクトル検索データセット'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Hacker News ベクトル検索データセット'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---



## はじめに {#introduction}

[Hacker Newsデータセット](https://news.ycombinator.com/)には、2,874万件の投稿とそのベクトル埋め込みが含まれています。埋め込みは、[SentenceTransformers](https://sbert.net/)モデルの[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)を使用して生成されました。各埋め込みベクトルの次元数は`384`です。

このデータセットは、ユーザー生成のテキストデータを基盤とした大規模な実環境のベクトル検索アプリケーションにおける設計、サイジング、パフォーマンスの各側面を検証するために使用できます。


## データセットの詳細 {#dataset-details}

ベクトル埋め込みを含む完全なデータセットは、ClickHouseによって単一の`Parquet`ファイルとして[S3バケット](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)で提供されています。

このデータセットのストレージとメモリ要件を見積もるために、まず[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してサイジング検証を実施することを推奨します。


## 手順 {#steps}

<VerticalStepper headerLevel="h3">

### テーブルの作成 {#create-table}

投稿とその埋め込みベクトル、および関連する属性を格納する `hackernews` テーブルを作成します：

```sql
CREATE TABLE hackernews
(
    `id` Int32,
    `doc_id` Int32,
    `text` String,
    `vector` Array(Float32),
    `node_info` Tuple(
        start Nullable(UInt64),
        end Nullable(UInt64)),
    `metadata` String,
    `type` Enum8('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `title` String,
    `post_score` Int32,
    `dead` UInt8,
    `deleted` UInt8,
    `length` UInt32
)
ENGINE = MergeTree
ORDER BY id;
```

`id` は単なる増分整数です。追加の属性は述語で使用でき、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)で説明されているように、ポストフィルタリング/プレフィルタリングと組み合わせたベクトル類似検索を実現できます。

### データの読み込み {#load-table}

`Parquet` ファイルからデータセットを読み込むには、以下のSQL文を実行します：

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

テーブルへの2,874万行の挿入には数分かかります。

### ベクトル類似インデックスの構築 {#build-vector-similarity-index}

`hackernews` テーブルの `vector` カラムにベクトル類似インデックスを定義して構築するには、以下のSQLを実行します：

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックス作成と検索のパラメータおよびパフォーマンスに関する考慮事項は、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)に記載されています。
上記の文では、HNSWハイパーパラメータ `M` と `ef_construction` にそれぞれ64と512の値を使用しています。
ユーザーは、選択した値に対応するインデックス構築時間と検索結果の品質を評価することで、これらのパラメータの最適な値を慎重に選択する必要があります。

2,874万件の完全なデータセットに対するインデックスの構築と保存には、利用可能なCPUコア数とストレージ帯域幅に応じて、数分から数時間かかる場合があります。

### ANN検索の実行 {#perform-ann-search}

ベクトル類似インデックスが構築されると、ベクトル検索クエリは自動的にインデックスを使用します：

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

ベクトルインデックスの初回メモリ読み込みには数秒から数分かかる場合があります。

### 検索クエリの埋め込みベクトル生成 {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/)は、文や段落の意味を捉えるための、ローカルで使いやすい埋め込みモデルを提供します。

このHackerNewsデータセットには、[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)モデルから生成されたベクトル埋め込みが含まれています。

以下に、`sentence_transformers` Pythonパッケージを使用してプログラムで埋め込みベクトルを生成する方法を示すPythonスクリプトの例を示します。検索埋め込みベクトルは、`SELECT` クエリ内の [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 関数の引数として渡されます。

```python
from sentence_transformers import SentenceTransformer
import sys

import clickhouse_connect

print("Initializing...")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client() # ClickHouse credentials here

while True:
    # ユーザーから検索クエリを取得
    print("Enter a search query :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # モデルを実行して検索ベクトルを取得
    print("Generating the embedding for ", input_query);
    embeddings = model.encode(texts)

```


    print("ClickHouse にクエリを実行しています...")
    params = {'v1':list(embeddings[0]), 'v2':20}
    result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
    print("結果:")
    for row in result.result_rows:
        print(row[0], row[2][:100])
        print("---------")

````

上記の Python スクリプトを実行した例と、その類似度検索の結果を次に示します
（上位 20 件の投稿それぞれについて、先頭 100 文字のみを表示しています）。

```text
初期化中...

検索クエリを入力してください:
Are OLAP cubes useful

"Are OLAP cubes useful" の埋め込みを生成しています

Querying ClickHouse...

結果:

27742647 smartmic:
slt2021: OLAP Cube is not dead, as long as you use some form of:<p>1. GROUP BY multiple fi
---------
27744260 georgewfraser:A data mart is a logical organization of data to help humans understand the schema. Wh
---------
27761434 mwexler:&quot;We model data according to rigorous frameworks like Kimball or Inmon because we must r
---------
28401230 chotmat:
erosenbe0: OLAP database is just a copy, replica, or archive of data with a schema designe
---------
22198879 Merick:+1 for Apache Kylin, it&#x27;s a great project and awesome open source community. If anyone i
---------
27741776 crazydoggers:I always felt the value of an OLAP cube was uncovering questions you may not know to as
---------
22189480 shadowsun7:
_Codemonkeyism: After maintaining an OLAP cube system for some years, I&#x27;m not that
---------
27742029 smartmic:
gengstrand: My first exposure to OLAP was on a team developing a front end to Essbase that
---------
22364133 irfansharif:
simo7: I&#x27;m wondering how this technology could work for OLAP cubes.<p>An OLAP cube
---------
23292746 scoresmoke:When I was developing my pet project for Web analytics (<a href="https:&#x2F;&#x2F;github
---------
22198891 js8:It seems that the article makes a categorical error, arguing that OLAP cubes were replaced by co
---------
28421602 chotmat:
7thaccount: Is there any advantage to OLAP cube over plain SQL (large historical database r
---------
22195444 shadowsun7:
lkcubing: Thanks for sharing. Interesting write up.<p>While this article accurately capt
---------
22198040 lkcubing:Thanks for sharing. Interesting write up.<p>While this article accurately captures the issu
---------
3973185 stefanu:
sgt: Interesting idea. Ofcourse, OLAP isn't just about the underlying cubes and dimensions,
---------
22190903 shadowsun7:
js8: It seems that the article makes a categorical error, arguing that OLAP cubes were r
---------
28422241 sradman:OLAP Cubes have been disrupted by Column Stores. Unless you are interested in the history of
---------
28421480 chotmat:
sradman: OLAP Cubes have been disrupted by Column Stores. Unless you are interested in the
---------
27742515 BadInformatics:
quantified: OP posts with inverted condition: “OLAP != OLAP Cube” is the actual titl
---------
28422935 chotmat:
rstuart4133: I remember hearing about OLAP cubes donkey&#x27;s years ago (probably not far
---------
````


## 要約デモアプリケーション {#summarization-demo-application}

上記の例では、ClickHouseを使用したセマンティック検索とドキュメント検索を実演しました。

次に、非常にシンプルながら高い可能性を持つ生成AIのサンプルアプリケーションを紹介します。

このアプリケーションは以下のステップを実行します:

1. ユーザーから_トピック_を入力として受け取る
2. `SentenceTransformers`とモデル`all-MiniLM-L6-v2`を使用して、_トピック_の埋め込みベクトルを生成する
3. `hackernews`テーブルに対してベクトル類似度検索を使用し、高い関連性を持つ投稿/コメントを取得する
4. `LangChain`とOpenAI `gpt-3.5-turbo` Chat APIを使用して、ステップ3で取得したコンテンツを**要約**する。
   ステップ3で取得した投稿/コメントは_コンテキスト_としてChat APIに渡され、生成AIにおける重要な連携要素となる。

以下に、要約アプリケーションの実行例を最初に示し、その後に要約アプリケーションのコードを示します。アプリケーションを実行するには、環境変数`OPENAI_API_KEY`にOpenAI APIキーを設定する必要があります。OpenAI APIキーは、https://platform.openai.com で登録後に取得できます。

このアプリケーションは、顧客感情分析、技術サポートの自動化、ユーザー会話のマイニング、法的文書、医療記録、会議の議事録、財務諸表など、複数のエンタープライズ領域に適用可能な生成AIのユースケースを実演しています。

```shell
$ python3 summarize.py

検索トピックを入力してください:
ClickHouseのパフォーマンス体験

埋め込みを生成中 ---->  ClickHouseのパフォーマンス体験

関連記事を取得するためにClickHouseにクエリを実行中...

chatgpt-3.5-turboモデルを初期化中...

ClickHouseから取得した検索結果を要約中...

chatgpt-3.5からの要約:
議論は、ClickHouseをTimescaleDB、Apache Spark、AWS Redshift、QuestDBなどの様々なデータベースと比較することに焦点を当てており、ClickHouseのコスト効率の高いパフォーマンスと分析アプリケーションへの適合性を強調しています。ユーザーは、大規模な分析ワークロードを処理する際のClickHouseのシンプルさ、速度、リソース効率を称賛していますが、DMLやバックアップの難しさなどの課題も言及されています。ClickHouseは、リアルタイム集計計算機能と堅実なエンジニアリングで認識されており、DruidやMemSQLなどの他のデータベースとの比較も行われています。全体として、ClickHouseはリアルタイムデータ処理、分析、大量データの効率的な処理のための強力なツールと見なされており、その印象的なパフォーマンスとコスト効率の高さで人気を集めています。
```

上記アプリケーションのコード:

```python
print("初期化中...")

import sys
import json
import time
from sentence_transformers import SentenceTransformer

import clickhouse_connect

from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
import textwrap
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    encoding = tiktoken.encoding_for_model(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client(compress=False) # ClickHouse credentials here

while True:
    # Take the search query from user
    print("検索トピックを入力してください:")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search or reference vector
    print("埋め込みを生成中 ----> ", input_query);
    embeddings = model.encode(texts)

    print("ClickHouseにクエリを実行中...")
    params = {'v1':list(embeddings[0]), 'v2':100}
    result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Just join all the search results
    doc_results = ""
    for row in result.result_rows:
        doc_results = doc_results + "\n" + row[2]

    print("chatgpt-3.5-turboモデルを初期化中")
    model_name = "gpt-3.5-turbo"

    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        model_name=model_name
    )

    texts = text_splitter.split_text(doc_results)

    docs = [Document(page_content=t) for t in texts]

    llm = ChatOpenAI(temperature=0, model_name=model_name)

    prompt_template = """
以下の内容を10文以内で簡潔に要約してください:


{text}


簡潔な要約:
"""

    prompt = PromptTemplate(template=prompt_template, input_variables=["text"])

```


    num_tokens = num_tokens_from_string(doc_results, model_name)

    gpt_35_turbo_max_tokens = 4096
    verbose = False

    print("ClickHouseから取得した検索結果を要約中...")

    if num_tokens <= gpt_35_turbo_max_tokens:
        chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
    else:
        chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

    summary = chain.run(docs)

    print(f"chatgpt-3.5からの要約: {summary}")

```
</VerticalStepper>
```
