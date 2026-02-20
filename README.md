# WebP Converter

WebP 変換ツール。Web アプリと CLI の2つの形態で提供します。

## パッケージ構成

| パッケージ | 説明 |
|-----------|------|
| [`packages/web`](./packages/web) | ブラウザで完結する WebP 変換 Web アプリ（[webp.milkmaccya.com](https://webp.milkmaccya.com)） |
| [`packages/cli`](./packages/cli) | コマンドラインから画像を一括変換する CLI ツール (`webp-convert`) |

---

## packages/web — Web アプリ

クライアントサイド（ブラウザ）で完結する画像変換アプリケーションです。
WebAssembly (`@jsquash`) を使用して、サーバーを介さずに画像を WebP 形式に変換・リサイズします。

### 機能

- 画像のドラッグ＆ドロップによる読み込み
- JPEG, PNG, AVIF などの画像を WebP に変換
- 変換後の画質設定
- 画像のリサイズ
- 変換前後のファイルサイズ比較とプレビュー

### 技術スタック

- React / Vite / TypeScript
- Tailwind CSS / shadcn/ui
- @jsquash (WebAssembly)
- Cloudflare Workers

---

## packages/cli — CLI ツール

[`packages/cli/README.md`](./packages/cli/README.md) を参照してください。

```bash
# 単一ファイル変換
webp-convert input.jpg -q 90

# 複数ファイル・バッチ変換
webp-convert *.jpg *.png -o ./dist/
webp-convert ./photos/ -q 75 -o ./webp/

# 変換後サイズをプレビュー（ファイルを書かない）
webp-convert ./photos/ --dry-run
```

---

## 開発

```bash
# 依存関係のインストール
npm install

# Web アプリの開発サーバー起動
npm run dev

# 全パッケージのビルド
npm run build

# 全パッケージのテスト
npm run test

# Cloudflare Workers へのデプロイ
npm run deploy
```

### ワークスペース別コマンド

```bash
# Web アプリのみ
npm run build -w @webp-converter/web
npm run test -w @webp-converter/web

# CLI のみ
npm run build -w webp-convert
npm run test -w webp-convert
```
