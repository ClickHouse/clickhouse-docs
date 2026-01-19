---
description: 'YouTube 動画の低評価データのコレクション。'
sidebar_label: 'YouTube 低評価'
slug: /getting-started/example-datasets/youtube-dislikes
title: 'YouTube 低評価データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'youtube', 'サンプルデータ', '動画分析', '低評価']
---

2021 年 11 月、YouTube はすべての動画から公開***低評価***数を非表示にしました。クリエイターは依然として低評価数を確認できますが、視聴者が確認できるのは動画が受け取った***高評価***の数だけです。

:::important
このデータセットには 45.5 億件以上のレコードが含まれているため、お使いのリソースがこの規模のデータ量に耐えられるか確認せずに、以下のコマンドをそのままコピー＆ペーストしないよう注意してください。以下のコマンドは、[ClickHouse Cloud](https://clickhouse.cloud) の**本番**インスタンス上で実行されています。
:::

データは JSON 形式で、[archive.org](https://archive.org/download/dislikes_youtube_2021_12_video_json_files) からダウンロードできます。同じデータを S3 にも用意しており、ClickHouse Cloud インスタンスに対してより効率的にダウンロードできるようにしています。

以下は、ClickHouse Cloud にテーブルを作成し、そのテーブルにデータを挿入する手順です。

:::note
以下の手順は、ローカル環境にインストールした ClickHouse でも問題なく利用できます。唯一の違いは、`s3cluster` の代わりに `s3` 関数を使用する点です（クラスターを構成している場合はこの限りではなく、その場合は `default` をクラスター名に置き換えてください）。
:::

## 段階的な手順 \{#step-by-step-instructions\}

<VerticalStepper headerLevel="h3">

### データ探索 \{#data-exploration\}

データの構造を確認しましょう。`s3cluster`テーブル関数はテーブルを返すため、`DESCRIBE`で結果を確認できます：

```sql
DESCRIBE s3(
'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
'JSONLines'
);
```

ClickHouseはJSONファイルから次のスキーマを推論します：

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

### テーブルの作成 \{#create-the-table\}

推論されたスキーマに基づいて、データ型を整理し、プライマリキーを追加しました。
次のテーブルを定義します：

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

### データの挿入 \{#insert-data\}

以下のコマンドは、S3ファイルからレコードを`youtube`テーブルにストリーミングします。

:::important
これは大量のデータ(46億5000万行)を挿入します。データセット全体が不要な場合は、必要な行数を指定した`LIMIT`句を追加してください。
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

`INSERT` コマンドに関する補足説明：

* `parseDateTimeBestEffortUSOrZero` 関数は、入力される日付フィールドが適切な形式ではない可能性がある場合に便利です。`fetch_date` を正しくパースできなかった場合は、`0` に設定されます。
* `upload_date` 列には有効な日付が含まれていますが、&quot;4 hours ago&quot; のような文字列も含まれており、これは当然ながら有効な日付ではありません。そこで元の値は `upload_date_str` に保持しつつ、`toDate(parseDateTimeBestEffortUSOrZero(upload_date::String))` でパースを試みることにしました。パースに失敗した場合は単に `0` が返されます。
* テーブル内で `NULL` 値が発生しないようにするために `ifNull` を使用しました。入力値が `NULL` の場合、`ifNull` 関数はその値を空文字列に置き換えます。

### 行数をカウントする \{#count-row-numbers\}

ClickHouse CloudのSQLコンソールで新しいタブを開く(または新しい`clickhouse-client`ウィンドウを開く)か、カウントの増加を監視します。
45.6億行の挿入には、サーバーリソースに応じて時間がかかります。(設定を調整しない場合、約4.5時間かかります。)

```sql
SELECT formatReadableQuantity(count())
FROM youtube
```

```response
┌─formatReadableQuantity(count())─┐
│ 4.56 billion                    │
└─────────────────────────────────┘
```

### データを探索する \{#explore-the-data\}

データが挿入されたら、お気に入りの動画やチャンネルの低評価数を集計してみましょう。ClickHouseがアップロードした動画の数を確認してみます:

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
上記のクエリが高速に実行されるのは、プライマリキーの第1カラムとして `uploader` を選択したためです。そのため、処理対象の行数は237k行のみで済みます。
:::

ClickHouse動画の高評価と低評価を確認してみましょう：

```sql
SELECT
title,
like_count,
dislike_count
FROM youtube
WHERE uploader = 'ClickHouse'
ORDER BY dislike_count DESC;
```

レスポンスは次のようになります：

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

以下は、`title`または`description`フィールドに**ClickHouse**が含まれる動画の検索結果です：

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

このクエリは全行を処理し、2つの文字列カラムを解析する必要があります。それでも、毎秒415万行という良好なパフォーマンスを実現しています:

```response
1174 rows in set. Elapsed: 1099.368 sec. Processed 4.56 billion rows, 1.98 TB (4.15 million rows/s., 1.80 GB/s.)
```

結果は次のようになります:

```response
┌─view_count─┬─like_count─┬─dislike_count─┬─url──────────────────────────┬─title──────────────────────────────────────────────────────────────────────────────────────────────────┐
│       1919 │         63 │             1 │ https://youtu.be/b9MeoOtAivQ │ ClickHouse v21.10 Release Webinar                                                                      │
│       8710 │         62 │             4 │ https://youtu.be/PeV1mC2z--M │ What is JDBC DriverManager? | JDBC                                                                     │
│       3534 │         62 │             1 │ https://youtu.be/8nWRhK9gw10 │ CLICKHOUSE - Arquitetura Modular                                                                       │
```

</VerticalStepper>

## 質問 \{#questions\}

### コメントが無効化されていると、高評価や低評価が押される可能性は下がりますか？ \{#create-the-table\}

コメントが無効化されている場合、視聴者は動画に対する気持ちを表そうとして、高評価や低評価を押す傾向が強くなるのでしょうか？

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

コメントを有効にすると、エンゲージメント率が高くなる傾向があります。

### 時間の経過に伴う動画数の変化と主なイベント \{#insert-data\}

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

アップローダー数の急増が、[新型コロナウイルス流行期のあたりで明確に見て取れます](https://www.theverge.com/2020/3/27/21197642/youtube-with-me-style-videos-views-coronavirus-cook-workout-study-home-beauty)。

### 字幕はいつ頃からどのように増えてきたのか \{#count-row-numbers\}

音声認識技術の進歩により、動画に字幕を付けることはいままでになく簡単になりました。YouTube では 2009 年末に自動キャプション機能が追加されましたが、あれが転換点だったのでしょうか？

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

データの結果を見ると、2009年に急増があることがわかります。この時期、YouTube は他の人の動画に字幕をアップロードできる「コミュニティ字幕」機能を削除していました。
これをきっかけに、難聴者やろう者の視聴者のために、クリエイターが自分の動画に字幕を追加することを促す、大きな成功を収めたキャンペーンが展開されました。

### 時系列でのアップロード数上位ユーザー \{#explore-the-data\}

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

### 再生数が増えると、いいね率はどのように変化しますか？ \{#how-do-like-ratio-changes-as-views-go-up\}

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

### ビューはどのように分散されますか？ \{#if-someone-disables-comments-does-it-lower-the-chance-someone-will-actually-click-like-or-dislike\}

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
