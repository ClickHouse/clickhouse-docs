---
title: 'Postgres ClickPipe における並列スナップショット'
description: 'Postgres ClickPipe における並列スナップショットを解説するドキュメント'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: '並列スナップショットの仕組み'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

このドキュメントでは、Postgres ClickPipe における並列スナップショット／初期ロードがどのように動作するかを説明し、その動作を制御するために使用できるスナップショットパラメータについて解説します。


## 概要 {#overview-pg-snapshot}

初期ロードはCDC ClickPipeの最初のフェーズで、ClickPipeがソースデータベース内のテーブルの履歴データをClickHouseに同期してから、CDCを開始します。多くの場合、開発者はpg_dumpやpg_restoreを使用したり、単一のスレッドでソースデータベースから読み取りClickHouseに書き込むなど、シングルスレッド方式でこれを行います。
しかし、Postgres ClickPipeはこのプロセスを並列化でき、初期ロードを大幅に高速化できます。

### PostgresのCTIDカラム {#ctid-pg-snapshot}

Postgresでは、テーブル内のすべての行にCTIDと呼ばれる一意の識別子があります。これはデフォルトではユーザーに表示されないシステムカラムですが、テーブル内の行を一意に識別するために使用できます。CTIDはブロック番号とブロック内のオフセットの組み合わせで、行への効率的なアクセスを可能にします。

### 論理パーティショニング {#logical-partitioning-pg-snapshot}

Postgres ClickPipeはCTIDカラムを使用してソーステーブルを論理的にパーティション化します。まずソーステーブルに対してCOUNT(\*)を実行し、次にウィンドウ関数パーティショニングクエリを実行して各パーティションのCTID範囲を取得することで、パーティションを取得します。これにより、ClickPipeはソーステーブルを並列に読み取ることができ、各パーティションは個別のスレッドで処理されます。

以下の設定について説明します:

<Image img={snapshot_params} alt='スナップショットパラメータ' size='md' />

#### パーティションあたりのスナップショット行数 {#numrows-pg-snapshot}

この設定は、1つのパーティションを構成する行数を制御します。ClickPipeはこのサイズのチャンクでソーステーブルを読み取り、チャンクは設定された初期ロード並列度に基づいて並列処理されます。デフォルト値はパーティションあたり100,000行です。

#### 初期ロード並列度 {#parallelism-pg-snapshot}

この設定は、並列処理されるパーティション数を制御します。デフォルト値は4で、これはClickPipeがソーステーブルの4つのパーティションを並列に読み取ることを意味します。初期ロードを高速化するために増やすことができますが、ソースデータベースに過負荷をかけないよう、ソースインスタンスの仕様に応じて適切な値に保つことを推奨します。ClickPipeは、ソーステーブルのサイズとパーティションあたりの行数に基づいて、パーティション数を自動的に調整します。

#### 並列処理するスナップショットテーブル数 {#tables-parallel-pg-snapshot}

並列スナップショットとは直接関係ありませんが、この設定は初期ロード中に並列処理されるテーブル数を制御します。デフォルト値は1です。これはパーティションの並列度に加えて適用されるため、4つのパーティションと2つのテーブルがある場合、ClickPipeは合計8つのパーティションを並列に読み取ります。

### Postgresでの並列スナップショットの監視 {#monitoring-parallel-pg-snapshot}

**pg_stat_activity**を分析することで、並列スナップショットの動作を確認できます。ClickPipeはソースデータベースへの複数の接続を作成し、それぞれがソーステーブルの異なるパーティションを読み取ります。異なるCTID範囲を持つ**FETCH**クエリが表示される場合、ClickPipeがソーステーブルを読み取っていることを意味します。ここでCOUNT(\*)とパーティショニングクエリも確認できます。

### 制限事項 {#limitations-parallel-pg-snapshot}

- スナップショットパラメータはパイプ作成後に編集できません。変更したい場合は、新しいClickPipeを作成する必要があります。
- 既存のClickPipeにテーブルを追加する際、スナップショットパラメータを変更することはできません。ClickPipeは新しいテーブルに対して既存のパラメータを使用します。
- パーティションキーカラムには`NULL`を含めないでください。パーティショニングロジックによってスキップされます。
