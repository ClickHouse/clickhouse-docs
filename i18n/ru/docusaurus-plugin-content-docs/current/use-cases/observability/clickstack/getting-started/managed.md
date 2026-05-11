---
slug: /use-cases/observability/clickstack/getting-started/managed
title: 'Начало работы с Managed ClickStack'
sidebar_label: 'Managed'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Начало работы с Managed ClickStack'
doc_type: 'guide'
keywords: ['Managed ClickStack', 'начало работы', 'ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/clickstack/getting-started/signup_page.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import BetaBadge from '@theme/badges/BetaBadge';
import SetupManagedIngestion from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import ProviderSelection from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import NavigateClickStackUI from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import service_connect from '@site/static/images/_snippets/service_connect.png';

<BetaBadge />

Самый простой способ начать — развернуть **Managed ClickStack** в **ClickHouse Cloud**, что обеспечивает полностью управляемый, безопасный бекенд при сохранении полного контроля над ингестией, схемой и обсервабилити-процессами. Это устраняет необходимость самостоятельной эксплуатации ClickHouse и даёт ряд преимуществ:

* Автоматическое масштабирование вычислительных ресурсов независимо от хранилища
* Низкая стоимость и практически неограниченный срок хранения на основе объектного хранилища
* Возможность независимо изолировать нагрузки чтения и записи с помощью warehouses
* Интегрированная аутентификация
* Автоматизированные резервные копии
* Функции безопасности и соответствия требованиям
* Бесшовные обновления

<VerticalStepper headerLevel="h2">
  ## Зарегистрируйтесь в ClickHouse Cloud \{#signup-to-clickhouse-cloud\}

  Чтобы создать сервис Managed ClickStack в [ClickHouse Cloud](https://console.clickhouse.cloud), сначала выполните **первый шаг** из [руководства по быстрому старту ClickHouse Cloud](/getting-started/quick-start/cloud).

  <ProviderSelection />

  ## Настройте ингестию \{#setup-ingestion\}

  После того как ваш сервис будет создан, убедитесь, что этот сервис выбран, и нажмите «ClickStack» в левом меню.

  <SetupManagedIngestion />

  ## Перейдите в интерфейс ClickStack \{#navigate-to-clickstack-ui-cloud\}

  <NavigateClickStackUI />

  ## Дальнейшие шаги \{#next-steps\}

  :::important[Запишите учётные данные по умолчанию]
  Если вы не записали свои учётные данные по умолчанию на предыдущих шагах, перейдите к сервису и выберите `Connect`, зафиксировав пароль и HTTP- и native-эндпоинты. Сохраните эти административные учётные данные в надёжном месте — их можно будет повторно использовать в следующих руководствах.
  :::

  <Image img={service_connect} size="lg" alt="Подключение к сервису" border />

  Для выполнения задач, таких как создание новых пользователей или добавление дополнительных источников данных, см. [руководство по развёртыванию Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks).
</VerticalStepper>
