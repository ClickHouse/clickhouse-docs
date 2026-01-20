---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Вы можете осуществлять приём данных в ClickHouse с помощью Java Runner для Google Dataflow'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'коннектор ClickHouseIO']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Java-раннер Dataflow \{#dataflow-java-runner\}

<ClickHouseSupportedBadge/>

Java-раннер Dataflow позволяет выполнять пользовательские конвейеры Apache Beam в службе Dataflow в Google Cloud. Такой подход обеспечивает максимальную гибкость и хорошо подходит для сложных ETL‑процессов.

## Как это работает \{#how-it-works\}

1. **Реализация конвейера**
   Чтобы использовать Java Runner, вам нужно реализовать конвейер Beam с помощью `ClickHouseIO` — нашего официального коннектора Apache Beam. Примеры кода и инструкции по использованию `ClickHouseIO` доступны на странице [ClickHouse Apache Beam](/integrations/apache-beam).

2. **Развертывание**
   После того как ваш конвейер реализован и настроен, вы можете развернуть его в сервисе Dataflow с помощью инструментов развертывания Google Cloud. Подробные инструкции по развертыванию приведены в разделе [Google Cloud Dataflow — конвейер на Java](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java).

**Примечание**: Этот подход предполагает, что вы знакомы с фреймворком Beam и обладаете опытом программирования. Если вы предпочитаете решение без написания кода, рассмотрите возможность использования [предопределённых шаблонов ClickHouse](./templates).