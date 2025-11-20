---
'title': 'chDB 시작하기'
'sidebar_label': '시작하기'
'slug': '/chdb/getting-started'
'description': 'chDB는 ClickHouse로 구동되는 인프로세스 SQL OLAP 엔진입니다.'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'in-process'
- 'in process'
'doc_type': 'guide'
---


# chDB 시작하기

이 가이드에서는 chDB의 Python 변형을 사용하여 시작하는 방법에 대해 설명합니다. 
우리는 S3에 저장된 JSON 파일을 쿼리한 후, JSON 파일을 기반으로 chDB에 테이블을 생성하고 데이터를 쿼리하는 방법을 배울 것입니다. 
또한 Apache Arrow 및 Panda와 같은 다양한 형식으로 데이터를 반환하는 방법과 Pandas DataFrames을 쿼리하는 방법도 알아볼 것입니다.

## 설정 {#setup}

먼저 가상 환경을 생성해 보겠습니다:

```bash
python -m venv .venv
source .venv/bin/activate
```

그리고 이제 chDB를 설치할 차례입니다.
버전 2.0.3 이상이 설치되어 있는지 확인하세요:

```bash
pip install "chdb>=2.0.2"
```

그리고 이제 [ipython](https://ipython.org/)을 설치하겠습니다:

```bash
pip install ipython
```

우리는 나머지 가이드에서 명령을 실행하기 위해 `ipython`을 사용할 예정이며, 다음을 실행하여 시작할 수 있습니다:

```bash
ipython
```

이 가이드에서는 Pandas와 Apache Arrow도 사용할 예정이므로, 이 라이브러리들도 설치하겠습니다:

```bash
pip install pandas pyarrow
```

## S3에서 JSON 파일 쿼리하기 {#querying-a-json-file-in-s3}

이제 S3 버킷에 저장된 JSON 파일을 쿼리하는 방법을 살펴보겠습니다. 
[YouTube dislikes 데이터세트](/getting-started/example-datasets/youtube-dislikes)에는 2021년까지의 YouTube 비디오에 대한 40억 개 이상의 불만이 포함되어 있습니다.
우리는 그 데이터세트의 JSON 파일 중 하나로 작업할 것입니다.

chdb를 가져옵니다:

```python
import chdb
```

다음 쿼리를 작성하여 JSON 파일 중 하나의 구조를 설명할 수 있습니다:

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

또한 해당 파일의 행 수를 계산할 수 있습니다:

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

이 파일에는 300,000개 이상의 레코드가 포함되어 있습니다.

chdb는 아직 쿼리 매개변수를 전달하는 것을 지원하지 않지만, 경로를 추출하여 f-String을 통해 전달할 수 있습니다.

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
프로그램에서 정의된 변수와 함께 이것을 수행하는 것은 괜찮지만, 사용자 제공 입력으로는 수행하지 마세요. 그렇지 않으면 쿼리가 SQL 주입에 노출될 수 있습니다.
:::

## 출력 형식 구성하기 {#configuring-the-output-format}

기본 출력 형식은 `CSV`지만, `output_format` 매개변수를 통해 변경할 수 있습니다. 
chDB는 ClickHouse 데이터 형식과 함께 [자체 형식](/chdb/reference/data-formats.md)인 `DataFrame`도 지원하며, 이는 Pandas DataFrame을 반환합니다:

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

또는 Apache Arrow 테이블을 반환하고 싶다면 다음과 같이 할 수 있습니다:

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

## JSON 파일에서 테이블 만들기 {#creating-a-table-from-json-file}

다음으로, chDB에 테이블을 생성하는 방법을 살펴보겠습니다. 
이를 위해서는 다른 API를 사용해야 하므로, 먼저 이를 가져오겠습니다:

```python
from chdb import session as chs
```

다음으로 세션을 초기화하겠습니다.
세션이 디스크에 지속되기를 원하면 디렉터리 이름을 제공해야 합니다.
비워두면 데이터베이스는 인메모리 상태가 되고 Python 프로세스를 종료하면 사라집니다.

```python
sess = chs.Session("gettingStarted.chdb")
```

다음으로 데이터베이스를 생성하겠습니다:

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

이제 JSON 파일의 스키마를 기반으로 `dislikes` 테이블을 생성할 수 있으며, `CREATE...EMPTY AS` 기법을 사용할 것입니다.
컬럼 유형이 모두 `Nullable`로 설정되지 않도록 [`schema_inference_make_columns_nullable`](/operations/settings/formats/#schema_inference_make_columns_nullable) 설정을 사용할 것입니다.

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

그런 다음 `DESCRIBE` 절을 사용하여 스키마를 검사할 수 있습니다:

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

다음으로 해당 테이블을 채우겠습니다:

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

이 두 단계를 한 번에 수행할 수도 있으며, `CREATE...AS` 기법을 사용할 것입니다.
이 방법으로 다른 테이블을 만들겠습니다:

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

## 테이블 쿼리하기 {#querying-a-table}

마지막으로, 테이블을 쿼리해 보겠습니다:

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

그런 다음 DataFrame에 좋아요와 싫어요의 비율을 계산하기 위해 추가 컬럼을 추가한다고 가정해 보겠습니다.
다음 코드를 작성할 수 있습니다:

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## Pandas DataFrame 쿼리하기 {#querying-a-pandas-dataframe}

이제 chDB에서 해당 DataFrame을 쿼리할 수 있습니다:

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

Pandas DataFrame을 쿼리하는 방법에 대한 자세한 내용은 [Querying Pandas 개발자 가이드](guides/querying-pandas.md)에서 확인할 수 있습니다.

## 다음 단계 {#next-steps}

이 가이드가 chDB에 대한 좋은 개요를 제공했기를 바랍니다. 
더 많은 내용을 배우고 싶다면 다음 개발자 가이드를 확인하세요:

* [Pandas DataFrames 쿼리하기](guides/querying-pandas.md)
* [Apache Arrow 쿼리하기](guides/querying-apache-arrow.md)
* [JupySQL에서 chDB 사용하기](guides/jupysql.md)
* [기존 clickhouse-local 데이터베이스와 chDB 사용하기](guides/clickhouse-local.md)
