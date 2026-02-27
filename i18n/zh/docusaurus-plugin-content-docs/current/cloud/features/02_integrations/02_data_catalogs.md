---
sidebar_label: '数据目录'
slug: /manage/data-catalogs
title: '数据目录'
description: '适用于 ClickHouse Cloud 的数据目录集成'
doc_type: 'landing-page'
keywords: ['数据目录', 'Cloud 特性', '数据湖', 'Iceberg', '集成']
---

import data_catalogs_ui from '@site/static/images/cloud/features/data-catalogs-ui.png';
import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse Cloud 可以直接连接到您的开放表格式数据目录，让您在不复制数据的情况下访问数据湖中的表。完成集成后，目录中的表会作为可查询的数据库出现在 ClickHouse 中。您可以通过 SQL 命令（[DataLakeCatalog](/engines/database-engines/datalakecatalog)），或在 ClickHouse Cloud UI 的 Data Sources 选项卡中完成配置。

通过 UI：

* 使用与数据目录对象字段一致的表单来简化配置
* 为所有活动数据目录集成提供统一界面
* 在保存时测试连接和凭证

<Image img={data_catalogs_ui} size="md" alt="带有数据目录集成的 ClickHouse Cloud UI" />

| Name                 | Open Table Format Supported                  | Support                                                               | Version |
| -------------------- | -------------------------------------------- | --------------------------------------------------------------------- | ------- |
| AWS Glue Catalog     | Iceberg                                      | Cloud &amp; [Core](/use-cases/data-lake/glue-catalog)                 | 25.10+  |
| Lakekeeper           | Iceberg                                      | [Core](/use-cases/data-lake/lakekeeper-catalog)                       | 25.10+  |
| Microsoft OneLake    | Iceberg                                      | Cloud &amp; [Core](/use-cases/data-lake/onelake-catalog)              | 25.12+  |
| Nessie               | Iceberg                                      | [Core](/use-cases/data-lake/nessie-catalog)                           | 25.10+  |
| Polaris/Open Catalog | Iceberg                                      | Core                                                                  | 26.1+   |
| REST catalog         | Iceberg                                      | [Core](/use-cases/data-lake/rest-catalog)                             | 25.10+  |
| Unity Catalog        | Iceberg (UniForm-enabled and managed), Delta | Cloud (Iceberg only) &amp; [Core](/use-cases/data-lake/unity-catalog) | 25.10+  |

我们计划支持更多目录，包括 Horizon 和 S3 表的 REST 端点。
