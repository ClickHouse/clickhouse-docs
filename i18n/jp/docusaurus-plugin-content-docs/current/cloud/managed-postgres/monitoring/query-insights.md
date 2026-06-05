---
slug: /cloud/managed-postgres/monitoring/query-insights
sidebar_label: 'クエリインサイト'
title: 'Postgres クエリインサイト'
description: 'Managed Postgres のステートメント単位テレメトリー。データベースで実行されるすべてのクエリパターンを影響度順に表示し、それぞれが遅い原因を示す診断カウンターを確認できます'
keywords: ['Managed Postgres', 'クエリインサイト', 'pg_stat_ch', '遅いクエリ', 'p99レイテンシ', 'クエリパターン', 'Postgresパフォーマンス', '一時ブロック', '並列ワーカー', 'wal']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import queryInsightsOverview from '@site/static/images/managed-postgres/monitoring/query-insights-overview.png';
import queryInsightsPatterns from '@site/static/images/managed-postgres/monitoring/query-insights-patterns.png';
import queryInsightsRecentQueries from '@site/static/images/managed-postgres/monitoring/query-insights-recent-queries.png';
import queryInsightsDetailAggregate from '@site/static/images/managed-postgres/monitoring/query-insights-detail-aggregate.png';
import queryInsightsDetailRecent from '@site/static/images/managed-postgres/monitoring/query-insights-detail-recent.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.query-insights-beta" />

クエリインサイトは、[Managed Postgres](/cloud/managed-postgres) インスタンスからステートメント単位のテレメトリーを収集し、すべてのクエリ
パターンを影響度順に順位付けするため、クラウドコンソールを離れることなく、&quot;p99 がじわじわ悪化している&quot; から &quot;このパターンは
ディスクにスピルしている&quot; まで、原因をすばやく突き止められます。

このデータは、[`pg_stat_ch`](https://github.com/clickhouse/pg_stat_ch) から取得されます。これは、ステートメント単位のカウンターを
ClickHouse Cloud にストリーミングするオープンソースの Postgres 拡張機能です。テレメトリーはデータベースの外に出る前に
Postgres 内で正規化されます。つまり、リテラルは取り除かれてプレースホルダーに置き換えられるため、
クエリした正確な値がテレメトリーストリームに含まれることはありません。

## クエリインサイトを開く \{#open\}

Cloud Console で Managed Postgres インスタンスを開き、左側のサイドバーで
**Query insights** をクリックします。ページは、実際の利用順に、次の 4 つの
領域に分かれています。

* データベースの健全性を 1 画面で確認できる **Overview**。
* データベースで実行されたすべてのクエリパターンを、疑わしい観点で並べ替えて順位付けする **Slow patterns** テーブル。
* 個々の実行を新しい順に一覧表示する **Recent queries** パネル。
* 1 つのパターンに関するすべてのカウンターを集計する **Detail flyout**。

上部の **Time period** セレクターを使用して、直近 15
分、1 時間、1 日、1 週間、1 か月に切り替えます。集計バケットのサイズは
自動的に調整されます。直近 15 分または 1 時間では 1 分バケット、
直近 1 日では 5 分バケット、直近 1 週間または 1 か月では 1 時間バケットとなるため、
チャートの応答性を維持できます。

## 概要 \{#overview\}

概要は、6つのパネルを並べた 3×2 のグリッドです。

| パネル                          | 表示内容                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| **Queries / sec**            | 選択した期間におけるクエリ量を、1 秒あたりのレートに正規化して表示します。                                  |
| **Query latency**            | 平均、p50、p95、p99 を 1 つのグラフに表示し、テールレイテンシが中央値から乖離するタイミングを確認できます。            |
| **Operations breakdown**     | ワークロードが実際にどの程度 `SELECT`、`INSERT`、`UPDATE`、その他の操作で構成されているかを示すドーナツチャートです。 |
| **Rows returned / affected** | その期間中にワークロードが処理した行の総数です。                                                |
| **Buffer hit ratio**         | 共有ブロックのヒット数と読み取り数の比率を示すドーナツチャートで、凡例には合計 CPU 時間も表示されます。                  |
| **Errors**                   | エラーの総数を時系列で表示します。                                                       |

この 1 画面で、データベースが健全かどうかを判断できます。健全なインスタンスは
一定の典型的な傾向を示します。つまり、バッファヒット率が 90% 台後半で、クエリ量は
アプリケーショントラフィックに合わせて増減し、エラー率は横ばいまたはゼロのままで、
各パーセンタイルのレイテンシも互いに近い動きをします。

<Image img={queryInsightsOverview} alt="6つの統計カード（1秒あたりのクエリ数、クエリレイテンシのパーセンタイル、操作内訳のドーナツ、返された行数のエリアチャート、95.2パーセントのバッファヒット率ドーナツ、エラーのカラムチャート）を表示したクエリインサイトの概要" size="lg" border />

## 低速パターン \{#slow-patterns\}

概要に問題の兆候が見られる場合は、パターンテーブルから調査を開始します。正規化されたクエリパターンごとに1行が割り当てられ、
リテラルは取り除かれるため、同じステートメントの実行は
同じ行にまとめられます。

<Image img={queryInsightsPatterns} alt="Database、User、Operation、Calls、Errors、Avg latency、P95、Max latency、Total runtime、Rows returned、Cache hit のカラムを含み、正規化されたクエリごとに1行を表示する低速クエリパターンのテーブル" size="lg" border />

### 怪しいものから順に並べ替える \{#sort\}

このテーブルは既定で **合計実行時間** の降順に並んでいます。この
並べ替えでは、通常、先頭のパターンが「最もコストがかかっているのは
何か？」への答えになります。ただし、単体で最も遅いパターンとは
限りません。1日に800万回実行されて12ミリ秒かかるクエリのほうが、
3秒かかった1回のクエリより重要になることがあります。

それぞれの並べ替えは、異なる観点を与えます。

* **合計実行時間** — データベースが最も多くの実時間を費やした箇所。
* **CPU時間** — コンピュート負荷の高いパターン。
* **呼び出し回数** — 高頻度のパターン。
* **エラー** — 繰り返し発生する失敗。
* **平均 / P50 / P95 / P99 / 最大遅延時間** — パーセンタイル別の外れ値。
* **返された行数**、**読み取ったブロック数**、**ヒットしたブロック数**、**WALバイト数** —
  エンジン、キャッシュ、または先行書き込みログを通過したデータ量が
  最も多いパターン。

追加のカラムを表示するには、**Columns** ボタンをクリックして切り替えます。
パターンテーブルでは合計19個のカラムが表示され、パーセンタイルの
内訳、キャッシュヒット率、パターンごとのCPU時間などが含まれます。

### テーブルを絞り込む \{#filters\}

調査中のワークロードのどの部分を見るかに応じて、テーブルを絞り込みます。

* **データベース**
* **ユーザー**
* **操作** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, …)
* **アプリケーション** — 接続文字列の `application_name`

「`sales` DB に対して orders サービスが何をしているかだけを表示」
といった条件は、2 つのドロップダウンで指定できます。フィルター値は、そのインスタンスで実際に実行された内容に基づいて自動的に補完されます。

## 最近のクエリ \{#recent-queries\}

パターンテーブルの下にある **Recent Queries** パネルには、個々の実行が
新しいものから順に表示されます。実行された
ステートメントごとに1行が割り当てられ、パターンごとに1行ではありません。集計ではなく生のイベント
ストリームを確認したい場合に使用します。たとえば、修正が反映されたことを確認したり、
エラーが発生した正確な瞬間を特定したりするのに役立ちます。

<Image img={queryInsightsRecentQueries} alt="Database、User、Operation、Application のフィルタードロップダウンと、Time、Operation、Query、Duration、Rows、Database、User、Blks read のカラムを備えた Recent Queries テーブル" size="lg" border />

デフォルトのカラムは Time、Operation、Query、Duration、Rows、
Database、User、Blks read です。**Columns** ピッカーを開くと、
Application、Blks hit、CPU user、CPU sys、PID を追加できます。このテーブルでは、
パターンテーブルと同じ Database、User、Operation、Application のフィルターを使用でき、
Time、Duration、Rows、Blks read、CPU time で
並べ替えられます。

任意の行をクリックすると、パターンテーブルと同じ詳細フライアウトが開き、
その単一実行のパターンに絞り込んだ表示になります。

## 詳細フライアウト \{#detail\}

patterns または recent queries テーブル内の任意の行をクリックすると、右側に **クエリ
詳細** フライアウトが開きます。このフライアウトでは、選択した時間範囲における
そのパターンのすべての実行を集約し、なぜ遅いのかを示す
カウンターを表示します。

フライアウトは、5 つのセクションで構成された単一のスクロールレイアウトです。

* **クエリパターン** — リテラルを `$1`、
  `$2`、… に置き換えた正規化 SQL と、クリップボードにコピーするボタン。
* **集計リソース使用状況** — 合計
  呼び出し数、平均/P95/P99/最大レイテンシー、合計実行時間、返された行数、キャッシュ
  ヒット率、読み取り blocks 数、ヒットした blocks 数、CPU 時間、WAL バイト数、error を含む、13 個の統計カードのグリッド。
* **クエリコンテキスト** — このパターンの発生元であるデータベース、ユーザー、操作、アプリケーション。
* **注目すべき実行** — error、異常に遅い実行、
  および結果セットが大きい実行を、完全な recent list の前に表示します。
* **最近の実行** — 同じパターンの個々の実行で、
  実行ごとのカウンターを表示します。

<Image img={queryInsightsDetailAggregate} alt="クエリパターンのコードブロックと、合計呼び出し数、レイテンシーのパーセンタイル、合計実行時間、返された行数、キャッシュヒット率、読み取り blocks 数、ヒットした blocks 数、CPU 時間、WAL バイト数、error を含む 13 個の統計カードを備えた集計リソース使用状況グリッドを表示するクエリ詳細フライアウト" size="md" border />

<Image img={queryInsightsDetailRecent} alt="続きのクエリ詳細フライアウト。データベース、ユーザー、操作、アプリケーションを含むクエリコンテキストセクションと、タイムスタンプ、OK ステータス、サーバーロール、ホスト ID、および duration、行数、キャッシュヒット、CPU、shared blocks read、shared blocks hit の実行ごとのカウンターを含む最近の実行カードを表示" size="md" border />

### 実行ごとのカウンター \{#counters\}

最近の実行を展開すると、どこに
時間がかかったのかを示すカウンターを確認できます。

* **共有ブロック** — read と hit は常に表示され、written と dirtied
  はゼロ以外の場合に表示されます。
* **ローカルおよび一時ブロック操作** — 一時ブロック操作がゼロ以外の場合、ソートまたは
  ハッシュがディスクにスピルしたことを意味します。
* **読み取り / 書き込み時間** — CPU 時間とは別に表示される I/O 時間です。
* **CPU 時間** — user と system が個別に表示されます。
* **並列ワーカー** — 計画された数と実際に起動された数です。
* **JIT** — JIT コンパイルの合計時間と関数数です。
* **WAL** — バイト数とレコード数です。

遅いパターンの診断に必要な情報はすべて、1 つの
画面にまとまっています。

## クエリインサイト API \{#api\}

同じテレメトリーは、
[ClickHouse Cloud OpenAPI](/cloud/managed-postgres/openapi#query-insights)を通じて
プログラムからも利用できます。
[低速パターン](#slow-patterns) テーブルは
[list slow query patterns](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternsGetList)
エンドポイントに対応し、[詳細フライアウト](#detail) は
[get slow query pattern](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternGet)
エンドポイントに対応しています。このエンドポイントは、1 つのパターンの集計メトリクスと
その最近の実行結果を返します。

## 仕組み \{#how-it-works\}

### ネットワークに出る前に、Postgres で正規化 \{#how-normalized\}

`pg_stat_ch` は parse-analyze フェーズにフックして各リテラルを
プレースホルダー (`$1`、`$2`、…) に置き換え、その結果のパターンを
`queryid` をキーにしたバックエンドごとの LRU にキャッシュします。エグゼキュータが
ステートメントを完了すると、そのキャッシュされたパターンがイベントに関連付けられます。値を含む
正確なステートメントがデータベースの外に出ることはありません。

### データベースの処理を妨げない \{#how-overhead\}

プロデューサーが追加するオーバーヘッドは、ステートメントごとにおよそ 3% です。enqueue パス
では、共有メモリーのリングバッファに対して非ブロッキングの try-lock を使用します。負荷が高まると、
拡張機能は Postgres にバックプレッシャーをかける代わりに、カウンターを増やしてイベントを破棄します。

### 集計ではなく生のイベント \{#how-raw-events\}

`pg_stat_ch` は、サンプリングを前提として、実行された各ステートメント (トップレベルおよびネストされたもの) ごとに 1 件の生イベントを出力します。UI 上のすべてのパーセンタイル、ランキング、内訳は、いずれも同じイベントストリームに対する ClickHouse クエリです。

### お客様が利用しているものと同じエンジン \{#how-engine\}

Insights のバックエンドには [ClickHouse Cloud](/cloud/overview) を使用しています。
高負荷な Postgres インスタンスから得られるクエリ単位のテレメトリーは、1 日あたり数百万行に達します。
列指向の圧縮により、実行ごとの詳細を数か月分保持してもコストを低く抑えられ、
さらに数十億行に対する集計もサブ秒で実行できるため、
1 週間単位や 1 か月単位で絞り込んでも UI の応答性を維持できます。

### オープンソース \{#how-open-source\}

`pg_stat_ch` は Apache 2.0 ライセンスで提供されています。任意の Postgres に対して実行し、任意の
ClickHouse に送信できます。ソースコードと issue は
[github.com/clickhouse/pg&#95;stat&#95;ch](https://github.com/clickhouse/pg_stat_ch) にあります。

## 関連ページ \{#related\}

* [監視ダッシュボード](/cloud/managed-postgres/monitoring/dashboard) — 組み込みのリソースとアクティビティのチャート
* [Prometheus エンドポイント](/cloud/managed-postgres/monitoring/prometheus) — ホストレベルのメトリクスを独自のオブザーバビリティスタックにスクレイプして取り込む
* [Managed Postgres OpenAPI](/cloud/managed-postgres/openapi#query-insights) — 低速パターンと最近の実行をプログラムからクエリする
* [拡張機能](/cloud/managed-postgres/extensions) — Managed Postgres インスタンスで利用できる拡張機能
* [`pg_stat_ch` on GitHub](https://github.com/clickhouse/pg_stat_ch) — クエリインサイト を支えるオープンソースの拡張機能