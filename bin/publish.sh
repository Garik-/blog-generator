#!/bin/bash

# Переменные
REPO_URL="https://github.com/your-username/your-repo.git" # Замените на URL вашего репозитория
DIST_DIR="dist" # Путь к папке с файлами
TARGET_BRANCH="main" # Целевая ветка
TEMP_DIR=$(mktemp -d) # Временная директория для клонирования репозитория

# Функция для выхода при ошибке
function exit_on_error {
    echo "Ошибка: $1"
    exit 1
}

# Клонирование репозитория
echo "Клонирование репозитория..."
git clone -b $TARGET_BRANCH $REPO_URL $TEMP_DIR || exit_on_error "Не удалось клонировать репозиторий"

# Переход в директорию репозитория
cd $TEMP_DIR || exit_on_error "Не удалось перейти в директорию репозитория"

# Копирование файлов из dist
echo "Копирование файлов из $DIST_DIR..."
cp -r "../$DIST_DIR/." . || exit_on_error "Не удалось скопировать файлы из $DIST_DIR"

# Добавление изменений
echo "Добавление изменений..."
git add . || exit_on_error "Не удалось добавить файлы"

# Коммит изменений
echo "Коммит изменений..."
git commit -m "Добавлены файлы из папки dist" || exit_on_error "Не удалось выполнить коммит"

# Push изменений
echo "Выполнение push в ветку $TARGET_BRANCH..."
git push origin $TARGET_BRANCH || exit_on_error "Не удалось выполнить push"

# Очистка временной директории
echo "Очистка временной директории..."
rm -rf $TEMP_DIR

echo "Готово!"

## хреновый скрипт, нужно проверить были ли изменения после копирования
## и добавить wget -r -P dist -nH http://localhost:3000/