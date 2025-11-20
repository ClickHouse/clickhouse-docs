---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Пользователи могут импортировать данные в ClickHouse с помощью Google Dataflow Java Runner'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'ClickHouseIO connector']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Исполнитель Dataflow Java

<ClickHouseSupportedBadge/>

Исполнитель Dataflow Java позволяет выполнять пользовательские конвейеры Apache Beam в сервисе Dataflow на Google Cloud. Этот подход обеспечивает максимальную гибкость и хорошо подходит для продвинутых ETL‑процессов.



## Как это работает {#how-it-works}

1. **Реализация конвейера**
   Для использования Java Runner необходимо реализовать конвейер Beam с использованием `ClickHouseIO` — официального коннектора Apache Beam. Примеры кода и инструкции по использованию `ClickHouseIO` доступны на странице [ClickHouse Apache Beam](/integrations/apache-beam).

2. **Развёртывание**
   После реализации и настройки конвейера его можно развернуть в Dataflow с помощью инструментов развёртывания Google Cloud. Подробные инструкции по развёртыванию приведены в [документации Google Cloud Dataflow — Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java).

**Примечание**: Данный подход предполагает знакомство с фреймворком Beam и навыки программирования. Если вы предпочитаете решение без написания кода, рассмотрите возможность использования [предопределённых шаблонов ClickHouse](./templates).
