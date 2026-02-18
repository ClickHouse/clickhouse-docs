---
sidebar_label: 'MongoDB ClickPipe のライフサイクル'
description: '各パイプステータスとその意味'
slug: /integrations/clickpipes/mongodb/lifecycle
title: 'MongoDB ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MongoDB ClickPipe のライフサイクル \{#lifecycle\}

本書では、MongoDB ClickPipe のライフサイクルにおける各フェーズと、それぞれで取りうるステータスおよびその意味について説明します。

## プロビジョニング \{#provisioning\}

Create ClickPipe ボタンをクリックすると、ClickPipe は `Provisioning` 状態で作成されます。プロビジョニング処理では、そのサービス向けに ClickPipes を実行するための基盤となるインフラストラクチャを立ち上げるとともに、ClickPipe 用の初期メタデータを登録します。同一サービス内の ClickPipes 向けコンピュートは共有されるため、2 つ目以降の ClickPipe は、インフラストラクチャがすでに用意されている分、1 つ目よりもはるかに短時間で作成されます。

## セットアップ \{#setup\}

Pipe のプロビジョニングが完了すると、`Setup` 状態に入ります。この状態では、宛先の ClickHouse テーブルを作成します。

## Snapshot \{#snapshot\}

セットアップが完了すると、CDC 専用のパイプでない限り `Snapshot` 状態に入り、CDC 専用のパイプは `Running` に遷移します。`Snapshot`、`Initial Snapshot`、（より一般的な）`Initial Load` は同義の用語です。この状態では、ソースとなる MongoDB コレクションのスナップショットを取得し、それらを ClickHouse にロードします。oplog の保持設定は、初期ロードに要する時間を見込んだ値にする必要があります。パイプは、再同期がトリガーされた場合や、既存のパイプに新しいテーブルが追加された場合にも `Snapshot` 状態に入ります。

## 実行中 \{#running\}

初期ロードが完了すると、パイプは `Running` 状態に入ります（スナップショット専用パイプの場合は `Completed` に遷移します）。この状態から、パイプは変更データキャプチャ（CDC）を開始します。この状態では、ソースの MongoDB クラスターから ClickHouse へ変更内容のストリーミングを開始します。CDC の制御方法については、[CDC の制御に関するドキュメント](./sync_control) を参照してください。

## 一時停止済み \{#paused\}

パイプが `Running` 状態になると、一時停止できるようになります。これにより CDC（変更データキャプチャ）プロセスが停止し、パイプは `Paused` 状態に入ります。この状態では、ソースの MongoDB から新しいデータは取得されませんが、ClickHouse 内の既存データはそのまま保持されます。この状態からパイプを再開できます。

## 一時停止 \{#pausing\}

:::note
この状態は近日提供予定です。現在 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を利用している場合は、リリース後も連携が継続して動作するよう、今のうちにこの状態への対応を検討してください。
:::
Pause ボタンをクリックすると、パイプは `Pausing` 状態になります。これは一時的な状態で、CDC（変更データキャプチャ）プロセスの停止処理を実行している途中です。CDC プロセスが完全に停止すると、パイプは `Paused` 状態に移行します。

## Modifying \{#modifying\}

:::note
この状態は近日中に追加される予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) との連携が、リリース後も継続して動作するよう、この状態のサポートを事前に追加することを検討してください。
:::
現時点では、この状態はパイプがテーブルの削除処理を行っていることを示します。

## Resync \{#resync\}

:::note
この状態は近日中に提供予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) に対しては、リリース後も連携が継続して動作するよう、今のうちからこの状態への対応を追加しておくことを検討してください。
:::
この状態は、パイプが resync フェーズにあり、_resync テーブルと元のテーブルとのアトミックなスワップを実行している段階であることを示します。resync に関する詳細は、[resync ドキュメント](./resync) を参照してください。

## 完了 \{#completed\}

この状態はスナップショット専用のパイプに適用され、スナップショットが完了しており、以降に実行すべき処理がないことを示します。

## 失敗 \{#failed\}

Pipe に致命的なエラーが発生すると、`Failed` 状態になります。サポートに問い合わせるか、[再同期](./resync) を実行して、この状態から復旧してください。