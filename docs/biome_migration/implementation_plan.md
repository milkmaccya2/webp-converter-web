# 実装計画: Biome 移行

現在の ESLint 構成を削除し、Client と Server の両方に Biome を導入して、リントとフォーマットの環境を整えます。

## 変更内容

### Client
#### [DELETE]
- `client/eslint.config.js`
- `client/package.json` の `devDependencies` から以下を削除:
  - `@eslint/js`
  - `eslint`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-react-refresh`
  - `globals`
  - `typescript-eslint`

#### [MODIFY] [`client/package.json`](file:///Users/yokoyama/git/webp-converter-web/client/package.json)
- `devDependencies` に `@biomejs/biome` を追加
- `scripts` を修正:
  - `lint`: `biome lint .`
  - `format`: `biome format --write .`
  - `check`: `biome check --write .` (lint と format の両方を実行)

#### [NEW] [`client/biome.json`](file:///Users/yokoyama/git/webp-converter-web/client/biome.json)
- Biome の設定ファイルを作成（React 推奨設定を含む）。

### Server
#### [MODIFY] [`server/package.json`](file:///Users/yokoyama/git/webp-converter-web/server/package.json)
- `devDependencies` に `@biomejs/biome` を追加
- `scripts` を追加/修正:
  - `lint`: `biome lint .`
  - `format`: `biome format --write .`

#### [NEW] [`server/biome.json`](file:///Users/yokoyama/git/webp-converter-web/server/biome.json)
- Biome の設定ファイルを作成（Node.js 環境向け）。

## 検証計画

### 自動テスト
- 各ディレクトリ（`client`, `server`）で `npm run lint` を実行し、エラーが出ないことを確認します。
- 必要に応じて自動修正 (`--write`) を適用します。
- `npm run build` が正常に通ることを確認します（lint エラーがビルドを阻害しないかチェック）。
