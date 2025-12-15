---
description: 'Wikipedia の記事 100 万件とそれらのベクトル埋め込みを含むデータセット'
sidebar_label: 'dbpedia データセット'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia データセット'
keywords: ['セマンティックサーチ', 'ベクトル類似検索', '近似最近傍探索', '埋め込み']
doc_type: 'guide'
---

[dbpedia データセット](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) には、Wikipedia の記事 100 万件と、それらに対して OpenAI の [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) モデルを用いて生成されたベクトル埋め込みが含まれています。

このデータセットは、ベクトル埋め込み、ベクトル類似検索、ジェネレーティブ AI を理解するための優れたスターターデータセットです。このデータセットを用いて、ClickHouse における[近似最近傍検索](../../engines/table-engines/mergetree-family/annindexes.md)と、シンプルながら強力な Q&A アプリケーションを紹介します。

## データセットの詳細 {#dataset-details}

このデータセットには、[huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/) 上にある 26 個の `Parquet` ファイルが含まれています。ファイル名は `0.parquet`、`1.parquet`、…、`25.parquet` です。データセットのサンプル行を確認するには、この [Hugging Face ページ](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) を参照してください。

## テーブルを作成する {#create-table}

記事 ID、タイトル、テキスト、および埋め込みベクトルを格納する `dbpedia` テーブルを作成します：

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```

## テーブルの読み込み {#load-table}

すべての Parquet ファイルからデータセットを読み込むには、次のシェルコマンドを実行します。

```shell
for i in $(seq 0 25); do
  echo "Processing file ${i}..."
  clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/${i}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
  echo "File ${i} complete."
done
```

別の方法として、次に示すように個々の SQL 文を実行して、25 個の各 Parquet ファイルを読み込むこともできます。

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

`dbpedia` テーブルに 100 万行があることを確認します。

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## セマンティック検索 {#semantic-search}

参考資料: ["ベクトル埋め込み（Vector embeddings）" OpenAI ガイド](https://platform.openai.com/docs/guides/embeddings)

ベクトル埋め込みを用いたセマンティック検索（_similarity search_ とも呼ばれます）は、概ね次の手順で行います。

- ユーザーから自然言語による検索クエリを受け取る（例: _"Tell me about some scenic rail journeys”_、_“Suspense novels set in Europe”_ など）
- LLM を使って検索クエリの埋め込みベクトルを生成する
- データセット内で、その検索クエリの埋め込みベクトルに最も近いベクトル（最近傍）を探索する

_最近傍（nearest neighbours）_ とは、ユーザーのクエリに関連する結果となる文書、画像、その他のコンテンツを指します。
取得された結果は、生成 AI アプリケーションにおける検索拡張生成（Retrieval Augmented Generation, RAG）の重要な入力となります。

## 総当たり方式でベクトル類似度検索を実行する {#run-a-brute-force-vector-similarity-search}

KNN（k-Nearest Neighbours）検索、または総当たり（ブルートフォース）検索では、データセット内の各ベクトルと
検索用埋め込みベクトルとの距離を計算し、その距離を並べ替えて最も近いベクトル（近傍）を取得します。`dbpedia` データセットでは、
セマンティック検索を視覚的に確認する簡単な方法として、データセット内の埋め込みベクトル自体を検索
ベクトルとして使用できます。例えば、次のようにします。

```sql title="Query"
SELECT id, title
FROM dbpedia
ORDER BY cosineDistance(vector, ( SELECT vector FROM dbpedia WHERE id = '<dbpedia:The_Remains_of_the_Day>') ) ASC
LIMIT 20
```

```response title="Response"
    ┌─id────────────────────────────────────────┬─title───────────────────────────┐
 1. │ <dbpedia:The_Remains_of_the_Day>          │ The Remains of the Day          │
 2. │ <dbpedia:The_Remains_of_the_Day_(film)>   │ The Remains of the Day (film)   │
 3. │ <dbpedia:Never_Let_Me_Go_(novel)>         │ Never Let Me Go (novel)         │
 4. │ <dbpedia:Last_Orders>                     │ Last Orders                     │
 5. │ <dbpedia:The_Unconsoled>                  │ The Unconsoled                  │
 6. │ <dbpedia:The_Hours_(novel)>               │ The Hours (novel)               │
 7. │ <dbpedia:An_Artist_of_the_Floating_World> │ An Artist of the Floating World │
 8. │ <dbpedia:Heat_and_Dust>                   │ Heat and Dust                   │
 9. │ <dbpedia:A_Pale_View_of_Hills>            │ A Pale View of Hills            │
10. │ <dbpedia:Howards_End_(film)>              │ Howards End (film)              │
11. │ <dbpedia:When_We_Were_Orphans>            │ When We Were Orphans            │
12. │ <dbpedia:A_Passage_to_India_(film)>       │ A Passage to India (film)       │
13. │ <dbpedia:Memoirs_of_a_Survivor>           │ Memoirs of a Survivor           │
14. │ <dbpedia:The_Child_in_Time>               │ The Child in Time               │
15. │ <dbpedia:The_Sea,_the_Sea>                │ The Sea, the Sea                │
16. │ <dbpedia:The_Master_(novel)>              │ The Master (novel)              │
17. │ <dbpedia:The_Memorial>                    │ The Memorial                    │
18. │ <dbpedia:The_Hours_(film)>                │ The Hours (film)                │
19. │ <dbpedia:Human_Remains_(film)>            │ Human Remains (film)            │
20. │ <dbpedia:Kazuo_Ishiguro>                  │ Kazuo Ishiguro                  │
    └───────────────────────────────────────────┴─────────────────────────────────┘
#highlight-next-line
20 rows in set. Elapsed: 0.261 sec. Processed 1.00 million rows, 6.22 GB (3.84 million rows/s., 23.81 GB/s.)
```

クエリレイテンシを記録しておき、ANN（ベクトルインデックス使用時）のクエリレイテンシと比較できるようにします。
また、実際の計算リソース使用量とストレージ帯域幅使用量を把握するため、OS ファイルキャッシュがコールドな状態および `max_threads=1` の条件でのクエリレイテンシも記録してください（それを基に、数百万ベクトル規模の本番データセットでの値を外挿します）。

## ベクトル類似度インデックスを作成する {#build-vector-similarity-index}

`vector` 列にベクトル類似度インデックスを定義・作成するには、次の SQL を実行します。

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックス作成および検索のためのパラメータとパフォーマンス上の考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。

インデックスの構築および保存処理には、利用可能な CPU コア数やストレージ帯域幅によっては数分かかる場合があります。

## ANN 検索を実行する {#perform-ann-search}

*Approximate Nearest Neighbours*（ANN、近似最近傍）とは、正確なベクトル検索よりもはるかに高速に結果を取得できる一群の手法（たとえば、グラフやランダムフォレストのような専用データ構造）を指します。結果の精度は、実用上はたいてい「十分よい」レベルです。多くの近似手法では、結果精度と検索時間のトレードオフを調整するためのパラメータが提供されています。

ベクトル類似度インデックスが構築されると、その後のベクトル検索クエリは自動的にそのインデックスを利用します。

```sql title="Query"
SELECT
    id,
    title
FROM dbpedia
ORDER BY cosineDistance(vector, (
        SELECT vector
        FROM dbpedia
        WHERE id = '<dbpedia:Glacier_Express>'
    )) ASC
LIMIT 20
```

```response title="Response"
    ┌─id──────────────────────────────────────────────┬─title─────────────────────────────────┐
 1. │ <dbpedia:Glacier_Express>                       │ Glacier Express                       │
 2. │ <dbpedia:BVZ_Zermatt-Bahn>                      │ BVZ Zermatt-Bahn                      │
 3. │ <dbpedia:Gornergrat_railway>                    │ Gornergrat railway                    │
 4. │ <dbpedia:RegioExpress>                          │ RegioExpress                          │
 5. │ <dbpedia:Matterhorn_Gotthard_Bahn>              │ Matterhorn Gotthard Bahn              │
 6. │ <dbpedia:Rhaetian_Railway>                      │ Rhaetian Railway                      │
 7. │ <dbpedia:Gotthard_railway>                      │ Gotthard railway                      │
 8. │ <dbpedia:Furka–Oberalp_railway>                 │ Furka–Oberalp railway                 │
 9. │ <dbpedia:Jungfrau_railway>                      │ Jungfrau railway                      │
10. │ <dbpedia:Monte_Generoso_railway>                │ Monte Generoso railway                │
11. │ <dbpedia:Montreux–Oberland_Bernois_railway>     │ Montreux–Oberland Bernois railway     │
12. │ <dbpedia:Brienz–Rothorn_railway>                │ Brienz–Rothorn railway                │
13. │ <dbpedia:Lauterbrunnen–Mürren_mountain_railway> │ Lauterbrunnen–Mürren mountain railway │
14. │ <dbpedia:Luzern–Stans–Engelberg_railway_line>   │ Luzern–Stans–Engelberg railway line   │
15. │ <dbpedia:Rigi_Railways>                         │ Rigi Railways                         │
16. │ <dbpedia:Saint-Gervais–Vallorcine_railway>      │ Saint-Gervais–Vallorcine railway      │
17. │ <dbpedia:Gatwick_Express>                       │ Gatwick Express                       │
18. │ <dbpedia:Brünig_railway_line>                   │ Brünig railway line                   │
19. │ <dbpedia:Regional-Express>                      │ Regional-Express                      │
20. │ <dbpedia:Schynige_Platte_railway>               │ Schynige Platte railway               │
    └─────────────────────────────────────────────────┴───────────────────────────────────────┘
#highlight-next-line
20 rows in set. Elapsed: 0.025 sec. Processed 32.03 thousand rows, 2.10 MB (1.29 million rows/s., 84.80 MB/s.)
```

## 検索クエリ用の埋め込みベクトルの生成 {#generating-embeddings-for-search-query}

これまでに見てきた類似度検索クエリでは、`dbpedia` テーブル内に既に存在するベクトルの1つを検索ベクトルとして使用していました。実際のアプリケーションでは、検索ベクトルは、自然言語で記述されたものを含むユーザーの入力クエリに対して生成する必要があります。検索ベクトルは、データセット用の埋め込みベクトルを生成する際に使用したものと同じ LLM モデルを使って生成しなければなりません。

以下の Python スクリプトは、`text-embedding-3-large` モデルを使用して OpenAI API をプログラムから呼び出し、埋め込みベクトルを生成する方法を示すサンプルです。生成された検索用埋め込みベクトルは、その後 `SELECT` クエリ内の `cosineDistance()` 関数に引数として渡されます。

このスクリプトを実行するには、OpenAI API キーを環境変数 `OPENAI_API_KEY` に設定しておく必要があります。OpenAI API キーは、[https://platform.openai.com](https://platform.openai.com) で登録後に取得できます。

```python
import sys
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # Pass ClickHouse credentials
openai_client = OpenAI() # Set OPENAI_API_KEY environment variable

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding


while True:
    # Accept the search query from user
    print("Enter a search query :")
    input_query = sys.stdin.readline();

    # Call OpenAI API endpoint to get the embedding
    print("Generating the embedding for ", input_query);
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    # Execute vector search query in ClickHouse
    print("Querying clickhouse...")
    params = {'v1':embedding, 'v2':10}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    for row in result.result_rows:
        print(row[0], row[1], row[2])
        print("---------------")
```

## Q&amp;A デモアプリケーション {#q-and-a-demo-application}

上記の例では、ClickHouse を用いたセマンティック検索とドキュメント検索を示しました。次に紹介するのは、非常にシンプルでありながら高い可能性を持つ生成 AI のサンプルアプリケーションです。

このアプリケーションは次の手順を実行します:

1. ユーザーから入力として *topic* を受け取ります
2. OpenAI API をモデル `text-embedding-3-large` で呼び出し、*topic* の埋め込みベクトルを生成します
3. `dbpedia` テーブル上でのベクトル類似度検索を使用して、関連性の高い Wikipedia の記事やドキュメントを取得します
4. ユーザーから、その *topic* に関連する自然言語での自由形式の質問を受け取ります
5. 手順 #3 で取得したドキュメントの知識に基づいて質問に回答するために、OpenAI の `gpt-3.5-turbo` Chat API を使用します。
   手順 #3 で取得したドキュメントは *context* として Chat API に渡され、生成 AI における重要な要素となります。

まず Q&amp;A アプリケーションを実行した際の会話例をいくつか示し、その後に Q&amp;A アプリケーションのコードを示します。
このアプリケーションを実行するには、環境変数 `OPENAI_API_KEY` に OpenAI API キーを設定する必要があります。
OpenAI API キーは、[https://platform.openai.com](https://platform.openai.com) で登録後に取得できます。

```shell
$ python3 QandA.py

Enter a topic : FIFA world cup 1990
Generating the embedding for 'FIFA world cup 1990' and collecting 100 articles related to it from ClickHouse...

Enter your question : Who won the golden boot
Salvatore Schillaci of Italy won the Golden Boot at the 1990 FIFA World Cup.


Enter a topic : Cricket world cup
Generating the embedding for 'Cricket world cup' and collecting 100 articles related to it from ClickHouse...

Enter your question : Which country has hosted the world cup most times
England and Wales have hosted the Cricket World Cup the most times, with the tournament being held in these countries five times - in 1975, 1979, 1983, 1999, and 2019.

$
```

コード：

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # Pass ClickHouse credentials here
openai_client = OpenAI() # Set the OPENAI_API_KEY environment variable

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # Take the topic of interest from user
    print("Enter a topic : ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # Generate an embedding vector for the search topic and query ClickHouse
    print("Generating the embedding for '" + input_query + "' and collecting 100 articles related to it from ClickHouse...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Collect all the matching articles/documents
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\nEnter your question : ", end="", flush=True)
    question = sys.stdin.readline();

    # Prompt for the OpenAI Chat API
    query = f"""Use the below content to answer the subsequent question. If the answer cannot be found, write "I don't know."

Content:
\"\"\"
{results}
\"\"\"

Question: {question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "You answer questions about {input_query}."},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # Print the answer to the question!
    print(response.choices[0].message.content)
    print("\n")
```
