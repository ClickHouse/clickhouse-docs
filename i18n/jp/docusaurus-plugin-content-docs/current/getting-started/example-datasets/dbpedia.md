---
description: 'Wikipedia の 100 万件の記事とそれらのベクトル埋め込みを含むデータセット'
sidebar_label: 'dbpedia データセット'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia データセット'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---

[dbpedia データセット](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) には、Wikipedia の 100 万件の記事と、それらに対して OpenAI の [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) モデルを用いて生成されたベクトル埋め込みが含まれています。

このデータセットは、ベクトル埋め込み、ベクトル類似度検索、および生成 AI を理解するための優れた入門用データセットです。このデータセットを利用して、ClickHouse における [近似最近傍検索](../../engines/table-engines/mergetree-family/annindexes.md) と、シンプルながら強力な Q&A アプリケーションを紹介します。



## データセットの詳細 {#dataset-details}

このデータセットには、[huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/)上に配置された26個の`Parquet`ファイルが含まれています。ファイル名は`0.parquet`、`1.parquet`、...、`25.parquet`となっています。データセットのサンプル行を確認するには、こちらの[Hugging Faceページ](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)をご覧ください。


## テーブルの作成 {#create-table}

記事ID、タイトル、テキスト、埋め込みベクトルを格納する`dbpedia`テーブルを作成します:

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

すべてのParquetファイルからデータセットをロードするには、以下のシェルコマンドを実行してください:

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

または、以下のように個別のSQLステートメントを実行して、25個のParquetファイルをそれぞれロードすることもできます:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

`dbpedia`テーブルに100万行が格納されていることを確認してください:

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## セマンティック検索 {#semantic-search}

推奨資料: ["Vector embeddings" OpenAI guide](https://platform.openai.com/docs/guides/embeddings)

ベクトル埋め込みを使用したセマンティック検索(_類似検索_とも呼ばれます)には、以下の手順が含まれます:

- ユーザーから自然言語での検索クエリを受け付ける(例: _"景色の良い鉄道の旅について教えて"_、_"ヨーロッパを舞台にしたサスペンス小説"_ など)
- LLMモデルを使用して検索クエリの埋め込みベクトルを生成する
- データセット内で検索埋め込みベクトルの最近傍を見つける

_最近傍_とは、ユーザークエリに関連する結果となるドキュメント、画像、またはコンテンツのことです。
取得された結果は、生成AIアプリケーションにおけるRetrieval Augmented Generation(RAG)の重要な入力となります。


## ブルートフォースベクトル類似検索の実行 {#run-a-brute-force-vector-similarity-search}

KNN（k近傍法）検索またはブルートフォース検索では、データセット内の各ベクトルと検索埋め込みベクトルとの距離を計算し、距離を順序付けして最近傍を取得します。`dbpedia`データセットでは、セマンティック検索を視覚的に確認する簡単な方法として、データセット自体の埋め込みベクトルを検索ベクトルとして使用できます。例：

```sql title="クエリ"
SELECT id, title
FROM dbpedia
ORDER BY cosineDistance(vector, ( SELECT vector FROM dbpedia WHERE id = '<dbpedia:The_Remains_of_the_Day>') ) ASC
LIMIT 20
```

```response title="レスポンス"
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

クエリレイテンシを記録し、ANN（ベクトルインデックス使用）のクエリレイテンシと比較できるようにしてください。
また、実際の計算リソース使用量とストレージ帯域幅使用量を把握するために、OSファイルキャッシュがコールド状態の場合と`max_threads=1`の場合のクエリレイテンシも記録してください（数百万のベクトルを含む本番環境のデータセットに外挿してください！）


## ベクトル類似度インデックスの構築 {#build-vector-similarity-index}

`vector`カラムにベクトル類似度インデックスを定義・構築するには、以下のSQLを実行します：

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックスの作成と検索に関するパラメータおよびパフォーマンスの考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。

インデックスの構築と保存には、利用可能なCPUコア数やストレージ帯域幅に応じて数分かかることがあります。


## ANN検索の実行 {#perform-ann-search}

_近似最近傍探索_（Approximate Nearest Neighbours、ANN）は、厳密なベクトル検索よりもはるかに高速に結果を計算する技術群（例：グラフやランダムフォレストなどの特殊なデータ構造）を指します。結果の精度は通常、実用上「十分」です。多くの近似手法では、結果の精度と検索時間のトレードオフを調整するためのパラメータが提供されています。

ベクトル類似性インデックスが構築されると、ベクトル検索クエリは自動的にインデックスを使用します：

```sql title="クエリ"
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

```response title="レスポンス"
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


## 検索クエリの埋め込みベクトル生成 {#generating-embeddings-for-search-query}

これまでに見てきた類似検索クエリは、`dbpedia`テーブル内の既存のベクトルの1つを検索ベクトルとして使用しています。実際のアプリケーションでは、自然言語で記述される可能性のあるユーザー入力クエリに対して検索ベクトルを生成する必要があります。検索ベクトルは、データセットの埋め込みベクトル生成に使用したものと同じLLMモデルを使用して生成する必要があります。

以下に、`text-embedding-3-large`モデルを使用して埋め込みベクトルを生成するためにOpenAI APIをプログラムから呼び出す方法を示すPythonスクリプトの例を示します。生成された検索埋め込みベクトルは、`SELECT`クエリ内の`cosineDistance()`関数の引数として渡されます。

このスクリプトを実行するには、環境変数`OPENAI_API_KEY`にOpenAI APIキーを設定する必要があります。OpenAI APIキーは、https://platform.openai.com で登録後に取得できます。

```python
import sys
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # ClickHouseの認証情報を渡す
openai_client = OpenAI() # OPENAI_API_KEY環境変数を設定

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding


while True:
    # ユーザーから検索クエリを受け取る
    print("検索クエリを入力してください:")
    input_query = sys.stdin.readline();

    # OpenAI APIエンドポイントを呼び出して埋め込みベクトルを取得
    print("埋め込みベクトルを生成中:", input_query);
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    # ClickHouseでベクトル検索クエリを実行
    print("ClickHouseにクエリを実行中...")
    params = {'v1':embedding, 'v2':10}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    for row in result.result_rows:
        print(row[0], row[1], row[2])
        print("---------------")
```


## Q&Aデモアプリケーション {#q-and-a-demo-application}

上記の例では、ClickHouseを使用したセマンティック検索とドキュメント検索を実演しました。次に、非常にシンプルながら高い可能性を秘めた生成AIのサンプルアプリケーションを紹介します。

このアプリケーションは以下のステップを実行します：

1. ユーザーから_トピック_を入力として受け取る
2. `text-embedding-3-large`モデルでOpenAI APIを呼び出し、_トピック_の埋め込みベクトルを生成する
3. `dbpedia`テーブルに対してベクトル類似度検索を使用し、高い関連性を持つWikipediaの記事/ドキュメントを取得する
4. _トピック_に関連する自然言語の自由形式の質問をユーザーから受け取る
5. ステップ3で取得したドキュメントの知識に基づいて、OpenAIの`gpt-3.5-turbo` Chat APIを使用して質問に回答する。
   ステップ3で取得したドキュメントは_コンテキスト_としてChat APIに渡され、生成AIにおける重要な連携要素となる。

以下に、Q&Aアプリケーションを実行した際の会話例をいくつか示し、その後にQ&Aアプリケーションのコードを掲載します。アプリケーションを実行するには、環境変数`OPENAI_API_KEY`にOpenAI APIキーを設定する必要があります。OpenAI APIキーは、https://platform.openai.com で登録後に取得できます。

```shell
$ python3 QandA.py

Enter a topic : FIFA world cup 1990
Generating the embedding for 'FIFA world cup 1990' and collecting 100 articles related to it from ClickHouse...

Enter your question : Who won the golden boot
イタリアのサルヴァトーレ・スキラッチが1990年FIFAワールドカップでゴールデンブーツを獲得しました。


Enter a topic : Cricket world cup
Generating the embedding for 'Cricket world cup' and collecting 100 articles related to it from ClickHouse...

Enter your question : Which country has hosted the world cup most times
イングランドとウェールズがクリケットワールドカップを最も多く開催しており、1975年、1979年、1983年、1999年、2019年の5回、これらの国で大会が開催されました。

$
```

コード：

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # ClickHouseの認証情報をここに渡す
openai_client = OpenAI() # 環境変数OPENAI_API_KEYを設定

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # ユーザーから関心のあるトピックを取得
    print("Enter a topic : ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # 検索トピックの埋め込みベクトルを生成し、ClickHouseにクエリを実行
    print("Generating the embedding for '" + input_query + "' and collecting 100 articles related to it from ClickHouse...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # マッチングしたすべての記事/ドキュメントを収集
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\nEnter your question : ", end="", flush=True)
    question = sys.stdin.readline();

    # OpenAI Chat API用のプロンプト
    query = f"""以下のコンテンツを使用して、後続の質問に回答してください。回答が見つからない場合は、「わかりません」と記述してください。

コンテンツ：
\"\"\"
{results}
\"\"\"

質問：{question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "You answer questions about {input_query}."},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # 質問への回答を出力！
    print(response.choices[0].message.content)
    print("\n")
```
