---
sidebar_label: 'Prometheus'
title: 'Prometheus'
slug: /cloud/manage/api/prometheus-api-reference
description: 'Документация справочника Cloud API для prometheus'
---

## Получение метрик организации

Возвращает метрики prometheus для всех сервисов в организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/prometheus` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| filtered_metrics | boolean | Вернуть отфильтрованный список метрик Prometheus. | 
