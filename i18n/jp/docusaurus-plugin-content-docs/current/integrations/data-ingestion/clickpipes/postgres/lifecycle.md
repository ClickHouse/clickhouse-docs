---
sidebar_label: 'Postgres ClickPipe のライフサイクル'
description: 'さまざまなパイプのステータスとその意味'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Postgres ClickPipe のライフサイクル'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Postgres ClickPipe のライフサイクル \{#lifecycle\}

本書では、Postgres ClickPipe の各フェーズと、そのフェーズで取りうるさまざまなステータスおよびその意味について説明します。

## プロビジョニング \{#provisioning\}

Create ClickPipe ボタンをクリックすると、ClickPipe は `Provisioning` 状態で作成されます。プロビジョニング処理では、このサービスで ClickPipes を実行するための基盤インフラストラクチャを立ち上げるとともに、パイプ用の初期メタデータをいくつか登録します。サービス内での ClickPipes 向けコンピュートは共有されるため、2 つ目の ClickPipe は、すでにインフラストラクチャが用意されている分、1 つ目よりもはるかに短時間で作成されます。

## セットアップ \{#setup\}

Pipe がプロビジョニングされると、`Setup` 状態に入ります。この状態では、宛先の ClickHouse テーブルを作成します。また、ここでソーステーブルの定義を取得して記録します。

## Snapshot \{#snapshot\}

セットアップが完了すると、`Snapshot` 状態に入ります（CDC 専用のパイプの場合は `Running` に遷移します）。`Snapshot`、`Initial Snapshot`、および（より一般的な）`Initial Load` という用語は同じ意味で使われます。この状態では、ソースデータベースのテーブルをスナップショットし、ClickHouse にロードします。ここでは論理レプリケーションは使用しませんが、レプリケーションスロットはこのステップで作成されるため、初期ロード中のスロットの増加を見込んで、`max_slot_wal_keep_size` およびストレージ関連パラメータを設定する必要があります。初期ロードの詳細については、[並列初期ロードのドキュメント](./parallel_initial_load) を参照してください。パイプは、再同期がトリガーされたときや既存のパイプに新しいテーブルが追加されたときにも `Snapshot` 状態に入ります。

## 実行中 \{#running\}

初期ロードが完了すると、パイプは `Running` 状態に移行します（スナップショット専用パイプの場合は `Completed` に遷移します）。この状態でパイプは CDC（変更データキャプチャ）を開始し、ソースデータベースから ClickHouse への論理レプリケーションを実行します。CDC の制御方法については、[CDC の制御に関するドキュメント](./sync_control)を参照してください。

## 一時停止中 \{#paused\}

pipe が `Running` 状態になると、一時停止できるようになります。これにより CDC（変更データキャプチャ）プロセスが停止し、pipe は `Paused` 状態になります。この状態では、ソースデータベースから新しいデータは取得されませんが、ClickHouse 内の既存データはそのまま保持されます。この状態から pipe を再開できます。

## 一時停止 \{#pausing\}

:::note
この状態は近日中に追加される予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 連携が、この状態のリリース後も継続して動作するように、あらかじめこの状態への対応を追加することをご検討ください。
:::
Pause ボタンをクリックすると、パイプは `Pausing` 状態に入ります。これは CDC プロセスの停止処理を進めている途中の一時的な状態です。CDC プロセスが完全に停止すると、パイプは `Paused` 状態に移行します。

## 変更中 \{#modifying\}

:::note
この状態は近日提供予定です。すでに [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) を利用している場合は、リリース後も連携が継続して動作するよう、今のうちにこの状態へのサポートを追加することをご検討ください。
:::
現在は、この状態はパイプがテーブルを削除している途中であることを示します。

## Resync \{#resync\}

:::note
このステートは近日公開予定です。現在ご利用中の [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) で、このステートをサポートするようあらかじめ変更しておくことで、リリース時にも連携が継続して動作するようにしておくことを推奨します。
:::
このステートは、パイプが resync フェーズにあり、`_resync` テーブルと元のテーブルのアトミックなスワップを実行していることを示します。resync に関する詳細は [resync のドキュメント](./resync) を参照してください。

## 完了 \{#completed\}

この状態はスナップショット専用のパイプに適用され、スナップショットが完了しており、これ以上実行する処理がないことを示します。

## Failed \{#failed\}

pipe に回復不能なエラーが発生すると、状態は `Failed` になります。サポートに問い合わせるか、[resync](./resync) を実行して pipe を再同期し、この状態から復旧できます。