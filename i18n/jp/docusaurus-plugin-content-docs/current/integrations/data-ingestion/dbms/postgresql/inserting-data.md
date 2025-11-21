---
slug: /integrations/postgresql/inserting-data
title: 'PostgreSQL からデータを挿入する方法'
keywords: ['postgres', 'postgresql', 'inserts']
description: 'ClickPipes、PeerDB、または Postgres テーブル関数を使用して PostgreSQL からデータを挿入する方法を説明するページ'
doc_type: 'guide'
---

ClickHouse へのデータ挿入パフォーマンスを最適化するベストプラクティスを学ぶには、[こちらのガイド](/guides/inserting-data) を読むことをお勧めします。

PostgreSQL からの一括ロードには、次の方法を利用できます。

- ClickHouse Cloud 向けのマネージド統合サービスである [ClickPipes](/integrations/clickpipes/postgres) を使用する。
- `PeerDB by ClickHouse` を使用する。これは、自己ホスト型 ClickHouse および ClickHouse Cloud への PostgreSQL データベースレプリケーション専用に設計された ETL ツールです。
- データを直接読み取るために [Postgres Table Function](/sql-reference/table-functions/postgresql) を使用する。この方法は一般的に、既知のウォーターマーク（例: タイムスタンプ）に基づくバッチレプリケーションで十分な場合、または一度限りの移行の場合に適しています。このアプローチは数千万行規模までスケールできます。より大きなデータセットを移行したい場合は、データを分割し、それぞれのチャンクを処理する複数のリクエストを検討してください。各チャンクに対してステージングテーブルを使用し、そのパーティションを最終テーブルへ移動する前にロードできます。これにより、失敗したリクエストを再試行可能になります。この一括ロード戦略の詳細については、こちらを参照してください。
- Postgres からデータを CSV 形式でエクスポートできます。その後、ローカルファイルまたはオブジェクトストレージ経由でテーブル関数を使って ClickHouse に挿入できます。