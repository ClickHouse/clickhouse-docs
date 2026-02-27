---
sidebar_label: 'データカタログ'
slug: /manage/data-catalogs
title: 'データカタログ'
description: 'ClickHouse Cloud 向けのデータカタログ統合機能'
doc_type: 'landing-page'
keywords: ['データカタログ', 'Cloud の機能', 'データレイク', 'Iceberg', '統合']
---

import data_catalogs_ui from '@site/static/images/cloud/features/data-catalogs-ui.png';
import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse Cloud は、オープンテーブルフォーマットのデータカタログに直接接続でき、データを複製することなくデータレイクテーブルへアクセスできます。統合すると、カタログのテーブルは ClickHouse 内でクエリ可能なデータベースとして表示されます。設定は、SQL コマンド（[DataLakeCatalog](/engines/database-engines/datalakecatalog)）または ClickHouse Cloud の UI の Data Sources タブから行えます。

UI を使用する場合:

* Data Catalog オブジェクトと整合したフィールドを持つフォームにより設定を簡素化
* アクティブなデータカタログ統合を一元的に管理できるインターフェースを提供
* 保存時に接続および認証情報をテスト

<Image img={data_catalogs_ui} size="md" alt="データカタログ統合を表示した ClickHouse Cloud UI" />

| 名前                   | サポートされるオープンテーブルフォーマット                        | サポート                                                                | バージョン  |
| -------------------- | -------------------------------------------- | ------------------------------------------------------------------- | ------ |
| AWS Glue Catalog     | Iceberg                                      | Cloud &amp; [Core](/use-cases/data-lake/glue-catalog)               | 25.10+ |
| Lakekeeper           | Iceberg                                      | [Core](/use-cases/data-lake/lakekeeper-catalog)                     | 25.10+ |
| Microsoft OneLake    | Iceberg                                      | Cloud &amp; [Core](/use-cases/data-lake/onelake-catalog)            | 25.12+ |
| Nessie               | Iceberg                                      | [Core](/use-cases/data-lake/nessie-catalog)                         | 25.10+ |
| Polaris/Open Catalog | Iceberg                                      | Core                                                                | 26.1+  |
| REST catalog         | Iceberg                                      | [Core](/use-cases/data-lake/rest-catalog)                           | 25.10+ |
| Unity Catalog        | Iceberg (UniForm-enabled and managed), Delta | Cloud (Iceberg のみ) &amp; [Core](/use-cases/data-lake/unity-catalog) | 25.10+ |

今後の対応として、Horizon や S3 テーブル向け REST エンドポイントなど、さらに多くのカタログを予定しています。
