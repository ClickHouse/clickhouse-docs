---
sidebar_label: 'Postgres ClickPipe のライフサイクル'
description: 'さまざまなパイプステータスとその意味'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Postgres ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Postgres ClickPipe のライフサイクル {#lifecycle}

このドキュメントでは、Postgres ClickPipe のさまざまなフェーズ、それぞれが取りうるステータスとその意味について説明します。

## プロビジョニング {#provisioning}

Create ClickPipe ボタンをクリックすると、ClickPipe は `Provisioning` 状態で作成されます。プロビジョニング処理では、そのサービス向けに ClickPipes を実行するためのインフラストラクチャを起動し、あわせてパイプ用の初期メタデータをいくつか登録します。サービス内で ClickPipes 用のコンピュートリソースは共有されるため、インフラストラクチャがすでに用意されている分、2 本目以降の ClickPipe は 1 本目よりもはるかに速く作成されます。

## セットアップ {#setup}

ClickPipe がプロビジョニングされると、`Setup` 状態になります。この状態で、送信先の ClickHouse テーブルを作成します。また、ここでソーステーブルのテーブル定義を取得して保存します。

## Snapshot {#snapshot}

セットアップが完了すると、（CDC 専用の pipe でなければ）`Snapshot` 状態に入ります。CDC 専用の pipe の場合は `Running` に遷移します。`Snapshot`、`Initial Snapshot`、および（より一般的な）`Initial Load` は同義の用語として扱われます。この状態では、ソースデータベースのテーブルのスナップショットを取得し、それらを ClickHouse にロードします。この処理では論理レプリケーションは使用しませんが、レプリケーションスロットはこのステップで作成されるため、初期ロード中のスロットの増加を見込んで `max_slot_wal_keep_size` とストレージ関連のパラメータを設定する必要があります。初期ロードの詳細については、[parallel initial load のドキュメント](./parallel_initial_load) を参照してください。pipe は、再同期がトリガーされた場合や、既存の pipe に新しいテーブルが追加された場合にも `Snapshot` 状態に入ります。

## 実行中 {#running}

初回ロードが完了すると、パイプは `Running` 状態に入ります（スナップショット専用パイプの場合は `Completed` に遷移します）。この状態で、パイプは `Change-Data Capture` を開始します。この状態では、ソースデータベースから ClickHouse への論理レプリケーションを開始します。CDC の制御方法については、[CDC の制御に関するドキュメント](./sync_control) を参照してください。

## 一時停止中 {#paused}

パイプが `Running` 状態になると、そのパイプを一時停止できます。これにより CDC プロセスが停止し、パイプは `Paused` 状態になります。この状態では、新しいデータはソースデータベースから取得されませんが、ClickHouse 内の既存データはそのまま保持されます。この状態からパイプを再開できます。

## 一時停止 {#pausing}

:::note
この状態は近日中にサポート予定です。現在 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を使用している場合は、この状態への対応を今のうちに追加し、リリース時にも連携が継続して動作するようにしておくことを検討してください。
:::
Pause ボタンをクリックすると、パイプは `Pausing` 状態に入ります。これは CDC（変更データキャプチャ）プロセスの停止処理を行っている一時的な状態です。CDC プロセスが完全に停止すると、パイプは `Paused` 状態に移行します。

## 変更中 {#modifying}

:::note
この状態はまもなく利用可能になります。すでに [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を使用している場合は、この状態へのサポートをあらかじめ追加しておくことで、リリース後もインテグレーションが継続して動作するようにしてください。
:::
現在、この状態はパイプがテーブルの削除処理を実行しているところであることを示します。

## 再同期 {#resync}

:::note
この状態は近日中に追加される予定です。現在お使いの[OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) で、この状態へのサポートをあらかじめ追加しておくことで、リリース後も連携が継続して動作するようにしてください。
:::
この状態は、パイプが再同期フェーズにあり、_resync テーブルと元のテーブルとのアトミックな入れ替え処理を実行していることを示します。再同期の詳細については、[再同期ドキュメント](./resync) を参照してください。

## 完了 {#completed}

この状態はスナップショット専用パイプに適用され、スナップショットが完了しており、これ以上行う処理がないことを示します。

## 失敗 {#failed}

パイプで復旧不能なエラーが発生した場合、そのパイプは `Failed` 状態になります。サポートに問い合わせるか、[再同期](./resync) を実行してこの状態から復旧できます。