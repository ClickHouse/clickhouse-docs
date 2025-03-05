---
slug: /engines/table-engines/special/
sidebar_position: 50
sidebar_label: 特殊
---


# 特殊テーブルエンジン

テーブルエンジンには、主に3つのカテゴリがあります。

- [MergeTreeエンジンファミリー](../../../engines/table-engines/mergetree-family/index.md)は、主に本番環境で使用されます。
- [Logエンジンファミリー](../../../engines/table-engines/log-family/index.md)は、小規模な一時データ用です。
- [統合用のテーブルエンジン](../../../engines/table-engines/integrations/index.md)があります。

残りのエンジンは独自の目的を持ち、まだファミリーにグループ化されていないため、この「特殊」カテゴリに配置されています。

<!-- このページの目次は自動生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールド: slug, description, titleから生成されます。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。
-->
| ページ | 説明 |
|-----|-----|
| [バッファテーブルエンジン](/docs/engines/table-engines/special/buffer) | データをRAMに書き込むためにバッファし、定期的に他のテーブルにフラッシュします。読み取り操作中は、バッファと他のテーブルから同時にデータが読み取られます。 |
| [ExecutableおよびExecutablePoolテーブルエンジン](/docs/engines/table-engines/special/executable) | `Executable`および`ExecutablePool`テーブルエンジンは、あなたが定義するスクリプトから生成された行を持つテーブルを定義することを可能にします（**stdout**に行を書き込みます）。 |
| [URLテーブルエンジン](/docs/engines/table-engines/special/url) | リモートHTTP/HTTPSサーバーとの間でデータをクエリします。このエンジンはFileエンジンに似ています。 |
| [Viewテーブルエンジン](/docs/engines/table-engines/special/view) | ビューを実装するために使用されます（詳細については、`CREATE VIEWクエリ`を参照してください）。データは保存されず、指定された`SELECT`クエリのみが保存されます。テーブルから読み取る際には、このクエリが実行され（クエリからすべての不必要なカラムが削除されます）、 |
| [分散テーブルエンジン](/docs/engines/table-engines/special/distributed) | 分散エンジンのテーブルは、自身のデータを保存しませんが、複数のサーバーでの分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中には、リモートサーバーにあるテーブルインデックスが使用されます。 |
| [Fileテーブルエンジン](/docs/engines/table-engines/special/file) | Fileテーブルエンジンは、データを対応するファイルフォーマット（`TabSeparated`、`Native`など）のファイルに保持します。 |
| [FileLogエンジン](/docs/engines/table-engines/special/filelog) | このエンジンはアプリケーションログファイルをレコードのストリームとして処理することを可能にします。 |
| [Setテーブルエンジン](/docs/engines/table-engines/special/set) | 常にRAMにあるデータセットです。`IN`演算子の右側での使用を目的としています。 |
| [Dictionaryテーブルエンジン](/docs/engines/table-engines/special/dictionary) | `Dictionary`エンジンは、辞書データをClickHouseテーブルとして表示します。 |
| [GenerateRandomテーブルエンジン](/docs/engines/table-engines/special/generate) | GenerateRandomテーブルエンジンは、指定されたテーブルスキーマのランダムデータを生成します。 |
| [Memoryテーブルエンジン](/docs/engines/table-engines/special/memory) | Memoryエンジンは、データをRAMに非圧縮形式で保存します。データは読み取った時とまったく同じ形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。 |
| [Mergeテーブルエンジン](/docs/engines/table-engines/special/merge) | `Merge`エンジン（`MergeTree`とは異なります）は、データを自体で保存せず任意の数の他のテーブルから同時に読み取ることを可能にします。 |
| [クエリ処理のための外部データ](/docs/engines/table-engines/special/external-data) | ClickHouseはサーバーに必要なデータを、`SELECT`クエリとともに送信することを許可します。このデータは一時テーブルに格納され、クエリで使用することができます（例えば、`IN`演算子内で）。 |
| [Joinテーブルエンジン](/docs/engines/table-engines/special/join) | JOIN操作で使用するためのオプショナルな準備データ構造です。 |
| [KeeperMap](/docs/engines/table-engines/special/keeper-map) | このエンジンは、Keeper/ZooKeeperクラスタを、一貫性のあるキー値ストアとして使用でき、線形整合性のある書き込みおよび逐次整合性のある読み取りを提供します。 |
| [Nullテーブルエンジン](/docs/engines/table-engines/special/null) | `Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み取ると、応答は空になります。 |
