---
description: 'Руководство по тестированию и оценке производительности оборудования с ClickHouse'
sidebar_label: 'Тестирование оборудования'
sidebar_position: 54
slug: /operations/performance-test
title: 'Как протестировать оборудование с помощью ClickHouse'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Вы можете запустить базовый тест производительности ClickHouse на любом сервере без установки пакетов ClickHouse.

## Автоматизированный запуск {#automated-run}

Вы можете запустить бенчмарк одним скриптом.

1. Скачайте скрипт.

```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. Запустите скрипт.

```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. Скопируйте полученный вывод и отправьте его на [feedback@clickhouse.com](mailto:feedback@clickhouse.com)

Все результаты публикуются здесь: [https://clickhouse.com/benchmark/hardware/](https://clickhouse.com/benchmark/hardware/)
