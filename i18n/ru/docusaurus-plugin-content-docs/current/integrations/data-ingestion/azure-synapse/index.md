---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Введение в интеграцию Azure Synapse с ClickHouse'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'данные']
title: 'Интеграция Azure Synapse с ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) — это интегрированный аналитический сервис, который объединяет большие данные, data science и хранилища данных, позволяя быстро анализировать большие объемы данных.
В Synapse пулы Spark предоставляют масштабируемые по требованию кластеры [Apache Spark](https://spark.apache.org), которые позволяют выполнять сложные преобразования данных, машинное обучение и интеграцию с внешними системами.

В этой статье показано, как интегрировать [коннектор ClickHouse Spark](/integrations/apache-spark/spark-native-connector) при работе с Apache Spark в Azure Synapse.

<TOCInline toc={toc} />

## Добавьте зависимости коннектора \{#add-connector-dependencies\}

Azure Synapse поддерживает три уровня [управления пакетами](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries):

1. Пакеты по умолчанию
2. Уровень пула Spark
3. Уровень сеанса

<br />

Следуйте руководству [Manage libraries for Apache Spark pools](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) и добавьте в приложение Spark следующие обязательные зависимости:

* `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` — [официальный Maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
* `clickhouse-jdbc-{java_client_version}-all.jar` — [официальный Maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

Ознакомьтесь с документацией [Spark Connector Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix), чтобы определить, какие версии подходят для ваших задач.

## Добавьте ClickHouse как каталог \{#add-clickhouse-as-catalog\}

Есть несколько способов добавить конфигурации Spark в ваш сеанс:

* Пользовательский файл конфигурации, загружаемый вместе с сеансом
* Добавьте конфигурации через интерфейс Azure Synapse
* Добавьте конфигурации в ноутбуке Synapse

Следуйте инструкции [Управление конфигурацией Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
и добавьте [конфигурации Spark, необходимые для коннектора](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

Например, вы можете настроить сеанс Spark в ноутбуке, указав следующие параметры:

```python
%%configure -f
{
    "conf": {
        "spark.sql.catalog.clickhouse": "com.clickhouse.spark.ClickHouseCatalog",
        "spark.sql.catalog.clickhouse.host": "<clickhouse host>",
        "spark.sql.catalog.clickhouse.protocol": "https",
        "spark.sql.catalog.clickhouse.http_port": "<port>",
        "spark.sql.catalog.clickhouse.user": "<username>",
        "spark.sql.catalog.clickhouse.password": "password",
        "spark.sql.catalog.clickhouse.database": "default"
    }
}
```

Убедитесь, что в первой ячейке указано следующее:

<Image img={sparkConfigViaNotebook} size="xl" alt="Настройка конфигурации Spark через notebook" border />

Дополнительные параметры см. на [странице конфигураций ClickHouse Spark](/integrations/apache-spark/spark-native-connector#configurations).

:::info
При работе с ClickHouse Cloud обязательно задайте [необходимые параметры Spark](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings).
:::

## Проверка настройки \{#setup-verification\}

Чтобы убедиться, что зависимости и параметры конфигурации заданы успешно, откройте Spark UI для вашего сеанса и перейдите на вкладку `Environment`.
Там найдите настройки, связанные с ClickHouse:

<Image img={sparkUICHSettings} size="xl" alt="Проверка настроек ClickHouse в Spark UI" border />

## Дополнительные ресурсы \{#additional-resources\}

* [Документация коннектора ClickHouse Spark](/integrations/apache-spark)
* [Обзор пулов Spark в Azure Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
* [Оптимизация производительности рабочих нагрузок Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
* [Управление библиотеками для пулов Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
* [Управление конфигурацией Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)