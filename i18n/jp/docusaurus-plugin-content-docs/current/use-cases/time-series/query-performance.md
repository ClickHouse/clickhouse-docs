---
'title': 'クエリ性能 - タイムシリーズ'
'sidebar_label': 'クエリ性能'
'description': 'タイムシリーズクエリ性能の向上'
'slug': '/use-cases/time-series/query-performance'
'keywords':
- 'time-series'
---




# 時系列クエリのパフォーマンス

ストレージを最適化した後の次のステップは、クエリパフォーマンスの向上です。このセクションでは、`ORDER BY` キーの最適化とマテリアライズドビューの使用という 2 つの重要な技術を探ります。これらのアプローチによって、クエリの実行時間を秒からミリ秒に短縮する方法を見ていきます。

## ORDER BY キーの最適化 {#time-series-optimize-order-by}

他の最適化を試みる前に、ClickHouse ができるだけ迅速な結果を生成できるように、オーダリングキーを最適化する必要があります。キーの選択は、実行するクエリに大きく依存します。たとえば、ほとんどのクエリが `project` および `subproject` カラムでフィルタリングされる場合、この場合には、時間カラムに加えてオーダリングキーにこれらを追加することが良いアイデアです。

同じカラムタイプを持ち、`(project, subproject, time)` でソートされたテーブルの別バージョンを作成しましょう。

```sql
CREATE TABLE wikistat_project_subproject
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (project, subproject, time);
```

次に、パフォーマンスに対するオーダリングキーの重要性を理解するために、複数のクエリを比較してみましょう。前回のデータタイプおよびコーデックの最適化を適用していないため、クエリパフォーマンスの違いはソート順にのみ基づいています。

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>クエリ</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(time)`</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(project, subproject, time)`</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
```sql
SELECT project, sum(hits) AS h
FROM wikistat
GROUP BY project
ORDER BY h DESC
LIMIT 10;
```       
            </td>
            <td style={{ textAlign: 'right' }}>2.381 sec</td>
            <td style={{ textAlign: 'right' }}>1.660 sec</td>
        </tr>

        <tr>
            <td>
```sql
SELECT subproject, sum(hits) AS h
FROM wikistat
WHERE project = 'it'
GROUP BY subproject
ORDER BY h DESC
LIMIT 10;
```          
            </td>
            <td style={{ textAlign: 'right' }}>2.148 sec</td>
            <td style={{ textAlign: 'right' }}>0.058 sec</td>
        </tr>
      
        <tr>
            <td>
```sql
SELECT toStartOfMonth(time) AS m, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY m
ORDER BY m DESC
LIMIT 10;
```          
            </td>
            <td style={{ textAlign: 'right' }}>2.192 sec</td>
            <td style={{ textAlign: 'right' }}>0.012 sec</td>
        </tr>

        <tr>
            <td>
```sql
SELECT path, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY path
ORDER BY h DESC
LIMIT 10;
```          
            </td>
            <td style={{ textAlign: 'right' }}>2.968 sec</td>
            <td style={{ textAlign: 'right' }}>0.010 sec</td>
        </tr>
    </tbody>
</table>

## マテリアライズドビュー {#time-series-materialized-views}

もう 1 つのオプションは、マテリアライズドビューを使用して人気のあるクエリの結果を集約して保存することです。これらの結果は、元のテーブルの代わりにクエリすることができます。たとえば、次のクエリがよく実行される場合を考えてみましょう。

```sql
SELECT path, SUM(hits) AS v
FROM wikistat
WHERE toStartOfMonth(time) = '2015-05-01'
GROUP BY path
ORDER BY v DESC
LIMIT 10
```

```text
┌─path──────────────────┬────────v─┐
│ -                     │ 89650862 │
│ Angelsberg            │ 19165753 │
│ Ana_Sayfa             │  6368793 │
│ Academy_Awards        │  4901276 │
│ Accueil_(homonymie)   │  3805097 │
│ Adolf_Hitler          │  2549835 │
│ 2015_in_spaceflight   │  2077164 │
│ Albert_Einstein       │  1619320 │
│ 19_Kids_and_Counting  │  1430968 │
│ 2015_Nepal_earthquake │  1406422 │
└───────────────────────┴──────────┘

10 行がセットされました。経過時間: 2.285 sec。231.41百万行、9.22 GB を処理しました (101.26百万行/秒、4.03 GB/秒)
ピークメモリ使用量: 1.50 GiB。
```

### マテリアライズドビューの作成 {#time-series-create-materialized-view}

次のマテリアライズドビューを作成できます。

```sql
CREATE TABLE wikistat_top
(
    `path` String,
    `month` Date,
    hits UInt64
)
ENGINE = SummingMergeTree
ORDER BY (month, hits);
```

```sql
CREATE MATERIALIZED VIEW wikistat_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

### 宛先テーブルのバックフィル {#time-series-backfill-destination-table}

この宛先テーブルは、`wikistat` テーブルに新しいレコードが挿入されるときにのみ populated されるため、[バックフィル](/data-modeling/backfilling)を行う必要があります。

これを行う最も簡単な方法は、[`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select) ステートメントを使用して、マテリアライズドビューのターゲットテーブルに直接挿入することであり、ビューの SELECT クエリ (変換) を使用することです。

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

生データセットのカーディナリティによっては (1億行を持つ！)、この方法はメモリ集約的になる場合があります。あるいは、最小限のメモリを必要とするバリアントを使用できます。

* Null テーブルエンジンを持つ一時テーブルを作成
* 通常使用されるマテリアライズドビューのコピーをその一時テーブルに接続
* INSERT INTO SELECT クエリを使用して、生データセットからその一時テーブルにすべてのデータをコピー
* 一時テーブルと一時マテリアライズドビューを削除

そのアプローチでは、生データセットの行が一時テーブルにブロック単位でコピーされ（これらの行は保存されません）、各ブロックの行に対して部分的な状態が計算され、ターゲットテーブルに書き込まれ、これらの状態がバックグラウンドで増分的にマージされます。

```sql
CREATE TABLE wikistat_backfill
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = Null;
```

次に、`wikistat_backfill` から読み取り、`wikistat_top` に書き込むマテリアライズドビューを作成します。

```sql
CREATE MATERIALIZED VIEW wikistat_backfill_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat_backfill
GROUP BY path, month;
```

そして最後に、初期の `wikistat` テーブルから `wikistat_backfill` を populate します。

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

そのクエリが完了すると、バックフィルテーブルとマテリアライズドビューを削除できます。

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

これで、元のテーブルの代わりにマテリアライズドビューをクエリできます。

```sql
SELECT path, sum(hits) AS hits
FROM wikistat_top
WHERE month = '2015-05-01'
GROUP BY ALL
ORDER BY hits DESC
LIMIT 10;
```

```text
┌─path──────────────────┬─────hits─┐
│ -                     │ 89543168 │
│ Angelsberg            │  7047863 │
│ Ana_Sayfa             │  5923985 │
│ Academy_Awards        │  4497264 │
│ Accueil_(homonymie)   │  2522074 │
│ 2015_in_spaceflight   │  2050098 │
│ Adolf_Hitler          │  1559520 │
│ 19_Kids_and_Counting  │   813275 │
│ Andrzej_Duda          │   796156 │
│ 2015_Nepal_earthquake │   726327 │
└───────────────────────┴──────────┘

10 行がセットされました。経過時間: 0.004 sec。
```

ここでのパフォーマンス改善は劇的です。以前はこのクエリの結果を計算するのに 2 秒以上かかっていましたが、現在はわずか 4 ミリ秒です。
