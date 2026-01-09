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

# MySQL ClickPipe のライフサイクル {#lifecycle}

このドキュメントでは、MySQL ClickPipe の各フェーズと、それぞれが取りうるステータスおよびその意味について説明します。なお、これらの内容は MariaDB にも当てはまります。

## プロビジョニング {#provisioning}

Create ClickPipe ボタンをクリックすると、ClickPipe は `Provisioning` 状態で作成されます。プロビジョニング処理では、そのサービスで ClickPipes を実行するための基盤インフラストラクチャを立ち上げるとともに、その ClickPipe 用の初期メタデータを登録します。サービス内での ClickPipes 用コンピュートリソースは共有されるため、基盤インフラストラクチャがすでに用意されている分、2 本目以降の ClickPipe は 1 本目よりもはるかに短時間で作成されます。

## セットアップ {#setup}

Pipe がプロビジョニングされると、`Setup` ステータスに入ります。このステータスでは、送信先の ClickHouse テーブルを作成します。また、ここでソーステーブルのテーブル定義を取得して記録します。

## Snapshot {#snapshot}

セットアップが完了すると、`Snapshot` 状態に入ります（CDC 専用パイプの場合は `Running` 状態に遷移します）。`Snapshot`、`Initial Snapshot`、`Initial Load`（より一般的）は同じ意味で使われる用語です。この状態では、ソース側の MySQL テーブルのスナップショットを取得し、それらを ClickHouse にロードします。バイナリログの保持期間設定は、初期ロードに要する時間を考慮して行う必要があります。初期ロードの詳細については、[parallel initial load のドキュメント](./parallel_initial_load) を参照してください。パイプは、再同期がトリガーされた場合や、既存のパイプに新しいテーブルが追加された場合にも `Snapshot` 状態に入ります。

## 実行中 {#running}

初回ロードが完了すると、パイプは（スナップショット専用のパイプでない限り）`Running` 状態に入ります。スナップショット専用のパイプの場合は `Completed` に遷移します。ここからパイプは `Change-Data Capture`（CDC）の処理を開始します。この状態では、ソースデータベースからバイナリログを読み取り、データをバッチ単位で ClickHouse に同期します。CDC の制御方法については、[CDC の制御に関するドキュメント](./sync_control)を参照してください。

## 一時停止 {#paused}

`Running` 状態になった ClickPipe は一時停止できます。一時停止すると CDC プロセスが停止し、ClickPipe は `Paused` 状態になります。この状態では、ソースデータベースから新しいデータは取得されませんが、ClickHouse の既存データはそのまま保持されます。この状態から ClickPipe を再開できます。

## 一時停止 {#pausing}

:::note
この状態は近日中に利用可能になる予定です。現在 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を使用している場合は、リリース後も連携が継続して動作するよう、今のうちにこの状態のサポートを追加することを検討してください。
:::
Pause ボタンをクリックすると、パイプは `Pausing` 状態に入ります。これは CDC プロセスの停止処理を実行している途中の一時的な状態です。CDC プロセスが完全に停止すると、パイプは `Paused` 状態に移行します。

## Modifying {#modifying}

:::note
この状態は近日中に追加される予定です。現在 ClickHouse の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を利用している場合は、この状態への対応を事前に追加しておくことをご検討ください。リリース時に連携が引き続き正しく動作するようにするためです。
:::
現時点では、この状態はパイプがテーブルの削除処理を実行中であることを示します。

## 再同期 {#resync}

:::note
この状態は近日追加予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) において、リリース時に連携が継続して動作するよう、今のうちからこの状態への対応を検討してください。
:::
この状態は、パイプが再同期フェーズにあり、_resync テーブルを元のテーブルとアトミックなスワップで入れ替えていることを示します。再同期の詳細については、[再同期のドキュメント](./resync) を参照してください。

## 完了 {#completed}

この状態はスナップショット専用のパイプに適用され、スナップショットが完了しており、これ以上行うべき処理がないことを示します。

## Failed {#failed}

パイプで復旧不能なエラーが発生した場合、そのパイプは `Failed` 状態になります。この状態から復旧するには、サポートに問い合わせるか、パイプの[再同期](./resync)を実行してください。