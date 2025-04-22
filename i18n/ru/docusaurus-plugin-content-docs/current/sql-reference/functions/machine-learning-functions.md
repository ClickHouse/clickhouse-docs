---
description: 'Документация для функций машинного обучения'
sidebar_label: 'Машинное обучение'
sidebar_position: 115
slug: /sql-reference/functions/machine-learning-functions
title: 'Функции машинного обучения'
---


# Функции машинного обучения

## evalMLMethod {#evalmlmethod}

Предсказание с использованием подогнанных регрессионных моделей осуществляется с помощью функции `evalMLMethod`. Смотрите ссылку в `linearRegression`.

## stochasticLinearRegression {#stochasticlinearregression}

Агрегатная функция [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) реализует метод стохастического градиентного спуска с использованием линейной модели и функции потерь MSE. Использует `evalMLMethod` для предсказания на новых данных.

## stochasticLogisticRegression {#stochasticlogisticregression}

Агрегатная функция [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) реализует метод стохастического градиентного спуска для задачи бинарной классификации. Использует `evalMLMethod` для предсказания на новых данных.
