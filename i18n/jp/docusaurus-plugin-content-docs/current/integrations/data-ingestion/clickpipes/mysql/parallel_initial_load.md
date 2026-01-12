---
title: 'MySQL ClickPipe における並列スナップショット'
description: 'MySQL ClickPipe における並列スナップショットについて説明するドキュメント'
slug: /integrations/clickpipes/mysql/parallel_initial_load
sidebar_label: '並列スナップショットの仕組み'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

このドキュメントでは、MySQL ClickPipe におけるスナップショット／初期ロードの並列実行がどのように動作するかを説明し、その並列実行を制御するために使用できるスナップショットパラメータについて解説します。

## 概要 {#overview-mysql-snapshot}

初回ロードは CDC ClickPipe の最初のフェーズであり、ClickPipe が CDC を開始する前に、ソースデータベース内のテーブルの履歴データを ClickHouse に同期します。多くの場合、開発者はこれを単一スレッドで行っています。
しかし、MySQL ClickPipe ではこの処理を並列化できるため、初回ロードを大幅に高速化できます。

### パーティションキー列 {#key-mysql-snapshot}

機能フラグを有効化すると、ClickPipe のテーブルピッカー（ClickPipe の作成時と編集時の両方）で、次の設定が表示されます：
<Image img={partition_key} alt="Partition key column" size="md"/>

MySQL ClickPipe は、ソーステーブル上のある列を使用してソーステーブルを論理的にパーティション分割します。この列を **パーティションキー列** と呼びます。これはソーステーブルを複数のパーティションに分割するために使用され、ClickPipe がこれらを並列処理できるようにします。

:::warning
パーティションキー列は、良好なパフォーマンス向上を得るためにソーステーブル上でインデックス化されている必要があります。これは、MySQL で `SHOW INDEX FROM <table_name>` を実行することで確認できます。
:::

### 論理パーティション分割 {#logical-partitioning-mysql-snapshot}

次の設定について説明します：

<Image img={snapshot_params} alt="Snapshot parameters" size="md"/>

#### スナップショット：パーティションあたりの行数 {#numrows-mysql-snapshot}

この設定は、何行を 1 つのパーティションと見なすかを制御します。ClickPipe はこのサイズのチャンク単位でソーステーブルを読み取り、初回ロードの並列度に基づいてチャンクを並列処理します。デフォルト値はパーティションあたり 100,000 行です。

#### 初回ロードの並列度 {#parallelism-mysql-snapshot}
この設定は、いくつのパーティションを並列処理するかを制御します。デフォルト値は 4 で、これは ClickPipe がソーステーブルの 4 つのパーティションを並列に読み取ることを意味します。初回ロードを高速化するために増やすことができますが、ソースデータベースに過負荷をかけないよう、ソースインスタンスのスペックに応じて妥当な値に保つことが推奨されます。ClickPipe は、ソーステーブルのサイズとパーティションあたりの行数に基づいてパーティション数を自動的に調整します。

#### スナップショット：並列処理するテーブル数 {#tables-parallel-mysql-snapshot}

これは並列スナップショット自体とはあまり関係がありませんが、初回ロード時にいくつのテーブルを並列処理するかを制御する設定です。デフォルト値は 1 です。これはパーティションの並列度にさらに上乗せされる点に注意してください。たとえば 4 つのパーティションと 2 つのテーブルがある場合、ClickPipe は 8 個のパーティションを並列に読み取ります。

### MySQL における並列スナップショットの監視 {#monitoring-parallel-mysql-snapshot}
MySQL で **SHOW processlist** を実行すると、並列スナップショットの動作を確認できます。ClickPipe はソースデータベースに対して複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。異なる範囲を持つ **SELECT** クエリが表示されていれば、ClickPipe がソーステーブルを読み取っていることを意味します。ここで COUNT(*) やパーティション分割用クエリも確認できます。

### 制限事項 {#limitations-parallel-mysql-snapshot}

- スナップショットパラメータはパイプ作成後に編集できません。変更したい場合は、新しい ClickPipe を作成する必要があります。
- 既存の ClickPipe にテーブルを追加する場合、スナップショットパラメータを変更することはできません。ClickPipe は新しいテーブルに対して既存のパラメータを使用します。
- パーティションキー列には `NULL` を含めるべきではありません。`NULL` はパーティション分割ロジックによってスキップされるためです。