---
title: 'Postgres ClickPipe における並列スナップショット'
description: 'Postgres ClickPipe における並列スナップショットについて説明するドキュメント'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: '並列スナップショットの仕組み'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC（変更データキャプチャ）', 'インジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

このドキュメントでは、Postgres ClickPipe における並列スナップショット／初期ロードがどのように動作するかを説明し、その制御に使用できるスナップショットパラメータについて解説します。


## 概要 \{#overview-pg-snapshot\}

初回ロードは CDC ClickPipe の最初のフェーズであり、ClickPipe がソースデータベース内のテーブルの履歴データを ClickHouse に同期してから CDC を開始するまでの処理を指します。多くの場合、開発者は `pg_dump` や `pg_restore` を使用したり、ソースデータベースから読み出して ClickHouse に書き込む処理を 1 本のスレッドだけで実行したりと、単一スレッドの方法でこれを行っています。
しかし、Postgres ClickPipe ではこの処理を並列化できるため、初回ロードを大幅に高速化できます。

### Postgres における CTID カラム \{#ctid-pg-snapshot\}

Postgres では、テーブル内のすべての行は CTID と呼ばれる一意の識別子を持ちます。これはデフォルトでは表示されないシステムカラムですが、テーブル内の行を一意に識別するために使用できます。CTID はブロック番号と、そのブロック内でのオフセットの組み合わせで構成されており、行へ効率的にアクセスすることを可能にします。

### 論理パーティショニング \{#logical-partitioning-pg-snapshot\}

Postgres 向け ClickPipe は、ソーステーブルを論理的にパーティション分割するために CTID カラムを使用します。まずソーステーブルに対して COUNT(*) を実行し、その後、ウィンドウ関数を用いたパーティション分割クエリを実行して、各パーティションの CTID 範囲を取得することでパーティションを決定します。これにより、ClickPipe はソーステーブルを並列に読み取り、各パーティションを個別のスレッドで処理できます。

次に、以下の設定について説明します。

<Image img={snapshot_params} alt="スナップショットパラメータ" size="md"/>

#### Snapshot number of rows per partition \{#numrows-pg-snapshot\}

この設定では、1 つのパーティションを構成する行数を制御します。ClickPipe はソーステーブルをこのサイズの chunk 単位で読み取り、各 chunk は設定された初期ロードの並列度に基づいて並列に処理されます。デフォルトでは、パーティションあたり 100,000 行です。

#### 初期ロードの並列度 \{#parallelism-pg-snapshot\}

この設定では、いくつのパーティションを並列に処理するかを制御します。既定値は 4 であり、これは ClickPipe がソーステーブルの 4 個のパーティションを並列に読み取ることを意味します。初期ロードを高速化するためにこの値を増やすこともできますが、ソースインスタンスのスペックに応じて妥当な値に保ち、ソースデータベースに過負荷がかからないようにすることを推奨します。ClickPipe は、ソーステーブルのサイズとパーティションあたりの行数に基づいて、処理するパーティション数を自動的に調整します。

#### スナップショットで並列処理するテーブル数 \{#tables-parallel-pg-snapshot\}

厳密には並列スナップショット自体の設定ではありませんが、この設定は初回ロード時にいくつのテーブルを並列で処理するかを制御します。デフォルト値は 1 です。これはパーティションの並列度に「上乗せ」される点に注意してください。そのため、パーティションが 4 個、テーブルが 2 個ある場合、ClickPipe は 8 個のパーティションを並列で読み取ります。

### Postgres における並列スナップショットの監視 \{#monitoring-parallel-pg-snapshot\}

**pg_stat_activity** を確認すると、並列スナップショットの動作状況を観察できます。ClickPipe はソースデータベースへの複数の接続を確立し、ソーステーブルの異なるパーティションをそれぞれ読み取ります。異なる CTID 範囲を持つ **FETCH** クエリが表示されている場合は、ClickPipe がソーステーブルを読み取っていることを意味します。また、このビューでは COUNT(*) やパーティショニング用のクエリも確認できます。

### 制限事項 \{#limitations-parallel-pg-snapshot\}

- スナップショットパラメータは ClickPipe を作成した後は編集できません。変更したい場合は、新しい ClickPipe を作成する必要があります。
- 既存の ClickPipe にテーブルを追加する場合も、スナップショットパラメータは変更できません。ClickPipe は、新しいテーブルに対しても既存のパラメータを使用します。
- パーティションキーのカラムには `NULL` を含めないでください。`NULL` はパーティション処理ロジックによってスキップされます。