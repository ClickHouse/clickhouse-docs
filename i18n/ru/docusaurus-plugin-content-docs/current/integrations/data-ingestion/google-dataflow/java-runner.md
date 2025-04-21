---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Пользователи могут загружать данные в ClickHouse с помощью Google Dataflow Java Runner'
title: 'Dataflow Java Runner'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java Runner

<ClickHouseSupportedBadge/>

Dataflow Java Runner позволяет вам выполнять пользовательские конвейеры Apache Beam на сервисе Dataflow от Google Cloud. Этот подход предоставляет максимальную гибкость и хорошо подходит для продвинутых ETL процессов.

## How It Works {#how-it-works}

1. **Реализация конвейера**
   Чтобы использовать Java Runner, вам необходимо реализовать свой конвейер Beam с использованием `ClickHouseIO` - нашего официального коннектора Apache Beam. Для примеров кода и инструкций по использованию `ClickHouseIO`, пожалуйста, посетите [ClickHouse Apache Beam](/integrations/apache-beam).

2. **Развертывание**
   Как только ваш конвейер реализован и сконфигурирован, вы можете развернуть его в Dataflow с использованием инструментов развертывания Google Cloud. Полные инструкции по развертыванию приведены в [документации Google Cloud Dataflow - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java).

**Примечание**: Этот подход предполагает знакомство с фреймворком Beam и знания в программировании. Если вы предпочитаете решение без кода, рассмотрите возможность использования [предварительно определенных шаблонов ClickHouse](./templates).
