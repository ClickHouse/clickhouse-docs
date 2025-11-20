---
'description': '위키피디아에서 가져온 100만 개의 기사를 포함하고 그들의 벡터 임베딩을 포함하는 데이터셋'
'sidebar_label': 'dbpedia 데이터셋'
'slug': '/getting-started/example-datasets/dbpedia-dataset'
'title': 'dbpedia 데이터셋'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'guide'
---

The [dbpedia dataset](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)는 Wikipedia에서 가져온 100만 개의 기사를 포함하고 있으며, OpenAI의 [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) 모델을 사용하여 생성된 벡터 임베딩을 제공한다.

이 데이터셋은 벡터 임베딩, 벡터 유사도 검색 및 생성 AI를 이해하는 데 훌륭한 시작 데이터셋이다. 우리는 이 데이터셋을 사용하여 ClickHouse에서 [근사 최근접 이웃 검색](../../engines/table-engines/mergetree-family/annindexes.md)과 간단하지만 강력한 Q&A 애플리케이션을 시연한다.

## Dataset details {#dataset-details}

데이터셋은 [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/)에 위치한 26개의 `Parquet` 파일을 포함한다. 파일명은 `0.parquet`, `1.parquet`, ..., `25.parquet`이다. 데이터셋의 예제 행을 보려면 이 [Hugging Face 페이지](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)를 방문해 주시기 바란다.

## Create table {#create-table}

기사 ID, 제목, 텍스트 및 임베딩 벡터를 저장하기 위해 `dbpedia` 테이블을 생성한다:

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```

## Load table {#load-table}

모든 Parquet 파일에서 데이터셋을 로드하려면 다음 셸 명령어를 실행한다:

```shell
$ seq 0 25 | xargs -P1 -I{} clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/{}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
```

또는 각각의 25개의 Parquet 파일을 로드하기 위해 아래와 같이 개별 SQL 문을 실행할 수 있다:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

`dbpedia` 테이블에서 100만 개의 행이 있는지 확인한다:

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```

## Semantic search {#semantic-search}

추천 읽기: ["Vector embeddings OpenAPI guide"](https://platform.openai.com/docs/guides/embeddings)

벡터 임베딩을 사용한 의미 검색(또는 _유사도 검색_)은 다음 단계를 포함한다:

- 사용자로부터 자연어로 검색 쿼리를 수락한다. 예: _"여행 경치 좋은 철도 여행에 대해 말해줘”_, _“유럽을 배경으로 한 서스펜스 소설”_ 등
- LLM 모델을 사용하여 검색 쿼리에 대한 임베딩 벡터를 생성한다
- 데이터셋에서 검색 임베딩 벡터에 대한 최근접 이웃을 찾는다

_최근접 이웃_은 사용자 쿼리와 관련된 문서, 이미지 또는 콘텐츠를 의미한다. 검색된 결과는 생성 AI 애플리케이션의 Retrieval Augmented Generation (RAG)에 중요한 입력으로 사용된다.

## Run a brute-force vector similarity search {#run-a-brute-force-vector-similarity-search}

KNN (k - Nearest Neighbours) 검색 또는 브루트 포스 검색은 데이터셋의 각 벡터와 검색 임베딩 벡터 간의 거리를 계산한 다음, 이 거리를 정렬하여 최근접 이웃을 찾는 작업을 포함한다. `dbpedia` 데이터셋을 사용하여 의미 검색을 시각적으로 관찰하는 빠른 기술은 데이터셋 자체의 임베딩 벡터를 검색 벡터로 사용하는 것이다. 예를 들어:

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

쿼리 대기 시간을 기록하여 ANN (벡터 인덱스 사용)에 대한 쿼리 대기 시간과 비교할 수 있다. 또한 전체 OS 파일 캐시와 `max_threads=1`에서의 쿼리 대기 시간을 기록하여 실제 컴퓨팅 사용량과 저장소 대역폭 사용량을 인식할 수 있다(수백만 개의 벡터가 있는 생산 데이터셋에 대해 이를 외삽할 수 있다!).

## Build a vector similarity index {#build-vector-similarity-index}

다음 SQL을 실행하여 `vector` 컬럼에 대해 벡터 유사도 인덱스를 정의하고 구축한다:

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

인덱스 생성 및 검색을 위한 매개변수와 성능 고려 사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명되어 있다.

인덱스를 구축하고 저장하는 데는 사용 가능한 CPU 코어 수와 저장소 대역폭에 따라 몇 분이 소요될 수 있다.

## Perform ANN search {#perform-ann-search}

_근사 최근접 이웃_ 또는 ANN은 정확한 벡터 검색보다 훨씬 빠르게 결과를 계산하는 기술 그룹(예: 그래프 및 랜덤 포레스트와 같은 특수 데이터 구조)을 의미한다. 결과의 정확도는 일반적으로 실용적인 사용에 "충분히 좋은" 수준이다. 많은 근사 기법은 결과 정확도와 검색 시간 간의 절충을 조정하기 위한 매개변수를 제공한다.

벡터 유사도 인덱스가 구축되면, 벡터 검색 쿼리는 자동으로 인덱스를 사용하게 된다:

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

## Generating embeddings for search query {#generating-embeddings-for-search-query}

지금까지 본 유사도 검색 쿼리는 `dbpedia` 테이블의 기존 벡터 중 하나를 검색 벡터로 사용한다. 실제 애플리케이션에서는 자연어로 된 사용자 입력 쿼리에 대해 검색 벡터를 생성해야 한다. 검색 벡터는 데이터셋의 임베딩 벡터를 생성하기 위해 사용된 것과 동일한 LLM 모델을 사용하여 생성되어야 한다.

아래는 OpenAI API를 호출하여 `text-embedding-3-large` 모델을 사용하여 임베딩 벡터를 생성하는 방법을 보여주는 예제 Python 스크립트이다. 검색 임베딩 벡터는 `SELECT` 쿼리의 `cosineDistance()` 함수에 인수로 전달된다.

스크립트를 실행하려면 `OPENAI_API_KEY`라는 환경 변수에 OpenAI API 키가 설정되어 있어야 한다. OpenAI API 키는 https://platform.openai.com 에 등록한 후에 얻을 수 있다.

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

## Q&A demo application {#q-and-a-demo-application}

위의 예는 ClickHouse를 사용한 의미 검색과 문서 검색을 시연하였다. 다음으로 매우 간단하지만 높은 잠재력을 가진 생성 AI 애플리케이션 예제가 제시된다.

애플리케이션은 다음 단계를 수행한다:

1. 사용자로부터 _주제_를 입력받는다
2. OpenAI API를 호출하여 모델 `text-embedding-3-large`로 _주제_에 대한 임베딩 벡터를 생성한다
3. 벡터 유사도 검색을 사용하여 `dbpedia` 테이블에서 매우 관련성이 높은 Wikipedia 기사/문서를 검색한다
4. 사용자로부터 _주제_와 관련된 자유형 질문을 자연어로 수락한다
5. OpenAI `gpt-3.5-turbo` Chat API를 사용하여 3단계에서 검색된 문서의 지식을 바탕으로 질문에 답변한다. 3단계에서 검색된 문서는 Chat API에 _맥락_으로 전달되며, 이는 생성 AI의 중요한 연결 고리가 된다.

Q&A 애플리케이션을 실행하여 몇 가지 대화 예제가 아래에 나열되고, Q&A 애플리케이션의 코드가 뒤따른다. 애플리케이션을 실행하려면 `OPENAI_API_KEY`라는 환경 변수에 OpenAI API 키가 설정되어 있어야 한다. OpenAI API 키는 https://platform.openai.com 에 등록한 후에 얻을 수 있다.

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

코드:

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
