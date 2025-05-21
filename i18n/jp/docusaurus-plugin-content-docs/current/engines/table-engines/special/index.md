---
description: '特別なテーブルエンジンのドキュメント'
sidebar_label: '特別'
sidebar_position: 50
slug: /engines/table-engines/special/
title: '特別なテーブルエンジン'
---


# 特別なテーブルエンジン

テーブルエンジンには主に3つのカテゴリがあります：

- [MergeTreeエンジンファミリー](../../../engines/table-engines/mergetree-family/index.md) ：主な生産用途のため。
- [Logエンジンファミリー](../../../engines/table-engines/log-family/index.md) ：小さな一時データ用。
- [統合用テーブルエンジン](../../../engines/table-engines/integrations/index.md)。

残りのエンジンはその用途が独特であり、まだファミリーにグループ化されていないため、"特別" カテゴリに置かれています。

<!-- このページの目次のテーブルは自動的に生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドを元に：slug, description, title.

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Buffer Table Engine](/engines/table-engines/special/buffer) | データをRAMに書き込み、定期的に別のテーブルにフラッシュするためのバッファ。読み取り操作中は、データはバッファと他のテーブルから同時に読み込まれる。 |
| [Executable and ExecutablePool Table Engines](/engines/table-engines/special/executable) | `Executable` と `ExecutablePool` テーブルエンジンは、定義したスクリプトから生成された行を持つテーブルを定義することを可能にします（行を **stdout** に書き込むことによって）。 |
| [URL Table Engine](/engines/table-engines/special/url) | リモートHTTP/HTTPSサーバーからデータをクエリします。このエンジンはFileエンジンに似ています。 |
| [View Table Engine](/engines/table-engines/special/view) | ビューを実装するために使用されます（詳細については `CREATE VIEWクエリ` を参照）。データは保存されず、指定された `SELECT` クエリのみが保存されます。テーブルから読み取るときは、このクエリが実行され（不必要なカラムはクエリから削除されます）、 |
| [Distributed Table Engine](/engines/table-engines/special/distributed) | 分散エンジンを持つテーブルは自分自身のデータを保存せず、複数のサーバーでの分散クエリ処理を許可します。読み取りは自動的に並列化されます。読み取り中に、リモートサーバーのテーブルインデックスが使用されます（存在する場合）。 |
| [File Table Engine](/engines/table-engines/special/file) | Fileテーブルエンジンは、データをサポートされているファイル形式の1つ（`TabSeparated`、`Native`など）でファイルに保持します。 |
| [FileLog Engine](/engines/table-engines/special/filelog) | このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。 |
| [Set Table Engine](/engines/table-engines/special/set) | 常にRAMにあるデータセット。`IN`演算子の右側での使用を目的としています。 |
| [Dictionary Table Engine](/engines/table-engines/special/dictionary) | `Dictionary`エンジンは、辞書データをClickHouseテーブルとして表示します。 |
| [GenerateRandom Table Engine](/engines/table-engines/special/generate) | GenerateRandomテーブルエンジンは、指定されたテーブルスキーマのためにランダムなデータを生成します。 |
| [Memory Table Engine](/engines/table-engines/special/memory) | メモリエンジンは、データを圧縮されていない形式でRAMに保持します。データは、読み取られたときに受け取った正確な形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。 |
| [Merge Table Engine](/engines/table-engines/special/merge) | `Merge`エンジン（`MergeTree`と混同しないでください）は、自身でデータを保存せず、他の任意のテーブルから同時に読み取ることを許可します。 |
| [External Data for Query Processing](/engines/table-engines/special/external-data) | ClickHouseは、クエリを処理するために必要なデータをサーバーに送信でき、`SELECT`クエリと一緒に送信されます。このデータは一時テーブルに入れられ、クエリ内で使用できます（例えば、`IN`演算子で）。 |
| [Join Table Engine](/engines/table-engines/special/join) | JOIN操作で使用するためのオプションの準備されたデータ構造。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | このエンジンは、Keeper/ZooKeeperクラスターを使用して、一貫性のあるキー-バリューストアとして線形書き込みおよび逐次一貫性のある読み取りを可能にします。 |
| [Null Table Engine](/engines/table-engines/special/null) | `Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み込むと、応答は空です。 |
