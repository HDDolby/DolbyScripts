// ==UserScript==
// @name         DolbyTaskKeepPartner
// @namespace    https://www.hddolby.com/
// @version      1.0.7
// @author       AgentN
// @description  在 HDDolby torrents.php?mystat=keep 页面，将做种数≤2的行高亮，并提供一键发布保种任务功能
// @license      MIT
// @match        https://www.hddolby.com/torrents.php?*mystat=keep*
// @match        https://www.hddolby.com/usercp.php*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @downloadURL https://update.greasyfork.org/scripts/569984/DolbyTaskKeepPartner.user.js
// @updateURL https://update.greasyfork.org/scripts/569984/DolbyTaskKeepPartner.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const API_DEFAULT_URL = "https://taskapi.orcinusorca.org";
    const API_PATH = "/api/v1/tasks/keep/publish";

    function getApiConfig() {
        return {
            url: GM_getValue("keep_api_url", API_DEFAULT_URL),
            token: GM_getValue("keep_api_token", "")
        };
    }

    function saveApiConfig(url, token) {
        GM_setValue("keep_api_url", url.replace(/\/$/, ""));
        GM_setValue("keep_api_token", token);
    }

    function highlightLow() {
        // 选择所有 class="rowfollow" 且 align="center" 的 td，内部有 <b>数字</b>
        document.querySelectorAll('td.rowfollow[align="center"] > b').forEach(function(b){
            var n = parseInt(b.textContent.trim(), 10);
            if (!isNaN(n) && n <= 2) {
                // 找到包含该 td 的最外层 tr
                var tr = b.closest('tr');
                if (tr) {
                    // 设置高亮背景色
                    tr.style.backgroundColor = '#fffa8c';
                    tr.classList.add('dt-low-seeders'); // 标记为低保种
                }
                if (tr) {
                    tr.querySelectorAll('td.embedded').forEach(function(td) {
                        td.style.backgroundColor = '#fffa8c';
                    });
                }
            }
        });
    }

    // 检查是否为置顶种子
    function isPinned(tr) {
        // 1. 检查 tr 的 class 是否包含 sticky
        // 注意：NexusPHP 有时使用 sticky_normal, sticky_highlight 等
        if (tr.classList.contains('sticky') || tr.className.indexOf('sticky') !== -1) return true;
        
        // 2. 检查内部图片
        // 用户提供的 HTML 中：<img class="sticky" src="..." alt="Sticky" title="置顶">
        if (tr.querySelector('img.sticky')) return true;
        if (tr.querySelector('img[title*="置顶"]')) return true;
        if (tr.querySelector('img[alt*="Sticky"]')) return true;
        if (tr.querySelector('img[src*="sticky"]')) return true;
        if (tr.querySelector('img[src*="pinned"]')) return true;
        
        // 3. 检查特殊的置顶表格容器
        if (tr.closest('table#torrents_sticky')) return true;
        
        return false;
    }

    // 提取种子ID
    function getTorrentId(tr) {
        const link = tr.querySelector('a[href*="details.php?id="]');
        if (link) {
            const match = link.href.match(/id=(\d+)/);
            if (match) return match[1];
        }
        return null;
    }

    // 一键处理：发布任务 + 置顶
    function runOneClickProcess() {
        const rows = document.querySelectorAll('tr.dt-low-seeders');
        let torrentIds = [];
        
        rows.forEach(tr => {
            if (!isPinned(tr)) {
                const id = getTorrentId(tr);
                if (id) torrentIds.push(id);
            }
        });

        if (torrentIds.length === 0) {
            alert("未找到需要处理的种子（标黄且未置顶）");
            return;
        }

        // 限制数量为 5
        const MAX_COUNT = 5;
        const totalFound = torrentIds.length;
        if (totalFound > MAX_COUNT) {
            torrentIds = torrentIds.slice(0, MAX_COUNT);
        }
        
        const count = torrentIds.length;
        const cost = count * 10000;

        if (!confirm(`[一键保种+置顶]\n\n找到 ${totalFound} 个目标，将处理前 ${count} 个。\n\n1. 发布任务到 API\n2. 扣除 ${cost} 鲸币进行置顶\n\n确定执行吗？`)) {
            return;
        }

        const config = getApiConfig();
        if (!config.token) {
            alert("请先设置 API Token");
            window.location.href = "/usercp.php?action=keepapi";
            return;
        }

        const apiUrl = (config.url || API_DEFAULT_URL) + API_PATH;
        let log = [];

        // 创建进度浮层
        const progressDiv = document.createElement('div');
        progressDiv.style.position = "fixed";
        progressDiv.style.top = "50%";
        progressDiv.style.left = "50%";
        progressDiv.style.transform = "translate(-50%, -50%)";
        progressDiv.style.backgroundColor = "rgba(0,0,0,0.8)";
        progressDiv.style.color = "white";
        progressDiv.style.padding = "20px";
        progressDiv.style.borderRadius = "10px";
        progressDiv.style.zIndex = "10000";
        progressDiv.style.textAlign = "center";
        progressDiv.innerHTML = `
            <h3 style="margin-top:0;">正在处理...</h3>
            <div id="dt-progress-api">API 发布: 等待中</div>
            <div id="dt-progress-promote" style="margin-top:10px;">置顶进度: 0/${count}</div>
            <div id="dt-progress-log" style="margin-top:10px; font-size:12px; color:#ccc;"></div>
        `;
        document.body.appendChild(progressDiv);

        function updateProgress(msg, type) {
            const logEl = document.getElementById('dt-progress-log');
            if (logEl) logEl.textContent = msg;
            
            if (type === 'api_ok') {
                document.getElementById('dt-progress-api').innerHTML = '<span style="color:#90ee90;">API 发布: 成功</span>';
            } else if (type === 'api_fail') {
                document.getElementById('dt-progress-api').innerHTML = '<span style="color:#ff6b6b;">API 发布: 失败</span>';
            }
        }

        // 1. Publish to API
        updateProgress("正在向 API 发送保种任务...", "info");
        
        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Api-Token " + config.token,
                "Host": new URL(apiUrl).hostname
            },
            data: JSON.stringify({ torrentIds: torrentIds }),
            timeout: 10000, // 10秒超时
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    log.push("✅ 保种任务发布成功");
                    updateProgress("API 发布成功", "api_ok");
                } else {
                    log.push("❌ 保种任务发布失败: " + response.status);
                    updateProgress("API 发布失败: " + response.status, "api_fail");
                }
                startPromoting();
            },
            onerror: function(err) {
                log.push("❌ API 请求出错");
                updateProgress("API 请求出错", "api_fail");
                startPromoting();
            },
            ontimeout: function() {
                log.push("❌ API 请求超时");
                updateProgress("API 请求超时", "api_fail");
                startPromoting();
            }
        });

        function startPromoting() {
            let successCount = 0;
            let failCount = 0;
            
            updateProgress(`开始置顶操作 (0/${count})`, "promote");

            function processNext(index) {
                if (index >= count) {
                    log.push(`🏁 批量置顶完成: 成功 ${successCount}, 失败 ${failCount}`);
                    updateProgress("全部完成，即将刷新...", "info");
                    setTimeout(() => {
                        document.body.removeChild(progressDiv);
                        alert(log.join("\n"));
                        location.reload();
                    }, 1000);
                    return;
                }

                const id = torrentIds[index];
                const url = `/promotion.php?id=${id}&action=1`;
                
                updateProgress(`正在置顶 ID:${id} (${index + 1}/${count})`, "promote");
                document.getElementById('dt-progress-promote').textContent = `置顶进度: ${index + 1}/${count}`;

                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    timeout: 5000, // 5秒超时
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 400) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    },
                    onerror: function() {
                        failCount++;
                    },
                    ontimeout: function() {
                        failCount++;
                    },
                    onloadend: function() {
                        // 稍微延迟一下
                        setTimeout(() => processNext(index + 1), 500); 
                    }
                });
            }
            processNext(0);
        }
    }

    // 添加发布按钮 (列表页)
    function addPublishButton() {
        // 寻找合适的位置，例如搜索箱上方或导航栏
        const target = document.querySelector('td.text[align="center"] #nav') || document.body;
        
        // 在页面头部添加一个固定按钮或者跟随菜单
        const menu = document.getElementById('mainmenu');
        if (menu) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = "javascript:void(0);";
            a.textContent = " 保种置顶 ";
            a.style.color = "#858482ff"; 
            a.onclick = runOneClickProcess;
            li.appendChild(a);
            menu.appendChild(li);
        } else {
            // 如果找不到菜单，添加悬浮按钮
            const btn = document.createElement('button');
            btn.textContent = "一键保种+置顶";
            btn.style.position = "fixed";
            btn.style.top = "10px";
            btn.style.right = "10px";
            btn.style.zIndex = "9999";
            btn.onclick = runOneClickProcess;
            document.body.appendChild(btn);
        }
    }

    // 渲染设置页面
    function renderSettingsPage() {
        // 找到主要内容区域 td#outer
        const outer = document.getElementById('outer');
        if (!outer) return;
        
        // 清空现有内容（移除错误信息）
        outer.innerHTML = '';
        
        // 构建 NexusPHP 风格的设置面板
        const panelHtml = `
            <table class="main" width="940" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                    <tr>
                        <td class="embedded">
                            <h2>保种任务发布设置</h2>
                            <div style="padding: 10px; background-color: #f9f9f9; border: 1px solid #ccc; border-radius: 5px; text-align: left;">
                                <div style="margin-bottom: 15px;">
                                    <label style="display:block; margin-bottom: 5px; font-weight: bold;">API 地址</label>
                                    <input type="text" id="dt-keep-api-url" style="width: 400px; padding: 5px;" placeholder="${API_DEFAULT_URL}" value="${GM_getValue('keep_api_url', API_DEFAULT_URL)}">
                                    <div style="font-size: 12px; color: #666; margin-top: 3px;">默认为: ${API_DEFAULT_URL}</div>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display:block; margin-bottom: 5px; font-weight: bold;">API Token</label>
                                    <input type="text" id="dt-keep-api-token" style="width: 400px; padding: 5px;" placeholder="输入您的 API Token" value="${GM_getValue('keep_api_token', '')}">
                                </div>
                                <div>
                                    <button id="dt-keep-save-btn" style="padding: 5px 15px; cursor: pointer; font-weight: bold;">保存设置</button>
                                    <span id="dt-keep-msg" style="margin-left: 10px; color: green; font-weight: bold;"></span>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        
        outer.innerHTML = panelHtml;

        // 绑定事件
        setTimeout(() => {
            const btn = document.getElementById('dt-keep-save-btn');
            if (btn) {
                btn.onclick = function() {
                    const url = document.getElementById('dt-keep-api-url').value.trim();
                    const token = document.getElementById('dt-keep-api-token').value.trim();
                    saveApiConfig(url, token);
                    const msg = document.getElementById('dt-keep-msg');
                    msg.textContent = "设置已保存！";
                    setTimeout(() => { msg.textContent = ""; }, 2000);
                };
            }
        }, 100);
    }

    // 在 User CP 添加导航链接
    function injectUserCpNav() {
        const url = new URL(location.href);
        if (url.pathname.includes('/usercp.php')) {
            // 找到导航栏或表格
            const table = document.querySelector('table.main');
            if (table) {
                // 在适当位置插入链接，或者在 sidebar
                // 简单处理：在页面顶部或 sidebar 添加
                // 这里我们假设用户知道 url 参数，或者我们添加一个显眼的入口
            }
            
            // 如果已经在设置页面，高亮当前选项等
        }
    }

    // 主逻辑
    const url = new URL(location.href);
    if (url.pathname.includes('/usercp.php')) {
        if (url.searchParams.get('action') === 'keepapi') {
            // 渲染设置页
            renderSettingsPage();
            return; // 停止其他脚本执行
        }
        // 在 User CP 页面注入入口
        const link = document.createElement('a');
        link.href = "usercp.php?action=keepapi";
        link.textContent = "[保种任务设置]";
        link.style.fontWeight = "bold";
        link.style.marginLeft = "10px";
        
        // 尝试插入到 "个人设定" 附近
        const settingsLink = document.querySelector('a[href*="action=personal"]');
        if (settingsLink && settingsLink.parentNode) {
            settingsLink.parentNode.appendChild(link);
        } else {
            // 插入到 h1 或 h2 标题后
            const title = document.querySelector('h1, h2, .text h2');
            if (title) title.appendChild(link);
        }
    }

    // 只有在种子列表页才执行高亮和添加按钮
    if (url.pathname.includes('torrents.php') && url.searchParams.get('mystat') === 'keep') {
        // 等待 DOM 完全加载后再执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                highlightLow();
                addPublishButton();
            });
        } else {
            highlightLow();
            addPublishButton();
        }
    }
})();