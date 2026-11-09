# 组员任务（组内材料，不进提交 ZIP）

## 怎么做（不需要 GitHub）
1. 从群里下载 `bms5312-g09-usd-cash.zip`，解压后得到 `bms5312-g09-usd-cash` 文件夹。双击里面的 `index.html` 就能看到 dashboard。
2. 用 Codex 打开这个文件夹，在本地做，不需要 GitHub 账号。
3. 每个任务做完，按下面写的把文件发回群里，或私发给项目负责人，负责人统一合并、重新打包。只发列出的文件，其他文件不要改。
4. 文件里只写角色，不写名字、学号、邮箱。结果按实际情况填；没做的保持 "Not run" 或 "—"。

**顺序**：Task A 会更新数据，最好先做。A 发回后负责人会重新打包发一版，C 和 D 最好用新版做。来不及的话直接用现在这版，表格里会记下你核对的是哪一天的数据。B 和 E 随时可以做。

## Task A：用 SKILL 更新数据（Codex 新对话，不带任何旧对话）
1. 在解压出来的 `bms5312-g09-usd-cash` 文件夹里开一个新的 Codex 对话，粘贴：

   > Read SKILL.md in this folder and follow it to update the dashboard data to the newest official observations. I am the data maintainer and will review the result. Do only what SKILL.md allows. Before anything replaces the accepted files, show me the before/after table, any flags and the source links, and wait for my decision.

2. 如果 Codex 下载失败（沙箱默认不联网），按它的提示允许这一条命令联网，或自己在终端运行它给的命令。这属于人工介入，要记下来。
3. 它会给出前后对比表和两个链接。打开 Treasury 页面找到对应日期那一行，核对 13 周和 26 周的 Bank Discount；打开 BLS 链接核对 CPI 指数。对得上就回复 `accept`，并用一句英文说明你核对了什么；对不上就回复 `reject` 和原因。
4. 它跑完发布后的检查后，再粘贴：

   > Fill in the Task A table in AGENT_TEST.md from what actually happened in this conversation. Replace every "—" with the facts: the date, your tool and its capabilities, the commands you ran and their results, any manual step I took, the candidate files, three before/after values from the review table, one independent calculation, the check results after release, the evidence paths and my decision in my words. Use roles only, no names. Do not commit or push. Then list every file that changed in this conversation.

5. **发回**：删掉文件夹里的 `candidate` 和 `previous` 两个子文件夹，然后把整个 `bms5312-g09-usd-cash` 文件夹压缩发回。数据更新涉及的文件多，整个发回最稳。

## Task B：失败测试（Codex 新对话，在测试副本里）
1. 把解压出来的文件夹再复制一份，改名为 `task-b-copy`。在副本里，用 `maintenance/invalid_unit_config.json` 的内容覆盖 `project.json`。
2. 在副本里开一个新的 Codex 对话，粘贴和 Task A 第 1 步**完全一样**的提示词。
3. 测试前就定好的预期（已写在 `AGENT_TEST.md`）：Codex 应该报 `STOP: Incompatible input unit`，不生成 `candidate`，`data.js` 不变，并请你提供正确的 `project.json`。
4. 结束后在同一个对话里粘贴：

   > Fill in the Task B table in AGENT_TEST.md from what actually happened in this conversation. Replace every "—" with the facts: the date, your tool and its capabilities, the actual response, the commands you ran, whether data.js kept its SHA-256, the evidence paths and my decision. Use roles only, no names. Do not change any other file.

5. **发回**：只发 `AGENT_TEST.md`。

## Task C：Excel 独立核算
1. 双击 `index.html`，同时打开 `evidence/independent_check.xlsx`。
2. 只填黄色格子：按表里写的位置，从 Treasury 和 BLS 官网抄数，再抄页面上显示的数。其他格子都是公式，会自动显示 PASS 或 FAIL。点开格子能看到公式。
3. 保存后，让 Codex 读这个文件并更新 EVALS：

   > Read evidence/independent_check.xlsx and EVALS.md. Update the "Student route" lines of E1, E2 and E3 and the summary table with the actual values and PASS/FAIL from the workbook, the date, the quote date checked and the role of the checker. Leave the assistant-route lines unchanged. Use roles only, no names. Do not change any other file.

4. **发回**：`evidence/independent_check.xlsx` 和 `EVALS.md`。

## Task D：用户试用 + 干净复现（最好由没参与开发的同学做）
1. 双击 `index.html`，只看页面，回答 `evidence/user_test.md` 里的 4 个问题，并把表里列出的控件都试一遍，包括 Copy summary 和 Print summary。
2. 在文件夹里运行表中的 3 条命令（需要 Python 3.10+ 和 Node 18+；不会的话让 Codex 帮你跑）。
3. 让 Codex 把你的答案和命令结果填进 `evidence/user_test.md`，再更新 EVALS 里 E4、E5、E8 的 Student route 行和汇总表。只写角色，不改其他文件。
4. **发回**：`evidence/user_test.md` 和 `EVALS.md`。

## Task E：补全 AI_LOG 里你的那条记录（负责 user value 部分的同学）
其他几条记录都写了：日期、具体工具、给 AI 的文件、问了什么和影响、AI 实际做了什么、AI 出的错和怎么核实的、分工。你那条要补到同样的程度。在你原来那个对话里，或者把原对话导出后交给你的 Astra，同时给它 `AI_LOG.md`，粘贴：

> Open AI_LOG.md and rewrite only the entry "Original dashboard review (user-value lead)" so that it has the same fields and level of detail as the other entries. Use only what happened in our original conversation.
> - Heading: add the session date, as in the other entries.
> - Tool: the exact AI tools used.
> - Supplied files: what was given to the AI.
> - Keep the table of what was asked and its effect. Correct any row that differs and add any missing challenge as a new row.
> - Executed: what the AI actually produced or changed, and in which files.
> - Errors and concerns tested, and how they were checked: each AI mistake or rejected suggestion, who caught it and how it was checked. If there was none, write what was checked instead.
> - Files and contributions: who did what, by role.
>
> Roles only: no names, student IDs or local paths. A plain record without disclaimers. Do not change any other entry or file.

**发回**：只发 `AI_LOG.md`。没出过错就照实写核对了什么，不要补没发生的事。

## 负责人收尾
1. 把收到的文件放回仓库的 `bms5312-g09-usd-cash/` 对应位置。两份 `EVALS.md` 和 `AGENT_TEST.md` 要按段合并。也可以全部交给 Claude 合并。
2. 跑三项检查。
3. 运行 `python3 bms5312-g09-usd-cash/tools/set_identity.py --prefix bms5312 --group g09`，重新生成 ZIP。
4. 解压打开一次。
