---
sidebar_label: Prometheus
title: Prometheus
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
| filtered_metrics | boolean | Возвращает отфильтрованный список метрик Prometheus. | 
