// ==UserScript==
// @name         Dolby Auto Reseed Reporter
// @namespace    https://task.orcinusorca.org
// @version      1.0.3
// @description  监听转种页面跳转，自动获取种子ID并向后端API汇报记录
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @connect      *
// @connect      taskapi.orcinusorca.org
// @connect      task.orcinusorca.org
// @license MIT
// @downloadURL https://update.greasyfork.org/scripts/556168/Dolby%20Auto%20Reseed%20Reporter.user.js
// @updateURL https://update.greasyfork.org/scripts/556168/Dolby%20Auto%20Reseed%20Reporter.meta.js
// ==/UserScript==

(function () {
    'use strict';

    function ensureModalCss() {
        if (document.getElementById('dt-reseed-modal-style')) return;
        const s = document.createElement('style');
        s.id = 'dt-reseed-modal-style';
        s.textContent = (
            '#dt-reseed-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);backdrop-filter:blur(2px);z-index:2147483647}' +
            '#dt-reseed-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:min(520px,90vw);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:16px 18px;z-index:2147483648}' +
            '#dt-reseed-modal h3{margin:0 0 10px;font-size:16px;font-weight:600}' +
            '#dt-reseed-modal .body{font-size:13px;line-height:1.6;max-height:50vh;overflow:auto}' +
            '#dt-reseed-modal .actions{margin-top:14px;display:flex;gap:10px;justify-content:flex-end}' +
            '#dt-reseed-modal .btn{padding:8px 12px;border-radius:10px;border:none;cursor:pointer;font-size:13px}' +
            '#dt-reseed-modal .btn.primary{background:#4B8BFF;color:#fff}' +
            '#dt-reseed-modal .btn.secondary{background:#eef2ff;color:#111}'
        );
        document.head.appendChild(s);
    }

    function showResultModal(opts) {
        ensureModalCss();
        const overlay = document.createElement('div');
        overlay.id = 'dt-reseed-overlay';
        const modal = document.createElement('div');
        modal.id = 'dt-reseed-modal';
        const isDark = document.documentElement.classList.contains('dark') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        modal.style.background = isDark ? 'rgba(22,22,28,.92)' : 'rgba(255,255,255,.92)';
        modal.style.color = isDark ? '#e5e7eb' : '#111';
        const title = document.createElement('h3');
        title.textContent = String(opts && opts.title ? opts.title : '转种汇报结果');
        const body = document.createElement('div');
        body.className = 'body';
        const rows = [
            ['站点', String(opts.host || '')],
            ['SID', String(opts.sid || '')],
            ['源HID', String(opts.hddolbyTid || '')],
            ['目标TID', String(opts.reportedTid || '')],
            ['接口', String(opts.url || '')],
            ['状态码', (opts.status !== undefined ? String(opts.status) : '')]
        ];
        const respText = String(opts.responseText || opts.errorText || '');
        const cut = respText.length > 800 ? (respText.slice(0, 800) + '...') : respText;
        const table = document.createElement('div');
        table.innerHTML = rows.map(([k,v]) => `<div><b>${k}</b>：${v}</div>`).join('');
        const resp = document.createElement('pre');
        resp.style.margin = '10px 0 0';
        resp.style.whiteSpace = 'pre-wrap';
        resp.style.wordBreak = 'break-word';
        resp.textContent = cut;
        body.appendChild(table);
        if (cut) body.appendChild(resp);
        const actions = document.createElement('div');
        actions.className = 'actions';
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn secondary';
        copyBtn.textContent = '复制详情';
        copyBtn.onclick = () => {
            const text = rows.map(([k,v]) => `${k}: ${v}`).join('\n') + (cut ? (`\n响应: \n${cut}`) : '');
            try { navigator.clipboard.writeText(text); } catch {}
        };
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn primary';
        closeBtn.textContent = '关闭';
        closeBtn.onclick = () => { try { overlay.remove(); modal.remove(); } catch {} };
        actions.appendChild(copyBtn);
        actions.appendChild(closeBtn);
        modal.appendChild(title);
        modal.appendChild(body);
        modal.appendChild(actions);
        overlay.addEventListener('click', () => { try { overlay.remove(); modal.remove(); } catch {} });
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }

    const sidMap = {
        "pt.keepfrds.com": 1,
        "pthome.net": 2,
        "api.m-team.cc": 3,
        "hdsky.me": 4,
        "tjupt.org": 5,
        "pterclub.net": 6,
        "hdhome.org": 7,
        "pt.btschool.club": 8,
        "ourbits.club": 9,
        "et8.org": 11,
        "totheglory.im": 14,
        "nanyangpt.com": 15,
        "hdcity.city": 17,
        "www.nicept.net": 18,
        "52pt.site": 19,
        "pt.eastgame.org": 22,
        "springsunday.net": 23,
        "pt.soulvoice.club": 24,
        "ptchdbits.co": 25,
        "ptsbao.club": 27,
        "hdarea.club": 29,
        "hdtime.org": 30,
        "1ptba.com": 31,
        "pt.hd4fans.org": 32,
        "open.cd": 33,
        "www.joyhd.net": 36,
        "u2.dmhy.org": 37,
        "pt.upxin.net": 38,
        "www.oshen.win": 39,
        "discfan.net": 40,
        "byr.pt": 45,
        "dicmusic.com": 51,
        "skyey2.com": 52,
        "pt.sjtu.edu.cn": 53,
        "www.hdroute.org": 54,
        "www.haidan.video": 56,
        "hdfans.org": 57,
        "www.dragonhd.xyz": 58,
        "www.hitpt.com": 59,
        "greatposterwall.com": 64,
        "pt.hdpost.top": 65,
        "hudbt.hust.edu.cn": 67,
        "audiences.me": 68,
        "piggo.me": 69,
        "wintersakura.net": 70,
        "hhanclub.top": 72,
        "pt.0ff.cc": 75,
        "ptchina.org": 79,
        "zhuque.in": 80,
        "zmpt.cc": 81,
        "rousi.zip": 82,
        "monikadesign.uk": 83,
        "cyanbug.net": 84,
        "ubits.club": 86,
        "pandapt.net": 88,
        "carpt.net": 89,
        "star-space.net": 91,
        "www.agsvpt.com": 93,
        "ptvicomo.net": 94,
        "www.qingwapt.com": 95,
        "xingtan.one": 96,
        "www.hdkyl.in": 97,
        "share.ilolicon.com": 98,
        "pt.gtk.pw": 99,
        "www.okpt.net": 101,
        "crabpt.vip": 102,
        "www.hddolby.com": 105,
        "kamept.com": 106,
        "ptcafe.club": 107,
        "www.yemapt.org": 109,
        "ptlgs.org": 110,
        "lemonhd.club": 111,
        "raingfh.top": 112,
        "njtupt.top": 113,
        "ptzone.xyz": 114,
        "pt.hdclone.org": 115,
        "kufei.org": 116,
        "www.ptlover.cc": 117,
        "pt.xingyungept.org": 119,
        "cspt.top": 120,
        "tmpt.top": 121,
        "www.htpt.cc": 123,
        "sewerpt.com": 124,
        "bilibili.download": 125,
        "www.gamegamept.com": 126,
        "cc.mypt.cc": 127,
        "longpt.org": 128,
        "hdbao.cc": 129,
        "13city.org": 130,
        "duckboobee.org": 131,
        "pt.luckpt.de": 132,
        "www.ptskit.org": 133,
        "playletpt.xyz": 134,
        "pt.novahd.top": 135,
        "pt.lajidui.top": 136,
        "www.hxpt.org": 137,
        "dubhe.site": 138
    };

    const API_URL = "https://your-api.example.com/";
    let CFG_URL = GM_getValue("reseed_api_url", API_URL);
    let CFG_TOKEN = GM_getValue("reseed_api_token", "");

    const host = location.hostname;
    const loc = new URL(location.href);
    if ((host === "www.hddolby.com" || host === "hddolby.com") && loc.pathname === "/usercp.php" && loc.searchParams.get("action") === "reseederapi") {
        renderSettingsPage();
        return;
    }
    if ((host === "www.hddolby.com" || host === "hddolby.com") && loc.pathname === "/usercp.php" && loc.searchParams.get("action") === "bind") {
        renderBindSettings();
    }
    try { captureOriginFromAutoFeed(); captureOriginFromHash(); captureOriginFromDetails(); } catch (e) {}
    try { rewriteUploadDescription(); } catch (e) {}
    if (!sidMap[host]) return;

    let torrentId = getTorrentIdFromUrl();
    if (!torrentId) {
        torrentId = getTorrentIdFromDom();
    }
    if (!torrentId) {
        waitForDom(() => {
            const tid = getTorrentIdFromDom();
            if (tid) maybeReport(tid);
        });
        return;
    }
    maybeReport(torrentId);

    function getTorrentIdFromUrl() {
        const u = new URL(location.href);
        const p = u.searchParams;
        const v = extractIdFromURL(u);
        if (v) return v;
        return null;
    }

    function getTorrentIdFromDom() {
        let id = null;
        const selector = [
            "a[href*='details.php?id=']",
            "a[href*='torrents.php?id=']",
            "a[href*='torrent.php?id=']",
            "a[href*='/torrent/']",
            "a[href*='/t/']",
            "a[href*='/detail/']",
            "a[href*='/torrents/']",
            "a[href*='/download_check/']",
            "a[href*='/library/']",
            "a[href*='video_detail.php?tid=']"
        ].join(", ");
        const link = document.querySelector(selector);
        if (link) {
            id = extractIdFromHref(link.href);
        }
        if (!id) {
            const meta = document.querySelector("meta[name='torrent-id']");
            if (meta) id = meta.content;
        }
        return id;
    }

    function extractIdFromHref(href) {
        try {
            const u = new URL(href, location.origin);
            return extractIdFromURL(u);
        } catch (e) {
            return null;
        }
    }

    function extractIdFromURL(u) {
        const p = u.searchParams;
        const keys = ["id", "torrentid", "tid", "topicid", "torrent_id"];
        for (let k of keys) {
            const v = p.get(k);
            if (v) return v;
        }
        const path = u.pathname.toLowerCase();
        let m;
        m = path.match(/\/t\/(\d+)/);
        if (m) return m[1];
        m = path.match(/\/torrent\/(\d+)/);
        if (m) return m[1];
        m = path.match(/\/detail\/(\d+)/);
        if (m) return m[1];
        m = path.match(/\/torrents\/(\d+)/);
        if (m) return m[1];
        m = path.match(/\/download_check\/(\d+)/);
        if (m) return m[1];
        m = path.match(/\/library\/(\d+)/);
        if (m) return m[1];
        m = path.match(/t-(\d+)/);
        if (m) return m[1];
        const hash = (u.hash || "").toLowerCase();
        m = hash.match(/#\/?torrent\/detail\/(\d+)\//);
        if (m) return m[1];
        return null;
    }

    function waitForDom(callback) {
        const observer = new MutationObserver(() => { callback(); });
        observer.observe(document, { childList: true, subtree: true });
        window.addEventListener("load", callback);
    }

    function sendReport(torrentId) {
        const sid = sidMap[host];
        if (!sid || sid === 105) return;
        const origin = GM_getValue("reseed_last_origin", null);
        if (!origin || !origin.tid) return;
        const uNow = new URL(location.href);
        if (uNow.searchParams.get("existed") === "1") return;
        const uploadedRequired = uNow.searchParams.get("uploaded") === "1";
        if (!uploadedRequired) return;
        const apiUrl = resolveReportUrl(GM_getValue("reseed_api_url", CFG_URL) || API_URL);
        const token = GM_getValue("reseed_api_token", CFG_TOKEN) || "";
        const uploadedFlag = true;
        const pref = getPreferredOrigin() || origin;
        const payload = {
            hddolbyTorrentId: String(pref.tid),
            reportedTorrentId: String(torrentId),
            sid: sid
        };
        const authHeader = token ? ("Api-Token " + token) : null;
        console.log("[Reseed Reporter] request", { url: apiUrl, sid: sid, host: host, payload: payload, headers: { Authorization: authHeader ? (authHeader.split(' ')[0] + " ******") : null } });
        const showToast = (text) => {
            try {
                let el = document.getElementById('dt-reseed-toast');
                if (el) el.remove();
                el = document.createElement('div');
                el.id = 'dt-reseed-toast';
                el.textContent = text;
                el.style.cssText = 'position:fixed;top:12px;left:12px;background:#10b981;color:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);z-index:2147483647;font-size:14px;';
                document.body.appendChild(el);
                setTimeout(() => { try { el && el.remove(); } catch {} }, 3000);
            } catch {}
        };
        const showError = (text) => {
            try {
                let el = document.getElementById('dt-reseed-toast-error');
                if (el) el.remove();
                el = document.createElement('div');
                el.id = 'dt-reseed-toast-error';
                el.textContent = text;
                el.style.cssText = 'position:fixed;top:12px;left:12px;background:#ef4444;color:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);z-index:2147483647;font-size:14px;';
                document.body.appendChild(el);
                setTimeout(() => { try { el && el.remove(); } catch {} }, 3500);
            } catch {}
        };
        const doPost = (url, retryFallback) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                data: JSON.stringify(payload),
                timeout: 15000,
                headers: Object.assign({ "Content-Type": "application/json" }, (authHeader ? { "Authorization": authHeader } : {})),
                onload: (response) => {
                    console.log("[Reseed Reporter] response", { status: response.status, headers: response.responseHeaders, text: response.responseText });
                    try {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                showResultModal({
                                    title: '转种汇报完成',
                                    host: host,
                                    sid: sid,
                                    hddolbyTid: String(pref.tid),
                                    reportedTid: String(torrentId),
                                    url: url,
                                    status: response.status,
                                    responseText: response.responseText || ''
                                });
                            } catch {}
                            showToast('转种汇报完成');
                            return;
                        }
                    } catch {}
                    if (retryFallback) {
                        const fallback = 'http://163.61.31.171:8080/api/tasks/reseed/report-by-hid';
                        console.log('[Reseed Reporter] retry with fallback', { url: fallback });
                        doPost(fallback, false);
                    } else {
                        try {
                            showResultModal({
                                title: '转种汇报失败',
                                host: host,
                                sid: sid,
                                hddolbyTid: String(pref.tid),
                                reportedTid: String(torrentId),
                                url: url,
                                status: response.status,
                                responseText: response.responseText || ''
                            });
                        } catch {}
                        showError('转种汇报失败');
                    }
                },
                onerror: (err) => {
                    console.error("[Reseed Reporter] error", err);
                    if (retryFallback) {
                        const fallback = 'http://163.61.31.171:8080/api/tasks/reseed/report-by-hid';
                        console.log('[Reseed Reporter] retry with fallback', { url: fallback });
                        doPost(fallback, false);
                    } else {
                        try {
                            showResultModal({
                                title: '转种汇报失败',
                                host: host,
                                sid: sid,
                                hddolbyTid: String(pref.tid),
                                reportedTid: String(torrentId),
                                url: url,
                                errorText: (err && (err.message || err.error || '')) || ''
                            });
                        } catch {}
                        showError('转种汇报失败');
                    }
                }
            });
        };
        doPost(apiUrl, true);
    }


    function maybeReport(tid) {
        if (!sidMap[host] || sidMap[host] === 105) return;
        const path = (new URL(location.href)).pathname.toLowerCase();
        const isUpload = /upload\.php$/.test(path) || /plugin_upload\.php$/.test(path) || /\/torrents\/create(\/?$)/.test(path);
        if (isUpload) return;
        const key = `reported:${host}:${tid}`;
        if (GM_getValue(key, false)) return;
        const u = new URL(location.href);
        if (u.searchParams.get("existed") === "1") return;
        const uploaded = u.searchParams.get("uploaded") === "1";
        if (uploaded) {
            GM_setValue(key, true);
            sendReport(tid);
        }
    }

    function isHddolbyHost(h) {
        const s = String(h || "").toLowerCase();
        return s === "www.hddolby.com" || s === "hddolby.com";
    }

    function captureOriginFromDetails() {
        // 仅在 HDDolby 详情页记录来源 HID，避免被目标站详情页覆盖
        if (!isHddolbyHost(host)) return;
        const sid = sidMap[host];
        if (!sid) return;
        const u = new URL(location.href);
        const tid = u.searchParams.get("id") || u.searchParams.get("tid") || null;
        if (!tid) return;
        GM_setValue("reseed_last_origin", { site: host, sid: sid, tid: String(tid), href: location.href, ts: Date.now(), source: "url" });
        console.log("[Reseed Reporter] origin set from HDDolby details", { tid: String(tid), href: location.href, site: host, sid, source: "url" });
    }

    function captureOriginFromHash() {
        const existing = GM_getValue("reseed_last_origin", null);
        if (existing && existing.source === "url") return;
        const h = location.hash || "";
        if (!h) return;
        const dec = decodeURIComponent(h);
        const m = dec.match(/https?:\/\/([^\/#\s]+)\/details\.php\?[^#]*?id=(\d+)/i);
        if (!m) return;
        const site = m[1].toLowerCase();
        if (!isHddolbyHost(site)) return;
        const sid = sidMap[site] || null;
        const tid = m[2];
        if (!sid) return;
        GM_setValue("reseed_last_origin", { site: site, sid: sid, tid: String(tid), href: m[0], ts: Date.now(), source: "hash" });
        console.log("[Reseed Reporter] origin set from hash", { tid: String(tid), href: m[0], site, sid, source: "hash" });
    }

    function extractHidFromString(s) {
        const m = String(s || "").match(/https?:\/\/([^\/#\s]+)\/details\.php\?[^#]*?id=(\d+)/i);
        if (!m) return null;
        const site = m[1].toLowerCase();
        if (!isHddolbyHost(site)) return null;
        return { site, id: m[2] };
    }

    // 取消从页面内容中抓取来源链接，确保仅使用地址栏或跳转哈希

    function getPreferredOrigin() {
        const o = GM_getValue("reseed_last_origin", null);
        if (!o) return null;
        // 优先级：auto_feed > url > 其他
        if (o.source === "auto_feed" || o.source === "url") return o;
        return o;
    }

    function captureOriginFromAutoFeed() {
        const existing = GM_getValue("reseed_last_origin", null);
        if (existing && (existing.source === "auto_feed" || existing.source === "url")) return;
        const candidates = [];
        try { if (typeof window.origin_url === "string") candidates.push(window.origin_url); } catch {}
        try { if (typeof unsafeWindow !== "undefined" && typeof unsafeWindow.origin_url === "string") candidates.push(unsafeWindow.origin_url); } catch {}
        // 扫描全局对象寻找带 origin_url 的数据结构（如 raw_info.origin_url）
        try {
            for (const k of Object.keys(window)) {
                try {
                    const v = window[k];
                    if (v && typeof v === "object" && typeof v.origin_url === "string") {
                        candidates.push(v.origin_url);
                    }
                } catch {}
            }
        } catch {}
        for (let u of candidates) {
            try { u = String(u).replace('***','/'); } catch {}
            const r = extractHidFromString(u);
            if (!r) continue;
            const sid = sidMap[r.site] || 105;
            GM_setValue("reseed_last_origin", { site: r.site, sid: sid, tid: String(r.id), href: String(u), ts: Date.now(), source: "auto_feed" });
            console.log("[Reseed Reporter] origin set from auto_feed", { tid: String(r.id), href: String(u), site: r.site, sid, source: "auto_feed" });
            break;
        }
    }

    function rewriteUploadDescription() {
        const p = loc.pathname.toLowerCase();
        const isUpload = /upload\.php$/.test(p) || /plugin_upload\.php$/.test(p) || /\/torrents\/create/.test(p) || /\/torrents\/create\//.test(p);
        if (!isUpload) return;
        const origin = getPreferredOrigin() || GM_getValue("reseed_last_origin", null);
        let tid = origin && origin.tid;
        if (!tid) {
            const ref = document.referrer || "";
            const m = ref.match(/https?:\/\/([^\/#\s]+)\/details\.php\?[^#]*?id=(\d+)/i);
            if (m) {
                const h = m[1].toLowerCase();
                if (h === "www.hddolby.com" || h === "hddolby.com") tid = m[2];
            }
        }
        if (!tid) return;
        const url = origin && origin.href ? String(origin.href) : `https://www.hddolby.com/details.php?id=${tid}`;
        const snippet = `[quote][b][color=blue]HDDolby官组[url=${url}]作品[/url]，感谢原制作者发布。[/color][/b][/quote]\n\n`;
        const pick = () => document.querySelector("textarea[name='descr'], textarea#descr, textarea[name='description'], textarea#description, textarea[name*='descr'], textarea[name*='desc']");
        const applyOnce = (ta) => {
            if (!ta) return;
            let val = ta.value || "";
            const hasUrl = val.includes(url);
            const hasPhrase = /HDDolby官组/.test(val);
            if (hasPhrase && !hasUrl) {
                val = val.replace(/HDDolby官组作品/g, `HDDolby官组[url=${url}]作品[/url]`);
            } else if (!hasUrl) {
                val = snippet + val;
            }
            if (val !== ta.value) {
                ta.value = val;
                ta.dispatchEvent(new Event("input", { bubbles: true }));
                ta.dispatchEvent(new Event("change", { bubbles: true }));
                console.log("[Reseed Reporter] description patched", { url });
            }
        };
        const ensure = () => {
            const ta = pick();
            if (ta) applyOnce(ta);
        };
        // Initial try and a short stabilization window to override later autofill
        ensure();
        let tries = 0;
        const timer = setInterval(() => {
            tries++;
            ensure();
            if (tries >= 60) clearInterval(timer);
        }, 300);
        // Patch before submit to guarantee presence
        const form = document.querySelector("form");
        if (form) {
            form.addEventListener("submit", () => {
                ensure();
            }, { capture: true });
        }
        const obs = new MutationObserver(() => ensure());
        obs.observe(document, { childList: true, subtree: true });
    }

    function renderSettingsPage() {
        const panel = document.createElement("div");
        panel.style.maxWidth = "720px";
        panel.style.margin = "16px auto";
        panel.style.padding = "16px";
        panel.style.border = "1px solid #ddd";
        panel.style.borderRadius = "8px";
        panel.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
        panel.style.display = "none";
        const title = document.createElement("div");
        title.textContent = "保种API";
        title.style.fontSize = "16px";
        title.style.fontWeight = "600";
        const urlLabel = document.createElement("label");
        urlLabel.textContent = "API 地址";
        urlLabel.style.display = "block";
        urlLabel.style.marginTop = "12px";
        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.style.width = "100%";
        urlInput.style.padding = "8px";
        urlInput.value = GM_getValue("reseed_api_url", CFG_URL);
        const tokenLabel = document.createElement("label");
        tokenLabel.textContent = "API Token";
        tokenLabel.style.display = "block";
        tokenLabel.style.marginTop = "12px";
        const tokenInput = document.createElement("input");
        tokenInput.type = "text";
        tokenInput.style.width = "100%";
        tokenInput.style.padding = "8px";
        tokenInput.value = GM_getValue("reseed_api_token", CFG_TOKEN);
        const btns = document.createElement("div");
        btns.style.marginTop = "14px";
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "保存";
        saveBtn.style.marginRight = "8px";
        const testBtn = document.createElement("button");
        testBtn.textContent = "测试";
        const msg = document.createElement("div");
        msg.style.marginTop = "12px";
        msg.style.color = "#333";
        saveBtn.onclick = () => {
            const u = urlInput.value.trim();
            const t = tokenInput.value.trim();
            if (!u) { msg.textContent = "请输入有效的 API 地址"; return; }
            GM_setValue("reseed_api_url", u);
            GM_setValue("reseed_api_token", t);
            CFG_URL = u;
            CFG_TOKEN = t;
            msg.textContent = "已保存";
        };
        testBtn.onclick = () => {
            const base = (urlInput.value.trim() || GM_getValue("reseed_api_url", CFG_URL));
            const u = resolveReportUrl(base);
            const t = (tokenInput.value.trim() || GM_getValue("reseed_api_token", CFG_TOKEN));
            const payload = { hddolbyTorrentId: "0", sid: sidMap[host] || 0, reportedTorrentId: "0", test: true };
            GM_xmlhttpRequest({
                method: "POST",
                url: u,
                data: JSON.stringify(payload),
                headers: Object.assign({ "Content-Type": "application/json" }, (t ? { "Authorization": (/^Bearer\s+/i.test(t) ? t : ("Api-Token " + t)) } : {})),
                onload: (r) => { msg.textContent = "测试成功: " + (r.status) + " " + (r.responseText || ""); },
                onerror: () => { msg.textContent = "测试失败"; }
            });
        };
        btns.appendChild(saveBtn);
        btns.appendChild(testBtn);
        panel.appendChild(title);
        panel.appendChild(urlLabel);
        panel.appendChild(urlInput);
        panel.appendChild(tokenLabel);
        panel.appendChild(tokenInput);
        panel.appendChild(btns);
        panel.appendChild(msg);
        const tabLabel = document.createElement("a");
        tabLabel.textContent = "保种API";
        tabLabel.href = "javascript:void(0)";
        tabLabel.style.padding = "8px 12px";
        tabLabel.style.display = "inline-block";
        tabLabel.style.border = "1px solid #ddd";
        tabLabel.style.borderRadius = "6px";
        tabLabel.style.margin = "8px";
        tabLabel.onclick = () => {
            panel.style.display = panel.style.display === "none" ? "block" : "none";
        };
        const navCandidates = document.querySelector(".nav-tabs, ul.tabnav, ul.nav, .tabs, .mainmenu, #nav") || document.body;
        navCandidates.appendChild(tabLabel);
        const contentContainer = document.querySelector("#outer, #content, .wrapper, .container, body") || document.body;
        contentContainer.appendChild(panel);
    }

    function renderBindSettings() {
        const outer = document.querySelector("#outer") || document.body;
        const wrap = document.createElement("table");
        wrap.className = "main";
        wrap.style.width = "940px";
        wrap.cellPadding = "5";
        wrap.cellSpacing = "0";
        const tbody = document.createElement("tbody");
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.className = "embedded";
        const box = document.createElement("div");
        box.className = "outer";
        box.style.padding = "14px";
        box.style.margin = "10px auto";
        box.style.borderRadius = "0px";
        const title = document.createElement("h2");
        title.className = "text";
        title.style.fontSize = "14px";
        title.textContent = "转种API设置";
        const formTable = document.createElement("table");
        formTable.className = "main";
        formTable.style.width = "100%";
        formTable.cellPadding = "5";
        formTable.cellSpacing = "0";
        const row1 = document.createElement("tr");
        const r1c1 = document.createElement("td");
        r1c1.className = "text";
        r1c1.style.width = "120px";
        r1c1.style.textAlign = "right";
        r1c1.textContent = "API 地址";
        const r1c2 = document.createElement("td");
        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.style.width = "95%";
        urlInput.value = GM_getValue("reseed_api_url", CFG_URL);
        r1c2.appendChild(urlInput);
        row1.appendChild(r1c1); row1.appendChild(r1c2);
        const row2 = document.createElement("tr");
        const r2c1 = document.createElement("td");
        r2c1.className = "text";
        r2c1.style.textAlign = "right";
        r2c1.textContent = "API Token";
        const r2c2 = document.createElement("td");
        const tokenInput = document.createElement("input");
        tokenInput.type = "text";
        tokenInput.style.width = "95%";
        tokenInput.value = GM_getValue("reseed_api_token", CFG_TOKEN);
        r2c2.appendChild(tokenInput);
        row2.appendChild(r2c1); row2.appendChild(r2c2);
        const row3 = document.createElement("tr");
        const r3c1 = document.createElement("td");
        r3c1.className = "text";
        const r3c2 = document.createElement("td");
        const saveBtn = document.createElement("input");
        saveBtn.type = "button";
        saveBtn.value = "保存转种api";
        const msg = document.createElement("span");
        msg.style.marginLeft = "10px";
        saveBtn.onclick = () => {
            const u = urlInput.value.trim();
            const t = tokenInput.value.trim();
            if (!u) { msg.textContent = "请输入有效的 API 地址"; return; }
            GM_setValue("reseed_api_url", u);
            GM_setValue("reseed_api_token", t);
            CFG_URL = u;
            CFG_TOKEN = t;
            msg.textContent = "已保存";
        };
        r3c2.appendChild(saveBtn);
        r3c2.appendChild(msg);
        row3.appendChild(r3c1); row3.appendChild(r3c2);
        formTable.appendChild(row1);
        formTable.appendChild(row2);
        formTable.appendChild(row3);
        box.appendChild(title);
        box.appendChild(formTable);
        td.appendChild(box);
        tr.appendChild(td);
        tbody.appendChild(tr);
        wrap.appendChild(tbody);
        outer.appendChild(wrap);
    }

    function resolveReportUrl(base) {
        const b = String(base || "").trim();
        if (!b) return "";
        const n = b.replace(/\s+/g, "").replace(/\/+$/, "");
        if (/\/api\/tasks\/reseed\/report-by-hid$/i.test(n) || /report-by-hid$/i.test(n)) return n;
        if (/\/api\/tasks\/reseed$/i.test(n)) return n + "/report-by-hid";
        if (/\/api$/i.test(n)) return n + "/tasks/reseed/report-by-hid";
        if (/\/reseed\/report\/?$/i.test(n)) return n.replace(/\/reseed\/report\/?$/i, "") + "/api/tasks/reseed/report-by-hid";
        try {
            const u = new URL(n);
            return u.origin + "/api/tasks/reseed/report-by-hid";
        } catch {
            return n + "/api/tasks/reseed/report-by-hid";
        }
    }

    try {
        if (loc.hash && /dt-test-modal-success/i.test(loc.hash)) {
            showResultModal({
                title: '转种汇报完成',
                host: host,
                sid: sidMap[host] || 0,
                hddolbyTid: '123456',
                reportedTid: '654321',
                url: resolveReportUrl(GM_getValue('reseed_api_url', CFG_URL) || API_URL),
                status: 200,
                responseText: '{"ok":true,"message":"test"}'
            });
        } else if (loc.hash && /dt-test-modal-fail/i.test(loc.hash)) {
            showResultModal({
                title: '转种汇报失败',
                host: host,
                sid: sidMap[host] || 0,
                hddolbyTid: '123456',
                reportedTid: '654321',
                url: resolveReportUrl(GM_getValue('reseed_api_url', CFG_URL) || API_URL),
                status: 500,
                responseText: '{"ok":false,"error":"test"}'
            });
        }
    } catch {}
})();
