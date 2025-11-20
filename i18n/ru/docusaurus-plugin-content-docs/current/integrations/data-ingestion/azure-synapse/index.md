---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Знакомство с Azure Synapse и ClickHouse'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'Интеграция Azure Synapse с ClickHouse'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Azure Synapse с ClickHouse

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) — это интегрированный аналитический сервис, который объединяет большие данные, data science и хранилища данных, обеспечивая быстрый анализ больших объемов данных.
В Synapse пулы Spark предоставляют масштабируемые по запросу кластеры [Apache Spark](https://spark.apache.org), которые позволяют выполнять сложные преобразования данных, задачи машинного обучения и интеграцию с внешними системами.

В этой статье показано, как интегрировать [коннектор ClickHouse для Spark](/integrations/apache-spark/spark-native-connector) при работе с Apache Spark в Azure Synapse.

<TOCInline toc={toc}></TOCInline>



## Добавление зависимостей коннектора {#add-connector-dependencies}

Azure Synapse поддерживает три уровня [управления пакетами](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries):

1. Пакеты по умолчанию
2. На уровне пула Spark
3. На уровне сессии

<br />

Следуйте руководству [Управление библиотеками для пулов Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) и добавьте в своё Spark-приложение следующие необходимые зависимости:

- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` — [официальный репозиторий Maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` — [официальный репозиторий Maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

Ознакомьтесь с разделом документации [Матрица совместимости Spark Connector](/integrations/apache-spark/spark-native-connector#compatibility-matrix), чтобы понять, какие версии подходят под ваши задачи.


## Добавление ClickHouse в качестве каталога {#add-clickhouse-as-catalog}

Существует несколько способов добавления конфигураций Spark в вашу сессию:

- Пользовательский файл конфигурации для загрузки с сессией
- Добавление конфигураций через интерфейс Azure Synapse
- Добавление конфигураций в вашем блокноте Synapse

Следуйте инструкциям [Управление конфигурацией Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
и добавьте [необходимые конфигурации Spark для коннектора](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

Например, вы можете настроить Spark-сессию в блокноте с помощью следующих параметров:

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

Убедитесь, что эта конфигурация находится в первой ячейке следующим образом:

<Image
  img={sparkConfigViaNotebook}
  size='xl'
  alt='Настройка конфигураций Spark через блокнот'
  border
/>

Посетите [страницу конфигураций ClickHouse Spark](/integrations/apache-spark/spark-native-connector#configurations) для получения дополнительных настроек.

:::info
При работе с ClickHouse Cloud убедитесь, что установлены [необходимые настройки Spark](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings).  
:::


## Проверка настройки {#setup-verification}

Чтобы убедиться, что зависимости и конфигурации были успешно установлены, откройте веб-интерфейс Spark UI вашей сессии и перейдите на вкладку `Environment`.
Там найдите настройки, связанные с ClickHouse:

<Image
  img={sparkUICHSettings}
  size='xl'
  alt='Проверка настроек ClickHouse с помощью Spark UI'
  border
/>


## Дополнительные ресурсы {#additional-resources}

- [Документация по коннектору ClickHouse Spark](/integrations/apache-spark)
- [Обзор пулов Spark в Azure Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Оптимизация производительности рабочих нагрузок Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Управление библиотеками для пулов Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Управление конфигурацией Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
