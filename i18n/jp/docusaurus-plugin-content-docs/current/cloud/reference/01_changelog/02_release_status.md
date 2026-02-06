---
title: 'リリース状況ページ'
sidebar_label: 'リリース状況'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'リージョン']
description: '各リリースチャネルごとのリリース状況を示すページ'
slug: /cloud/release-status
doc_type: 'reference'
---

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

ClickHouse Cloud では、安定性・新機能へのアクセス・アップグレードの予測可能性といった異なるニーズに対応するため、複数のリリースチャネルを提供しています。各チャネルにはそれぞれ明確に異なるアップグレードスケジュールがあり、最新リリースに即時アクセスしたいユーザーと、最も安定したバージョンのみを利用できるようアップグレードを延期したいユーザーといった、異なるユースケースに対応することを目的としています。


## リリースチャネルの詳細 \{#release-channel-details\}

<details>
<summary>リリースチャネルの詳細を見る</summary>

| Channel Name | Description | Key Considerations | Tiers Supported |
| :--- | :--- | :--- | :--- |
| **Fast (Early Release)** | 本番環境以外での利用を推奨するチャネルです。各データベースバージョンのアップグレードにおいて、最初にロールアウトされるチャネルです。 | 安定性よりも新機能への早期アクセスを優先。<br/>本番アップグレードに先立ち、本番以外の環境でリリースを検証可能 | Basic (default)<br/>Scale、Enterprise ティア |
| **Regular** | すべてのマルチレプリカサービス向けのデフォルトリリースチャネルです。<br/>このチャネルでのロールアウトは、通常 Fast リリースチャネル開始から 2 週間後に始まります。 | デフォルト / サービス全体でのアップグレード。<br/>サービスは複数週間にわたり段階的にアップグレードされます。 | Scale と Enterprise |
| **Slow (Deferred)** | リリーススケジュールの終盤でサービスのアップグレードを行いたい、よりリスク回避志向のユーザーに推奨されるチャネルです。<br/>このチャネルでのロールアウトは、通常 Regular リリースチャネル開始から 2 週間後に始まります。 | 安定性と予測可能性を最大化。<br/>Fast / Regular チャネルでの新リリースについて、さらに十分なテスト期間を必要とするユーザー向け | Enterprise |

<br/>
<br/>

:::note
すべてのシングルレプリカサービスは、自動的に Fast リリースチャネルに登録されます。
:::

</details>

Enterprise ティアのサービスでは、すべてのリリースチャネルでスケジュール済みのアップグレードウィンドウが利用可能です。この機能により、アップグレードを実行する曜日と、その日の時間帯ウィンドウを設定できます。

## リリーススケジュール \{#release-schedule\}

:::important リリース日について
以下の日付は、各リリースチャネルに対して ClickHouse が**ロールアウトを開始する**タイミングを示しており、個々のサービスがアップグレードされるタイミングではありません。

- ロールアウトは自動で実行され、複数週にわたって段階的に行われます
- スケジュールされたアップグレードウィンドウが設定されているサービスは、チャネルのロールアウト完了後の週に、そのスケジュールされたウィンドウ内でアップグレードされます
- ロールアウトの一時停止（例：ホリデーシーズン中のフリーズ）やヘルスモニタリングにより、ロールアウト完了が遅延する場合があります

本番環境をアップグレードする前に事前テストを行う場合は、非本番環境のサービスには Fast または Regular チャネルを、本番環境のサービスには Slow チャネルを使用してください。
:::

<ReleaseSchedule releases={[
    {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.12',
     version: '25.12',
     fast_start_date: 'TBD',
     fast_end_date: 'TBD',
     regular_start_date: 'TBD',
     regular_end_date: 'TBD',
     slow_start_date: 'TBD',
     slow_end_date: 'TBD',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green'
   },
   {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.10',
     version: '25.10',
     fast_start_date: '2025-12-11',
     fast_end_date: '2025-12-15',
     regular_start_date: '2026-01-23',
     regular_end_date: 'TBD',
     slow_start_date: 'TBD',
     slow_end_date: 'TBD',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green',
     regular_delay_note: 'スケジュールされたアップグレードウィンドウを持つサービスは、ロールアウト完了後の週に、そのスケジュールされたウィンドウ内で 25.10 へアップグレードされます',
   },
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.8',
    version: '25.8',
    fast_start_date: '完了',
    fast_end_date: '完了',
    regular_start_date: '2025-10-29',
    regular_end_date: '2025-12-19',
    slow_start_date: '2026-01-27',
    slow_end_date: '2026-02-04',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green',
  }
]} />