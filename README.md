# PP Diary — Web 版

依照 Figma「ui正式版」實作的網頁版，畫面以 iPhone 18 Pro（402 × 874）為基準。
只用純 HTML / CSS / JavaScript，**不需要安裝或建置**。

## 開啟方式
- **最簡單：** 直接雙擊 `index.html`，用 Chrome / Safari 開啟。
- **VS Code（建議）：** 用 VS Code 開啟整個資料夾，安裝推薦的 **Live Server** 擴充套件，
  在 `index.html` 上按右鍵 →「Open with Live Server」，存檔後畫面會自動重新整理。
- **手機上看：** 用 Live Server 開啟後，手機連同一個 Wi-Fi，打開 `http://<電腦 IP>:5500`；
  在 Safari 選「加入主畫面」，就能全螢幕執行，Safe Area 也會正確套用。

在電腦上會顯示 iPhone 外框；在手機上會全螢幕顯示，並依螢幕大小自動等比縮放。

## 資料夾結構
```
index.html              入口（依序載入所有 css / js）
css/
  tokens.css            設計 Token：色票、字體、圓角、Safe Area
  base.css              裝置外框、Safe Area、頁面轉場
  components.css        共用元件樣式
  screens.css           各頁面樣式（數值來自設計稿）
js/
  state.js              資料（存在 localStorage）
  icons.js              圖示（SVG，顏色跟著 currentColor）
  components.js         共用元件：topbar、glass 卡片、步驟指示、玻璃罐、彈窗、選單、彩帶…
  router.js             Hash 路由（#/home、#/q/1…6、#/daily…）
  app.js                啟動、螢幕適配
  screens/*.js          各頁面
assets/img/             插圖素材
assets/fonts/           （選用）離線字體
```

## 頁面與路由
| 路由 | Figma frame |
|---|---|
| (啟動) | 0.0 app開啟 |
| `#/home` | 0.1 主畫面 / 主畫面下滑 |
| `#/q/1` ~ `#/q/5` | 0.2 形狀、0.3 軟硬、0.4 多少、0.5 特殊、0.6 時間長短 |
| `#/q/6` | 0.7 畫畫版 / 模板 |
| `#/daily` | 0.8 日總結 / 沖走 |
| `#/monthly` | 0.9 月總結 / 還沒拉開 |
| `#/calendar` | 1.0 月曆（`?confetti=1` 噴彩帶） |
| `#/friends` | 1.1 交友頁面 |
| `#/profile/elsa`、`#/profile/cc` | 1.2 個人頁面（自己 / 別人 / 分享 / 取消好友） |

開發時在網址後面加 `?nosplash` 可以跳過啟動畫面，例如 `index.html?nosplash#/q/3`。

## 互動
- 主畫面：提醒卡上下滑（或點右側圓點）切換到週曆；按「I got it」也會切換；Start pooping 有輪播動畫
- 形狀：左右滑選；軟硬：按住馬桶吸把往下拉；多少：長按讓便便變大；特殊物：可多選
- 時長：往下拉衛生紙（或用滑鼠滾輪）；畫板：畫筆 / 線 / 箭頭 / 圖形、顏色、油漆桶切換填色、模板貼紙（可拖曳）
- 日總結：點便便或往下滑就會沖走，之後才出現下一步
- 月總結：點擊或往下拉展開衛生紙；save / next
- 月曆：切換月份、日記可以編輯、完成後噴彩帶
- 交友 / 個人頁：點 POOPED BY 標籤會出現 加好友 / 愛心 / 分享；likes、分享彈窗、取消好友彈窗

## 自訂
- **改顏色或字體：** 只要改 `css/tokens.css`。
- **換插圖：** 從 Figma 以 @3x 匯出，用相同檔名覆蓋 `assets/img/` 裡的檔案（目前是從設計 PNG 裁切的暫用素材）。
- **評量表預覽框：** 步驟 2–5 的框框會依使用者的選擇即時畫出便便：形狀（步驟 1）→ 軟硬越往下越有菱角 → 長按越久越大 → 選的特殊物出現在便便上。形狀定義在 `js/screens/questionnaire.js` 的 `shapes`。。
- **清除資料：** 在瀏覽器 Console 執行 `PP.state.reset()`。
