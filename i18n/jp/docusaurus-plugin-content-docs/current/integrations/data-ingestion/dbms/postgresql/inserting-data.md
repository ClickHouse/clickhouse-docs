---
slug: /integrations/postgresql/inserting-data
title: 'PostgreSQL からデータを挿入する方法'
keywords: ['postgres', 'postgresql', 'inserts']
description: 'ClickPipes、PeerDB または Postgres テーブル関数を使用して PostgreSQL からデータを挿入する方法を説明するページ'
doc_type: 'guide'
---

ClickHouse へのデータ挿入パフォーマンスを最適化するためのベストプラクティスについては、[このガイド](/guides/inserting-data) を参照してください。

PostgreSQL からのバルクロードには、次の方法を使用できます:

- [ClickPipes](/integrations/clickpipes/postgres) を使用する方法。ClickHouse Cloud 向けのマネージド統合サービスです。
- `PeerDB by ClickHouse`。PostgreSQL データベースを、自己ホスト型 ClickHouse および ClickHouse Cloud の両方へレプリケーションすることに特化して設計された ETL ツールです。
- [Postgres テーブル関数](/sql-reference/table-functions/postgresql) を使用してデータを直接読み取る方法。これは通常、タイムスタンプなどの既知のウォーターマークに基づくバッチレプリケーションで十分な場合や、一度限りの移行に適しています。このアプローチは数千万行規模までスケールできます。より大きなデータセットを移行したい場合は、データをチャンクに分割し、それぞれを処理する複数のリクエストを検討してください。チャンクごとにステージングテーブルを使用し、そのパーティションを最終テーブルへ移動する前段とすることができます。これにより、失敗したリクエストを再試行できるようになります。このバルクロード戦略の詳細については、こちらを参照してください。
- PostgreSQL からデータを CSV 形式でエクスポートすることもできます。その後、ローカルファイルまたはオブジェクトストレージ経由で、テーブル関数を用いて ClickHouse に挿入できます。