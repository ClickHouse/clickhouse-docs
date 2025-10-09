---
'description': 'Wikipedia からの 100 万の記事とそのベクトル埋め込みを含むデータセット'
'sidebar_label': 'dbpedia データセット'
'slug': '/getting-started/example-datasets/dbpedia-dataset'
'title': 'dbpedia データセット'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'reference'
---

The [dbpedia dataset](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) には、Wikipedia からの 100 万の記事と、OpenAI の [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) モデルを使用して生成されたベクトル埋め込みが含まれています。

このデータセットは、ベクトル埋め込み、ベクトル類似性検索、Generative AI を理解するための優れたスタートデータセットです。このデータセットを使用して、ClickHouse における [approximate nearest neighbor search](../../engines/table-engines/mergetree-family/annindexes.md) と、シンプルだが強力な Q&A アプリケーションをデモします。

## データセットの詳細 {#dataset-details}

データセットには、[huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/) にある 26 の `Parquet` ファイルが含まれています。ファイル名は `0.parquet`、 `1.parquet`、...、 `25.parquet` です。データセットのいくつかのサンプル行を表示するには、この [Hugging Face のページ](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) を訪問してください。

## テーブルの作成 {#create-table}

記事の id、タイトル、テキスト、および埋め込みベクトルを格納する `dbpedia` テーブルを作成します:

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```

## テーブルのロード {#load-table}

すべての Parquet ファイルからデータセットをロードするには、次のシェルコマンドを実行します:

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

また、以下のように各 25 の Parquet ファイルをロードするために個別の SQL ステートメントを実行することもできます:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

`dbpedia` テーブルに 100 万行が表示されることを確認してください:

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```

## セマンティック検索 {#semantic-search}

推奨読書: ["Vector embeddings" OpenAPI ガイド](https://platform.openai.com/docs/guides/embeddings)

ベクトル埋め込みを使用したセマンティック検索（_similarity search_ とも呼ばれる）には、次のステップが含まれます：

- ユーザーから自然言語で検索クエリを受け取る（例: _"Tell me about some scenic rail journeys”_、_“Suspense novels set in Europe”_ など）
- LLM モデルを使用して検索クエリの埋め込みベクトルを生成する
- データセット内の検索埋め込みベクトルに最も近い近傍を見つける

_最も近い近傍_ とは、ユーザークエリに関連する結果となる文書、画像、またはコンテンツです。
取得された結果は、Generative AI アプリケーションにおける Retrieval Augmented Generation (RAG) の重要な入力です。

## ブルートフォース ベクトル類似性検索の実行 {#run-a-brute-force-vector-similarity-search}

KNN （k - Nearest Neighbours）検索またはブルートフォース検索では、データセット内の各ベクトルと検索埋め込みベクトルとの距離を計算し、その距離を順序付けて最も近い近傍を取得します。`dbpedia` データセットを使用して、セマンティック検索を視覚的に観察するための簡単な手法は、データセット自体からの埋め込みベクトルを検索ベクトルとして使用することです。例えば:

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

クエリのレイテンシを記録して、ANN（ベクトルインデックスを使用）のクエリレイテンシと比較できるようにします。また、コールド OS ファイルキャッシュでのクエリレイテンシと `max_threads=1` を記録して、実際のコンピュータ使用量とストレージ帯域幅の使用率を認識します（これを数百万のベクトルを含む生産データセットに外挿します！）

## ベクトル類似性インデックスの作成 {#build-vector-similarity-index}

次の SQL を実行して `vector` カラムにベクトル類似性インデックスを定義し、構築します:

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックス作成と検索に関するパラメータおよびパフォーマンスの考慮事項は [ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md) に記載されています。

インデックスの構築と保存には、利用可能な CPU コアの数とストレージ帯域幅に応じて数分かかる場合があります。

## ANN 検索の実行 {#perform-ann-search}

_Approximate Nearest Neighbours_ または ANN は、結果を高速に計算する特別なデータ構造（例えば、グラフやランダムフォレストなど）を用いる技術群を指します。結果の精度は通常、実用的な使用には「十分良い」です。多くの近似技術は、結果の精度と検索時間のトレードオフを調整するパラメータを提供します。

ベクトル類似性インデックスが構築されると、ベクトル検索クエリは自動的にインデックスを使用します:

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

## 検索クエリのための埋め込みの生成 {#generating-embeddings-for-search-query}

これまでに見た類似性検索クエリでは、`dbpedia` テーブル内の既存のベクトルのいずれかを検索ベクトルとして使用しています。実際のアプリケーションでは、検索ベクトルは自然言語でのユーザー入力クエリに対して生成する必要があります。検索ベクトルは、データセットの埋め込みベクトルを生成するために使用されたのと同じ LLM モデルを使用して生成する必要があります。

以下に、OpenAI API をプログラム的に呼び出して `text-embedding-3-large` モデルを使用して埋め込みベクトルを生成する方法を示す Python スクリプトの例を示します。検索埋め込みベクトルは、`SELECT` クエリ内の `cosineDistance()` 関数への引数として渡されます。

スクリプトを実行するには、環境変数 `OPENAI_API_KEY` に OpenAI API キーを設定する必要があります。OpenAI API キーは、https://platform.openai.com で登録後に取得できます。

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

## Q&A デモアプリケーション {#q-and-a-demo-application}

上記の例では、ClickHouse を使用したセマンティック検索と文書取得をデモしました。次に、非常にシンプルですが、高い潜在能力を持つ Generative AI の例アプリケーションを示します。

このアプリケーションは次のステップを実行します:

1. ユーザーから入力として _トピック_ を受け取る
2. OpenAI API を呼び出して、モデル `text-embedding-3-large` によって _トピック_ の埋め込みベクトルを生成する
3. ベクトル類似性検索を使用して、`dbpedia` テーブルから非常に関連性の高い Wikipedia 記事または文書を取得する
4. ユーザーから _トピック_ に関連する自由形式の質問を自然言語で受け取る
5. OpenAI `gpt-3.5-turbo` Chat API を使用して、ステップ #3 で取得した文書の知識に基づいて質問に答える。
   ステップ #3 で取得した文書は Chat API への _コンテキスト_ として渡され、Generative AI の重要なリンクになります。

Q&A アプリケーションを実行することで得られるいくつかの会話の例をまず以下に示し、その後 Q&A アプリケーションのコードを示します。アプリケーションを実行するには、環境変数 `OPENAI_API_KEY` に OpenAI API キーを設定する必要があります。OpenAI API キーは、https://platform.openai.com で登録後に取得できます。

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

コード:

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
