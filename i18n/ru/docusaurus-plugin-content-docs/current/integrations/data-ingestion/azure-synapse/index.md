---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'Введение в работу с Azure Synapse и ClickHouse'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'Интеграция Azure Synapse и ClickHouse'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Azure Synapse с ClickHouse

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) — это интегрированный сервис аналитики, который объединяет большие данные, data science и хранилища данных для быстрого крупномасштабного анализа данных.
В Synapse пулы Spark предоставляют масштабируемые кластеры [Apache Spark](https://spark.apache.org) по требованию, которые позволяют пользователям выполнять сложные преобразования данных, машинное обучение и интеграцию с внешними системами.

В этой статье показано, как интегрировать [коннектор ClickHouse Spark](/integrations/apache-spark/spark-native-connector) при работе с Apache Spark в Azure Synapse.

<TOCInline toc={toc}></TOCInline>



## Добавление зависимостей коннектора {#add-connector-dependencies}

Azure Synapse поддерживает три уровня [управления пакетами](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries):

1. Пакеты по умолчанию
2. Уровень пула Spark
3. Уровень сессии

<br />

Следуйте инструкциям из руководства [Manage libraries for Apache Spark pools](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) и добавьте следующие необходимые зависимости в ваше Spark-приложение:

- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` — [официальный maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` — [официальный maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

Обратитесь к документации [Матрица совместимости Spark Connector](/integrations/apache-spark/spark-native-connector#compatibility-matrix), чтобы определить, какие версии подходят для ваших задач.


## Добавление ClickHouse в качестве каталога {#add-clickhouse-as-catalog}

Существует несколько способов добавления конфигураций Spark в вашу сессию:

- Пользовательский файл конфигурации для загрузки с сессией
- Добавление конфигураций через интерфейс Azure Synapse
- Добавление конфигураций в notebook Synapse

Следуйте инструкциям [Manage Apache Spark configuration](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
и добавьте [необходимые конфигурации Spark для коннектора](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

Например, вы можете настроить Spark-сессию в notebook с помощью следующих параметров:

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

Убедитесь, что эта конфигурация находится в первой ячейке:

<Image
  img={sparkConfigViaNotebook}
  size='xl'
  alt='Настройка конфигураций Spark через notebook'
  border
/>

Посетите [страницу конфигураций ClickHouse Spark](/integrations/apache-spark/spark-native-connector#configurations) для получения дополнительных настроек.

:::info
При работе с ClickHouse Cloud убедитесь, что установлены [необходимые настройки Spark](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings).  
:::


## Проверка настройки {#setup-verification}

Чтобы убедиться, что зависимости и конфигурации были успешно установлены, откройте веб-интерфейс Spark вашей сессии и перейдите на вкладку `Environment`.
Там найдите настройки, связанные с ClickHouse:

<Image
  img={sparkUICHSettings}
  size='xl'
  alt='Проверка настроек ClickHouse с помощью веб-интерфейса Spark'
  border
/>


## Дополнительные ресурсы {#additional-resources}

- [Документация по коннектору ClickHouse Spark](/integrations/apache-spark)
- [Обзор пулов Spark в Azure Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Оптимизация производительности рабочих нагрузок Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Управление библиотеками для пулов Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Управление конфигурацией Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
