---
slug: '/engines/table-engines/special/'
sidebar_position: 50
sidebar_label: '特別'
---


# 特別なテーブルエンジン

テーブルエンジンには主に3つのカテゴリがあります：

- [MergeTreeエンジンファミリー](../../../engines/table-engines/mergetree-family/index.md)：主な生産用途向け。
- [Logエンジンファミリー](../../../engines/table-engines/log-family/index.md)：小規模な一時データ向け。
- [統合向けのテーブルエンジン](../../../engines/table-engines/integrations/index.md)。

残りのエンジンはその目的においてユニークであり、まだファミリーにグループ化されていないため、「特別」カテゴリに置かれています。

<!-- このページの目次テーブルは自動的に生成されます
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
のYAMLフロントマターのフィールドから：slug、description、title。

もし誤りを発見した場合は、各ページのYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [Bufferテーブルエンジン](/engines/table-engines/special/buffer) | データをRAMに書き込むためにバッファリングし、定期的に他のテーブルにフラッシュします。読み取り操作中に、データはバッファと他のテーブルから同時に読み取られます。 |
| [ExecutableおよびExecutablePoolテーブルエンジン](/engines/table-engines/special/executable) | `Executable`および`ExecutablePool`テーブルエンジンは、定義したスクリプトから行を生成するテーブルを定義することを可能にします（行を**stdout**に書き込むことによって）。 |
| [URLテーブルエンジン](/engines/table-engines/special/url) | リモートHTTP/HTTPSサーバーからのデータをクエリします。このエンジンはFileエンジンに似ています。 |
| [Viewテーブルエンジン](/engines/table-engines/special/view) | ビューを実装するために使用されます（詳細は`CREATE VIEWクエリ`を参照）。データを保存せず、指定された`SELECT`クエリのみを保存します。テーブルから読み取る際には、このクエリを実行し（クエリから不要なカラムを削除します）、結果を返します。 |
| [Distributedテーブルエンジン](/engines/table-engines/special/distributed) | Distributedエンジンのテーブルは自分自身のデータを保存せず、複数のサーバーで分散クエリ処理を可能にします。読み取りは自動的に並列化され、リモートサーバーのテーブルインデックスが使用されます（存在する場合）。 |
| [Fileテーブルエンジン](/engines/table-engines/special/file) | Fileテーブルエンジンは、データをサポートされているファイル形式の1つでファイルに保持します（`TabSeparated`、`Native`など）。 |
| [FileLogエンジン](/engines/table-engines/special/filelog) | このエンジンはアプリケーションのログファイルをレコードのストリームとして処理することを可能にします。 |
| [Setテーブルエンジン](/engines/table-engines/special/set) | 常にRAMにあるデータセットです。`IN`演算子の右側での使用を意図しています。 |
| [Dictionaryテーブルエンジン](/engines/table-engines/special/dictionary) | `Dictionary`エンジンは辞書データをClickHouseテーブルとして表示します。 |
| [GenerateRandomテーブルエンジン](/engines/table-engines/special/generate) | GenerateRandomテーブルエンジンは、指定されたテーブルスキーマのためにランダムデータを生成します。 |
| [Memoryテーブルエンジン](/engines/table-engines/special/memory) | MemoryエンジンはデータをRAMに非圧縮形式で保存します。データは読み取る際に受け取ったそのままの形で保存されます。つまり、このテーブルからの読み取りは完全に無料です。 |
| [Mergeテーブルエンジン](/engines/table-engines/special/merge) | `Merge`エンジン（`MergeTree`と混同しないでください）はデータを自ら保存せず、任意の数の他のテーブルから同時に読み取ることを可能にします。 |
| [クエリ処理のための外部データ](/engines/table-engines/special/external-data) | ClickHouseは、クエリを処理するために必要なデータをサーバーに送信することを許可し、`SELECT`クエリと共に使用します。このデータは一時テーブルに配置され、クエリ内で使用できます（例えば、`IN`演算子で）。 |
| [Joinテーブルエンジン](/engines/table-engines/special/join) | JOIN操作で使用するためのオプションの準備されたデータ構造です。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | このエンジンは、Keeper/ZooKeeperクラスターを、一貫したキー・バリュー・ストアとして使用し、線形化可能な書き込みと逐次的に一貫した読み取りを可能にします。 |
| [Nullテーブルエンジン](/engines/table-engines/special/null) | `Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み取ると、応答は空になります。 |
