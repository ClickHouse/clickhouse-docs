---
'slug': '/cloud/reference/shared-catalog'
'sidebar_label': '共有カタログ'
'title': '共有カタログと共有データベースエンジン'
'keywords':
- 'SharedCatalog'
- 'SharedDatabaseEngine'
'description': '共有カタログコンポーネントとClickHouse Cloudにおける共有データベースエンジンについて説明します'
'doc_type': 'reference'
---


# Shared catalog and shared database engine {#shared-catalog-and-shared-database-engine}

**ClickHouse Cloud（およびファーストパーティパートナーのクラウドサービス）専用**

Shared Catalogは、ClickHouse Cloud内のレプリカ間でステートレスエンジンを使用するデータベースやテーブルのメタデータおよびDDL操作をレプリケートする、クラウドネイティブなコンポーネントです。これにより、動的または部分的にオフラインの環境でも、これらのオブジェクトの一貫した状態管理が可能になり、メタデータの整合性が確保されます。

Shared Catalogは**テーブル自体をレプリケートしません**が、DDLクエリとメタデータをレプリケートすることで、すべてのレプリカがデータベースおよびテーブル定義の一貫したビューを持つことを確保します。

以下のデータベースエンジンのレプリケーションをサポートしています：

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog

## Architecture and metadata storage {#architecture-and-metadata-storage}

Shared Catalog内のすべてのメタデータとDDLクエリの履歴は、ZooKeeperに中央集中的に保存されます。ローカルディスクには何も永続化されません。このアーキテクチャにより、次のことが保証されます：

- すべてのレプリカ間での一貫した状態
- コンピュートノードのステートレス性
- 高速で信頼性の高いレプリカブートストラッピング

## Shared database engine {#shared-database-engine}

**Shared database engine**は、Shared Catalogと連携して、**ステートレステーブルエンジン**（例：`SharedMergeTree`）を使用するテーブルを持つデータベースを管理します。これらのテーブルエンジンは、永続的な状態をディスクに書き込まず、動的なコンピュート環境と互換性があります。

Shared database engineは、Replicated database engineの動作を基に改善され、追加の保証と運用上の利点を提供します。

### Key benefits {#key-benefits}

- **原子的なCREATE TABLE ... AS SELECT**
  テーブルの作成とデータ挿入は原子的に実行されます—操作全体が完了するか、テーブルは全く作成されません。

- **データベース間でのRENAME TABLE**
  データベース間でのテーブルの原子的な移動を可能にします：
```sql
RENAME TABLE db1.table TO db2.table;
```

- **UNDROP TABLEによる自動テーブル回復**
  削除されたテーブルは、デフォルトで8時間保持され、復元可能です：
```sql
UNDROP TABLE my_table;
```
  保存期間はサーバー設定で構成可能です。

- **改善されたコンピュート間の分離**
  削除クエリを処理するためにすべてのレプリカがオンラインである必要があるReplicated database engineとは異なり、Shared Catalogはメタデータの中央集中的な削除を実行します。これにより、一部のレプリカがオフラインのときでも操作が成功します。

- **自動メタデータレプリケーション**
  Shared Catalogは、データベース定義が起動時にすべてのサーバーに自動的にレプリケートされることを保証します。オペレーターは、新しいインスタンスでメタデータを手動で構成または同期する必要はありません。

- **中央集約型、バージョン管理されたメタデータの状態**
  Shared Catalogは、ZooKeeperに単一の信頼のソースを保存します。レプリカが起動すると、最新の状態を取得し、整合性を確保するために差分を適用します。クエリ実行中に、システムは他のレプリカが少なくとも必要なバージョンのメタデータに達するまで待つことができます。

## Usage in ClickHouse Cloud {#usage-in-clickhouse-cloud}

エンドユーザーがShared CatalogとShared database engineを使用する際には、追加の構成は必要ありません。データベースの作成は、従来通りの手順です：

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloudは、自動的にデータベースにShared database engineを割り当てます。このようなデータベース内でステートレスエンジンを使用して作成されたテーブルは、Shared Catalogのレプリケーションおよび調整機能の恩恵を自動的に受けます。

## Summary {#summary}

Shared CatalogとShared database engineは次の機能を提供します：

- ステートレスエンジン用の信頼性の高い自動メタデータレプリケーション
- ローカルメタデータ永続化なしのステートレスコンピュート
- 複雑なDDLに対する原子的操作
- 弾力的、一時的、または部分的にオフラインのコンピュート環境への改善されたサポート
- ClickHouse Cloudユーザーにとってシームレスな利用

これらの機能により、Shared CatalogはClickHouse Cloudにおけるスケーラブルでクラウドネイティブなメタデータ管理の基盤となります。
