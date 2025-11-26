---
description: '一个关于 YouTube 视频“点踩”数据的集合。'
sidebar_label: 'YouTube 点踩数据'
slug: /getting-started/example-datasets/youtube-dislikes
title: 'YouTube 点踩数据集'
doc_type: 'guide'
keywords: ['示例数据集', 'youtube', '示例数据', '视频分析', '点踩']
---

在 2021 年 11 月，YouTube 从其所有视频中移除了公开的***点踩***计数。创作者仍然可以看到点踩数量，但观众现在只能看到视频收到了多少个***点赞***。

:::important
该数据集包含超过 45.5 亿条记录，因此除非你的资源能够处理这种规模的数据量，否则请谨慎直接复制粘贴下面的命令。以下命令是在一个 [ClickHouse Cloud](https://clickhouse.cloud) 的**生产**实例上执行的。
:::

数据为 JSON 格式，可以从 [archive.org](https://archive.org/download/dislikes_youtube_2021_12_video_json_files) 下载。我们也已将相同的数据提供在 S3 上，以便更高效地下载到 ClickHouse Cloud 实例中。

以下是在 ClickHouse Cloud 中创建表并插入数据的步骤。

:::note
下面的步骤同样也适用于本地安装的 ClickHouse。唯一的变化是使用 `s3` 函数而不是 `s3cluster`（除非你已经配置了集群——在这种情况下，将 `default` 改为你的集群名称）。
:::



## 分步说明 {#step-by-step-instructions}

<VerticalStepper headerLevel="h3">

### 数据探索 {#data-exploration}

让我们查看数据的结构。`s3cluster` 表函数返回一个表,因此我们可以使用 `DESCRIBE` 查看结果:

```sql
DESCRIBE s3(
    'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
    'JSONLines'
);
```

ClickHouse 从 JSON 文件推断出以下模式:

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

### 创建表 {#create-the-table}

基于推断的模式,我们对数据类型进行了优化并添加了主键。
定义以下表:

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

### 插入数据 {#insert-data}

以下命令将 S3 文件中的记录流式传输到 `youtube` 表中。


:::important
这会插入大量数据——46.5 亿行。如果您不需要整个数据集，只需在查询中添加一个 `LIMIT` 子句，并将其设置为所需的行数。
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

关于我们的 `INSERT` 命令的一些说明：

* 当传入的日期字段可能不符合正确格式时，`parseDateTimeBestEffortUSOrZero` 函数非常有用。如果 `fetch_date` 未能被正确解析，它将被设置为 `0`
* `upload_date` 列中包含有效日期，但也包含诸如 &quot;4 hours ago&quot; 之类的字符串——这显然不是有效日期。我们决定将原始值存储在 `upload_date_str` 中，并尝试使用 `toDate(parseDateTimeBestEffortUSOrZero(upload_date::String))` 对其进行解析。如果解析失败，我们就会得到 `0`
* 我们使用 `ifNull` 来避免在表中出现 `NULL` 值。如果传入值为 `NULL`，`ifNull` 函数会将其设置为空字符串

### 统计行数

在 ClickHouse Cloud 的 SQL Console 中打开一个新选项卡（或新开一个 `clickhouse-client` 窗口），并观察计数的增长。
插入 4.56B 行数据需要一段时间，具体取决于您的服务器资源。（在未对设置进行任何调优的情况下，大约需要 4.5 小时。）

```sql
SELECT formatReadableQuantity(count())
FROM youtube
```

```response
┌─formatReadableQuantity(count())─┐
│ 45.6 亿                          │
└─────────────────────────────────┘
```

### 浏览数据

数据插入完成后，可以统计一下你最喜欢的视频或频道的点踩次数。让我们看看由 ClickHouse 上传的视频有多少个：

```sql
SELECT count()
FROM youtube
WHERE uploader = 'ClickHouse';
```

```response
┌─count()─┐
│      84 │
└─────────┘

返回 1 行。耗时:0.570 秒。已处理 23.757 万行,5.77 MB(41.654 万行/秒,10.12 MB/秒)
```

:::note
上面的查询之所以能运行得这么快，是因为我们将 `uploader` 设为主键的第一列——因此它只需要处理 23.7 万行数据。
:::

接下来来看一下 ClickHouse 视频的点赞和点踩数据：

```sql
SELECT
    title,
    like_count,
    dislike_count
FROM youtube
WHERE uploader = 'ClickHouse'
ORDER BY dislike_count DESC;
```

响应类似如下：

```response
┌─title────────────────────────────────────────────────────────────────────────────────────────────────┬─like_count─┬─dislike_count─┐
│ ClickHouse v21.11 Release Webinar                                                                    │         52 │             3 │
│ ClickHouse Introduction                                                                              │         97 │             3 │
│ Casa Modelo Algarve                                                                                  │        180 │             3 │
│ Профайлер запросов:  трудный путь                                                                    │         33 │             3 │
│ ClickHouse в Курсометре                                                                              │          4 │             2 │
│ 10 Good Reasons to Use ClickHouse                                                                    │         27 │             2 │
...

结果集包含 84 行。耗时：0.013 秒。处理了 155.65 千行，16.94 MB（1196 万行/秒，1.30 GB/秒）
```

下面是一个示例查询，用于搜索在 `title` 或 `description` 字段中包含 **ClickHouse** 的视频：


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

该查询需要处理每一行数据,并解析两列字符串。即便如此,仍能获得每秒 415 万行的良好性能:

```response
1174 rows in set. Elapsed: 1099.368 sec. Processed 4.56 billion rows, 1.98 TB (4.15 million rows/s., 1.80 GB/s.)
```

查询结果如下:

```response
┌─view_count─┬─like_count─┬─dislike_count─┬─url──────────────────────────┬─title──────────────────────────────────────────────────────────────────────────────────────────────────┐
│       1919 │         63 │             1 │ https://youtu.be/b9MeoOtAivQ │ ClickHouse v21.10 Release Webinar                                                                      │
│       8710 │         62 │             4 │ https://youtu.be/PeV1mC2z--M │ What is JDBC DriverManager? | JDBC                                                                     │
│       3534 │         62 │             1 │ https://youtu.be/8nWRhK9gw10 │ CLICKHOUSE - Arquitetura Modular                                                                       │
```

</VerticalStepper>


## 问题

### 如果有人关闭评论功能，是否会降低其他人实际点“赞”或“踩”的可能性？

当评论被关闭时，人们是否更有可能通过点赞或点踩来表达他们对视频的感受？

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

22 行，耗时 8.460 秒。处理了 45.6 亿行，77.48 GB（5.3873 亿行/秒，9.16 GB/秒）
```

启用评论似乎与更高的互动率存在关联。

### 视频数量随时间如何变化——有哪些值得注意的事件？

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
┌──────月份─┬─上传者─┬─视频数量─┬───观看次数─┐
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

在新冠疫情期间，[上传者数量的激增非常明显](https://www.theverge.com/2020/3/27/21197642/youtube-with-me-style-videos-views-coronavirus-cook-workout-study-home-beauty)。

### 随着时间推移出现更多字幕，以及出现的时间点

随着语音识别技术的发展，为视频创建字幕变得前所未有的容易，而 YouTube 在 2009 年底推出了自动字幕功能——转折点是否就是从那时开始的？

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
┌──────月份──┬───字幕百分比───────┬────────────────前一值────┐
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

数据显示在 2009 年出现一个峰值。当时 YouTube 正在移除其社区字幕功能，该功能允许用户为他人上传视频字幕。
这促成了一场非常成功的运动，呼吁创作者为自己的视频添加字幕，以方便重听和失聪观众观看。

### 随时间变化的顶级上传者

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

### 随着浏览量的增长，点赞率会如何变化？

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
┌─观看量范围────────┬─评论是否启用──────┬─点赞比率──┐
│ < 10.00           │ 否                 │       0.66 │
│ < 10.00           │ 是                 │       0.66 │
│ < 100.00          │ 否                 │          3 │
│ < 100.00          │ 是                 │       3.95 │
│ < 1.00 thousand   │ 否                 │       8.45 │
│ < 1.00 thousand   │ 是                 │      13.07 │
│ < 10.00 thousand  │ 否                 │      18.57 │
│ < 10.00 thousand  │ 是                 │      30.92 │
│ < 100.00 thousand │ 否                 │      23.55 │
│ < 100.00 thousand │ 是                 │      42.13 │
│ < 1.00 million    │ 否                 │      19.23 │
│ < 1.00 million    │ 是                 │      37.86 │
│ < 10.00 million   │ 否                 │      12.13 │
│ < 10.00 million   │ 是                 │      30.72 │
│ < 100.00 million  │ 否                 │       6.67 │
│ < 100.00 million  │ 是                 │      23.32 │
│ < 1.00 billion    │ 否                 │       3.08 │
│ < 1.00 billion    │ 是                 │      20.69 │
│ < 10.00 billion   │ 否                 │       1.77 │
│ < 10.00 billion   │ 是                 │       19.5 │
└───────────────────┴─────────────────────┴────────────┘
```

### 视图如何分布？


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
