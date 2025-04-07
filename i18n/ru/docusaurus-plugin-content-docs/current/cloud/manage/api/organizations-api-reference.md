---
sidebar_label: 'Организации'
title: 'Организации'
slug: /cloud/manage/api/organizations-api-reference
description: 'Документация по API облака для организаций'
---

## Получение списка доступных организаций

Возвращает список с одной организацией, связанной с ключом API в запросе.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations` |

### Запрос


### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка создания организации. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Получение информации об организации

Возвращает информацию об одной организации. Для получения деталей ключ аутентификации должен принадлежать организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 


### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка создания организации. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Обновление информации об организации

Обновляет поля организации. Требуется роль ключа аутентификации ADMIN.

| Метод | Путь |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID организации для обновления. | 

### Параметры тела

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| name | string | Название организации. | 
| privateEndpoints |  |  | 

### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка создания организации. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Список действий организации

Возвращает список всех действий организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| from_date | date-time | Дата начала поиска | 
| to_date | date-time | Дата окончания поиска | 


### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| id | string | Уникальный ID активности. | 
| createdAt | date-time | Временная метка активности. ISO-8601. | 
| type | string | Тип активности. | 
| actorType | string | Тип актёра: 'user', 'support', 'system', 'api'. | 
| actorId | string | Уникальный ID актёра. | 
| actorDetails | string | Дополнительная информация об актёре. | 
| actorIpAddress | string | IP-адрес актёра. Определён для типов актёров 'user' и 'api'. | 
| organizationId | string | Область действия активности: ID организации, к которой относится это действие. | 
| serviceId | string | Область действия активности: ID сервиса, к которому относится это действие. | 


#### Пример ответа

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```

## Активность организации

Возвращает одну активность организации по ID.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities/{activityId}` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| activityId | string | ID запрашиваемой активности. | 


### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| id | string | Уникальный ID активности. | 
| createdAt | date-time | Временная метка активности. ISO-8601. | 
| type | string | Тип активности. | 
| actorType | string | Тип актёра: 'user', 'support', 'system', 'api'. | 
| actorId | string | Уникальный ID актёра. | 
| actorDetails | string | Дополнительная информация об актёре. | 
| actorIpAddress | string | IP-адрес актёра. Определён для типов актёров 'user' и 'api'. | 
| organizationId | string | Область действия активности: ID организации, к которой относится это действие. | 
| serviceId | string | Область действия активности: ID сервиса, к которому относится это действие. | 


#### Пример ответа

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```
