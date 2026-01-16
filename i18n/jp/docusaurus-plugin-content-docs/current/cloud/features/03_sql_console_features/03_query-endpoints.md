---
sidebar_title: 'クエリ API エンドポイント'
slug: /cloud/features/query-api-endpoints
description: '保存済みクエリから REST API エンドポイントを簡単に作成できる'
keywords: ['api', 'クエリ API エンドポイント', 'クエリ エンドポイント', 'クエリ REST API']
title: 'クエリ API エンドポイント'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

# クエリ API エンドポイント \\{#query-api-endpoints\\}

インタラクティブなデータ駆動型アプリケーションを構築するには、高速なデータベース、適切に構造化されたデータ、最適化されたクエリだけでは不十分です。
フロントエンドやマイクロサービスもまた、クエリから返されるデータを、できれば適切に構造化された API を介して、簡単に利用できる必要があります。

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソールで保存した任意の SQL クエリから、直接 API エンドポイントを作成できます。
これにより、ネイティブ ドライバーを使って ClickHouse Cloud サービスに接続することなく、HTTP 経由で API エンドポイントにアクセスして保存済みクエリを実行できます。

:::tip ガイド
数ステップで簡単にクエリ API エンドポイントをセットアップする手順については、[Query API endpoints guide](/cloud/get-started/query-endpoints) を参照してください。
:::