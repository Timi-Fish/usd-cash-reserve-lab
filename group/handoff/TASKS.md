# 组员任务（组内材料，不进提交 ZIP）

仓库：https://github.com/Timi-Fish/usd-cash-reserve-lab （公开）。提交包是里面的 `dev-g00-usd-cash/` 文件夹。

开始前先 `git pull`。做完用 Conventional Commit 提交，直接推 `main`。文件和提交信息里只写角色，不写名字、学号、邮箱。

**顺序**：Task A 先做，因为它会更新数据。C、D 要在 A 推上去之后再做，核对的是更新后的数据。B 和 E 随时可以做。

## Task A：用 SKILL 更新数据（Codex 新对话，不要带任何旧对话）
1. 在 `dev-g00-usd-cash/` 文件夹里开一个新的 Codex 对话，粘贴下面的提示词：

   > Read SKILL.md in this folder and follow it to update the dashboard data to the newest official observations. I am the data maintainer and will review the result. Do only what SKILL.md allows. Before anything replaces the accepted files, show me the before/after table, any flags and the source links, and wait for my decision.

2. Codex 可能下载失败，因为沙箱默认不联网。这时按它的提示允许这一条命令联网，或者自己在终端运行它给的命令。这属于人工介入，要记下来。
3. 它会给出前后对比表和两个链接。打开 Treasury 页面，找到对应日期那一行，核对 13 周和 26 周的 Bank Discount；打开 BLS 链接，核对 CPI 指数。对得上就回复 `accept`，并用一句英文说明你核对了什么；对不上就回复 `reject` 和原因。
4. 它跑完发布后的检查后，再粘贴：

   > Fill in the Task A table in AGENT_TEST.md from what actually happened in this conversation. Replace every "—" with the facts: the date, your tool and its capabilities, the commands you ran and their results, any manual step I took, the candidate files, three before/after values from the review table, one independent calculation, the check results after release, the evidence paths and my decision in my words. Use roles only, no names. Then commit everything with the message "chore(data): release <quote date> quotes and <CPI month> CPI" and push to main.

## Task B：失败测试（Codex 新对话，在测试副本里）
1. 把 `dev-g00-usd-cash/` 整个复制一份，放到仓库外面，例如桌面上的 `task-b-copy`。在副本里，用 `maintenance/invalid_unit_config.json` 的内容覆盖 `project.json`。
2. 在副本文件夹里开一个新的 Codex 对话，粘贴和 Task A 完全一样的提示词。
3. 预期结果在测试前已经写进 `AGENT_TEST.md`：Codex 应该报 `STOP: Incompatible input unit`，不生成 `candidate/`，`data.js` 不变，并请你提供正确的 `project.json`。
4. 结束后，在**仓库里**（不是副本里）开 Codex，粘贴这段，并把 Task B 的对话内容贴给它：

   > Fill in the Task B table in AGENT_TEST.md from this transcript of a test run. Replace every "—" with the facts: the date, the tool and its capabilities, the actual response, the commands it ran, whether data.js kept its SHA-256, the evidence paths and the human decision. Use roles only, no names. Commit with the message "test(agent): record Task B failure test" and push to main.

   副本本身不要提交。

## Task C：Excel 独立核算（A 推上去之后做）
1. 打开 `dev-g00-usd-cash/index.html`（双击即可）和 `dev-g00-usd-cash/evidence/independent_check.xlsx`。
2. 只填黄色格子：按表里写的位置，从 Treasury 和 BLS 官网抄数，再抄页面上显示的数。其他格子都是公式，自动判断 PASS 或 FAIL。
3. 保存后，让你的 AI 读这个文件并更新 EVALS：

   > Read evidence/independent_check.xlsx and EVALS.md. Update the "Student route" lines of E1, E2 and E3 and the summary table with the actual values and PASS/FAIL from the workbook, the date and the role of the checker. Leave the assistant-route lines unchanged. Use roles only, no names. Commit with the message "test(evals): record student calculation checks" and push to main.

## Task D：非开发者用户测试 + 干净复现（A 推上去之后做；由没参与开发的组员做）
1. 在 GitHub 页面点 Code → Download ZIP，解压到一个新文件夹，双击里面的 `dev-g00-usd-cash/index.html`。
2. 只看页面，回答 `evidence/user_test.md` 里的 4 个问题，并试一遍表里列出的控件，包括 Copy summary 和 Print summary。
3. 在解压出来的 `dev-g00-usd-cash/` 里运行表中的 3 条命令（需要 Python 3.10+ 和 Node 18+）。
4. 让你的 AI 把结果填进 `evidence/user_test.md`，再更新 EVALS 中 E4、E5、E8 的 Student route 行和汇总表。只写角色。提交信息用 `test(evals): record user test and clean reproduction`。

## Task E：核对 AI_LOG 里你的那条记录（负责 user value 部分的组员）
在你原来那个对话里，或者把原对话导出后交给你的 Astra，粘贴：

> Compare the entry "Original dashboard review (user-value lead)" in AI_LOG.md of this repository with our original conversation. Correct anything that differs, add the session date and the tools used, and add any challenge that is missing as a new row at the same level of detail: what was asked, and its effect on the work. Roles only, no names. Write it as a plain record, without disclaimers. Commit with the message "docs(ai-log): complete the user-value review entry" and push to main.

## 最后（项目负责人）
全部推上去以后：
1. 运行 `python3 dev-g00-usd-cash/tools/set_identity.py --prefix bms5312 --group g09`，生成 `bms5312-g09-usd-cash.zip`。
2. 解压打开一次，确认页面正常。
3. 确认 presentation.pdf 是最终版。
