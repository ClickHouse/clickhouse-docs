---
'sidebar_label': 'Java Runner'
'slug': '/integrations/google-dataflow/java-runner'
'sidebar_position': 2
'description': 'Пользователи могут принимать данные в ClickHouse, используя Google
  Dataflow Java Runner'
'title': 'Dataflow Java Runner'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java runner

<ClickHouseSupportedBadge/>

Java Runner для Dataflow позволяет выполнять пользовательские конвейеры Apache Beam на сервисе Dataflow в Google Cloud. Этот подход предоставляет максимальную гибкость и хорошо подходит для сложных ETL-процессов.

## Как это работает {#how-it-works}

1. **Реализация конвейера**  
   Для использования Java Runner вам необходимо реализовать свой конвейер Beam, используя `ClickHouseIO` - наш официальный коннектор Apache Beam. Для получения примеров кода и инструкций по использованию `ClickHouseIO`, пожалуйста, посетите [ClickHouse Apache Beam](/integrations/apache-beam).

2. **Развертывание**  
   Как только ваш конвейер будет реализован и настроен, вы можете развернуть его в Dataflow, используя инструменты развертывания Google Cloud. Подробные инструкции по развертыванию приведены в [документации Google Cloud Dataflow - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java).

**Примечание**: Этот подход предполагает знакомство с фреймворком Beam и навыки программирования. Если вы предпочитаете решение без кода, рассмотрите возможность использования [предварительно определенных шаблонов ClickHouse](./templates).
