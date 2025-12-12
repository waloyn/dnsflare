# 任务：添加 Plan 和 Last Updated 列

## 上下文
用户希望在 Zone 列表展示域名的套餐计划和最后更新时间。
提供的 JSON 数据属于 Zone 对象，包含 `plan` 和 `modified_on` 字段。
虽然用户指向 `src/route/zone/record/List.vue`，但数据结构对应的正确文件为 `src/route/zone/List.vue`。

## 计划
1.  **修改类型定义** (`src/api/index.d.ts`):
    - 向 `CloudflareZoneRecord` 添加 `plan: CloudflarePlan`。
2.  **修改组件** (`src/route/zone/List.vue`):
    - 添加 `formatDate` 工具函数。
    - 添加 `<el-table-column>` 显示 `plan.name`。
    - 添加 `<el-table-column>` 显示格式化后的 `modifiedOn`。

## 执行状态
- 已完成类型定义更新。
- 已完成组件修改。
- 假如 `objectToCamelCase` 工作正常，数据绑定将自动生效。
