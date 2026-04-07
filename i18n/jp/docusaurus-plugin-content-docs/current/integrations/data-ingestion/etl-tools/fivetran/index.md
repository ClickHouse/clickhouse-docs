---
sidebar_label: 'Fivetran'
slug: /integrations/fivetran
sidebar_position: 2
description: 'Fivetran を使用すると、自動 schema 作成、重複排除、History Mode（SCD Type 2）により、あらゆるソースから ClickHouse Cloud へデータを移行できます。'
title: 'Fivetran と ClickHouse Cloud'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse-fivetran-destination'
keywords: ['fivetran', 'データ移行', 'etl', 'clickhouse destination', '自動データプラットフォーム', 'history mode', 'SCD Type 2']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Fivetran と ClickHouse Cloud \{#fivetran-and-clickhouse-cloud\}

<ClickHouseSupportedBadge/>

## 概要 \{#overview\}

[Fivetran](https://www.fivetran.com) は、クラウドデータプラットフォームからのデータ抽出、プラットフォームへの取り込み、およびプラットフォーム間でのデータ移動を自動化するデータ移動プラットフォームです。

[ClickHouse Cloud](https://clickhouse.com/cloud) は [Fivetran の宛先](https://fivetran.com/docs/destinations/clickhouse) としてサポートされており、さまざまなソースから ClickHouse へデータを読み込むことができます。オープンソース版の ClickHouse は宛先としてサポートされていません。

この宛先コネクタは、ClickHouse と Fivetran が共同で開発および保守しています。ソースコードは [GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination) で公開されています。

:::note
[ClickHouse Cloud 宛先](https://fivetran.com/docs/destinations/clickhouse) は現在 **ベータ** ですが、近日中の一般提供開始に向けて作業を進めています。
:::

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/sWe5JHW3lAs"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>

## 主な機能 \{#key-features\}

* **ClickHouse Cloud 対応**: ClickHouse Cloud データベースを Fivetran の宛先として使用できます。
* **SaaS デプロイメントモデル**: Fivetran によって完全に管理されるため、自社のインフラストラクチャを管理する必要はありません。
* **History Mode (SCD Type 2)&#x20;**: すべてのレコードバージョンの完全な履歴を保持し、特定時点での分析や監査証跡に対応します。
* **設定可能なバッチサイズ**: JSON 設定ファイルで write、select、mutation、hard delete のバッチサイズを調整することで、Fivetran を用途に合わせて最適化できます。

## 制限事項 \{#limitations\}

* schema の移行はまだサポートされていませんが、現在対応を進めています。
* 主キー カラムの追加、削除、変更はサポートされていません。
* `CREATE TABLE` 文での ClickHouse のカスタム設定はサポートされていません。
* ロールベースの権限付与は完全にはサポートされていません。コネクタの権限チェックでは、ユーザーに直接付与された権限のみを確認します。代わりに[直接付与された権限](/integrations/fivetran/troubleshooting#role-based-grants)を使用してください。

## 関連ページ \{#related-pages\}

* [技術リファレンス](/integrations/fivetran/reference): 型の対応、テーブルエンジン、メタデータカラム、高度な設定
* [トラブルシューティングとベストプラクティス](/integrations/fivetran/troubleshooting): よくあるエラー、最適化のヒント、デバッグ用クエリ
* [GitHub の ClickHouse Fivetran 宛先](https://github.com/ClickHouse/clickhouse-fivetran-destination)

## セットアップガイド \{#setup-guide\}

* 構成や一般的な技術情報については、[技術リファレンス](/integrations/fivetran/reference)を参照してください。
* 詳細なガイドについては、Fivetran のドキュメントにある[セットアップガイド](https://fivetran.com/docs/destinations/clickhouse/setup-guide)を参照してください。

## お問い合わせとサポート \{#contact-us\}

ClickHouse の Fivetran 宛先では、責任を分担する体制を採用しています。

* **ClickHouse** は、宛先コネクタのコードを開発・保守します。
* **Fivetran** は、コネクタをホストし、データ転送、パイプラインのスケジューリング、ソースコネクタを担当します。

Fivetran ClickHouse 宛先については、Fivetran と ClickHouse の両方がサポートを提供しています。一般的なお問い合わせは、Fivetran プラットフォームに最も詳しい Fivetran に連絡することをお勧めします。ClickHouse 特有の質問や問題については、当社のサポートチームが対応します。質問や問題の報告は、[サポートチケット](/about-us/support)を作成してください。