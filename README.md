World‑Dashboard – Global Intelligence Nexus
世界規模の地政学リスクや経済・社会指標を、誰でも俯瞰できる形で可視化するためのWebアプリケーションです。現在は基盤機能を整備した段階であり、今後の拡張に備えて既存UIやコンテンツ構造を理解できるようにまとめています。
プロジェクトの目的
世界の出来事を単なるニュースとして消費するのではなく、国ごとの経済・社会・政治・リスクの構造を横断的に比較できるようにすることが「World‑Dashboard」の使命です。各国の基礎データや危機指数を整理し、俯瞰図と詳細分析をシームレスに切り替えられるよう設計しました。現在のバージョンは v6.3（Global Intelligence Nexus）です。
主要なデータソース
•	経済：IMF World Economic Outlook 2025[1]
•	人口：国連 World Population Prospects 2024[1]
•	政治体制：V‑Dem Democracy Report 2024[1]
•	リスク指数：Fragile States Index (FSI) 2024[1]
これらの統計値を国別に整理したマスターファイル（worlddash_global_master.json）には、各国のISO 3コード、国名、名目GDP、GDP成長率、人口、FSI総合スコアなどが含まれています[2]。UI表示用として見出し文やスコアも保持されており、レーダーチャートなどで使用されます[3]。
