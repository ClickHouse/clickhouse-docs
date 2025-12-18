---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Введение в Azure Synapse с ClickHouse'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'Интеграция Azure Synapse с ClickHouse'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Azure Synapse с ClickHouse {#integrating-azure-synapse-with-clickhouse}

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) — это интегрированный аналитический сервис, который объединяет большие данные, data science и хранилища данных, обеспечивая быструю аналитику в крупном масштабе.
В Synapse пулы Spark предоставляют масштабируемые по запросу кластеры [Apache Spark](https://spark.apache.org), которые позволяют выполнять сложные преобразования данных, задачи машинного обучения и интеграции с внешними системами.

В этой статье вы узнаете, как интегрировать [коннектор ClickHouse Spark](/integrations/apache-spark/spark-native-connector) при работе с Apache Spark в Azure Synapse.

<TOCInline toc={toc}></TOCInline>

## Добавление зависимостей коннектора {#add-connector-dependencies}
Azure Synapse поддерживает три уровня [управления пакетами](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries):
1. Пакеты по умолчанию
2. Уровень пула Spark
3. Уровень сессии

<br/>

Следуйте руководству [Manage libraries for Apache Spark pools](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) и добавьте следующие необходимые зависимости в ваше приложение Spark:
- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` — [официальный репозиторий Maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` — [официальный репозиторий Maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

Ознакомьтесь с документацией [Spark Connector Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix), чтобы подобрать версии, соответствующие вашим требованиям.

## Добавить ClickHouse как каталог {#add-clickhouse-as-catalog}

Существует несколько способов добавить конфигурации Spark в ваш сеанс:

* Пользовательский файл конфигурации, загружаемый вместе с сеансом
* Добавить конфигурации через интерфейс Azure Synapse
* Добавить конфигурации в блокноте Synapse

Следуйте руководству [Manage Apache Spark configuration](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
и добавьте [обязательные для коннектора конфигурации Spark](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

Например, вы можете настроить сеанс Spark в блокноте со следующими параметрами:

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

Убедитесь, что это находится в первой ячейке, как показано ниже:

<Image img={sparkConfigViaNotebook} size="xl" alt="Настройка параметров Spark через notebook" border />

Перейдите на страницу [ClickHouse Spark configurations](/integrations/apache-spark/spark-native-connector#configurations) для получения дополнительных настроек.

:::info
При работе с ClickHouse Cloud обязательно задайте [обязательные параметры Spark](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings).
:::


## Проверка настройки {#setup-verification}

Чтобы убедиться, что зависимости и конфигурации были успешно настроены, перейдите в Spark UI вашего сеанса и откройте вкладку `Environment`.
Там найдите параметры, относящиеся к ClickHouse:

<Image img={sparkUICHSettings} size="xl" alt="Проверка настроек ClickHouse с помощью Spark UI" border/>

## Дополнительные ресурсы {#additional-resources}

- [Документация по коннектору ClickHouse для Spark](/integrations/apache-spark)
- [Обзор пулов Spark в Azure Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Оптимизация производительности нагрузок Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Управление библиотеками для пулов Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Управление конфигурацией Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)