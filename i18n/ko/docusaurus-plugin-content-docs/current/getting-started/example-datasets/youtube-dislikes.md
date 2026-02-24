---
description: 'YouTube 동영상의 싫어요 데이터 모음.'
sidebar_label: 'YouTube 싫어요'
slug: /getting-started/example-datasets/youtube-dislikes
title: 'YouTube 싫어요 데이터셋'
doc_type: 'guide'
keywords: ['예시 데이터셋', 'youtube', '샘플 데이터', '동영상 분석', '싫어요']
---

2021년 11월, YouTube는 모든 동영상에서 공개된 ***싫어요*** 개수를 제거했습니다. 크리에이터는 여전히 싫어요 수를 볼 수 있지만, 시청자는 동영상이 받은 ***좋아요*** 개수만 볼 수 있습니다.

:::important
이 데이터셋은 45억 5천만 개가 넘는 레코드를 포함하고 있으므로, 아래 명령을 그대로 복사해 실행하기 전에 사용 중인 리소스가 이 정도 규모를 처리할 수 있는지 반드시 확인하십시오. 아래 명령은 [ClickHouse Cloud](https://clickhouse.cloud)의 **프로덕션** 인스턴스에서 실행되었습니다.
:::

데이터는 JSON 형식이며 [archive.org](https://archive.org/download/dislikes_youtube_2021_12_video_json_files)에서 다운로드할 수 있습니다. 동일한 데이터를 S3에도 제공하므로 ClickHouse Cloud 인스턴스로 더 효율적으로 다운로드할 수 있습니다.

다음은 ClickHouse Cloud에서 테이블을 생성하고 데이터를 삽입하는 단계입니다.

:::note
아래 단계는 로컬에 설치된 ClickHouse에서도 문제없이 사용할 수 있습니다. 변경해야 할 사항은 `s3cluster` 대신 `s3` 함수를 사용하는 것뿐입니다(클러스터가 구성되어 있는 경우에는 `default`를 클러스터 이름으로 변경하면 됩니다).
:::

## 단계별 지침 \{#step-by-step-instructions\}

<VerticalStepper headerLevel="h3">
  ### 데이터 탐색

  데이터가 어떤 형태인지 확인해 보겠습니다. `s3cluster` 테이블 함수는 테이블을 반환하므로 `DESCRIBE`를 사용하여 결과를 확인할 수 있습니다:

  ```sql
  DESCRIBE s3(
      'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
      'JSONLines'
  );
  ```

  ClickHouse는 JSON 파일로부터 다음 스키마를 추론합니다:

  ```response
  ┌─name────────────────┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
  │ id                  │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ fetch_date          │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ upload_date         │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ title               │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ uploader_id         │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ uploader            │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ uploader_sub_count  │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ is_age_limit        │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ view_count          │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ like_count          │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ dislike_count       │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ is_crawlable        │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ is_live_content     │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ has_subtitles       │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ is_ads_enabled      │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ is_comments_enabled │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ description         │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ rich_metadata       │ Array(Tuple(call Nullable(String), content Nullable(String), subtitle Nullable(String), title Nullable(String), url Nullable(String))) │              │                    │         │                  │                │
  │ super_titles        │ Array(Tuple(text Nullable(String), url Nullable(String)))                                                                              │              │                    │         │                  │                │
  │ uploader_badges     │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ video_badges        │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  └─────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
  ```

  ### 테이블 생성하기

  추론된 스키마를 기반으로 데이터 타입을 정리하고 기본 키(primary key)를 추가했습니다.
  다음 테이블을 정의하세요:

  ```sql
  CREATE TABLE youtube
  (
      `id` String,
      `fetch_date` DateTime,
      `upload_date_str` String,
      `upload_date` Date,
      `title` String,
      `uploader_id` String,
      `uploader` String,
      `uploader_sub_count` Int64,
      `is_age_limit` Bool,
      `view_count` Int64,
      `like_count` Int64,
      `dislike_count` Int64,
      `is_crawlable` Bool,
      `has_subtitles` Bool,
      `is_ads_enabled` Bool,
      `is_comments_enabled` Bool,
      `description` String,
      `rich_metadata` Array(Tuple(call String, content String, subtitle String, title String, url String)),
      `super_titles` Array(Tuple(text String, url String)),
      `uploader_badges` String,
      `video_badges` String
  )
  ENGINE = MergeTree
  ORDER BY (uploader, upload_date)
  ```

  ### 데이터 삽입하기

  다음 명령을 사용하여 S3 파일의 레코드를 `youtube` 테이블로 스트리밍합니다.

  :::important
  이 작업은 대량의 데이터(46억 5천만 행)를 삽입합니다. 전체 데이터셋이 필요하지 않은 경우, 원하는 행 수와 함께 `LIMIT` 절을 추가하십시오.
  :::

  ```sql
  INSERT INTO youtube
  SETTINGS input_format_null_as_default = 1
  SELECT
      id,
      parseDateTimeBestEffortUSOrZero(toString(fetch_date)) AS fetch_date,
      upload_date AS upload_date_str,
      toDate(parseDateTimeBestEffortUSOrZero(upload_date::String)) AS upload_date,
      ifNull(title, '') AS title,
      uploader_id,
      ifNull(uploader, '') AS uploader,
      uploader_sub_count,
      is_age_limit,
      view_count,
      like_count,
      dislike_count,
      is_crawlable,
      has_subtitles,
      is_ads_enabled,
      is_comments_enabled,
      ifNull(description, '') AS description,
      rich_metadata,
      super_titles,
      ifNull(uploader_badges, '') AS uploader_badges,
      ifNull(video_badges, '') AS video_badges
  FROM s3(
      'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
      'JSONLines'
  )
  ```

  `INSERT` 명령에 대한 참고 사항:

  * `parseDateTimeBestEffortUSOrZero` 함수는 입력된 날짜 필드가 올바른 형식이 아닐 수 있을 때 유용합니다. `fetch_date`가 올바르게 파싱되지 않으면 값이 `0`으로 설정됩니다
  * `upload_date` 컬럼에는 유효한 날짜가 들어 있지만, 동시에 &quot;4 hours ago&quot;와 같은 문자열도 포함되어 있습니다. 이는 분명히 유효한 날짜가 아닙니다. 원본 값을 `upload_date_str`에 저장하고 `toDate(parseDateTimeBestEffortUSOrZero(upload_date::String))`로 파싱을 시도하기로 결정했습니다. 파싱에 실패하면 단순히 `0`만 반환됩니다.
  * 테이블에 `NULL` 값이 들어오지 않도록 `ifNull`을 사용했습니다. 들어오는 값이 `NULL`인 경우 `ifNull` 함수가 해당 값을 빈 문자열로 설정합니다.

  ### 행 개수 세기

  ClickHouse Cloud의 SQL Console에서 새 탭을 열거나(또는 새 `clickhouse-client` 창을 열고) 카운트가 증가하는 것을 확인하세요.
  서버 리소스에 따라 45억 6천만 개의 행을 삽입하는 데 시간이 걸립니다. (설정을 조정하지 않을 경우 약 4.5시간 소요됩니다.)

  ```sql
  SELECT formatReadableQuantity(count())
  FROM youtube
  ```

  ```response
  ┌─formatReadableQuantity(count())─┐
  │ 4.56 billion                    │
  └─────────────────────────────────┘
  ```

  ### 데이터 탐색하기

  데이터가 삽입되면 좋아하는 동영상이나 채널의 싫어요 수를 집계하세요. ClickHouse가 업로드한 동영상이 몇 개인지 확인해 보겠습니다:

  ```sql
  SELECT count()
  FROM youtube
  WHERE uploader = 'ClickHouse';
  ```

  ```response
  ┌─count()─┐
  │      84 │
  └─────────┘

  1 row in set. Elapsed: 0.570 sec. Processed 237.57 thousand rows, 5.77 MB (416.54 thousand rows/s., 10.12 MB/s.)
  ```

  :::note
  위 쿼리가 매우 빠르게 실행되는 이유는 기본 키의 첫 번째 컬럼으로 `uploader`를 선택했기 때문입니다. 따라서 237,000개의 행만 처리하면 됩니다.
  :::

  ClickHouse 비디오의 좋아요와 싫어요를 확인해 보겠습니다:

  ```sql
  SELECT
      title,
      like_count,
      dislike_count
  FROM youtube
  WHERE uploader = 'ClickHouse'
  ORDER BY dislike_count DESC;
  ```

  응답은 다음과 같습니다:

  ```response
  ┌─title────────────────────────────────────────────────────────────────────────────────────────────────┬─like_count─┬─dislike_count─┐
  │ ClickHouse v21.11 Release Webinar                                                                    │         52 │             3 │
  │ ClickHouse Introduction                                                                              │         97 │             3 │
  │ Casa Modelo Algarve                                                                                  │        180 │             3 │
  │ Профайлер запросов:  трудный путь                                                                    │         33 │             3 │
  │ ClickHouse в Курсометре                                                                              │          4 │             2 │
  │ 10 Good Reasons to Use ClickHouse                                                                    │         27 │             2 │
  ...

  84 rows in set. Elapsed: 0.013 sec. Processed 155.65 thousand rows, 16.94 MB (11.96 million rows/s., 1.30 GB/s.)
  ```

  다음은 `title` 또는 `description` 필드에 **ClickHouse**가 포함된 비디오 검색 예시입니다:

  ```sql
  SELECT
      view_count,
      like_count,
      dislike_count,
      concat('https://youtu.be/', id) AS url,
      title
  FROM youtube
  WHERE (title ILIKE '%ClickHouse%') OR (description ILIKE '%ClickHouse%')
  ORDER BY
      like_count DESC,
      view_count DESC;
  ```

  이 쿼리는 모든 행을 처리해야 하며, 두 개의 문자열 컬럼을 파싱해야 합니다. 그럼에도 불구하고 초당 415만 행의 우수한 성능을 얻습니다:

  ```response
  1174 rows in set. Elapsed: 1099.368 sec. Processed 4.56 billion rows, 1.98 TB (4.15 million rows/s., 1.80 GB/s.)
  ```

  결과는 다음과 같습니다:

  ```response
  ┌─view_count─┬─like_count─┬─dislike_count─┬─url──────────────────────────┬─title──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │       1919 │         63 │             1 │ https://youtu.be/b9MeoOtAivQ │ ClickHouse v21.10 Release Webinar                                                                      │
  │       8710 │         62 │             4 │ https://youtu.be/PeV1mC2z--M │ What is JDBC DriverManager? | JDBC                                                                     │
  │       3534 │         62 │             1 │ https://youtu.be/8nWRhK9gw10 │ CLICKHOUSE - Arquitetura Modular                                                                       │
  ```
</VerticalStepper>

## 질문 {#questions}

### 동영상에서 댓글을 비활성화하면 실제로 좋아요나 싫어요를 누를 가능성이 낮아지나요? \{#create-the-table\}

댓글이 비활성화되어 있을 때, 사람들이 동영상에 대한 감정을 표현하기 위해 좋아요나 싫어요를 누를 가능성이 더 높아지나요?

```sql
SELECT
    concat('< ', formatReadableQuantity(view_range)) AS views,
    is_comments_enabled,
    total_clicks / num_views AS prob_like_dislike
FROM
(
    SELECT
        is_comments_enabled,
        power(10, CEILING(log10(view_count + 1))) AS view_range,
        sum(like_count + dislike_count) AS total_clicks,
        sum(view_count) AS num_views
    FROM youtube
    GROUP BY
        view_range,
        is_comments_enabled
) WHERE view_range > 1
ORDER BY
    is_comments_enabled ASC,
    num_views ASC;
```

```response
┌─views─────────────┬─is_comments_enabled─┬────prob_like_dislike─┐
│ < 10.00           │ false               │  0.08224180712685371 │
│ < 100.00          │ false               │  0.06346337759167248 │
│ < 1.00 thousand   │ false               │  0.03201883652987105 │
│ < 10.00 thousand  │ false               │  0.01716073540410903 │
│ < 10.00 billion   │ false               │ 0.004555639481829971 │
│ < 100.00 thousand │ false               │  0.01293351460515323 │
│ < 1.00 billion    │ false               │ 0.004761811192464957 │
│ < 1.00 million    │ false               │ 0.010472604018980551 │
│ < 10.00 million   │ false               │  0.00788902538420125 │
│ < 100.00 million  │ false               │  0.00579152804250582 │
│ < 10.00           │ true                │  0.09819517478134059 │
│ < 100.00          │ true                │  0.07403784478585775 │
│ < 1.00 thousand   │ true                │  0.03846294910067627 │
│ < 10.00 billion   │ true                │ 0.005615217329358215 │
│ < 10.00 thousand  │ true                │  0.02505881391701455 │
│ < 1.00 billion    │ true                │ 0.007434998802482997 │
│ < 100.00 thousand │ true                │ 0.022694648130822004 │
│ < 100.00 million  │ true                │ 0.011761563746575625 │
│ < 1.00 million    │ true                │ 0.020776022304589435 │
│ < 10.00 million   │ true                │ 0.016917095718089584 │
└───────────────────┴─────────────────────┴──────────────────────┘

22 rows in set. Elapsed: 8.460 sec. Processed 4.56 billion rows, 77.48 GB (538.73 million rows/s., 9.16 GB/s.)
```

댓글을 활성화하는 것과 참여율 증가 사이에는 연관성이 있는 것으로 보입니다.


### 시간 경과에 따른 동영상 수 변화와 주요 이벤트는 무엇입니까? \{#insert-data\}

```sql
SELECT
    toStartOfMonth(toDateTime(upload_date)) AS month,
    uniq(uploader_id) AS uploaders,
    count() AS num_videos,
    sum(view_count) AS view_count
FROM youtube
GROUP BY month
ORDER BY month ASC;
```

```response
┌──────month─┬─uploaders─┬─num_videos─┬───view_count─┐
│ 2005-04-01 │         5 │          6 │    213597737 │
│ 2005-05-01 │         6 │          9 │      2944005 │
│ 2005-06-01 │       165 │        351 │     18624981 │
│ 2005-07-01 │       395 │       1168 │     94164872 │
│ 2005-08-01 │      1171 │       3128 │    124540774 │
│ 2005-09-01 │      2418 │       5206 │    475536249 │
│ 2005-10-01 │      6750 │      13747 │    737593613 │
│ 2005-11-01 │     13706 │      28078 │   1896116976 │
│ 2005-12-01 │     24756 │      49885 │   2478418930 │
│ 2006-01-01 │     49992 │     100447 │   4532656581 │
│ 2006-02-01 │     67882 │     138485 │   5677516317 │
│ 2006-03-01 │    103358 │     212237 │   8430301366 │
│ 2006-04-01 │    114615 │     234174 │   9980760440 │
│ 2006-05-01 │    152682 │     332076 │  14129117212 │
│ 2006-06-01 │    193962 │     429538 │  17014143263 │
│ 2006-07-01 │    234401 │     530311 │  18721143410 │
│ 2006-08-01 │    281280 │     614128 │  20473502342 │
│ 2006-09-01 │    312434 │     679906 │  23158422265 │
│ 2006-10-01 │    404873 │     897590 │  27357846117 │
```

코로나19 전후로 업로더 수가 눈에 띄게 급증한 것을 [확인할 수 있습니다](https://www.theverge.com/2020/3/27/21197642/youtube-with-me-style-videos-views-coronavirus-cook-workout-study-home-beauty).


### 시간 경과에 따른 자막 증가와 그 시점 \{#count-row-numbers\}

음성 인식 기술의 발전으로 동영상에 자막을 생성하는 일이 그 어느 때보다 쉬워졌습니다. YouTube가 2009년 말에 자동 자막 기능을 도입한 것이 그 도약의 시점이었을까요?

```sql
SELECT
    toStartOfMonth(upload_date) AS month,
    countIf(has_subtitles) / count() AS percent_subtitles,
    percent_subtitles - any(percent_subtitles) OVER (
        ORDER BY month ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING
    ) AS previous
FROM youtube
GROUP BY month
ORDER BY month ASC;
```

```response
┌──────month─┬───percent_subtitles─┬────────────────previous─┐
│ 2015-01-01 │  0.2652653881082824 │      0.2652653881082824 │
│ 2015-02-01 │  0.3147556050309162 │    0.049490216922633834 │
│ 2015-03-01 │ 0.32460464492371877 │    0.009849039892802558 │
│ 2015-04-01 │ 0.33471963051468445 │    0.010114985590965686 │
│ 2015-05-01 │  0.3168087575501062 │   -0.017910872964578273 │
│ 2015-06-01 │  0.3162609788438222 │  -0.0005477787062839745 │
│ 2015-07-01 │ 0.31828767677518033 │   0.0020266979313581235 │
│ 2015-08-01 │  0.3045551564286859 │   -0.013732520346494415 │
│ 2015-09-01 │   0.311221133995152 │    0.006665977566466086 │
│ 2015-10-01 │ 0.30574870926812175 │   -0.005472424727030245 │
│ 2015-11-01 │ 0.31125409712077234 │   0.0055053878526505895 │
│ 2015-12-01 │  0.3190967954651779 │    0.007842698344405541 │
│ 2016-01-01 │ 0.32636021432496176 │    0.007263418859783877 │

```

데이터 결과를 보면 2009년에 급증이 나타납니다. 당시 YouTube는 다른 사람의 동영상에 자막을 업로드할 수 있게 해 주던 커뮤니티 자막 기능을 제거하고 있었습니다.
이로 인해 청각장애인 및 난청 시청자를 위해 크리에이터들이 자신의 동영상에 자막을 추가하도록 독려하는 매우 큰 성공을 거둔 캠페인이 진행되었습니다.


### 시간에 따른 상위 업로더 \{#explore-the-data\}

```sql
WITH uploaders AS
    (
        SELECT uploader
        FROM youtube
        GROUP BY uploader
        ORDER BY sum(view_count) DESC
        LIMIT 10
    )
SELECT
    month,
    uploader,
    sum(view_count) AS total_views,
    avg(dislike_count / like_count) AS like_to_dislike_ratio
FROM youtube
WHERE uploader IN (uploaders)
GROUP BY
    toStartOfMonth(upload_date) AS month,
    uploader
ORDER BY
    month ASC,
    total_views DESC;
```

```response
┌──────month─┬─uploader───────────────────┬─total_views─┬─like_to_dislike_ratio─┐
│ 1970-01-01 │ T-Series                   │    10957099 │  0.022784656361208206 │
│ 1970-01-01 │ Ryan's World               │           0 │  0.003035559410234172 │
│ 1970-01-01 │ SET India                  │           0 │                   nan │
│ 2006-09-01 │ Cocomelon - Nursery Rhymes │   256406497 │    0.7005566715978622 │
│ 2007-06-01 │ Cocomelon - Nursery Rhymes │    33641320 │    0.7088650914344298 │
│ 2008-02-01 │ WWE                        │    43733469 │   0.07198856488734842 │
│ 2008-03-01 │ WWE                        │    16514541 │    0.1230603715431997 │
│ 2008-04-01 │ WWE                        │     5907295 │    0.2089399470159618 │
│ 2008-05-01 │ WWE                        │     7779627 │   0.09101676560436774 │
│ 2008-06-01 │ WWE                        │     7018780 │    0.0974184753155297 │
│ 2008-07-01 │ WWE                        │     4686447 │    0.1263845422065158 │
│ 2008-08-01 │ WWE                        │     4514312 │   0.08384574274791441 │
│ 2008-09-01 │ WWE                        │     3717092 │   0.07872802579349912 │
```


### 조회수가 증가함에 따라 좋아요 비율은 어떻게 변합니까?

```sql
SELECT
    concat('< ', formatReadableQuantity(view_range)) AS view_range,
    is_comments_enabled,
    round(like_ratio, 2) AS like_ratio
FROM
(
SELECT
    power(10, CEILING(log10(view_count + 1))) AS view_range,
    is_comments_enabled,
    avg(like_count / dislike_count) AS like_ratio
FROM youtube WHERE dislike_count > 0
GROUP BY
    view_range,
    is_comments_enabled HAVING view_range > 1
ORDER BY
    view_range ASC,
    is_comments_enabled ASC
);
```

```response
┌─view_range────────┬─is_comments_enabled─┬─like_ratio─┐
│ < 10.00           │ false               │       0.66 │
│ < 10.00           │ true                │       0.66 │
│ < 100.00          │ false               │          3 │
│ < 100.00          │ true                │       3.95 │
│ < 1.00 thousand   │ false               │       8.45 │
│ < 1.00 thousand   │ true                │      13.07 │
│ < 10.00 thousand  │ false               │      18.57 │
│ < 10.00 thousand  │ true                │      30.92 │
│ < 100.00 thousand │ false               │      23.55 │
│ < 100.00 thousand │ true                │      42.13 │
│ < 1.00 million    │ false               │      19.23 │
│ < 1.00 million    │ true                │      37.86 │
│ < 10.00 million   │ false               │      12.13 │
│ < 10.00 million   │ true                │      30.72 │
│ < 100.00 million  │ false               │       6.67 │
│ < 100.00 million  │ true                │      23.32 │
│ < 1.00 billion    │ false               │       3.08 │
│ < 1.00 billion    │ true                │      20.69 │
│ < 10.00 billion   │ false               │       1.77 │
│ < 10.00 billion   │ true                │       19.5 │
└───────────────────┴─────────────────────┴────────────┘
```


### 뷰(View)는 어떻게 분산됩니까? \{#if-someone-disables-comments-does-it-lower-the-chance-someone-will-actually-click-like-or-dislike\}

```sql
SELECT
    labels AS percentile,
    round(quantiles) AS views
FROM
(
    SELECT
        quantiles(0.999, 0.99, 0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1)(view_count) AS quantiles,
        ['99.9th', '99th', '95th', '90th', '80th', '70th','60th', '50th', '40th', '30th', '20th', '10th'] AS labels
    FROM youtube
)
ARRAY JOIN
    quantiles,
    labels;
```

```response
┌─percentile─┬───views─┐
│ 99.9th     │ 1216624 │
│ 99th       │  143519 │
│ 95th       │   13542 │
│ 90th       │    4054 │
│ 80th       │     950 │
│ 70th       │     363 │
│ 60th       │     177 │
│ 50th       │      97 │
│ 40th       │      57 │
│ 30th       │      32 │
│ 20th       │      16 │
│ 10th       │       6 │
└────────────┴─────────┘
```
