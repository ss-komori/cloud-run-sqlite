#!/bin/sh
set -e

DB_PATH=./prisma/dev.db
DB_BACKUP_PATH=./prisma/dev.db.bk
# コンテナ起動時に持っているSQLiteのデータベースファイルは、
# 後続処理でリストアに成功したら削除したいので、リネームしておく
if [ -f "$DB_PATH" ]; then
  mv "$DB_PATH" "$DB_BACKUP_PATH"
fi

# Cloud Storage からリストア
litestream restore -if-replica-exists -config /etc/litestream.yml "$DB_PATH"

if [ -f "$DB_PATH" ]; then
  # リストアに成功したら、リネームしていたファイルを削除
  echo "---- Restored from Cloud Storage ----"
  rm "$DB_BACKUP_PATH"
else
  # 初回起動時にはレプリカが未作成であり、リストアに失敗するので、
  # その場合には、冒頭でリネームしたdbファイルを元の名前に戻す
  echo "---- Failed to restore from Cloud Storage ----"
  mv "$DB_BACKUP_PATH" "$DB_PATH"
fi

# メインプロセスに、litestreamによるレプリケーション、
# サブプロセスに Next.js アプリケーションを走らせる
exec litestream replicate -exec "npm start" -config /etc/litestream.yml
