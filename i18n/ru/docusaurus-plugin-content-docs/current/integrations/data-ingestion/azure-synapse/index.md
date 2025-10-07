---
'sidebar_label': 'Azure Synapse'
'slug': '/integrations/azure-synapse'
'description': 'Введение в Azure Synapse с ClickHouse'
'keywords':
- 'clickhouse'
- 'azure synapse'
- 'azure'
- 'synapse'
- 'microsoft'
- 'azure spark'
- 'data'
'title': 'Интеграция Azure Synapse с ClickHouse'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';


# Интеграция Azure Synapse с ClickHouse

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) — это интегрированная аналитическая служба, которая объединяет большие данные, Data Science и хранилища для обеспечения быстрой обработки больших объемов данных. Внутри Synapse кластеры Spark предоставляют по требованию масштабируемые [Apache Spark](https://spark.apache.org) кластеры, которые позволяют пользователям выполнять сложные преобразования данных, машинное обучение и интеграцию с внешними системами.

В этой статье показано, как интегрировать [ClickHouse Spark connector](/integrations/apache-spark/spark-native-connector) при работе с Apache Spark в Azure Synapse.

<TOCInline toc={toc}></TOCInline>

## Добавление зависимостей коннектора {#add-connector-dependencies}
Azure Synapse поддерживает три уровня [обслуживания пакетов](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries):
1. Пакеты по умолчанию
2. Уровень пула Spark
3. Уровень сессии

<br/>

Следуйте [руководству по управлению библиотеками для пулов Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) и добавьте следующие необходимые зависимости в ваше Spark приложение:
- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [официальный maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [официальный maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

Пожалуйста, посетите нашу [матрицу совместимости Spark Connector](/integrations/apache-spark/spark-native-connector#compatibility-matrix), чтобы понять, какие версии подходят вашим потребностям.

## Добавление ClickHouse в качестве каталога {#add-clickhouse-as-catalog}

Существует несколько способов добавить конфигурации Spark в вашу сессию:
* Пользовательский файл конфигурации, который будет загружен с вашей сессией
* Добавление конфигураций через интерфейс Azure Synapse
* Добавление конфигураций в вашем блокноте Synapse

Следуйте [руководству по управлению конфигурацией Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration) и добавьте [необходимые конфигурации Spark для коннектора](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

Например, вы можете настроить вашу Spark сессию в вашем блокноте с помощью этих настроек:

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

Убедитесь, что это будет в первой ячейке следующим образом:

<Image img={sparkConfigViaNotebook} size="xl" alt="Настройка конфигураций Spark через блокнот" border/>

Пожалуйста, посетите [страницу конфигураций ClickHouse Spark](/integrations/apache-spark/spark-native-connector#configurations) для дополнительных настроек.

:::info
При работе с ClickHouse Cloud убедитесь, что установлены [обязательные настройки Spark](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings).  
:::

## Проверка настройки {#setup-verification}

Чтобы убедиться, что зависимости и конфигурации установлены успешно, посетите Spark UI вашей сессии и перейдите на вкладку `Environment`. Там найдите ваши настройки, связанные с ClickHouse:

<Image img={sparkUICHSettings} size="xl" alt="Проверка настроек ClickHouse с помощью Spark UI" border/>

## Дополнительные ресурсы {#additional-resources}

- [Документация ClickHouse Spark Connector](/integrations/apache-spark)
- [Обзор пулов Spark Azure Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Оптимизация производительности для рабочих нагрузок Apache Spark](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Управление библиотеками для пулов Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Управление конфигурацией Apache Spark в Synapse](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
