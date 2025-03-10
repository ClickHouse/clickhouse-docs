---
slug: /sql-reference/functions/machine-learning-functions
sidebar_position: 115
sidebar_label: Машинное Обучение
---


# Функции Машинного Обучения

## evalMLMethod {#evalmlmethod}

Предсказание с использованием обученных моделей регрессии осуществляется с помощью функции `evalMLMethod`. См. ссылку в `linearRegression`.

## stochasticLinearRegression {#stochasticlinearregression}

Агрегатная функция [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) реализует метод стохастического градиентного спуска с использованием линейной модели и функции потерь MSE. Использует `evalMLMethod` для предсказания на новых данных.

## stochasticLogisticRegression {#stochasticlogisticregression}

Агрегатная функция [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) реализует метод стохастического градиентного спуска для задачи бинарной классификации. Использует `evalMLMethod` для предсказания на новых данных.
