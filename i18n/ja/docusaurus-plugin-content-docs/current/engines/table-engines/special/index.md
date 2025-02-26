---
slug: /engines/table-engines/special/
sidebar_position: 50
sidebar_label: 特殊
---

# 特殊テーブルエンジン

テーブルエンジンには主に三つのカテゴリーがあります：

- 主に生産用途のための[MergeTreeエンジンファミリー](../../../engines/table-engines/mergetree-family/index.md)。
- 小規模な一時データ用の[Logエンジンファミリー](../../../engines/table-engines/log-family/index.md)。
- 統合用の[テーブルエンジン](../../../engines/table-engines/integrations/index.md)。

残りのエンジンはその目的が独特であり、まだファミリーに分類されていないため、「特殊」カテゴリーに分類されています。

<!-- このページの目次テーブルは自動的に生成されています 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールド（slug, description, title）から作成されています。

エラーを見つけた場合は、各ページのYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [バッファテーブルエンジン](/engines/table-engines/special/buffer) | データをRAMにバッファリングし、定期的に別のテーブルにフラッシュします。読み取り操作中は、バッファと別のテーブルから同時にデータを読み取ります。 |
| [実行可能および実行可能プールテーブルエンジン](/engines/table-engines/special/executable) | `Executable`および`ExecutablePool`テーブルエンジンは、あなたが定義するスクリプトから生成された行を持つテーブルを定義することを可能にします（行を**stdout**に書き込むことによって）。 |
| [URLテーブルエンジン](/engines/table-engines/special/url) | リモートHTTP/HTTPSサーバーからデータをクエリします。このエンジンはファイルエンジンに似ています。 |
| [ビュー テーブルエンジン](/engines/table-engines/special/view) | ビューの実装に使用されます（詳細は`CREATE VIEWクエリ`を参照）。データは保存せず、指定された`SELECT`クエリのみを保存します。テーブルから読み取るときに、このクエリを実行し（クエリからすべての不要なカラムを削除します）、結果を取得します。 |
| [分散テーブルエンジン](/engines/table-engines/special/distributed) | 分散エンジンを持つテーブルは、自身のデータを保存せず、複数のサーバー上での分散クエリ処理を可能にします。読み取りは自動的に並行処理されます。読み取り中は、リモートサーバーのテーブルインデックスが使用されます（存在する場合）。 |
| [ファイルテーブルエンジン](/engines/table-engines/special/file) | ファイルテーブルエンジンは、サポートされているファイルフォーマット（`TabSeparated`, `Native`など）のいずれかでデータをファイルに保持します。 |
| [FileLogエンジン](/engines/table-engines/special/filelog) | このエンジンは、アプリケーションログファイルをレコードのストリームとして処理を可能にします。 |
| [セットテーブルエンジン](/engines/table-engines/special/set) | 常にRAM内にあるデータセット。`IN`演算子の右側で使用することを目的としています。 |
| [辞書テーブルエンジン](/engines/table-engines/special/dictionary) | `Dictionary`エンジンは、辞書データをClickHouseテーブルとして表示します。 |
| [GenerateRandomテーブルエンジン](/engines/table-engines/special/generate) | GenerateRandomテーブルエンジンは、指定されたテーブルスキーマのためにランダムデータを生成します。 |
| [メモリテーブルエンジン](/engines/table-engines/special/memory) | メモリエンジンは、データをRAMに圧縮されていない形式で保存します。データは、読み取る際に受信した形と正確に同じ形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。 |
| [マージテーブルエンジン](/engines/table-engines/special/merge) | `Merge`エンジン（`MergeTree`と混同しないでください）は、データを自体で保存せず、他の任意のテーブルから同時に読み取ることを許可します。 |
| [クエリ処理のための外部データ](/engines/table-engines/special/external-data) | ClickHouseは、サーバーにクエリ処理に必要なデータを`SELECT`クエリと共に送信することを可能にします。このデータは一時テーブルに置かれ、クエリで使用できます（例えば、`IN`演算子で）。 |
| [ジョインテーブルエンジン](/engines/table-engines/special/join) | JOIN操作に使用するためのオプションの準備済みデータ構造です。 |
| [KeeperMap](/engines/table-engines/special/keeper-map) | このエンジンは、Keeper/ZooKeeperクラスターを一貫性のあるキー・バリュー ストアとして、線形可用書き込みと順次一貫性のある読み取りで使用することを許可します。 |
| [ヌルテーブルエンジン](/engines/table-engines/special/null) | `Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み取ると、応答は空になります。 |
