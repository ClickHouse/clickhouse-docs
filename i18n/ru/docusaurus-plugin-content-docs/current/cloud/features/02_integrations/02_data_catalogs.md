---
sidebar_label: 'Каталоги данных'
slug: /manage/data-catalogs
title: 'Каталоги данных'
description: 'Интеграции с каталогами данных для ClickHouse Cloud'
doc_type: 'landing-page'
keywords: ['каталоги данных', 'возможности Cloud', 'озера данных', 'iceberg', 'интеграции']
---

import data_catalogs_ui from '@site/static/images/cloud/features/data-catalogs-ui.png';
import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse Cloud может напрямую подключаться к вашим каталогам данных в открытых табличных форматах, предоставляя доступ к таблицам озера данных без дублирования данных.
Благодаря интеграции таблицы вашего каталога будут отображаться как доступные для запросов базы данных в ClickHouse.
Настройку можно выполнить как с помощью SQL-команды ([DataLakeCatalog](/engines/database-engines/datalakecatalog)), так и через интерфейс ClickHouse Cloud на вкладке Data Sources.

Использование интерфейса:

* Упрощает настройку с помощью формы с полями, соответствующими объектам вашего каталога данных
* Предоставляет единый интерфейс для активных интеграций с каталогами данных
* Проверяет подключения и учетные данные при сохранении

<Image img={data_catalogs_ui} size="md" alt="Интерфейс ClickHouse Cloud с интеграциями каталогов данных" />

| Имя                  | Поддерживаемый открытый табличный формат            | Метод аутентификации                       | Поддержка                                                               | Версия |
| -------------------- | --------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- | ------ |
| AWS Glue Catalog     | Iceberg                                             | IAM/ключи доступа                          | Cloud &amp; [Core](/use-cases/data-lake/glue-catalog)                   | 25.10+ |
| Lakekeeper           | Iceberg                                             | учетные данные клиента OAuth               | [Core](/use-cases/data-lake/lakekeeper-catalog)                         | 25.10+ |
| Microsoft OneLake    | Iceberg                                             | Azure Active Directory (AAD)               | Cloud &amp; [Core](/use-cases/data-lake/onelake-catalog)                | 25.12+ |
| Nessie               | Iceberg                                             | учетные данные клиента OAuth               | [Core](/use-cases/data-lake/nessie-catalog)                             | 25.10+ |
| Polaris/Open Catalog | Iceberg                                             | учетные данные клиента OAuth               | [Core](/use-cases/data-lake/polaris-catalog)                            | 26.1+  |
| REST catalog         | Iceberg                                             | учетные данные клиента OAuth, Bearer token | Cloud &amp; [Core](/use-cases/data-lake/rest-catalog)                   | 25.10+ |
| Unity Catalog        | Iceberg (с поддержкой UniForm и управляемый), Delta | учетные данные клиента OAuth               | Cloud (только Iceberg) &amp; [Core](/use-cases/data-lake/unity-catalog) | 25.10+ |

Мы планируем поддержку большего числа каталогов, включая Horizon и REST endpoint для таблиц S3.
