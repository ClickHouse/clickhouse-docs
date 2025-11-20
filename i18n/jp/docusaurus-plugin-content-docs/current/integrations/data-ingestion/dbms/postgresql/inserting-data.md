---
slug: /integrations/postgresql/inserting-data
title: 'PostgreSQL からデータを挿入する方法'
keywords: ['postgres', 'postgresql', 'inserts']
description: 'ClickPipes、PeerDB または Postgres テーブル関数を使用して PostgreSQL からデータを挿入する方法を説明するページ'
doc_type: 'guide'
---

ClickHouse へのデータ挿入パフォーマンスを最適化するためのベストプラクティスについては、[このガイド](/guides/inserting-data) を参照することを推奨します。

PostgreSQL からのバルクデータロードには、次の方法を使用できます。

- ClickHouse Cloud 向けのマネージド統合サービスである [ClickPipes](/integrations/clickpipes/postgres) を使用する。
- `PeerDB by ClickHouse` を使用する。これは、セルフホスト版 ClickHouse と ClickHouse Cloud の両方への PostgreSQL データベースレプリケーション専用に設計された ETL ツールです。
- [Postgres テーブル関数](/sql-reference/table-functions/postgresql) を使用してデータを直接読み取る。この方法は、既知のウォーターマーク（例: タイムスタンプ）に基づくバッチレプリケーションで十分な場合、または一度限りの移行である場合に一般的に適しています。このアプローチは数千万行規模までスケールできます。より大きなデータセットを移行したいユーザーは、データを複数のチャンクに分割し、それぞれを処理する複数のリクエストを検討してください。各チャンクについて、パーティションを最終テーブルへ移動する前にステージングテーブルを使用できます。これにより、失敗したリクエストを再試行できます。このバルクロード戦略の詳細については、こちらを参照してください。
- PostgreSQL から CSV 形式でデータをエクスポートすることもできます。その後、ローカルファイルから、またはテーブル関数を使用してオブジェクトストレージ経由で ClickHouse に挿入できます。