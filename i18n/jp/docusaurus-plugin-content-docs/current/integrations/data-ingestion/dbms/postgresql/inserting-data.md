---
slug: /integrations/postgresql/inserting-data
title: 'PostgreSQL からデータを挿入する方法'
keywords: ['postgres', 'postgresql', 'inserts']
description: 'ClickPipes、PeerDB、または Postgres テーブル関数を使用して PostgresSQL からデータを挿入する方法を説明するページ'
doc_type: 'guide'
---

ClickHouse へのデータ挿入パフォーマンスを最適化するためのベストプラクティスについては、[こちらのガイド](/guides/inserting-data) を参照することを推奨します。

PostgreSQL からのバルクロードには、次の方法を使用できます。

- ClickHouse Cloud 用のマネージド統合サービスである [ClickPipes](/integrations/clickpipes/postgres) を使用する。
- `PeerDB by ClickHouse` を使用する。これは、PostgreSQL データベースをセルフホスト型の ClickHouse および ClickHouse Cloud の両方へレプリケーションするために特化した ETL ツールです。
- [Postgres Table Function](/sql-reference/table-functions/postgresql) を使用してデータを直接読み取る。この方法は、既知のウォーターマーク（例: タイムスタンプ）に基づくバッチレプリケーションで十分な場合や、一度きりの移行である場合に一般的に適しています。このアプローチは数千万行規模までスケール可能です。より大きなデータセットを移行したい場合は、データをチャンクに分割し、それぞれを個別のリクエストで処理することを検討してください。各チャンクについてステージングテーブルを使用し、そのパーティションを最終テーブルに移動する前にロードすることができます。これにより、失敗したリクエストのみを再試行できます。このバルクロード戦略の詳細については、こちらを参照してください。
- データを Postgres から CSV 形式でエクスポートする。この CSV をローカルファイル、またはテーブル関数を用いてオブジェクトストレージ経由で ClickHouse に挿入できます。