---
description: '위키백과의 문서 100만 개와 해당 벡터 임베딩을 포함한 데이터셋'
sidebar_label: 'dbpedia 데이터셋'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia 데이터셋'
keywords: ['시맨틱 검색', '벡터 유사도', '근사 최근접 이웃', '임베딩']
doc_type: 'guide'
---

[dbpedia 데이터셋](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)은 위키백과의 문서 100만 개와 OpenAI의 [text-embedding-3-large](https://platform.openai.com/docs/models/text-embedding-3-large) 모델로 생성된 벡터 임베딩을 포함합니다.

이 데이터셋은 벡터 임베딩, 벡터 유사도 검색 및 생성형 AI를 이해하는 데 적합한 훌륭한 입문용 데이터셋입니다. 이 데이터셋을 사용하여 ClickHouse에서 [근사 최근접 이웃 검색](../../engines/table-engines/mergetree-family/annindexes.md)과 단순하지만 강력한 Q&A 애플리케이션을 시연합니다.

## 데이터세트 상세 정보 \{#dataset-details\}

이 데이터세트에는 [huggingface.co](https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/)에 위치한 `Parquet` 파일 26개가 포함되어 있습니다. 파일 이름은 `0.parquet`, `1.parquet`, ..., `25.parquet`입니다. 데이터세트의 예시 행 몇 개를 확인하려면 이 [Hugging Face 페이지](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M)를 방문하십시오.

## 테이블 생성 \{#create-table\}

문서 ID, 제목, 텍스트 및 임베딩 벡터를 저장할 `dbpedia` 테이블을 생성합니다:

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```


## 테이블 로드 \{#load-table\}

모든 Parquet 파일에서 데이터셋을 불러오려면 다음 셸 명령을 실행하십시오.

```shell
for i in $(seq 0 25); do
  echo "Processing file ${i}..."
  clickhouse client -q "INSERT INTO dbpedia SELECT _id, title, text, \"text-embedding-3-large-1536-embedding\" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/${i}.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;"
  echo "File ${i} complete."
done
```

또는 다음과 같이 개별 SQL 문을 실행하여 25개의 Parquet 파일을 각각 로드할 수 있습니다:

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

`dbpedia` 테이블에 100만 개의 행이 있는지 확인합니다:

```sql
SELECT count(*)
FROM dbpedia

   ┌─count()─┐
1. │ 1000000 │
   └─────────┘
```


## 의미론적 검색 \{#semantic-search\}

추천 읽을거리: ["Vector embeddings" OpenAPI 가이드](https://platform.openai.com/docs/guides/embeddings)

벡터 임베딩을 사용한 의미론적 검색(_similarity search_ 또는 유사도 검색)은 다음 단계로 구성됩니다.

- 자연어로 된 검색 쿼리를 입력받습니다. 예: _"풍경이 아름다운 기차 여행 코스를 알려줘"_, _"유럽을 배경으로 한 서스펜스 소설"_ 등
- LLM 모델을 사용해 검색 쿼리에 대한 임베딩 벡터를 생성합니다.
- 데이터셋에서 해당 검색 임베딩 벡터와 가장 가까운 이웃을 찾습니다.

_가장 가까운 이웃_ 은 해당 쿼리와 관련성이 높은 문서, 이미지 또는 콘텐츠입니다.
검색된 결과는 생성형 AI 애플리케이션에서 검색 증강 생성(Retrieval Augmented Generation, RAG)의 핵심 입력이 됩니다.

## 브루트포스 벡터 유사도 검색 실행 \{#run-a-brute-force-vector-similarity-search\}

KNN(k-최근접 이웃, k-Nearest Neighbours) 검색 또는 브루트포스 검색은 데이터셋의 각 벡터와 검색 임베딩 벡터 사이의 거리를
계산한 다음 그 거리를 정렬하여 가장 가까운 이웃을 찾는 방식입니다. `dbpedia` 데이터셋에서는
데이터셋 자체의 임베딩 벡터를 검색 벡터로 사용하는 것이 시맨틱(semantic) 검색을 빠르게 시각적으로 확인할 수 있는
간단한 기법입니다. 예를 들면 다음과 같습니다:

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

쿼리 지연 시간을 기록해 두면 벡터 인덱스를 사용하는 ANN의 쿼리 지연 시간과 비교할 수 있습니다.
또한 실제 연산 자원 사용량과 스토리지 대역폭 사용량을 파악하기 위해, OS 파일 캐시가 콜드인 상태와 `max_threads=1` 설정에서의 쿼리 지연 시간도 함께 기록하십시오.
(이 값을 수백만 개 벡터를 가진 프로덕션 데이터셋으로 외삽하여 추정할 수 있습니다!)


## 벡터 유사도 인덱스 생성 \{#build-vector-similarity-index\}

다음 SQL을 실행하여 `vector` 컬럼에 벡터 유사도 인덱스를 정의하고 생성합니다.

```sql
ALTER TABLE dbpedia ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 1536, 'bf16', 64, 512);

ALTER TABLE dbpedia MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

인덱스 생성 및 검색을 위한 매개변수와 성능 관련 고려 사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명되어 있습니다.

사용 가능한 CPU 코어 수와 스토리지 대역폭에 따라 인덱스를 생성하고 저장하는 데 몇 분 정도 소요될 수 있습니다.


## ANN 검색 수행 \{#perform-ann-search\}

*Approximate Nearest Neighbours* 또는 ANN은 (그래프나 랜덤 포레스트와 같은 특수 데이터 구조 등) 정확한 벡터 검색보다 훨씬 빠르게 결과를 찾아내는 기법들의 집합을 의미합니다. 결과 정확도는 일반적으로 실무에서 사용하기에 「충분히 좋은」 수준입니다. 많은 근사 기법은 결과 정확도와 검색 시간 간의 트레이드오프를 조정할 수 있는 매개변수를 제공합니다.

벡터 유사도 인덱스가 구축되면, 벡터 검색 쿼리는 인덱스를 자동으로 사용합니다:

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


## 검색 쿼리를 위한 임베딩 생성 \{#generating-embeddings-for-search-query\}

지금까지 살펴본 유사도 검색 쿼리는 `dbpedia` 테이블에 이미 존재하는 벡터 중 하나를
검색 벡터로 사용합니다. 실제 애플리케이션에서는 자연어로 된
사용자 입력 쿼리에 대해 검색 벡터를 생성해야 합니다. 검색 벡터는 데이터셋의 임베딩 벡터를
생성할 때 사용한 것과 동일한 LLM 모델을 사용해 생성해야 합니다.

아래 예시 Python 스크립트는 OpenAI API를 프로그래밍 방식으로 호출하여
`text-embedding-3-large` 모델을 사용해 임베딩 벡터를 생성하는 방법을 보여 줍니다.
이때 생성된 검색 임베딩 벡터는 `SELECT` 쿼리에서 `cosineDistance()` 함수의 인수로
전달됩니다.

스크립트를 실행하려면 환경 변수 `OPENAI_API_KEY`에 OpenAI API 키가 설정되어 있어야 합니다.
OpenAI API 키는 https://platform.openai.com 에 등록한 후 발급받을 수 있습니다.

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


## Q&amp;A 데모 애플리케이션 \{#q-and-a-demo-application\}

위 예제에서는 ClickHouse를 사용한 시맨틱 검색과 문서 검색을 시연했습니다. 다음으로, 구조는 매우 단순하지만 잠재력이 큰 생성형 AI 예제 애플리케이션을 소개합니다.

이 애플리케이션은 다음 단계를 수행합니다:

1. 사용자로부터 *topic*을(를) 입력으로 받습니다.
2. OpenAI API를 `text-embedding-3-large` 모델과 함께 호출하여 *topic*에 대한 임베딩 벡터를 생성합니다.
3. `dbpedia` 테이블에서 벡터 유사도 검색을 수행해 가장 관련성이 높은 Wikipedia 문서들을 검색합니다.
4. *topic*과 관련된 자연어의 자유 형식 질문을 사용자로부터 입력받습니다.
5. OpenAI `gpt-3.5-turbo` Chat API를 사용하여 3단계에서 검색된 문서의 지식을 기반으로 질문에 답변합니다.
   3단계에서 검색된 문서들은 Chat API에 *context*로 전달되며, 이는 생성형 AI에서 핵심적인 연결 고리 역할을 합니다.

먼저 Q&amp;A 애플리케이션을 실행했을 때의 대화 예시 몇 가지를 아래에 제시하고, 이어서 Q&amp;A 애플리케이션의 코드를 제공합니다.
애플리케이션을 실행하려면 환경 변수 `OPENAI_API_KEY`에 OpenAI API 키를 설정해야 합니다.
OpenAI API 키는 https://platform.openai.com 에서 회원 가입 후 발급받을 수 있습니다.

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
