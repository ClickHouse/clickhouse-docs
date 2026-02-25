---
title: 'chDB 시작하기'
sidebar_label: '시작하기'
slug: /chdb/getting-started
description: 'chDB는 ClickHouse 기반 인프로세스 SQL OLAP 엔진입니다'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'in-process', 'in process']
doc_type: 'guide'
---



# chDB 시작하기 \{#getting-started-with-chdb\}

이 가이드에서는 chDB의 Python 버전을 사용해 환경을 준비하는 방법을 살펴봅니다.
먼저 S3에 있는 JSON 파일을 쿼리한 다음, 해당 JSON 파일을 기반으로 chDB에 테이블을 생성하고 데이터에 대해 일부 쿼리를 실행합니다.
또한 Apache Arrow와 Pandas를 포함해 쿼리 결과를 다양한 형식으로 반환하는 방법을 살펴보고, 마지막으로 Pandas DataFrame에 대해 쿼리를 실행하는 방법을 알아봅니다. 



## 설정 \{#setup\}

먼저 가상 환경을 생성합니다.

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다.
버전 2.0.3 이상을 사용 중인지 확인하십시오:

```bash
pip install "chdb>=2.0.2"
```

이제 [ipython](https://ipython.org/)을 설치하겠습니다:

```bash
pip install ipython
```

이 가이드의 나머지 부분에서는 명령 실행을 위해 `ipython`을 사용합니다. 다음 명령을 실행하여 시작합니다.

```bash
ipython
```

이 가이드에서는 Pandas와 Apache Arrow도 사용할 것이므로, 이 라이브러리들도 함께 설치하십시오:

```bash
pip install pandas pyarrow
```


## S3에서 JSON 파일 쿼리하기 \{#querying-a-json-file-in-s3\}

이제 S3 버킷에 저장된 JSON 파일을 어떻게 쿼리하는지 살펴보겠습니다.
[YouTube dislikes 데이터셋](/getting-started/example-datasets/youtube-dislikes)은 2021년까지의 YouTube 동영상에 대한 40억 개가 넘는 싫어요 행을 포함합니다.
이 데이터셋에 포함된 JSON 파일 중 하나를 사용해 보겠습니다.

chdb를 임포트합니다:

```python
import chdb
```

다음 쿼리를 사용하면 JSON 파일 중 하나의 구조를 확인할 수 있습니다:

```python
chdb.query(
  """
  DESCRIBE s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )
  SETTINGS describe_compact_output=1
  """
)
```

```text
"id","Nullable(String)"
"fetch_date","Nullable(String)"
"upload_date","Nullable(String)"
"title","Nullable(String)"
"uploader_id","Nullable(String)"
"uploader","Nullable(String)"
"uploader_sub_count","Nullable(Int64)"
"is_age_limit","Nullable(Bool)"
"view_count","Nullable(Int64)"
"like_count","Nullable(Int64)"
"dislike_count","Nullable(Int64)"
"is_crawlable","Nullable(Bool)"
"is_live_content","Nullable(Bool)"
"has_subtitles","Nullable(Bool)"
"is_ads_enabled","Nullable(Bool)"
"is_comments_enabled","Nullable(Bool)"
"description","Nullable(String)"
"rich_metadata","Array(Tuple(
    call Nullable(String),
    content Nullable(String),
    subtitle Nullable(String),
    title Nullable(String),
    url Nullable(String)))"
"super_titles","Array(Tuple(
    text Nullable(String),
    url Nullable(String)))"
"uploader_badges","Nullable(String)"
"video_badges","Nullable(String)"
```

또한 해당 파일에 포함된 행 개수를 셀 수도 있습니다.

```python
chdb.query(
  """
  SELECT count()
  FROM s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )"""
)
```

```text
336432
```

이 파일에는 30만 개가 조금 넘는 레코드가 포함되어 있습니다.

chdb는 아직 쿼리 매개변수 전달을 지원하지 않지만, 경로를 추출해서 f-String을 통해 전달할 수 있습니다.

```python
path = 's3://clickhouse-public-datasets/youtube/original/files/youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst'
```

```python
chdb.query(
  f"""
  SELECT count()
  FROM s3('{path}','JSONLines')
  """
)
```

:::warning
프로그램에서 정의한 변수에 대해서는 이렇게 해도 괜찮지만, 사용자가 제공한 입력에 대해서는 절대 이렇게 하지 마십시오. 그렇지 않으면 쿼리가 SQL 인젝션 공격에 취약해집니다.
:::


## 출력 형식 구성하기 \{#configuring-the-output-format\}

기본 출력 형식은 `CSV`이지만 `output_format` 매개변수로 변경할 수 있습니다.
chDB는 ClickHouse 데이터 포맷뿐만 아니라, `DataFrame`을 포함한 [자체 포맷](/chdb/reference/data-formats.md)도 일부 지원하며, `DataFrame`은 Pandas DataFrame을 반환합니다:

```python
result = chdb.query(
  f"""
  SELECT is_ads_enabled, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="DataFrame"
)

print(type(result))
print(result)
```

```text
<class 'pandas.core.frame.DataFrame'>
   is_ads_enabled  count()
0           False   301125
1            True    35307
```

또는 Apache Arrow 테이블을 반환받으려면:

```python
result = chdb.query(
  f"""
  SELECT is_live_content, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="ArrowTable"
)

print(type(result))
print(result)
```

```text
<class 'pyarrow.lib.Table'>
pyarrow.Table
is_live_content: bool
count(): uint64 not null
----
is_live_content: [[false,true]]
count(): [[315746,20686]]
```


## JSON 파일에서 테이블 생성하기 \{#creating-a-table-from-json-file\}

다음으로, chDB에서 테이블을 생성하는 방법을 살펴보겠습니다.
이를 위해서는 다른 API를 사용해야 하므로, 먼저 해당 API를 import합니다:

```python
from chdb import session as chs
```

다음으로 세션을 초기화합니다.
세션을 디스크에 저장하려면 디렉터리 이름을 지정해야 합니다.
비워 두면 데이터베이스는 메모리에만 존재하며 Python 프로세스를 종료하면 곧바로 사라집니다.

```python
sess = chs.Session("gettingStarted.chdb")
```

다음으로는 데이터베이스를 생성합니다:

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

이제 JSON 파일의 스키마를 기반으로 `CREATE...EMPTY AS` 기법을 사용하여 `dislikes` 테이블을 생성할 수 있습니다.
컬럼 타입이 모두 `Nullable`로 설정되지 않도록 [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable) 설정을 사용합니다.

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes
  ORDER BY fetch_date 
  EMPTY AS 
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

그런 다음 스키마를 살펴보기 위해 `DESCRIBE` 절을 사용할 수 있습니다.

```python
sess.query(f"""
   DESCRIBE youtube.dislikes
   SETTINGS describe_compact_output=1
   """
)
```

```text
"id","String"
"fetch_date","String"
"upload_date","String"
"title","String"
"uploader_id","String"
"uploader","String"
"uploader_sub_count","Int64"
"is_age_limit","Bool"
"view_count","Int64"
"like_count","Int64"
"dislike_count","Int64"
"is_crawlable","Bool"
"is_live_content","Bool"
"has_subtitles","Bool"
"is_ads_enabled","Bool"
"is_comments_enabled","Bool"
"description","String"
"rich_metadata","Array(Tuple(
    call String,
    content String,
    subtitle String,
    title String,
    url String))"
"super_titles","Array(Tuple(
    text String,
    url String))"
"uploader_badges","String"
"video_badges","String"
```

이제 해당 테이블을 채워 보겠습니다:

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

`CREATE...AS` 기법을 사용하면 이 두 단계를 한 번에 처리할 수도 있습니다.
이 기법을 사용하여 다른 테이블을 하나 만들어 보겠습니다:

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes2
  ORDER BY fetch_date 
  AS 
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```


## 테이블 쿼리하기 \{#querying-a-table\}

마지막으로 테이블에 쿼리를 실행합니다:

```sql
df = sess.query("""
  SELECT uploader, sum(view_count) AS viewCount, sum(like_count) AS likeCount, sum(dislike_count) AS dislikeCount
  FROM youtube.dislikes
  GROUP BY ALL
  ORDER BY viewCount DESC
  LIMIT 10
  """,
  "DataFrame"
)
df
```

```text
                             uploader  viewCount  likeCount  dislikeCount
0                             Jeremih  139066569     812602         37842
1                     TheKillersMusic  109313116     529361         11931
2  LetsGoMartin- Canciones Infantiles  104747788     236615        141467
3                    Xiaoying Cuisine   54458335    1031525         37049
4                                Adri   47404537     279033         36583
5                  Diana and Roma IND   43829341     182334        148740
6                      ChuChuTV Tamil   39244854     244614        213772
7                            Cheez-It   35342270        108            27
8                            Anime Uz   33375618    1270673         60013
9                    RC Cars OFF Road   31952962     101503         49489
```

그다음 좋아요 대비 싫어요 비율을 계산하기 위해 DataFrame에 컬럼을 하나 더 추가한다고 가정해 보겠습니다.
다음과 같은 코드를 작성할 수 있습니다.

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```


## Pandas DataFrame 쿼리하기 \{#querying-a-pandas-dataframe\}

이제 chDB에서 해당 DataFrame에 대해 쿼리를 실행할 수 있습니다:

```python
chdb.query(
  """
  SELECT uploader, likeDislikeRatio
  FROM Python(df)
  """,
  output_format="DataFrame"
)
```

```text
                             uploader  likeDislikeRatio
0                             Jeremih         21.473548
1                     TheKillersMusic         44.368536
2  LetsGoMartin- Canciones Infantiles          1.672581
3                    Xiaoying Cuisine         27.842182
4                                Adri          7.627395
5                  Diana and Roma IND          1.225857
6                      ChuChuTV Tamil          1.144275
7                            Cheez-It          4.000000
8                            Anime Uz         21.173296
9                    RC Cars OFF Road          2.051021
```

Pandas DataFrame에 쿼리하는 방법은 [Pandas 쿼리 개발자 가이드](guides/querying-pandas.md)에서 더 자세히 확인할 수 있습니다.


## 다음 단계 \{#next-steps\}

이 가이드가 chDB에 대한 전반적인 개요를 제공했기를 바랍니다. 
사용 방법을 더 자세히 알아보려면 아래 개발자 가이드를 참고하십시오:

* [Pandas DataFrame 쿼리하기](guides/querying-pandas.md)
* [Apache Arrow 쿼리하기](guides/querying-apache-arrow.md)
* [JupySQL에서 chDB 사용하기](guides/jupysql.md)
* [기존 clickhouse-local 데이터베이스와 함께 chDB 사용하기](guides/clickhouse-local.md)
