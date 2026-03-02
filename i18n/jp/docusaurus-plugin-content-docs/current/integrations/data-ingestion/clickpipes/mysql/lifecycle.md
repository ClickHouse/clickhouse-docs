---
sidebar_label: 'MySQL ClickPipe のライフサイクル'
description: 'さまざまなパイプステータスとその意味'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'MySQL ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL ClickPipe のライフサイクル \{#lifecycle\}

本書では、MySQL ClickPipe のライフサイクルにおける各フェーズと取りうる各ステータス、その意味について説明します。なお、ここで説明する内容は MariaDB にも適用されます。

## プロビジョニング \{#provisioning\}

Create ClickPipe ボタンをクリックすると、ClickPipe は `Provisioning` 状態で作成されます。プロビジョニング処理では、このサービス向けに ClickPipes を実行するための基盤インフラストラクチャを立ち上げるとともに、パイプ用の初期メタデータをいくつか登録します。同一サービス内の ClickPipes のコンピュートリソースは共有されるため、2 本目の ClickPipe は、すでにインフラストラクチャが用意されている分、1 本目よりもはるかに短時間で作成されます。

## セットアップ \{#setup\}

パイプがプロビジョニングされると、`Setup` 状態に入ります。この状態では、宛先側の ClickHouse テーブルを作成します。また、ここでソース側テーブルのテーブル定義を取得して記録します。

## Snapshot \{#snapshot\}

セットアップが完了すると、（CDC 専用パイプでない限り）`Snapshot` 状態に入ります（CDC 専用パイプの場合は `Running` に遷移します）。`Snapshot`、`Initial Snapshot`、および（より一般的な）`Initial Load` という用語は同義として扱われます。この状態では、ソース側の MySQL テーブルのスナップショットを取得し、それらを ClickHouse にロードします。バイナリログの保持設定は、初回ロードに要する時間を考慮して設定する必要があります。初回ロードの詳細については、[並列初期ロードに関するドキュメント](./parallel_initial_load) を参照してください。パイプは、再同期（resync）がトリガーされたとき、または既存のパイプに新しいテーブルが追加されたときにも `Snapshot` 状態に入ります。

## Running \{#running\}

初期ロードが完了すると、パイプは（スナップショット専用パイプでない限り）`Running` 状態に入ります。スナップショット専用パイプの場合は、この時点で `Completed` に遷移します。この状態で、パイプは `Change-Data Capture`（CDC（変更データキャプチャ））を開始します。この状態では、ソースデータベースからバイナリログを読み取り、データをバッチ単位で ClickHouse に同期します。CDC の制御方法については、[CDC の制御に関するドキュメント](./sync_control) を参照してください。

## 一時停止中 \{#paused\}

パイプが `Running` 状態になると、一時停止できます。これにより CDC プロセスが停止し、パイプは `Paused` 状態に入ります。この状態では、新しいデータはソースデータベースから取得されませんが、ClickHouse 内の既存データはそのまま保持されます。この状態からパイプを再開できます。

## 一時停止 \{#pausing\}

:::note
この状態は近日中に追加される予定です。[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を使用している場合は、リリース後も連携が継続して動作するよう、今のうちにこの状態への対応を追加することをご検討ください。
:::
Pause ボタンをクリックすると、パイプは `Pausing` 状態になります。これは、CDC（変更データキャプチャ）プロセスの停止処理を進めている途中の一時的な状態です。CDC プロセスが完全に停止すると、パイプは `Paused` 状態に移行します。

## Modifying \{#modifying\}

:::note
この状態はまもなく利用可能になる予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) がある場合は、リリース時に連携が継続して動作するよう、今のうちにこの状態への対応を追加することをご検討ください。
:::
現在は、この状態はパイプがテーブルを削除している途中であることを示します。

## 再同期 \{#resync\}

:::note
この状態は近日提供予定です。現在 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を使用している場合は、リリース後も連携が継続して動作するよう、今のうちにこの状態のサポートを追加することを検討してください。
:::
この状態は、パイプが再同期フェーズにあり、_resync テーブルと元のテーブルとのアトミックなスワップ操作を実行していることを示します。再同期の詳細については、[再同期ドキュメント](./resync) を参照してください。

## 完了 \{#completed\}

この状態はスナップショット専用のパイプに適用され、スナップショットが完了しており、以降に実行する処理はないことを示します。

## 失敗 \{#failed\}

パイプに回復不能なエラーが発生した場合、`Failed` 状態になります。サポートに問い合わせるか、[再同期](./resync) を実行して、この状態からパイプを復旧させることができます。