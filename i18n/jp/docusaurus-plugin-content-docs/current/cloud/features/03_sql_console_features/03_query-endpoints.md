---
sidebar_title: 'クエリ API エンドポイント'
slug: /cloud/features/query-api-endpoints
description: '保存済みクエリから REST API エンドポイントを簡単に作成する'
keywords: ['api', 'クエリ API エンドポイント', 'クエリエンドポイント', 'クエリ REST API']
title: 'クエリ API エンドポイント'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# クエリ API エンドポイント

インタラクティブなデータ駆動型アプリケーションを構築するには、高速なデータベース、適切に構造化されたデータ、最適化されたクエリだけでは不十分です。
フロントエンドやマイクロサービスも、できれば適切に設計された API を通じて、これらのクエリから返されるデータに簡単にアクセスできる必要があります。

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソールで任意の保存済み SQL クエリから直接 API エンドポイントを作成できます。
ネイティブドライバーを使用して ClickHouse Cloud サービスに接続することなく、HTTP 経由で API エンドポイントにアクセスして保存済みクエリを実行できます。

:::tip ガイド
少ないステップで簡単にクエリ API エンドポイントをセットアップする手順については、[Query API endpoints ガイド](/cloud/get-started/query-endpoints) を参照してください。
:::