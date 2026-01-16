---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', 'подключение', 'интеграция', 'CDC (фиксация изменений данных)', 'ETL', 'интеграция данных', 'реальное время', 'потоковая передача данных']
slug: /integrations/artie
description: 'Стриминг данных в ClickHouse с использованием CDC-платформы Artie'
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

# Подключение Artie к ClickHouse \{#connect-artie-to-clickhouse\}

<a href="https://www.artie.com/" target="_blank">Artie</a> — полностью управляемая платформа потоковой передачи данных в реальном времени, которая реплицирует данные из production-среды в ClickHouse, открывая возможности для клиентской аналитики, операционных процессов и Agentic AI в production-среде.

## Обзор \\{#overview\\}

Artie — это современный слой дата-инфраструктуры для эры ИИ: полностью управляемая платформа потоковой обработки данных в реальном времени, которая постоянно синхронизирует боевые данные с вашим хранилищем.

По мере того как компании активируют свои хранилища для задач ИИ в реальном времени, операционной аналитики и клиентских дата-продуктов, они переходят на инфраструктуру, которая быстрая, надёжная и масштабируемая.

Мы даём компаниям такие стриминговые пайплайны и глубокую обсервабилити, которые Netflix, DoorDash и Instacart разрабатывали внутри компании, но без необходимости нанимать 10+ инженеров и тратить 1–2 года на разработку платформы. Artie автоматизирует весь жизненный цикл ингестии — захват изменений, слияния, бэкфилы и обсервабилити — без затрат на сопровождение со стороны инженерной команды и разворачивается за считанные минуты.

Такие лидеры, как ClickUp, Substack и Alloy, используют Artie не только для решения текущих проблем с пайплайнами, но и для того, чтобы подготовить свой дата-стек к будущему по мере ускорения их ИИ-стратегии.

<VerticalStepper headerLevel="h2">

## Создайте аккаунт Artie \\{#1-create-an-artie-account\\}

Перейдите на <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> и заполните форму, чтобы запросить доступ.

<Image img={artie_signup} size="md" border alt="Страница регистрации Artie" />

## Найдите свои учётные данные ClickHouse \\{#2-find-your-clickhouse-credentials\\}

После создания сервиса в ClickHouse Cloud найдите следующие обязательные параметры:

<ConnectionDetails />

## Создайте новый пайплайн в Artie \\{#3-create-a-new-pipeline-in-artie\\}

Перейдите в Artie с информацией, собранной на предыдущих шагах, и создайте новый пайплайн, выполнив следующий трёхшаговый процесс.

1. **Подключите источник** — настройте вашу исходную базу данных (Postgres, MySQL, Events API и т.д.)
2. **Выберите таблицы для репликации** — укажите, какие таблицы синхронизировать с ClickHouse
3. **Подключите приёмник** — введите ваши учётные данные ClickHouse

<Image img={artie_edit_pipeline} size="lg" border alt="Интерфейс редактирования пайплайна Artie" />

</VerticalStepper>

## Свяжитесь с нами \\{#contact-us\\}

Если у вас есть вопросы, обратитесь к нашей <a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">документации по ClickHouse</a> или свяжитесь с нашей командой по адресу <a href="mailto:hi@artie.com">hi@artie.com</a>.

## Скриншоты продукта \\{#product-screenshots\\}

Портал аналитики

<Image img={analytics} size="md" border alt="Портал аналитики"/>

Мониторы для пайплайнов и отдельных таблиц

<Image img={monitor} size="md" border alt="Встроенный мониторинг"/>

Ежедневные уведомления об изменениях схемы

<Image img={schema_notification} size="md" border alt="Уведомление об изменении схемы"/>