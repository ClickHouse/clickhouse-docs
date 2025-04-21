---
sidebar_label: 'Prometheus'
title: 'Prometheus'
slug: /cloud/manage/api/prometheus-api-reference
description: 'Документация справочника API облака для prometheus'
---

## Получение показателей организации

Возвращает показатели prometheus для всех служб в организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/prometheus` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| filtered_metrics | boolean | Вернуть отфильтрованный список показателей Prometheus. | 
