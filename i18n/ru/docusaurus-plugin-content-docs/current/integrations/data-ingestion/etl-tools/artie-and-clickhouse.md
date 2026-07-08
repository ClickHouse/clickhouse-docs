---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['ClickHouse', 'Artie', 'подключить', 'интегрировать', 'CDC', 'ETL', 'интеграция данных', 'в реальном времени', 'стриминг']
slug: /integrations/artie
description: 'Потоковая загрузка данных в ClickHouse с помощью платформы CDC-стриминга Artie'
title: 'Подключение Artie к ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<a href="https://www.artie.com/" target="_blank">Artie</a> — это полностью управляемая платформа потоковой передачи данных в реальном времени, которая реплицирует данные из production в ClickHouse, обеспечивая клиентскую аналитику, операционные процессы и использование агентного ИИ в рабочей среде.

## Обзор \{#overview\}

Artie — это современный слой инфраструктуры данных для эпохи AI: полностью управляемая платформа потоковой передачи данных в реальном времени, которая непрерывно синхронизирует боевые данные с вашим хранилищем.

По мере того как компании начинают использовать свои хранилища для AI-нагрузок в реальном времени, операционной аналитики и клиентских продуктов данных, они переходят на инфраструктуру, которая работает быстро, надежно и масштабируется по мере роста.

Мы даем компаниям те же потоковые конвейеры и глубокую обсервабилити, которые Netflix, DoorDash и Instacart создавали своими силами, — без найма 10+ инженеров и без затрат 1–2 лет на разработку платформы. Artie автоматизирует весь цикл ингестии — захват изменений, слияние, дозагрузку исторических данных и обсервабилити — без необходимости в инженерном сопровождении и разворачивается за считанные минуты.

Такие лидеры, как ClickUp, Substack и Alloy, используют Artie не только для решения текущих проблем с конвейерами, но и для того, чтобы подготовить свой стек данных к будущему по мере ускорения их AI-стратегии.

<VerticalStepper headerLevel="h2">
  ## Создайте учетную запись Artie \{#1-create-an-artie-account\}

  Перейдите на <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> и заполните форму, чтобы запросить доступ.

  <Image img={artie_signup} size="md" border alt="Страница регистрации Artie" />

  ## Найдите свои учетные данные ClickHouse \{#2-find-your-clickhouse-credentials\}

  После создания сервиса в ClickHouse Cloud найдите следующие обязательные параметры:

  <ConnectionDetails />

  ## Создайте новый конвейер в Artie \{#3-create-a-new-pipeline-in-artie\}

  Перейдите в Artie с информацией, которую вы собрали на предыдущих шагах, и создайте новый конвейер, выполнив следующие 3 шага.

  1. **Подключите источник** - Настройте исходную базу данных (Postgres, MySQL, Events API и т. д.)
  2. **Выберите таблицы, которые хотите реплицировать** - Укажите, какие таблицы нужно синхронизировать с ClickHouse
  3. **Подключите пункт назначения** - Введите учетные данные ClickHouse

  <Image img={artie_edit_pipeline} size="lg" border alt="Интерфейс редактирования конвейера Artie" />
</VerticalStepper>

## Свяжитесь с нами \{#contact-us\}

Если у вас есть вопросы, пожалуйста, обратитесь к нашей <a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">документации по ClickHouse</a> или свяжитесь с командой по адресу <a href="mailto:hi@artie.com">hi@artie.com</a>.

## Скриншоты продукта \{#product-screenshots\}

Портал аналитики

<Image img={analytics} size="md" border alt="Портал аналитики" />

Отдельные мониторы для конвейеров и таблиц

<Image img={monitor} size="md" border alt="Встроенный мониторинг" />

Ежедневные уведомления об изменениях схемы

<Image img={schema_notification} size="md" border alt="Уведомление об изменениях схемы" />