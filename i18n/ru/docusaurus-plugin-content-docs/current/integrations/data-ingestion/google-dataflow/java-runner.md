---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Пользователи могут загружать данные в ClickHouse с использованием Google Dataflow Java Runner'
title: 'Java Runner для Dataflow'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Java Runner для Dataflow

<ClickHouseSupportedBadge/>

Java Runner для Dataflow позволяет выполнять пользовательские конвейеры Apache Beam на сервисе Dataflow в Google Cloud. Этот подход обеспечивает максимальную гибкость и хорошо подходит для сложных ETL рабочих процессов.

## Как это работает {#how-it-works}

1. **Реализация конвейера**
   Чтобы использовать Java Runner, вам необходимо реализовать свой конвейер Beam с помощью `ClickHouseIO` - нашего официального коннектора Apache Beam. Для получения примеров кода и инструкций по использованию `ClickHouseIO` посетите [ClickHouse Apache Beam](/integrations/apache-beam).

2. **Развёртывание**
   После того как ваш конвейер реализован и настроен, вы можете развёртывать его на Dataflow с использованием инструментов развёртывания Google Cloud. Подробные инструкции по развёртыванию предоставлены в [документации Google Cloud Dataflow - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java).

**Примечание**: Этот подход предполагает знакомство с фреймворком Beam и навыки программирования. Если вы предпочитаете решение без кода, рассмотрите возможность использования [предварительно заданных шаблонов ClickHouse](./templates).
