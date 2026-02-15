# Biome Migration Task List

- [x] Client: ESLint設定の削除
    - [x] `client/eslint.config.js` の削除
    - [x] `client/package.json` から ESLint 関連の依存関係を削除
- [x] Client: Biome のセットアップ
    - [x] `client` に `@biomejs/biome` をインストール
    - [x] `client/biome.json` の作成・設定
    - [x] `client/package.json` のスクリプト (`lint`, `format`) を更新
- [x] Server: Biome のセットアップ
    - [x] `server` に `@biomejs/biome` をインストール
    - [x] `server/biome.json` の作成・設定
    - [x] `server/package.json` のスクリプト (`lint`, `format`) を更新
- [x] 検証
    - [x] Client で `npm run check` を実行し、正しく動作することを確認 (一部ルールを無効化)
    - [x] Server で `npm run check` を実行し、正しく動作することを確認
