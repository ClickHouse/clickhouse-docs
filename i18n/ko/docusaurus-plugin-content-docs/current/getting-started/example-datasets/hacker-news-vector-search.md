---
description: '2,800만 개가 넘는 Hacker News 게시물과 해당 벡터 임베딩을 포함한 데이터셋'
sidebar_label: 'Hacker News 벡터 검색 데이터셋'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Hacker News 벡터 검색 데이터셋'
keywords: ['시맨틱 검색', '벡터 유사도', '근사 최근접 이웃', '임베딩']
doc_type: 'guide'
---

## 소개 \{#introduction\}

[Hacker News 데이터셋](https://news.ycombinator.com/)에는 2,874만 개의
게시글과 해당 벡터 임베딩이 포함되어 있습니다. 임베딩은 [SentenceTransformers](https://sbert.net/) 모델 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)를 사용하여 생성되었습니다. 각 임베딩 벡터의 차원은 `384`입니다.

이 데이터셋은 사용자 생성 텍스트 데이터를 기반으로 구축된 대규모 실제 벡터 검색 애플리케이션의 설계, 규모 산정 및 성능 측면을 단계별로 살펴보는 데 사용할 수 있습니다.

## 데이터셋 세부 정보 \{#dataset-details\}

벡터 임베딩이 포함된 전체 데이터셋은 ClickHouse에서 하나의 `Parquet` 파일로 [S3 버킷](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)에 제공합니다.

이 데이터셋의 스토리지 및 메모리 요구 사항을 추정하기 위해 먼저 용량 산정 작업을 수행하는 것이 좋으며, 이를 위해 [문서](../../engines/table-engines/mergetree-family/annindexes.md)를 참고하십시오.

## 절차 \{#steps\}

<VerticalStepper headerLevel="h3">
  ### 테이블 생성하기

  게시물, 임베딩 및 관련 속성을 저장하기 위한 `hackernews` 테이블을 생성하세요:

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

  `id`는 단순히 증가하는 정수입니다. 추가 속성은 조건절에서 사용되어 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명된 대로 사후 필터링/사전 필터링과 결합된 벡터 유사도 검색을 수행할 수 있습니다

  ### 데이터 로드하기

  `Parquet` 파일에서 데이터셋을 로드하려면 다음 SQL 문을 실행하세요:

  ```sql
  INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
  ```

  테이블에 2,874만 행을 삽입하는 데 몇 분 정도 소요됩니다.

  ### 벡터 유사도 인덱스 구축하기

  다음 SQL을 실행하여 `hackernews` 테이블의 `vector` 컬럼에 벡터 유사도 인덱스를 정의하고 구축하세요:

  ```sql
  ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

  ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
  ```

  인덱스 생성 및 검색에 대한 매개변수와 성능 고려 사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명되어 있습니다.
  위 명령문은 HNSW 하이퍼파라미터 `M`과 `ef_construction`에 각각 64와 512 값을 사용합니다.
  선택한 값에 따른 인덱스 빌드 시간과 검색 결과 품질을 평가하여 이러한 매개변수의 최적 값을 신중하게 선택하십시오.

  전체 2,874만 개의 데이터셋에 대해 인덱스를 구축하고 저장하는 작업은 사용 가능한 CPU 코어 수와 스토리지 대역폭에 따라 수 분에서 한 시간 정도 소요될 수 있습니다.

  ### ANN 검색 수행하기

  벡터 유사도 인덱스가 구축되면 벡터 검색 쿼리에서 자동으로 해당 인덱스를 사용합니다:

  ```sql title="Query"
  SELECT id, title, text
  FROM hackernews
  ORDER BY cosineDistance( vector, <search vector>)
  LIMIT 10

  ```

  벡터 인덱스를 메모리에 처음 로드하는 데 몇 초에서 몇 분 정도 소요될 수 있습니다.

  ### 검색 쿼리에 대한 임베딩 생성하기

  [Sentence Transformers](https://www.sbert.net/)는 문장과 단락의 의미론적 의미를 포착하는 로컬 임베딩 모델을 제공하며, 사용이 간편합니다.

  이 HackerNews 데이터셋에는 [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) 모델로 생성된 벡터 임베딩이 포함되어 있습니다.

  아래 Python 스크립트 예제는 `sentence_transformers1` Python 패키지를 사용하여 프로그래밍 방식으로 임베딩 벡터를 생성하는 방법을 보여줍니다. 검색 임베딩 벡터는 `SELECT` 쿼리의 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 함수에 인수로 전달됩니다.

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

  위 Python 스크립트 실행 예시와 유사도 검색 결과는 다음과 같습니다
  (상위 20개 게시물에서 각각 100자만 출력됩니다):

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

  ## 요약 데모 애플리케이션

  위 예제에서는 ClickHouse를 사용하여 시맨틱 검색 및 문서 검색을 시연했습니다.

  다음으로 매우 간단하지만 잠재력이 높은 생성형 AI 예제 애플리케이션이 제시됩니다.

  애플리케이션은 다음 단계를 수행합니다:

  1. 사용자가 입력한 *topic*을 입력으로 받습니다
  2. `SentenceTransformers`의 `all-MiniLM-L6-v2` 모델을 사용하여 *topic*에 대한 임베딩 벡터를 생성합니다
  3. `hackernews` 테이블에서 벡터 유사도 검색으로 가장 관련성이 높은 게시물과 댓글을 조회합니다
  4. `LangChain`과 OpenAI `gpt-3.5-turbo` Chat API를 사용하여 3단계에서 가져온 콘텐츠를 **요약**합니다.
     3단계에서 가져온 게시물/댓글은 Chat API에 *context*로 전달되며, 생성형 AI에서 핵심 연결 고리 역할을 합니다.

  요약 애플리케이션 실행 예시가 먼저 아래에 나열되어 있으며, 그 다음에 요약 애플리케이션 코드가 제공됩니다. 애플리케이션을 실행하려면 환경 변수 `OPENAI_API_KEY`에 OpenAI API 키를 설정해야 합니다. OpenAI API 키는 https://platform.openai.com 에서 등록 후 얻을 수 있습니다.

  이 애플리케이션은 고객 감정 분석, 기술 지원 자동화, 사용자 대화 분석, 법률 문서, 의료 기록, 회의 녹취록, 재무제표 등 다양한 엔터프라이즈 영역에 적용 가능한 생성형 AI 사용 사례를 보여줍니다

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