# 任务评审：添加Zone列表列

## 执行概览
- **修改文件**：
  - `src/api/index.d.ts`: 更新 `CloudflareZoneRecord` 接口，增加 `plan` 字段定义。
  - `src/route/zone/List.vue`: 在 Zone 列表中添加“计划”和“最后更新”列。

## 详细变更
1.  **接口定义**：
    - `CloudflareZoneRecord` 新增 `plan: CloudflarePlan`。这与后端返回并经前端 `objectToCamelCase` 转换后的数据结构一致。
2.  **UI 变更**：
    - 新增“计划”列，绑定 `row.plan.name`。
    - 新增“最后更新”列，显示 `modifiedOn` 字段。
    - 实现了 `formatDate` 本地格式化函数。

## 问题与风险
- **文件路径差异**：用户请求提及 `src/route/zone/record/List.vue`，但根据提供的 JSON 数据（包含 `plan`, `name_servers` 等 Zone 属性），判定用户意图为修改 Zone 列表（`src/route/zone/List.vue`）。若用户实际上希望在 DNS 记录页看到 Zone 信息，则当前修改虽然正确反映了 Zone 列表需求，但可能未覆盖用户的隐藏需求（虽然该需求在技术上不太合理）。
- **数据格式**：假设 `objectToCamelCase` 正确处理了所有嵌套对象的键名转换，因此 `modified_on` 对应 `modifiedOn`。

## 结论
任务已按逻辑推断的最佳方案执行完毕。
