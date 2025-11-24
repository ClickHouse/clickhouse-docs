---
'description': '데이터셋은 2800만 개 이상의 Hacker News 게시물 및 그들의 벡터 임베딩을 포함합니다.'
'sidebar_label': '해커 뉴스 벡터 검색 데이터셋'
'slug': '/getting-started/example-datasets/hackernews-vector-search-dataset'
'title': '해커 뉴스 벡터 검색 데이터셋'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'guide'
---

## 소개 {#introduction}

[해커 뉴스 데이터셋](https://news.ycombinator.com/)은 2,874만 개의 게시물과 그 벡터 임베딩을 포함하고 있습니다. 임베딩은 [SentenceTransformers](https://sbert.net/) 모델 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)를 사용하여 생성되었습니다. 각 임베딩 벡터의 차원은 `384`입니다.

이 데이터셋은 사용자 생성 텍스트 데이터를 기반으로 하는 대규모 실제 벡터 검색 애플리케이션의 설계, 크기 및 성능 측면을 살펴보는 데 사용될 수 있습니다.

## 데이터셋 세부정보 {#dataset-details}

벡터 임베딩이 포함된 전체 데이터셋은 ClickHouse에 의해 단일 `Parquet` 파일로 [S3 버킷](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)에서 제공됩니다.

사용자는 먼저 [문서](../../engines/table-engines/mergetree-family/annindexes.md)를 참조하여 이 데이터셋의 저장 및 메모리 요구 사항을 추정하는 크기 측정 작업을 수행하는 것을 권장합니다.

## 단계 {#steps}

<VerticalStepper headerLevel="h3">

### 테이블 생성 {#create-table}

게시물 및 그 임베딩과 관련 속성을 저장하기 위해 `hackernews` 테이블을 생성합니다:

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

`id`는 단순히 증가하는 정수입니다. 추가 속성은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에서 설명하는 대로 벡터 유사성 검색과 결합된 후처리/전처리를 이해하는 데 사용될 수 있습니다.

### 데이터 로드 {#load-table}

`Parquet` 파일에서 데이터셋을 로드하려면 다음 SQL 문을 실행합니다:

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

테이블에 2,874만 개의 행을 삽입하는 데 몇 분 정도 걸립니다.

### 벡터 유사성 인덱스 빌드 {#build-vector-similarity-index}

다음 SQL을 실행하여 `hackernews` 테이블의 `vector` 컬럼에 대한 벡터 유사성 인덱스를 정의하고 빌드합니다:

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

인덱스 생성 및 검색에 대한 매개변수와 성능 고려 사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명되어 있습니다.
위 문장에서는 HNSW 하이퍼파라미터 `M` 및 `ef_construction`에 대해 각각 64 및 512의 값을 사용합니다.
사용자는 선택한 값에 해당하는 인덱스 빌드 시간과 검색 결과 품질을 평가하여 이러한 매개변수의 최적 값을 신중하게 선택해야 합니다.

전체 2,874만 데이터셋에 대한 인덱스를 빌드하고 저장하는 데는 가용한 CPU 코어 수와 저장 대역폭에 따라 몇 분에서 몇 시간이 걸릴 수도 있습니다.

### ANN 검색 수행 {#perform-ann-search}

벡터 유사성 인덱스가 구축되면 벡터 검색 쿼리는 자동으로 인덱스를 사용합니다:

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

벡터 인덱스를 메모리에 처음 로드하는 데는 몇 초에서 몇 분이 걸릴 수 있습니다.

### 검색 쿼리에 대한 임베딩 생성 {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/)는 문장과 단락의 의미를 포착하기 위한 로컬 사용 쉬운 임베딩 모델을 제공합니다.

이 해커 뉴스 데이터셋에는 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 모델에서 생성된 벡터 임베딩이 포함되어 있습니다.

다음은 `sentence_transformers1` Python 패키지를 사용하여 임베딩 벡터를 프로그래밍 방식으로 생성하는 방법을 보여주는 예제 Python 스크립트입니다. 검색 임베딩 벡터는 `SELECT` 쿼리의 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 함수에 인수로 전달됩니다.

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

위 Python 스크립트를 실행한 예와 유사성 검색 결과는 아래에 표시되어 있습니다 (상위 20개의 게시물에서 100자만 인쇄됩니다):

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

## 요약 데모 애플리케이션 {#summarization-demo-application}

위의 예는 ClickHouse를 사용한 의미 검색 및 문서 검색을 시연했습니다.

다음에는 아주 간단하지만 높은 잠재력을 가진 생성적 AI 예제 애플리케이션이 소개됩니다.

애플리케이션은 다음 단계를 수행합니다:

1. 사용자로부터 _주제_를 입력받습니다.
2. `all-MiniLM-L6-v2` 모델을 사용하여 _주제_에 대한 임베딩 벡터를 생성합니다.
3. `hackernews` 테이블에서 벡터 유사성 검색을 사용하여 관련성이 높은 게시물/댓글을 검색합니다.
4. `LangChain`과 OpenAI `gpt-3.5-turbo` Chat API를 사용하여 3단계에서 검색한 내용을 **요약**합니다.
   3단계에서 검색된 게시물/댓글은 Chat API에 _맥락_으로 전달되며, 생성적 AI의 핵심 연결 고리입니다.

요약 애플리케이션을 실행한 예가 먼저 나열되며, 그 다음에 요약 애플리케이션의 코드가 제공됩니다. 애플리케이션을 실행하려면 환경 변수 `OPENAI_API_KEY`에 OpenAI API 키를 설정해야 합니다. OpenAI API 키는 https://platform.openai.com에 등록한 후 받을 수 있습니다.

이 애플리케이션은 고객 감정 분석, 기술 지원 자동화, 사용자 대화 분석, 법적 문서, 의료 기록, 회의 기록, 재무 제표 등과 같이 다수의 기업 도메인에 적용 가능한 생성적 AI 사용 사례를 보여줍니다.

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

위 애플리케이션의 코드:

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
