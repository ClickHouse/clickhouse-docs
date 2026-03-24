---
sidebar_label: 'Middleware'
slug: /integrations/middleware
keywords: ['clickhouse', 'middleware', 'オブザーバビリティ', '統合', 'モニタリング']
description: 'Middleware を ClickHouse に接続して、ClickHouse のメトリクスとログを監視・分析します。'
title: 'ClickHouse に Middleware を接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# Middleware を ClickHouse に接続する \{#connecting-middleware-to-clickhouse\}

<PartnerBadge />

[Middleware](https://middleware.io/) は、インフラストラクチャ、ログ、アプリケーションのパフォーマンスをモニタリングするためのクラウドオブザーバビリティプラットフォームです。

ClickHouse を Middleware に接続すると、より広範なモニタリングワークフローの一部として、データベーステレメトリを収集・可視化できます。

## 前提条件 \{#prerequisites\}

* 稼働中の ClickHouse サービス (Cloud またはセルフマネージド)
* ClickHouse のホスト、ポート、ユーザー名、パスワードへのアクセス
* Middleware アカウント

## Middleware で ClickHouse に接続する \{#connect-clickhouse-in-middleware\}

1. Middleware アカウントにサインインします。
2. **Integrations** に移動し、**ClickHouse** を検索します。
3. ClickHouse 統合を選択し、接続情報を入力します。
   * ホスト
   * ポート
   * データベース
   * ユーザー名
   * パスワード
4. 統合を保存し、接続をテストします。

## データ収集を確認する \{#verify-data-collection\}

セットアップ後、ClickHouse の メトリクス や ログ が Middleware のダッシュボードに表示されていることを確認してください。

接続 の検証が失敗する場合は、次の点を確認してください。

* ClickHouse が Middleware からの接続を受け入れている
* SSL/TLS の設定が ClickHouse の endpoint と一致している
* credentials とデータベース permissions が正しい

## 参考資料 \{#additional-resources\}

* [Middleware のWebサイト](https://middleware.io/)