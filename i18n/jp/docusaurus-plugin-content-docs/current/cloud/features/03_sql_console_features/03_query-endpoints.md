---
sidebar_title: 'クエリAPIエンドポイント'
slug: /cloud/features/query-api-endpoints
description: '保存済みクエリから簡単にREST APIエンドポイントを作成'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'クエリAPIエンドポイント'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# Query APIエンドポイント

インタラクティブなデータ駆動型アプリケーションを構築するには、高速なデータベース、適切に構造化されたデータ、最適化されたクエリだけでは不十分です。
フロントエンドやマイクロサービスも、これらのクエリが返すデータを簡単に利用できる必要があり、できれば適切に構造化されたAPIを介して行うことが望ましいです。

**Query APIエンドポイント**機能を使用すると、ClickHouse Cloudコンソールに保存された任意のSQLクエリから直接APIエンドポイントを作成できます。
ネイティブドライバを介してClickHouse Cloudサービスに接続することなく、HTTP経由でAPIエンドポイントにアクセスし、保存されたクエリを実行できます。

:::tip ガイド
Query APIエンドポイントを簡単な手順で設定する方法については、[Query APIエンドポイントガイド](/cloud/get-started/query-endpoints)を参照してください
:::