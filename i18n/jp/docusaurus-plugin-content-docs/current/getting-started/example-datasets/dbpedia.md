---
description: 'Wikipedia の 100 万件の記事とそれらのベクトル埋め込みを含むデータセット'
sidebar_label: 'dbpedia データセット'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia データセット'
keywords: ['セマンティック検索', 'ベクトル類似度', '近似最近傍', '埋め込み']
doc_type: 'guide'
---

[dbpedia データセット](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) には、Wikipedia の 100 万件の記事と、それらに対して OpenAI の [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) モデルを使用して生成されたベクトル埋め込みが含まれています。

このデータセットは、ベクトル埋め込み、ベクトル類似検索、および生成 AI を理解するための優れた入門用データセットです。このデータセットを用いて、ClickHouse における [近似最近傍検索](../../engines/table-engines/mergetree-family/annindexes.md) と、シンプルでありながら強力な Q&A アプリケーションを紹介します。



## データセットの詳細 {#dataset-details}

このデータセットには、[huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/) 上にホストされている 26 個の `Parquet` ファイルが含まれています。ファイル名は `0.parquet`、`1.parquet`、…、`25.parquet` です。データセットの行の一部を例として確認するには、この [Hugging Face のページ](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) を参照してください。



## テーブルの作成

記事 ID、タイトル、本文テキスト、および埋め込みベクトルを保存するための `dbpedia` テーブルを作成します。

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```


## テーブルの読み込み

すべての Parquet ファイルからデータセットを読み込むには、次のシェルコマンドを実行します。

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

または、次のように個別のSQLステートメントを実行して、25個のParquetファイルそれぞれを読み込むこともできます。

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

`dbpedia` テーブルに 100 万行が存在することを確認します:`

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## セマンティック検索 {#semantic-search}

推奨資料: ["Vector embeddings" OpenAPI guide](https://platform.openai.com/docs/guides/embeddings)

ベクトル埋め込みを用いたセマンティック検索（_similarity search_ とも呼ばれる）は、次の手順で行います。

- ユーザーから自然言語による検索クエリを受け取る（例: _"Tell me about some scenic rail journeys”_, _“Suspense novels set in Europe”_ など）
- LLM モデルを使用して検索クエリの埋め込みベクトルを生成する
- データセット内で、その検索クエリの埋め込みベクトルに最も近い近傍を探索する

_最近傍_ とは、ユーザーのクエリに対して関連性の高いドキュメント、画像、またはコンテンツです。
取得された結果は、生成 AI アプリケーションにおける Retrieval Augmented Generation (RAG) の主要な入力となります。



## 総当たりベクトル類似検索を実行する

KNN（k-Nearest Neighbours）検索、つまり総当たり検索では、データセット内の各ベクトルと検索用の埋め込みベクトルとの距離を計算し、その距離を並べ替えて最も近い近傍を求めます。`dbpedia` データセットでは、セマンティック検索を視覚的に素早く確認する簡便な方法として、データセット内の埋め込みベクトル自体を検索ベクトルとして使用できます。例えば、次のとおりです。

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
20行のセット。経過時間: 0.261秒。処理済み: 100万行、6.22 GB (384万行/秒、23.81 GB/秒)
```

クエリレイテンシを記録しておき、ANN（ベクトルインデックス使用）によるクエリレイテンシと比較できるようにします。
また、OS ファイルキャッシュがコールドな状態の場合と `max_threads=1` を指定した場合のクエリレイテンシも記録し、実際の計算リソースおよびストレージ帯域幅の使用状況を把握します（その結果を数百万ベクトルを含む本番データセットに外挿して評価できるようにします）。


## ベクトル類似インデックスを構築する

`vector` 列に対してベクトル類似インデックスを定義・構築するには、次の SQL を実行します。

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

インデックス作成および検索のためのパラメータとパフォーマンス上の考慮事項については、[ドキュメント](../../engines/table-engines/mergetree-family/annindexes.md)を参照してください。

利用可能な CPU コア数やストレージ帯域幅によっては、インデックスの構築および保存に数分かかる場合があります。


## ANN 検索を実行する

*Approximate Nearest Neighbours*（近似最近傍探索、ANN）は、グラフやランダムフォレストのような特殊なデータ構造を用いるものなどの手法群を指し、厳密なベクトル検索よりもはるかに高速に結果を計算できます。結果の精度は、実用上は概ね「十分」であることが一般的です。多くの近似手法では、結果精度と検索時間とのトレードオフを調整できるパラメータが用意されています。

ベクトル類似度インデックスが構築されると、ベクトル検索クエリは自動的にそのインデックスを使用します。

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
20行を取得しました。経過時間: 0.025秒。処理: 32.03千行、2.10 MB (1.29百万行/秒、84.80 MB/秒)
```


## 検索クエリ用の埋め込みの生成

これまでに見てきた類似度検索クエリでは、`dbpedia` テーブル内の既存ベクトルのうち
いずれか 1 つを検索ベクトルとして使用していました。実際のアプリケーションでは、
自然言語である可能性の高いユーザー入力クエリに対して検索ベクトルを生成する必要があります。
検索ベクトルは、データセット用の埋め込みベクトルを生成する際に使用したものと同じ LLM モデルを用いて
生成する必要があります。

以下に、`text-embedding-3-large` モデルを使用して埋め込みベクトルを生成するために
OpenAI API をプログラムから呼び出す方法を示す Python スクリプトの例を示します。
生成した検索用埋め込みベクトルは、その後 `SELECT` クエリ内の `cosineDistance()` 関数に
引数として渡されます。

このスクリプトを実行するには、OpenAI API キーを環境変数 `OPENAI_API_KEY` に設定しておく必要があります。
OpenAI API キーは、[https://platform.openai.com](https://platform.openai.com) に登録することで取得できます。

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
    # ユーザーから検索クエリを受け付ける
    print("検索クエリを入力してください：")
    input_query = sys.stdin.readline();

    # OpenAI APIエンドポイントを呼び出してエンベディングを取得
    print("エンベディングを生成中：", input_query);
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    # ClickHouseでベクトル検索クエリを実行
    print("ClickHouseへクエリを実行中...")
    params = {'v1':embedding, 'v2':10}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    for row in result.result_rows:
        print(row[0], row[1], row[2])
        print("---------------")
```


## Q&amp;A デモアプリケーション

上記の例では、ClickHouse を用いたセマンティックサーチとドキュメント検索を紹介しました。ここでは、非常にシンプルですが高い可能性を秘めた生成 AI のサンプルアプリケーションを紹介します。

このアプリケーションは次の手順を実行します:

1. ユーザーから入力として *topic*（トピック）を受け取る
2. OpenAI API のモデル `text-embedding-3-large` を呼び出し、*topic* の埋め込みベクターを生成する
3. `dbpedia` テーブル上でベクター類似度検索を実行し、高い関連性を持つ Wikipedia の記事／ドキュメントを取得する
4. ユーザーから、その *topic* に関連する自然言語での自由形式の質問を受け取る
5. OpenAI の `gpt-3.5-turbo` Chat API を使用し、手順 3 で取得したドキュメントの知識に基づいて質問に回答する。\
   手順 3 で取得したドキュメントは *context*（コンテキスト）として Chat API に渡され、生成 AI における重要な役割を果たします。

まず、Q&amp;A アプリケーションを実行した際の会話例をいくつか示し、その後で Q&amp;A アプリケーションのコードを示します。アプリケーションを実行するには、環境変数 `OPENAI_API_KEY` に OpenAI API キーを設定しておく必要があります。OpenAI API キーは、[https://platform.openai.com](https://platform.openai.com) で登録を行うことで取得できます。

```shell
$ python3 QandA.py

トピックを入力してください: FIFAワールドカップ1990
'FIFAワールドカップ1990' の埋め込みベクトルを生成し、ClickHouse から関連する記事を 100 件収集しています...

質問を入力してください: ゴールデンブーツ賞を獲得したのは誰ですか
1990年のFIFAワールドカップでは、イタリア代表の Salvatore Schillaci がゴールデンブーツ賞を受賞しました。


トピックを入力してください: クリケット・ワールドカップ
'クリケット・ワールドカップ' の埋め込みベクトルを生成し、ClickHouse から関連する記事を 100 件収集しています...

質問を入力してください: ワールドカップを最多開催している国はどこですか
クリケット・ワールドカップを最多開催しているのはイングランドとウェールズで、1975年、1979年、1983年、1999年、2019年の計5回開催されています。

$
```

コード：

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # ここに ClickHouse の認証情報を指定します
openai_client = OpenAI() # 環境変数 OPENAI_API_KEY を設定しておきます

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # ユーザーから関心のあるトピックを受け取る
    print("トピックを入力してください : ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # 検索トピックの埋め込みベクトルを生成し、ClickHouse にクエリを実行する
    print("「" + input_query + "」の埋め込みを生成し、ClickHouse から関連する記事を 100 件収集しています...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # 一致したすべての記事／ドキュメントを収集する
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\n質問を入力してください : ", end="", flush=True)
    question = sys.stdin.readline();

    # OpenAI Chat API に渡すプロンプトを作成する
    query = f"""以下のコンテンツを使って、次の質問に答えてください。回答が見つからない場合は "I don't know." と出力してください。

コンテンツ:
\"\"\"
{results}
\"\"\"

質問: {question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "あなたは {input_query} に関する質問に答えるアシスタントです。"},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # 質問に対する回答を出力する
    print(response.choices[0].message.content)
    print("\n")
```
