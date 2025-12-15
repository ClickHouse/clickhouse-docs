---
title: 'Postgres ClickPipe における並列スナップショット'
description: 'このドキュメントでは、Postgres ClickPipe における並列スナップショットについて説明します'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: '並列スナップショットの仕組み'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'インジェスト', 'リアルタイム同期']
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

このドキュメントでは、Postgres ClickPipe におけるスナップショット／初期ロードの並列化の仕組みを説明し、それを制御するために使用できるスナップショットパラメータについて解説します。


## 概要 {#overview-pg-snapshot}

初期ロードは CDC ClickPipe の最初のフェーズであり、ClickPipe がソースデータベース内のテーブルの履歴データを ClickHouse に同期してから CDC を開始します。多くの場合、開発者は pg_dump や pg_restore を使ったり、ソースデータベースから読み込んで ClickHouse に書き込む処理を単一スレッドで実行します。
しかし、Postgres 向け ClickPipe はこの処理を並列化できるため、初期ロードを大幅に高速化できます。

### Postgres の CTID カラム {#ctid-pg-snapshot}

Postgres では、テーブル内の各行には CTID と呼ばれる一意の識別子があります。これはデフォルトではユーザーからは見えないシステムカラムですが、テーブル内の行を一意に識別するために使用できます。CTID はブロック番号とブロック内のオフセットの組み合わせで構成されており、これにより行への効率的なアクセスが可能になります。

### 論理パーティショニング {#logical-partitioning-pg-snapshot}
Postgres 向け ClickPipe は CTID カラムを使用してソーステーブルを論理的にパーティション分割します。最初にソーステーブルに対して COUNT(*) を実行し、その後ウィンドウ関数を用いたパーティショニングクエリを実行して、各パーティションの CTID 範囲を取得します。これにより ClickPipe は、各パーティションを別々のスレッドで処理しながら、ソーステーブルを並列で読み取ることができます。

以下の設定について説明します:

<Image img={snapshot_params} alt="スナップショットパラメータ" size="md"/>

#### スナップショットのパーティションあたりの行数 {#numrows-pg-snapshot}

この設定は、1 つのパーティションを構成する行数を制御します。ClickPipe はソーステーブルをこのサイズのチャンクで読み取り、チャンクは設定された初期ロードの並列度に基づいて並列処理されます。デフォルト値はパーティションあたり 100,000 行です。

#### 初期ロードの並列度 {#parallelism-pg-snapshot}

この設定は、同時に処理されるパーティション数を制御します。デフォルト値は 4 で、ClickPipe はソーステーブルの 4 つのパーティションを並列に読み取ることを意味します。初期ロードを高速化するためにこの値を増やすこともできますが、ソースデータベースに過負荷をかけないよう、ソースインスタンスのスペックに応じて妥当な値に保つことを推奨します。ClickPipe はソーステーブルのサイズとパーティションあたりの行数に基づいて、パーティション数を自動的に調整します。

#### 並列に処理するテーブル数（スナップショット） {#tables-parallel-pg-snapshot}

並列スナップショットそのものとはあまり関係ありませんが、この設定は初期ロード中に並列処理されるテーブル数を制御します。デフォルト値は 1 です。この値はパーティションの並列度にさらに乗算される点に注意してください。たとえば、4 つのパーティションと 2 つのテーブルがある場合、ClickPipe は 8 個のパーティションを並列に読み取ります。

### Postgres での並列スナップショットの監視 {#monitoring-parallel-pg-snapshot}

pg_stat_activity を確認することで、並列スナップショットの動作を可視化できます。ClickPipe はソースデータベースに対して複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。異なる CTID 範囲を持つ FETCH クエリが表示されている場合は、ClickPipe がソーステーブルを読み取っていることを意味します。このビューには COUNT(*) やパーティショニングクエリも表示されます。

### 制限事項 {#limitations-parallel-pg-snapshot}

- スナップショットパラメータはパイプ作成後には編集できません。変更したい場合は、新しい ClickPipe を作成する必要があります。
- 既存の ClickPipe にテーブルを追加する場合、スナップショットパラメータを変更することはできません。ClickPipe は新しいテーブルに対しても既存のパラメータを使用します。
- パーティションキーのカラムには `NULL` を含めないでください。`NULL` はパーティショニングロジックによってスキップされます。