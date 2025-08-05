---
description: 'Documentation for Special Table Engines'
sidebar_label: 'Special'
sidebar_position: 50
slug: '/engines/table-engines/special/'
title: 'Special Table Engines'
---




# 特殊なテーブルエンジン

テーブルエンジンには主に3つのカテゴリがあります。

- [MergeTreeエンジンファミリ](../../../engines/table-engines/mergetree-family/index.md)：主要な生産用途向け。
- [Logエンジンファミリ](../../../engines/table-engines/log-family/index.md)：小さな一時データ用。
- [統合用テーブルエンジン](../../../engines/table-engines/integrations/index.md)。

残りのエンジンはその目的がユニークであり、ファミリにはまだグルーピングされていないため、この「特殊」カテゴリに位置付けられています。

<!-- このページの目次テーブルは自動的に生成されます。 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマatterフィールドであるslug、description、titleから生成されます。

エラーを見つけた場合は、ページ自体のYMLフロントマatterを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Buffer Table Engine](/engines/table-engines/special/buffer) | データをRAMにバッファリングし、定期的に別のテーブルにフラッシュします。読み取り操作中は、データはバッファと他のテーブルから同時に読み込まれます。 |
| [Executable and ExecutablePool Table Engines](/engines/table-engines/special/executable) | `Executable`および`ExecutablePool`テーブルエンジンは、あなたが定義するスクリプトから生成された行を持つテーブルを定義できるようにします（**stdout**に行を書き込みます）。 |
| [URL Table Engine](/engines/table-engines/special/url) | リモートHTTP/HTTPSサーバーからデータをクエリします。このエンジンはFileエンジンに似ています。 |
| [View Table Engine](/engines/table-engines/special/view) | ビューを実装するために使用されます（詳細は`CREATE VIEW`クエリを参照）。データを保存せず、指定された`SELECT`クエリのみを保存します。テーブルから読み取るとき、このクエリを実行し（不要なカラムはすべて削除されます）、データを取得します。 |
| [Distributed Table Engine](/engines/table-engines/special/distributed) | Distributedエンジンを持つテーブルは、自身のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中、リモートサーバーのテーブルインデックスがあれば、それが利用されます。 |
| [File Table Engine](/engines/table-engines/special/file) | Fileテーブルエンジンは、サポートされているファイルフォーマット（`TabSeparated`、`Native`など）のいずれかでファイルにデータを保存します。 |
| [FileLog Engine](/engines/table-engines/special/filelog) | このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。 |
| [Set Table Engine](/engines/table-engines/special/set) | 常にRAMにあるデータセット。`IN`演算子の右側での使用を目的としています。 |
| [Dictionary Table Engine](/engines/table-engines/special/dictionary) | `Dictionary`エンジンは、辞書データをClickHouseテーブルとして表示します。 |
| [GenerateRandom Table Engine](/engines/table-engines/special/generate) | GenerateRandomテーブルエンジンは、指定されたテーブルスキーマに対してランダムデータを生成します。 |
| [Memory Table Engine](/engines/table-engines/special/memory) | Memoryエンジンは、RAMにデータを非圧縮形式で保存します。データは、読み取ったときに受信したのと正確に同じ形で保存されます。言い換えれば、このテーブルからの読み取りは完全に無償です。 |
| [Merge Table Engine](/engines/table-engines/special/merge) | `Merge`エンジン（`MergeTree`と混同しないでください）は、データ自体を保存せず、他の任意のテーブルから同時に読み取ることを可能にします。 |
| [External Data for Query Processing](/engines/table-engines/special/external-data) | ClickHouseは、クエリ処理に必要なデータをサーバーに送信し、`SELECT`クエリとともに渡すことを許可します。このデータは一時テーブルに配置され、クエリで使用することができます（例えば、`IN`演算子内で）。 |
| [Join Table Engine](/engines/table-engines/special/join) | JOIN操作で使用するためのオプションの準備されたデータ構造。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | このエンジンは、Keeper/ZooKeeperクラスターを、一貫性のあるキーと値のストアとして、リニアライザブル書き込みと順序一貫性のある読み取りを提供します。 |
| [Null Table Engine](/engines/table-engines/special/null) | `Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み取ると、レスポンスは空になります。 |
