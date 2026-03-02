---
title: 'MySQL ClickPipe における並列スナップショット'
description: 'MySQL ClickPipe における並列スナップショットを解説するドキュメント'
slug: /integrations/clickpipes/mysql/parallel_initial_load
sidebar_label: '並列スナップショットの仕組み'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC（変更データキャプチャ）', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

このドキュメントでは、MySQL ClickPipe におけるスナップショットおよび初期ロードの並列実行の仕組みと、それを制御するために使用できるスナップショットパラメータについて説明します。


## 概要 \{#overview-mysql-snapshot\}

Initial load（初期ロード）は CDC ClickPipe の最初のフェーズであり、ClickPipe がソースデータベース内のテーブルの履歴データを ClickHouse に同期し、その後に CDC を開始するまでの処理を指します。多くの場合、この処理はシングルスレッドで実行されます。
しかし、MySQL ClickPipe ではこのプロセスを並列化できるため、初期ロードを大幅に高速化できます。

### パーティションキー・カラム \{#key-mysql-snapshot\}

この機能フラグを有効化すると、ClickPipe のテーブルピッカー（ClickPipe の作成時と編集時の両方）に、次の設定が表示されます：

<Image img={partition_key} alt="パーティションキー・カラム" size="md"/>

MySQL ClickPipe は、ソーステーブル上のあるカラムを使用してソーステーブルを論理的にパーティション分割します。このカラムを **パーティションキー・カラム** と呼びます。これはソーステーブルを複数のパーティションに分割するために使用され、ClickPipe によってそれらのパーティションが並列に処理されます。

:::warning
パーティションキー・カラムは、十分なパフォーマンス向上を得るために、ソーステーブルで索引が作成されている必要があります。これは MySQL で `SHOW INDEX FROM <table_name>` を実行することで確認できます。
:::

### 論理パーティショニング \{#logical-partitioning-mysql-snapshot\}

以下の設定について説明します。

<Image img={snapshot_params} alt="スナップショットのパラメータ" size="md"/>

#### パーティションごとのスナップショット行数 \{#numrows-mysql-snapshot\}

この設定は、1 つのパーティションを構成する行数を制御します。ClickPipe は、ソーステーブルをこのサイズの chunk ごとに読み取り、chunk は設定された初期ロードの並列度に基づいて並列処理されます。デフォルト値は、パーティションあたり 100,000 行です。

#### 初期ロードの並列度 \{#parallelism-mysql-snapshot\}

この設定は、同時に処理されるパーティション数を制御します。デフォルト値は 4 です。これは、ClickPipe がソーステーブルの 4 つのパーティションを並列に読み取ることを意味します。初期ロードを高速化するためにこの値を増やすことは可能ですが、ソースインスタンスのスペックに応じて妥当な値に保ち、ソースデータベースに過度の負荷がかかることを避けることを推奨します。ClickPipe は、ソーステーブルのサイズとパーティションごとの行数に基づいて、パーティション数を自動的に調整します。

#### 並列でスナップショットを取得するテーブル数 \{#tables-parallel-mysql-snapshot\}

厳密には並列スナップショットそのものには関係しませんが、この設定は初期ロード時に並列処理されるテーブル数を制御します。デフォルト値は 1 です。これはパーティションの並列度にさらに上乗せされる点に注意してください。つまり、4 つのパーティションと 2 つのテーブルがある場合、ClickPipe は 8 個のパーティションを並列に読み取ります。

### MySQL での並列スナップショットの監視 \{#monitoring-parallel-mysql-snapshot\}

MySQL で **SHOW processlist** を実行すると、並列スナップショットの実行状況を確認できます。ClickPipe はソースデータベースに対して複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。範囲の異なる **SELECT** クエリが表示されている場合は、ClickPipe がソーステーブルを読み取っていることを意味します。ここでは、COUNT(*) やパーティション用のクエリも確認できます。

### 制限事項 \{#limitations-parallel-mysql-snapshot\}

- スナップショットのパラメータは、パイプ作成後に変更できません。変更したい場合は、新しい ClickPipe を作成する必要があります。
- 既存の ClickPipe にテーブルを追加する際も、スナップショットのパラメータを変更することはできません。ClickPipe は、新しく追加されたテーブルに対して既存のパラメータを使用します。
- パーティションキーのカラムには `NULL` を含めないでください。`NULL` はパーティション処理のロジックによってスキップされます。