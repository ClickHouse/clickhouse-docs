---
slug: /cloud/managed-postgres/pricing
sidebar_label: 'Цены'
title: 'Цены'
description: 'Модель ценообразования, уровни, типы инстансов и сведения о бета-ценах для Managed Postgres от ClickHouse'
keywords: ['цены на postgres', 'стоимость managed postgres', 'бета-цены на postgres', 'калькулятор цен postgres', 'цены на nvme', 'цены на postgres по уровням']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Postgres под управлением ClickHouse использует локальное хранилище NVMe, что позволяет обеспечить производительность промышленного уровня и нативную интеграцию с ClickHouse без дополнительных затрат, характерных для традиционных архитектур с сетевым хранилищем. На этой странице рассматриваются модель ценообразования, доступные типы инстансов и сравнение уровней сервиса.

Postgres под управлением ClickHouse теперь доступен в бета-версии. Сервис останется бесплатным до начала учета потребления 15 июня 2026 года, чтобы у команд было время подобрать подходящий размер инстансов до начала тарификации.

В период бета для всех планов действует скидка 50% — это часть нашей поддержки ранних клиентов. Цены начинаются примерно от **$30/месяц** за конфигурацию с 1 vCPU, 8 ГБ оперативной памяти и 59 ГБ хранилища NVMe.

:::tip[Калькулятор цен]
Чтобы узнать точную стоимость, воспользуйтесь [калькулятором цен](https://clickhouse.com/pricing?service=postgres#pricing-calculator) и подберите оптимальную конфигурацию для вашей рабочей нагрузки.
:::

## Соотношение цены и производительности \{#price-performance\}

Поскольку сервис работает на локальном NVMe-хранилище, многие рабочие нагрузки могут обеспечивать значительно лучшее соотношение цены и производительности по сравнению с традиционными архитектурами хранения с подключением по сети. Сравнение бенчмарков с другими провайдерами Postgres на сопоставимых аппаратных конфигурациях см. в [PostgresBench](https://postgresbench.clickhouse.com/).

Для сопоставимых рабочих нагрузок клиентам может требоваться до 2–4× меньше вычислительных ресурсов. Эти потенциальные преимущества по эффективности следует учитывать при сравнении цен у разных провайдеров, хотя фактический выигрыш зависит от конкретной рабочей нагрузки и должен быть проверен на ваших приложениях.

## Модель ценообразования \{#pricing-model\}

Сервис работает на локальном хранилище NVMe, поэтому стоимость определяется полной конфигурацией виртуальной машины — CPU, памятью и хранилищем, а не отдельными тарифами на вычислительные ресурсы и диск.

Доступно более 50 конфигураций — от 1 vCPU / 8 GB оперативной памяти / 59 GB NVMe до 96 vCPU / 768 GB оперативной памяти / 60 TB хранилища NVMe, что обеспечивает гибкость как для Postgres-нагрузок, интенсивно использующих вычислительные ресурсы, так и для нагрузок Postgres с большими требованиями к хранилищу.

### Ценообразование по уровням \{#tier-based-pricing\}

Цены, доступные возможности и лимиты ресурсов зависят от уровня организации — [Basic, Scale или Enterprise](/cloud/manage/cloud-tiers), — однако каждый уровень включает базовые возможности сервиса, в том числе Postgres промышленного класса на локальном NVMe-хранилище, встроенный CDC для ClickHouse и расширение `pg_clickhouse`.

В таблице ниже приведены возможности, характеристики и ограничения для каждого уровня. Чтобы сравнить цены между уровнями, воспользуйтесь [калькулятором цен](https://clickhouse.com/pricing?service=postgres#pricing-calculator).

<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0'}}>
  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Basic</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>Отлично подходит для тестирования новых идей и запуска небольших проектов. Ограниченные объемы хранилища и памяти.</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">До 8 ГБ оперативной памяти для compute</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">До 118 ГБ локального NVMe-хранилища</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">Резервные копии со сроком хранения 1 день</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">PITR и ветки</a></li>
      <li>Включает <a href="/docs/cloud/managed-postgres/high-availability">высокую доступность</a></li>
      <li><a href="/docs/cloud/managed-postgres/monitoring/query-insights">Query Insights</a> со сроком хранения 1 день</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">Более 90 расширений Postgres</a></li>
      <li><a href="/docs/cloud/managed-postgres/clickhouse-integration">Нативный CDC для ClickHouse</a></li>
      <li><a href="/docs/cloud/managed-postgres/extensions">Расширение <code>pg&#95;clickhouse</code></a></li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">Полностью управляемая миграция данных</a></li>
      <li>Экспертная поддержка со временем ответа в пределах 1 рабочего дня</li>
      <li><a href="/docs/cloud/security/manage-my-account">Аутентификация через единый вход (SSO)</a> с помощью входа через Google или Microsoft</li>
      <li><a href="/docs/cloud/security/manage-my-account#mfa">Многофакторная аутентификация</a></li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Scale</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>Для производственных сред, больших объёмов данных и профессиональных сценариев использования.</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>Всё из Basic, а также</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">До 60 ТБ хранилища</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">До 96 vCPU и 768 ГБ оперативной памяти</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">Автомасштабирование хранилища</a></li>
      <li><a href="/docs/cloud/managed-postgres/read-replicas">Реплики для чтения</a></li>
      <li><a href="/docs/cloud/managed-postgres/security">Частные сети</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">Резервные копии со сроком хранения 7 дней</a></li>
      <li><a href="/docs/cloud/managed-postgres/monitoring/query-insights">Query Insights</a> со сроком хранения 7 дней</li>
      <li>Экспертная поддержка со временем ответа 1 час, 24x7, для инцидентов уровня Severity 1</li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Enterprise</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>Для работы с production-средами, очень большими объёмами данных и корпоративными сценариями использования.</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>Всё, что входит в Scale, а также</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li>Поддержка уровня Enterprise со временем ответа 30 минут для инцидентов Severity 1</li>
      <li><a href="/docs/cloud/infrastructure/clickhouse-private">Частные регионы</a></li>
      <li>Выделенный ведущий инженер службы поддержки</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">Пользовательские расширения</a> (*ожидают одобрения)</li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">Руководства по миграции с консультационной поддержкой</a></li>
      <li><a href="/docs/cloud/managed-postgres/upgrades">Плановые обновления</a></li>
    </ul>
  </div>
</div>

### Типы инстансов \{#instance-types\}

Конфигурации инстансов сгруппированы в три категории, чтобы упростить выбор инфраструктуры с учетом характеристик рабочей нагрузки.

* **Оптимизировано для памяти:** Предназначено для рабочих нагрузок с интенсивным использованием памяти и более высоким соотношением памяти к CPU (например, 1:8 или 1:4). Поддерживает семейства AWS на базе Graviton: `r8gd`, `r6gd`, `m6gd` и `m8gd`. Лучше всего подходит для больших рабочих наборов, высокой доли попаданий в кэш и нагрузок на базы данных, ограниченных объемом памяти.
* **Оптимизировано для хранилища:** Предназначено для рабочих нагрузок, которым требуются большие объемы локального NVMe-хранилища без пропорционального масштабирования вычислительных ресурсов. Поддерживает семейства AWS на базе Graviton: `i8g`, `i8ge`, `i7i` и `i7ie`; доступны конфигурации с локальным NVMe-хранилищем объемом до 60 ТБ. Лучше всего подходит для больших наборов данных, нагрузок с временными рядами, хранения логов и событий, а также OLTP-нагрузок с высокими требованиями к хранилищу.
* **Оптимизировано для CPU:** Предназначено для рабочих нагрузок с интенсивным использованием вычислительных ресурсов и более низким соотношением памяти к CPU (обычно около 1:2). Поддерживает семейства `c6gd` и лучше всего подходит для транзакционных рабочих нагрузок с высоким параллелизмом и запросов, ограниченных производительностью CPU.

## Калькулятор цен \{#pricing-calculator\}

Используйте [калькулятор цен](https://clickhouse.com/pricing?service=postgres#pricing-calculator), чтобы оценить стоимость развертывания для различных профилей рабочей нагрузки и конфигураций. Вы можете настроить:

* Уровень организации (Basic, Scale, Enterprise)
* Регион
* Тип конфигурации (Memory, Storage или CPU Optimized)
* Архитектуру CPU (ARM или x86)
* Размеры vCPU, памяти и хранилища
* Конфигурации Standby / High Availability (HA)

Это позволяет сравнить цены для более чем 50 поддерживаемых комбинаций конфигурации и подобрать оптимальный вариант для вашей рабочей нагрузки.

## Основные условия бета-ценообразования \{#beta-pricing-highlights\}

В период бета-тестирования:

* Сервис предоставляется бесплатно до начала учета использования с **15 июня 2026 года**
* Нативный CDC через **ClickPipes** включен без дополнительной платы
* В настоящее время плата не взимается за **исходящий сетевой трафик** и **резервное копирование**
* В настоящее время все тарифные планы включают **бета-цены со скидкой 50%**

## Оговорки \{#disclaimers\}

Поскольку продукт продолжает развиваться в статусе бета, цены и состав предложения могут быть уточнены до выхода в General Availability (GA). Обратите внимание на следующее:

* Тарификация исходящего сетевого трафика будет введена после GA. Для приложений, развернутых вместе с базой данных, расходы на исходящий трафик, как ожидается, будут минимальными.
* После выхода в GA может взиматься дополнительная плата за резервное копирование при сроках хранения, превышающих лимит, который еще определяется.
* Мы ожидаем, что нативный CDC через ClickPipes останется бесплатным или будет стоить минимально на стадии GA, когда Postgres и ClickHouse размещены в одном регионе, что соответствует концепции единой платформы OLTP + OLAP.
* При масштабировании, переключении при отказе и развертывании резервного инстанса кратковременно параллельно работают два инстанса, чтобы ваша база данных оставалась доступной — до завершения перехода вы можете видеть пересекающиеся начисления за оба инстанса. Длительность этого окна зависит от типа инстанса и объема хранилища.
* Если выбранный вами тип инстанса временно недоступен в выбранном регионе, мы можем предоставить сопоставимый тип инстанса, чтобы ваша база данных оставалась доступной. Оплата будет взиматься по тарифу предоставленного инстанса.
* Текущие цены могут меняться и уточняться ближе к GA по мере того, как в период бета мы будем лучше понимать реальные сценарии использования у клиентов, характеристики рабочих нагрузок и требования к инфраструктуре.