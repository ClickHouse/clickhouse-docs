---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Пользователи могут загружать данные в ClickHouse, используя Google Dataflow Java Runner'
---


# Dataflow Java Runner

Dataflow Java Runner позволяет выполнять пользовательские конвейеры Apache Beam на сервисе Dataflow Google Cloud. Этот подход предоставляет максимальную гибкость и хорошо подходит для сложных ETL процессов.

## Как это работает {#how-it-works}

1. **Реализация конвейера**  
   Чтобы использовать Java Runner, вам необходимо реализовать свой конвейер Beam, используя `ClickHouseIO` - наш официальный коннектор Apache Beam. Для примеров кода и инструкций о том, как использовать `ClickHouseIO`, пожалуйста, посетите [ClickHouse Apache Beam](/integrations/apache-beam).

2. **Развертывание**  
   После того как ваш конвейер разработан и сконфигурирован, вы можете развернуть его в Dataflow, используя инструменты развертывания Google Cloud. Подробные инструкции по развертыванию представлены в [документации Google Cloud Dataflow - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java).

**Примечание**: Этот подход предполагает знакомство с фреймворком Beam и навыками программирования. Если вы предпочитаете решение без кода, рассмотрите возможность использования [предварительно определенных шаблонов ClickHouse](./templates).  
