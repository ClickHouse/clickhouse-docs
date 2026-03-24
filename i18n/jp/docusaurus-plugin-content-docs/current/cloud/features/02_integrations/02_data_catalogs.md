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

ClickHouse Cloud は、オープンテーブルフォーマットのデータカタログに直接接続でき、データを複製することなくデータレイクテーブルへアクセスできます。
この統合により、カタログのテーブルは ClickHouse 内でクエリ可能なデータベースとして表示されます。
設定は、SQL コマンド ([DataLakeCatalog](/engines/database-engines/datalakecatalog)) と ClickHouse Cloud の UI の Data Sources タブの両方から行えます。

UI を使用する場合:

* Data Catalog オブジェクトと整合したフィールドを持つフォームにより設定を簡素化
* アクティブなデータカタログ統合を一元的に管理できるインターフェースを提供
* 保存時に接続および認証情報をテスト

<Image img={data_catalogs_ui} size="md" alt="データカタログ統合を表示した ClickHouse Cloud UI" />

| 名前                   | サポートされるオープンテーブルフォーマット                        | 認証方式                          | サポート                                                                | バージョン  |
| -------------------- | -------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- | ------ |
| AWS Glue Catalog     | Iceberg                                      | IAM/アクセスキー                    | Cloud &amp; [Core](/use-cases/data-lake/glue-catalog)               | 25.10+ |
| Lakekeeper           | Iceberg                                      | OAuth クライアント認証情報              | [Core](/use-cases/data-lake/lakekeeper-catalog)                     | 25.10+ |
| Microsoft OneLake    | Iceberg                                      | Azure Active Directory (AAD)  | Cloud &amp; [Core](/use-cases/data-lake/onelake-catalog)            | 25.12+ |
| Nessie               | Iceberg                                      | OAuth クライアント認証情報              | [Core](/use-cases/data-lake/nessie-catalog)                         | 25.10+ |
| Polaris/Open Catalog | Iceberg                                      | OAuth クライアント認証情報              | [Core](/use-cases/data-lake/polaris-catalog)                        | 26.1+  |
| REST catalog         | Iceberg                                      | OAuth クライアント認証情報、Bearer token | Cloud &amp; [Core](/use-cases/data-lake/rest-catalog)               | 25.10+ |
| Unity Catalog        | Iceberg (UniForm-enabled and managed), Delta | OAuth クライアント認証情報              | Cloud (Iceberg のみ) &amp; [Core](/use-cases/data-lake/unity-catalog) | 25.10+ |

今後の対応として、Horizon や S3 テーブル向け REST endpoint など、さらに多くのカタログを予定しています。
