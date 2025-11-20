---
title: 'MySQL ClickPipe における並列スナップショット'
description: 'MySQL ClickPipe における並列スナップショットについて説明するドキュメント'
slug: /integrations/clickpipes/mysql/parallel_initial_load
sidebar_label: '並列スナップショットの仕組み'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

このドキュメントでは、MySQL ClickPipe におけるスナップショット／初期ロードの並列実行の仕組みを説明し、その制御に使用できるスナップショットパラメーターについて解説します。


## 概要 {#overview-mysql-snapshot}

初期ロードはCDC ClickPipeの最初のフェーズで、ClickPipeがソースデータベースのテーブルの履歴データをClickHouseに同期してからCDCを開始します。多くの場合、開発者はこれをシングルスレッド方式で実行します。
しかし、MySQL ClickPipeはこのプロセスを並列化でき、初期ロードを大幅に高速化できます。

### パーティションキー列 {#key-mysql-snapshot}

機能フラグを有効にすると、ClickPipeテーブルピッカー(ClickPipeの作成時と編集時の両方)に以下の設定が表示されます:

<Image img={partition_key} alt='パーティションキー列' size='md' />

MySQL ClickPipeは、ソーステーブルの列を使用してソーステーブルを論理的にパーティション化します。この列は**パーティションキー列**と呼ばれます。ソーステーブルをパーティションに分割するために使用され、その後ClickPipeによって並列処理されます。

:::warning
パーティションキー列は、優れたパフォーマンス向上を実現するために、ソーステーブルでインデックス化されている必要があります。これは、MySQLで`SHOW INDEX FROM <table_name>`を実行することで確認できます。
:::

### 論理パーティショニング {#logical-partitioning-mysql-snapshot}

以下の設定について説明します:

<Image img={snapshot_params} alt='スナップショットパラメータ' size='md' />

#### パーティションあたりのスナップショット行数 {#numrows-mysql-snapshot}

この設定は、パーティションを構成する行数を制御します。ClickPipeは、このサイズのチャンクでソーステーブルを読み取り、チャンクは設定された初期ロード並列度に基づいて並列処理されます。デフォルト値はパーティションあたり100,000行です。

#### 初期ロード並列度 {#parallelism-mysql-snapshot}

この設定は、並列処理されるパーティション数を制御します。デフォルト値は4で、ClickPipeがソーステーブルの4つのパーティションを並列に読み取ることを意味します。初期ロードを高速化するために増やすことができますが、ソースデータベースに過負荷をかけないように、ソースインスタンスの仕様に応じて適切な値に保つことを推奨します。ClickPipeは、ソーステーブルのサイズとパーティションあたりの行数に基づいて、パーティション数を自動的に調整します。

#### 並列スナップショットテーブル数 {#tables-parallel-mysql-snapshot}

並列スナップショットとは直接関係ありませんが、この設定は初期ロード中に並列処理されるテーブル数を制御します。デフォルト値は1です。これはパーティションの並列度に加えて適用されるため、4つのパーティションと2つのテーブルがある場合、ClickPipeは合計8つのパーティションを並列に読み取ります。

### MySQLでの並列スナップショットの監視 {#monitoring-parallel-mysql-snapshot}

MySQLで**SHOW processlist**を実行すると、並列スナップショットの動作を確認できます。ClickPipeはソースデータベースへの複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。異なる範囲の**SELECT**クエリが表示される場合、ClickPipeがソーステーブルを読み取っていることを意味します。ここでCOUNT(\*)とパーティショニングクエリも確認できます。

### 制限事項 {#limitations-parallel-mysql-snapshot}

- スナップショットパラメータは、パイプ作成後に編集できません。変更する場合は、新しいClickPipeを作成する必要があります。
- 既存のClickPipeにテーブルを追加する場合、スナップショットパラメータを変更できません。ClickPipeは新しいテーブルに対して既存のパラメータを使用します。
- パーティションキー列には`NULL`を含めないでください。パーティショニングロジックによってスキップされます。
