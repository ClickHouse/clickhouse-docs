---
sidebar_label: 'MongoDB ClickPipe のライフサイクル'
description: '各種パイプステータスとその意味'
slug: /integrations/clickpipes/mongodb/lifecycle
title: 'MongoDB ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'CDC', 'データのインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MongoDB ClickPipe のライフサイクル \\{#lifecycle\\}

このドキュメントでは、MongoDB ClickPipe のさまざまなフェーズと、それぞれが取りうるステータスおよびその意味について説明します。

## プロビジョニング \\{#provisioning\\}

Create ClickPipe ボタンをクリックすると、ClickPipe は `Provisioning` 状態で作成されます。プロビジョニング処理では、そのサービス向けに ClickPipes を実行するための基盤となるインフラストラクチャを立ち上げるとともに、パイプ用の初期メタデータをいくつか登録します。サービス内で利用される ClickPipes 用のコンピュートリソースは共有されるため、2 本目以降の ClickPipe は、インフラストラクチャがすでに用意されている分、1 本目よりもはるかに短時間で作成されます。

## セットアップ \\{#setup\\}

パイプのプロビジョニングが完了すると、`Setup` 状態に入ります。この状態で、宛先の ClickHouse テーブルを作成します。

## Snapshot \\{#snapshot\\}

セットアップが完了すると、CDC のみのパイプでない限り `Snapshot` 状態に移行します（CDC のみのパイプは `Running` に遷移します）。`Snapshot`、`Initial Snapshot`、`Initial Load`（より一般的な呼称）の 3 つの用語は、同義として相互に入れ替えて使われます。この状態では、ソースである MongoDB コレクションのスナップショットを取得し、それらを ClickHouse にロードします。oplog の保持期間設定は、この初回ロードに要する時間を見込んで設定する必要があります。パイプは、再同期が実行されたとき、または既存のパイプに新しいテーブルが追加されたときにも `Snapshot` 状態に入ります。

## 実行中 \\{#running\\}

初期ロードが完了すると、パイプは `Running` 状態に入ります（スナップショット専用のパイプの場合は `Completed` に遷移します）。この段階からパイプは `Change-Data Capture` を開始します。この状態では、ソースの MongoDB クラスターから ClickHouse への変更のストリーミングを開始します。CDC（変更データキャプチャ）の制御方法については、[CDC の制御に関するドキュメント](./sync_control)を参照してください。

## 一時停止 \\{#paused\\}

`Running` 状態になった ClickPipe は一時停止できます。これにより CDC（変更データキャプチャ）プロセスが停止し、ClickPipe は `Paused` 状態になります。この状態では、ソースの MongoDB から新しいデータは取得されませんが、ClickHouse の既存データは保持されたままです。この状態から ClickPipe を再開することができます。

## 一時停止 \\{#pausing\\}

:::note
この状態は近日中に利用可能になる予定です。現在 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を使用している場合は、リリース時も連携が継続して動作するよう、今のうちにこの状態へのサポートを追加することを検討してください。
:::
Pause ボタンをクリックすると、パイプは `Pausing` 状態になります。これは一時的な状態であり、CDC プロセスの停止処理を行っている最中です。CDC プロセスが完全に停止すると、パイプは `Paused` 状態になります。

## 変更中 \\{#modifying\\}

:::note
この状態は近日中に追加される予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) では、リリース後も連携が継続して動作するよう、この状態のサポートを今のうちに追加することを検討してください。
:::
現在は、この状態はパイプがテーブルを削除している途中であることを示します。

## Resync \\{#resync\\}

:::note
この状態はまもなく追加される予定です。現在 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を利用している場合は、リリース時に連携が継続して動作するよう、今のうちにこの状態への対応を追加することを検討してください。
:::
この状態は、パイプが resync のフェーズにあり、_resync テーブルと元のテーブルのアトミックスワップを実行していることを示します。resync の詳細については、[resync に関するドキュメント](./resync) を参照してください。

## 完了 \\{#completed\\}

この状態はスナップショット専用パイプに適用され、スナップショットが完了しており、これ以上実行する処理がないことを示します。

## 失敗 \\{#failed\\}

パイプに回復不能なエラーが発生すると、`Failed` 状態になります。この状態から復旧するには、サポートに連絡するか、パイプを[再同期](./resync)してください。