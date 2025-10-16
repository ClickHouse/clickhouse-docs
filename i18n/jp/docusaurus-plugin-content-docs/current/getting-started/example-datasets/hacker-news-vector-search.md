---
'description': 'データセットには2800万以上のHacker News投稿とそれらのベクトル埋め込みが含まれています'
'sidebar_label': 'Hacker News ベクトル検索データセット'
'slug': '/getting-started/example-datasets/hackernews-vector-search-dataset'
'title': 'Hacker News ベクトル検索データセット'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'guide'
---

## Introduction {#introduction}

[Hacker Newsデータセット](https://news.ycombinator.com/)には2874万件の投稿とそのベクトル埋め込みが含まれています。埋め込みは[SentenceTransformers](https://sbert.net/)モデル[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)を使用して生成されました。各埋め込みベクトルの次元は`384`です。

このデータセットは、ユーザー生成のテキストデータを基に構築された大規模な実世界のベクトル検索アプリケーションの設計、サイズ、パフォーマンスの側面を通じて学ぶために使用できます。

## Dataset details {#dataset-details}

ベクトル埋め込みを含む完全なデータセットは、ClickHouseによって単一の`Parquet`ファイルとして提供されます。ファイルは[S3バケット](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)に格納されています。

ユーザーには、まず[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照して、このデータセットのストレージおよびメモリ要件を見積もるサイズ見積もり作業を実施することをお勧めします。

## Steps {#steps}

<VerticalStepper headerLevel="h3">

### Create table {#create-table}

投稿およびその埋め込み、関連属性を格納するための`hackernews`テーブルを作成します：

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

`id`は単なるインクリメンタル整数です。追加の属性は、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)に説明されているように、ポストフィルタリング/プレフィルタリングと組み合わせたベクトル類似検索を理解するための述語で使用できます。

### Load data {#load-table}

`Parquet`ファイルからデータセットをロードするには、次のSQL文を実行します：

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

2874万行をテーブルに挿入するのには数分かかります。

### Build a vector similarity index {#build-vector-similarity-index}

次のSQLを実行して、`hackernews`テーブルの`vector`カラムにベクトル類似インデックスを定義し構築します：

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックス作成と検索のためのパラメータおよびパフォーマンス考慮事項は、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)に記載されています。上記のステートメントは、HNSWハイパーパラメータ`M`と`ef_construction`に対して、それぞれ64と512の値を使用しています。ユーザーは、選択された値に対応するインデックス構築時間と検索結果の質を評価して、これらのパラメータに対する最適な値を慎重に選択する必要があります。

インデックスの構築と保存には、利用可能なCPUコアの数やストレージ帯域幅に応じて、2874万のデータセット全体で数分から数時間かかることがあります。

### Perform ANN search {#perform-ann-search}

ベクトル類似インデックスが構築されたら、ベクトル検索クエリは自動的にインデックスを使用します：

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

初回のベクトルインデックスのメモリへのロードには数秒から数分かかる場合があります。

### Generate embeddings for search query {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/)は、文や段落の意味的な意味をキャプチャするためのローカルで使いやすい埋め込みモデルを提供しています。

このHackerNewsデータセットには、[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)モデルから生成されたベクトル埋め込みが含まれています。

ここでは、`sentence_transformers` Pythonパッケージを使用してプログラム的に埋め込みベクトルを生成する方法を示すPythonスクリプトの例を提供します。検索埋め込みベクトルは、その後、`SELECT`クエリの[`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance)関数に引数として渡されます。

```python
from sentence_transformers import SentenceTransformer
import sys

import clickhouse_connect

print("Initializing...")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client() # ClickHouse credentials here

while True:
    # Take the search query from user
    print("Enter a search query :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search vector
    print("Generating the embedding for ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':20}
    result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
    print("Results :")
    for row in result.result_rows:
        print(row[0], row[2][:100])
        print("---------")

```

上記のPythonスクリプトを実行した例と類似検索結果は、以下に示されます（トップ20投稿の各投稿から100文字のみ印刷されます）：

```text
Initializing...

Enter a search query :
Are OLAP cubes useful

Generating the embedding for  "Are OLAP cubes useful"

Querying ClickHouse...

Results :

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
```

## Summarization demo application {#summarization-demo-application}

上記の例は、ClickHouseを使用したセマンティック検索と文書取得を実演しました。

非常にシンプルですが高い可能性を持つ生成AIの例アプリケーションが次に提示されます。

このアプリケーションは、次のステップを実行します：

1. ユーザーからの入力として_トピック_を受け取ります。
2. `SentenceTransformers`のモデル`all-MiniLM-L6-v2`を使用して_トピック_の埋め込みベクトルを生成します。
3. `hackernews`テーブルでベクトル類似検索を使用して非常に関連性の高い投稿/コメントを取得します。
4. `LangChain`とOpenAIの`gpt-3.5-turbo` Chat APIを使用して、ステップ#3で取得した内容を**要約**します。
   ステップ#3で取得した投稿/コメントは、Chat APIへの_コンテキスト_として渡され、生成AIにおける重要なリンクとなります。

次に、要約アプリケーションを実行した例が示され、その後に要約アプリケーションのコードが続きます。アプリケーションを実行するには、環境変数`OPENAI_API_KEY`にOpenAI APIキーを設定する必要があります。OpenAI APIキーは、https://platform.openai.com で登録後に取得できます。

このアプリケーションは、顧客感情分析、テクニカルサポートの自動化、ユーザー会話のマイニング、法的文書、医療記録、会議の議事録、財務諸表など、複数のエンタープライズドメインに適用可能な生成AIユースケースを示しています。

```shell
$ python3 summarize.py

Enter a search topic :
ClickHouse performance experiences

Generating the embedding for ---->  ClickHouse performance experiences

Querying ClickHouse to retrieve relevant articles...

Initializing chatgpt-3.5-turbo model...

Summarizing search results retrieved from ClickHouse...

Summary from chatgpt-3.5:
The discussion focuses on comparing ClickHouse with various databases like TimescaleDB, Apache Spark,
AWS Redshift, and QuestDB, highlighting ClickHouse's cost-efficient high performance and suitability
for analytical applications. Users praise ClickHouse for its simplicity, speed, and resource efficiency
in handling large-scale analytics workloads, although some challenges like DMLs and difficulty in backups
are mentioned. ClickHouse is recognized for its real-time aggregate computation capabilities and solid
engineering, with comparisons made to other databases like Druid and MemSQL. Overall, ClickHouse is seen
as a powerful tool for real-time data processing, analytics, and handling large volumes of data
efficiently, gaining popularity for its impressive performance and cost-effectiveness.
```

上記アプリケーションのコード：

```python
print("Initializing...")

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
    print("Enter a search topic :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search or reference vector
    print("Generating the embedding for ----> ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':100}
    result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Just join all the search results
    doc_results = ""
    for row in result.result_rows:
        doc_results = doc_results + "\n" + row[2]

    print("Initializing chatgpt-3.5-turbo model")
    model_name = "gpt-3.5-turbo"

    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        model_name=model_name
    )

    texts = text_splitter.split_text(doc_results)

    docs = [Document(page_content=t) for t in texts]

    llm = ChatOpenAI(temperature=0, model_name=model_name)

    prompt_template = """
Write a concise summary of the following in not more than 10 sentences:


{text}


CONSCISE SUMMARY :
"""

    prompt = PromptTemplate(template=prompt_template, input_variables=["text"])

    num_tokens = num_tokens_from_string(doc_results, model_name)

    gpt_35_turbo_max_tokens = 4096
    verbose = False

    print("Summarizing search results retrieved from ClickHouse...")

    if num_tokens <= gpt_35_turbo_max_tokens:
        chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
    else:
        chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

    summary = chain.run(docs)

    print(f"Summary from chatgpt-3.5: {summary}")
```
</VerticalStepper>
