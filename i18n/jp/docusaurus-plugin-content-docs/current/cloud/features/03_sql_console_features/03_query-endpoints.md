---
sidebar_title: 'Query API エンドポイント'
slug: /cloud/features/query-api-endpoints
description: '保存済みクエリから REST API エンドポイントを簡単に作成'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'Query API エンドポイント'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# クエリ API エンドポイント

インタラクティブなデータ駆動型アプリケーションを構築するには、高速なデータベース、適切に構造化されたデータ、最適化されたクエリだけでは不十分です。
フロントエンドやマイクロサービス側でも、できればよく設計された API を通じて、これらのクエリが返すデータを簡単に利用できる必要があります。

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソール内の任意の保存済み SQL クエリから、直接 API エンドポイントを作成できます。
ネイティブドライバーを使って ClickHouse Cloud サービスに接続することなく、HTTP 経由で API エンドポイントにアクセスし、保存済みクエリを実行できます。

:::tip Guide
少ない手順でクエリ API エンドポイントをセットアップする方法については、[Query API endpoints guide](/cloud/get-started/query-endpoints) を参照してください
:::