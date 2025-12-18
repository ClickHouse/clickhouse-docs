---
title: 'リリース状況ページ'
sidebar_label: 'リリース状況'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: '各リリースチャネルのリリース状況をまとめたページ'
slug: /cloud/release-status
doc_type: 'reference'
---

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

ClickHouse Cloud では、安定性、新機能へのアクセス、アップグレードの予測可能性といったニーズに応じて、複数のリリースチャネルを提供しています。各チャネルごとにアップグレードスケジュールが異なり、新しいリリースにすぐアクセスしたいユーザーと、最も安定したリリース版を受け取れるようアップグレードを先送りしたいユーザーという、異なるユースケースに対応することを目的としています。


## リリースチャネルの詳細 {#release-channel-details}

<details>
<summary>リリースチャネルについて詳しく知る</summary>

| チャネル名 | 説明 | 主なポイント | 対応ティア |
| :--- | :--- | :--- | :--- |
| **Fast（早期リリース）** | 本番以外の環境に推奨されるチャネルです。すべてのデータベースバージョンのアップグレードで、最初にリリースされるチャネルです。 | 安定性よりも新機能へのアクセスを優先。<br/>本番アップグレードの前に、本番以外の環境でリリースを事前検証可能 | Basic（デフォルト）<br/>Scale、Enterprise ティア |
| **Regular** | すべてのマルチレプリカサービスに対するデフォルトのリリースチャネルです。<br/>このチャネルでの更新は、通常 Fast リリースチャネルの約 2 週間後に行われます。 | デフォルト / クラスタ全体のアップグレード用。<br/>このチャネルでのアップグレードは、通常 Fast リリースチャネルでのアップグレードから約 2 週間後に実施されます。 | Scale および Enterprise |
| **Slow（延期）** | リスク回避志向が強く、リリーススケジュールの終盤でサービスをアップグレードしたいユーザーに推奨されるチャネルです。<br/>このチャネルでの更新は、通常 Regular リリースチャネルの約 2 週間後に行われます。 | 安定性と予測可能性を最大化。<br/>Fast/Regular チャネルでの新リリースに対して、より多くのテストを行いたいユーザー向け | Enterprise |

<br/>
<br/>

:::note
すべてのシングルレプリカサービスは、自動的に Fast リリースチャネルに登録されます。
:::

</details>

Enterprise ティアのサービスでは、すべてのリリースチャネルでスケジュールされたアップグレードを利用できます。この機能により、アップグレードを実施する曜日と時間帯の時間枠を設定できます。

## リリーススケジュール {#release-schedule}

以下に記載のリリース日程は目安であり、変更される可能性があります。

<ReleaseSchedule releases={[
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.10',
    version: '25.10',
    fast_date: '2025-12-11 から開始予定',
    regular_date: '2026-01-05',
    slow_date: 'TBD',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green',
    fast_delay_note: '進行中',
  }
]} />