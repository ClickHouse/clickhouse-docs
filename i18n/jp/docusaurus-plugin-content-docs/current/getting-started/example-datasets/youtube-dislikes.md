---
'description': 'YouTube 動画の嫌いなコレクションです。'
'sidebar_label': 'YouTube Dislikes'
'slug': '/getting-started/example-datasets/youtube-dislikes'
'title': 'YouTube の嫌いなデータセット'
'doc_type': 'reference'
---

In November of 2021, YouTube removed the public ***dislike*** count from all of its videos. While creators can still see the number of dislikes, viewers can only see how many ***likes*** a video has received.

:::important
データセットには45.5億件以上のレコードが含まれているため、リソースがその程度のボリュームに対応できる場合を除き、以下のコマンドを単純にコピー＆ペーストすることには注意してください。以下のコマンドは、[ClickHouse Cloud](https://clickhouse.cloud)の **Production** インスタンスで実行されました。
:::

データはJSON形式で、[archive.org](https://archive.org/download/dislikes_youtube_2021_12_video_json_files)からダウンロードできます。同じデータをS3に提供しており、ClickHouse Cloudインスタンスに効率的にダウンロードできるようになっています。

ClickHouse Cloudでテーブルを作成し、データを挿入する手順は以下の通りです。

:::note
以下の手順は、ClickHouseのローカルインストールでも簡単に動作します。唯一の変更点は、`s3cluster`関数の代わりに`s3`関数を使用することです（クラスターが構成されている場合は、その場合`default`をクラスターの名前に変更します）。
:::

## ステップバイステップの手順 {#step-by-step-instructions}

1. データがどのように見えるかを確認しましょう。`s3cluster`テーブル関数はテーブルを返すので、結果を`DESCRIBE`できます：

```sql
DESCRIBE s3(
    'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
    'JSONLines'
);
```

ClickHouseは、JSONファイルから以下のスキーマを推測します：

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

2. 推測したスキーマに基づいて、データ型をクリーンアップし、主キーを追加しました。以下のテーブルを定義します：

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

3. 以下のコマンドは、S3ファイルから`youtube`テーブルにレコードをストリーミングします。

:::important
これにより大量のデータが挿入されます - 46.5億行です。全データセットを挿入したくない場合は、単に希望する行数を持つ`LIMIT`句を追加してください。
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

`INSERT`コマンドに関するいくつかのコメント：

- `parseDateTimeBestEffortUSOrZero`関数は、受信した日付フィールドが適切な形式でない場合に便利です。`fetch_date`が正しくパースされない場合、`0`に設定されます
- `upload_date`カラムには有効な日付が含まれますが、「4 hours ago」のような文字列も含まれており、これは確かに有効な日付ではありません。元の値を`upload_date_str`に保存し、`toDate(parseDateTimeBestEffortUSOrZero(upload_date::String))`で解析しようとしました。解析が失敗した場合は、`0`を取得します
- `ifNull`を使用して、テーブル内に`NULL`値が入らないようにしました。受信した値が`NULL`の場合、`ifNull`関数はその値を空の文字列に設定します

4. ClickHouse CloudのSQLコンソールで新しいタブを開く（または新しい`clickhouse-client`ウィンドウを開く）と、カウントが増加するのを見ることができます。サーバーリソースに応じて46.5B行の挿入には時間がかかります（設定を調整しなくても、約4.5時間かかります）。

```sql
SELECT formatReadableQuantity(count())
FROM youtube
```

```response
┌─formatReadableQuantity(count())─┐
│ 4.56 billion                    │
└─────────────────────────────────┘
```

5. データが挿入されたら、お気に入りの動画やチャンネルの不平不満の数をカウントしてみましょう。ClickHouseによってアップロードされた動画の数を見てみましょう：

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
上記のクエリは、最初のカラムに`uploader`を選んでいるため非常に迅速に実行されます - なので、237k行だけを処理すれば済みました。
:::

6. ClickHouseの動画のいいねと嫌いを見てみましょう：

```sql
SELECT
    title,
    like_count,
    dislike_count
FROM youtube
WHERE uploader = 'ClickHouse'
ORDER BY dislike_count DESC;
```

応答は次のようになります：

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

7. `title`または`description`フィールドに**ClickHouse**を含む動画を検索します：

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

このクエリは各行を処理し、2つの文字列カラムをも解析する必要があります。それでも、4.15M行/秒という良好なパフォーマンスを得ています：

```response
1174 rows in set. Elapsed: 1099.368 sec. Processed 4.56 billion rows, 1.98 TB (4.15 million rows/s., 1.80 GB/s.)
```

結果は次のようになります：

```response
┌─view_count─┬─like_count─┬─dislike_count─┬─url──────────────────────────┬─title──────────────────────────────────────────────────────────────────────────────────────────────────┐
│       1919 │         63 │             1 │ https://youtu.be/b9MeoOtAivQ │ ClickHouse v21.10 Release Webinar                                                                      │
│       8710 │         62 │             4 │ https://youtu.be/PeV1mC2z--M │ What is JDBC DriverManager? | JDBC                                                                     │
│       3534 │         62 │             1 │ https://youtu.be/8nWRhK9gw10 │ CLICKHOUSE - Arquitetura Modular                                                                       │
```

## 質問 {#questions}

### 誰かがコメントを無効にすると、それが実際にいいねや嫌いをクリックする可能性を低下させるか？ {#if-someone-disables-comments-does-it-lower-the-chance-someone-will-actually-click-like-or-dislike}

コメントが無効になっていると、人々は動画についての感情を表現するためにいいねや嫌いをクリックする可能性が高まりますか？

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

コメントを有効にすることは、エンゲージメントの率が高いことと相関しているようです。

### 動画の数は時間と共にどう変化するか - 注目すべきイベントは？ {#how-does-the-number-of-videos-change-over-time---notable-events}

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

アップローダーの急増は[コロナウイルスの周辺で目立ちます](https://www.theverge.com/2020/3/27/21197642/youtube-with-me-style-videos-views-coronavirus-cook-workout-study-home-beauty)。

### 時間とともに字幕が増え、いつ増えたか {#more-subtitles-over-time-and-when}

音声認識の進歩により、2009年末にYouTubeが自動キャプションを追加し、動画の字幕作成がこれまで以上に簡単になった - その時に急増したのでしょうか？

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

データの結果は2009年に急増を示しています。実際、その時、YouTubeは他の人の動画にキャプションをアップロードできるコミュニティキャプション機能を削除していました。
これにより、聴覚障害者や耳の不自由な視聴者のために動画にキャプションを追加するようにクリエイターに呼びかける非常に成功したキャンペーンが促進されました。

### 時間とともにトップアップローダー {#top-uploaders-over-time}

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

### 視聴数が増加するにつれ、いいねの比率はどう変化するか？ {#how-do-like-ratio-changes-as-views-go-up}

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

### 視聴数はどのように分布しているか？ {#how-are-views-distributed}

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
