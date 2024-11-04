// ==UserScript==
// @name            杜比月度审核统计
// @name:en         hddolby_logAuditStat
// @namespace       https://www.hddolby.com/
// @version         1.0.2
// @author          Kesa
// @description     杜比月度审核员审核数量统计
// @description:en  hddolby's log audit statistics monthly
// @license         MIT
// @icon            https://www.hddolby.com/favicon.ico
// @match           https://www.hddolby.com/log.php*
// @grant           none
// ==/UserScript==

(o => { const t = document.createElement("style"); t.dataset.source = "vite-plugin-monkey", t.textContent = o, document.head.append(t) })(" .insertTable{width:940px}.innerTable{width:100%}.innerTable td{border:none}.toast-title{font-weight:700}.toast-message{-ms-word-wrap:break-word;word-wrap:break-word}.toast-message a,.toast-message label{color:#fff}.toast-message a:hover{color:#ccc;text-decoration:none}.toast-close-button{position:relative;right:-.3em;top:-.3em;float:right;font-size:20px;font-weight:700;color:#fff;-webkit-text-shadow:0 1px 0 #fff;text-shadow:0 1px 0 #fff;opacity:.8;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80);filter:alpha(opacity=80);line-height:1}.toast-close-button:focus,.toast-close-button:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.4;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=40);filter:alpha(opacity=40)}.rtl .toast-close-button{left:-.3em;float:left;right:.3em}button.toast-close-button{padding:0;cursor:pointer;background:0 0;border:0;-webkit-appearance:none}.toast-top-center{top:0;right:0;width:100%}.toast-bottom-center{bottom:0;right:0;width:100%}.toast-top-full-width{top:0;right:0;width:100%}.toast-bottom-full-width{bottom:0;right:0;width:100%}.toast-top-left{top:12px;left:12px}.toast-top-right{top:12px;right:12px}.toast-bottom-right{right:12px;bottom:12px}.toast-bottom-left{bottom:12px;left:12px}#toast-container{position:fixed;z-index:999999;pointer-events:none}#toast-container *{-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}#toast-container>div{position:relative;pointer-events:auto;overflow:hidden;margin:0 0 6px;padding:15px 15px 15px 50px;width:300px;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;background-position:15px center;background-repeat:no-repeat;-moz-box-shadow:0 0 12px #999;-webkit-box-shadow:0 0 12px #999;box-shadow:0 0 12px #999;color:#fff;opacity:.8;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80);filter:alpha(opacity=80)}#toast-container>div.rtl{direction:rtl;padding:15px 50px 15px 15px;background-position:right 15px center}#toast-container>div:hover{-moz-box-shadow:0 0 12px #000;-webkit-box-shadow:0 0 12px #000;box-shadow:0 0 12px #000;opacity:1;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=100);filter:alpha(opacity=100);cursor:pointer}#toast-container>.toast-info{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGwSURBVEhLtZa9SgNBEMc9sUxxRcoUKSzSWIhXpFMhhYWFhaBg4yPYiWCXZxBLERsLRS3EQkEfwCKdjWJAwSKCgoKCcudv4O5YLrt7EzgXhiU3/4+b2ckmwVjJSpKkQ6wAi4gwhT+z3wRBcEz0yjSseUTrcRyfsHsXmD0AmbHOC9Ii8VImnuXBPglHpQ5wwSVM7sNnTG7Za4JwDdCjxyAiH3nyA2mtaTJufiDZ5dCaqlItILh1NHatfN5skvjx9Z38m69CgzuXmZgVrPIGE763Jx9qKsRozWYw6xOHdER+nn2KkO+Bb+UV5CBN6WC6QtBgbRVozrahAbmm6HtUsgtPC19tFdxXZYBOfkbmFJ1VaHA1VAHjd0pp70oTZzvR+EVrx2Ygfdsq6eu55BHYR8hlcki+n+kERUFG8BrA0BwjeAv2M8WLQBtcy+SD6fNsmnB3AlBLrgTtVW1c2QN4bVWLATaIS60J2Du5y1TiJgjSBvFVZgTmwCU+dAZFoPxGEEs8nyHC9Bwe2GvEJv2WXZb0vjdyFT4Cxk3e/kIqlOGoVLwwPevpYHT+00T+hWwXDf4AJAOUqWcDhbwAAAAASUVORK5CYII=)!important}#toast-container>.toast-error{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=)!important}#toast-container>.toast-success{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==)!important}#toast-container>.toast-warning{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGYSURBVEhL5ZSvTsNQFMbXZGICMYGYmJhAQIJAICYQPAACiSDB8AiICQQJT4CqQEwgJvYASAQCiZiYmJhAIBATCARJy+9rTsldd8sKu1M0+dLb057v6/lbq/2rK0mS/TRNj9cWNAKPYIJII7gIxCcQ51cvqID+GIEX8ASG4B1bK5gIZFeQfoJdEXOfgX4QAQg7kH2A65yQ87lyxb27sggkAzAuFhbbg1K2kgCkB1bVwyIR9m2L7PRPIhDUIXgGtyKw575yz3lTNs6X4JXnjV+LKM/m3MydnTbtOKIjtz6VhCBq4vSm3ncdrD2lk0VgUXSVKjVDJXJzijW1RQdsU7F77He8u68koNZTz8Oz5yGa6J3H3lZ0xYgXBK2QymlWWA+RWnYhskLBv2vmE+hBMCtbA7KX5drWyRT/2JsqZ2IvfB9Y4bWDNMFbJRFmC9E74SoS0CqulwjkC0+5bpcV1CZ8NMej4pjy0U+doDQsGyo1hzVJttIjhQ7GnBtRFN1UarUlH8F3xict+HY07rEzoUGPlWcjRFRr4/gChZgc3ZL2d8oAAAAASUVORK5CYII=)!important}#toast-container.toast-bottom-center>div,#toast-container.toast-top-center>div{width:300px;margin-left:auto;margin-right:auto}#toast-container.toast-bottom-full-width>div,#toast-container.toast-top-full-width>div{width:96%;margin-left:auto;margin-right:auto}.toast{background-color:#030303}.toast-success{background-color:#51a351}.toast-error{background-color:#bd362f}.toast-info{background-color:#2f96b4}.toast-warning{background-color:#f89406}.toast-progress{position:absolute;left:0;bottom:0;height:4px;background-color:#000;opacity:.4;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=40);filter:alpha(opacity=40)}@media all and (max-width:240px){#toast-container>div{padding:8px 8px 8px 50px;width:11em}#toast-container>div.rtl{padding:8px 50px 8px 8px}#toast-container .toast-close-button{right:-.2em;top:-.2em}#toast-container .rtl .toast-close-button{left:-.2em;right:.2em}}@media all and (min-width:241px) and (max-width:480px){#toast-container>div{padding:8px 8px 8px 50px;width:18em}#toast-container>div.rtl{padding:8px 50px 8px 8px}#toast-container .toast-close-button{right:-.2em;top:-.2em}#toast-container .rtl .toast-close-button{left:-.2em;right:.2em}}@media all and (min-width:481px) and (max-width:768px){#toast-container>div{padding:15px 15px 15px 50px;width:25em}#toast-container>div.rtl{padding:15px 50px 15px 15px}} ");

(function () {
  'use strict';

  !function (e) {
    e(["jquery"], function (e2) {
      return function () {
        function t(e3, t2, n2) {
          return g({ type: O.error, iconClass: m().iconClasses.error, message: e3, optionsOverride: n2, title: t2 });
        }
        function n(t2, n2) {
          return t2 || (t2 = m()), v = e2("#" + t2.containerId), v.length ? v : (n2 && (v = d(t2)), v);
        }
        function o(e3, t2, n2) {
          return g({ type: O.info, iconClass: m().iconClasses.info, message: e3, optionsOverride: n2, title: t2 });
        }
        function s(e3) {
          C = e3;
        }
        function i(e3, t2, n2) {
          return g({ type: O.success, iconClass: m().iconClasses.success, message: e3, optionsOverride: n2, title: t2 });
        }
        function a(e3, t2, n2) {
          return g({ type: O.warning, iconClass: m().iconClasses.warning, message: e3, optionsOverride: n2, title: t2 });
        }
        function r(e3, t2) {
          var o2 = m();
          v || n(o2), u(e3, o2, t2) || l(o2);
        }
        function c(t2) {
          var o2 = m();
          return v || n(o2), t2 && 0 === e2(":focus", t2).length ? void h(t2) : void (v.children().length && v.remove());
        }
        function l(t2) {
          for (var n2 = v.children(), o2 = n2.length - 1; o2 >= 0; o2--)
            u(e2(n2[o2]), t2);
        }
        function u(t2, n2, o2) {
          var s2 = !(!o2 || !o2.force) && o2.force;
          return !(!t2 || !s2 && 0 !== e2(":focus", t2).length) && (t2[n2.hideMethod]({
            duration: n2.hideDuration, easing: n2.hideEasing, complete: function () {
              h(t2);
            }
          }), true);
        }
        function d(t2) {
          return v = e2("<div/>").attr("id", t2.containerId).addClass(t2.positionClass), v.appendTo(e2(t2.target)), v;
        }
        function p() {
          return { tapToDismiss: true, toastClass: "toast", containerId: "toast-container", debug: false, showMethod: "fadeIn", showDuration: 300, showEasing: "swing", onShown: void 0, hideMethod: "fadeOut", hideDuration: 1e3, hideEasing: "swing", onHidden: void 0, closeMethod: false, closeDuration: false, closeEasing: false, closeOnHover: true, extendedTimeOut: 1e3, iconClasses: { error: "toast-error", info: "toast-info", success: "toast-success", warning: "toast-warning" }, iconClass: "toast-info", positionClass: "toast-top-right", timeOut: 5e3, titleClass: "toast-title", messageClass: "toast-message", escapeHtml: false, target: "body", closeHtml: '<button type="button">&times;</button>', closeClass: "toast-close-button", newestOnTop: true, preventDuplicates: false, progressBar: false, progressClass: "toast-progress", rtl: false };
        }
        function f(e3) {
          C && C(e3);
        }
        function g(t2) {
          function o2(e3) {
            return null == e3 && (e3 = ""), e3.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }
          function s2() {
            c2(), u2(), d2(), p2(), g2(), C2(), l2(), i2();
          }
          function i2() {
            var e3 = "";
            switch (t2.iconClass) {
              case "toast-success":
              case "toast-info":
                e3 = "polite";
                break;
              default:
                e3 = "assertive";
            }
            I.attr("aria-live", e3);
          }
          function a2() {
            E.closeOnHover && I.hover(H, D), !E.onclick && E.tapToDismiss && I.click(b2), E.closeButton && j && j.click(function (e3) {
              e3.stopPropagation ? e3.stopPropagation() : void 0 !== e3.cancelBubble && e3.cancelBubble !== true && (e3.cancelBubble = true), E.onCloseClick && E.onCloseClick(e3), b2(true);
            }), E.onclick && I.click(function (e3) {
              E.onclick(e3), b2();
            });
          }
          function r2() {
            I.hide(), I[E.showMethod]({ duration: E.showDuration, easing: E.showEasing, complete: E.onShown }), E.timeOut > 0 && (k = setTimeout(b2, E.timeOut), F.maxHideTime = parseFloat(E.timeOut), F.hideEta = (/* @__PURE__ */ new Date()).getTime() + F.maxHideTime, E.progressBar && (F.intervalId = setInterval(x, 10)));
          }
          function c2() {
            t2.iconClass && I.addClass(E.toastClass).addClass(y);
          }
          function l2() {
            E.newestOnTop ? v.prepend(I) : v.append(I);
          }
          function u2() {
            if (t2.title) {
              var e3 = t2.title;
              E.escapeHtml && (e3 = o2(t2.title)), M.append(e3).addClass(E.titleClass), I.append(M);
            }
          }
          function d2() {
            if (t2.message) {
              var e3 = t2.message;
              E.escapeHtml && (e3 = o2(t2.message)), B.append(e3).addClass(E.messageClass), I.append(B);
            }
          }
          function p2() {
            E.closeButton && (j.addClass(E.closeClass).attr("role", "button"), I.prepend(j));
          }
          function g2() {
            E.progressBar && (q.addClass(E.progressClass), I.prepend(q));
          }
          function C2() {
            E.rtl && I.addClass("rtl");
          }
          function O2(e3, t3) {
            if (e3.preventDuplicates) {
              if (t3.message === w)
                return true;
              w = t3.message;
            }
            return false;
          }
          function b2(t3) {
            var n2 = t3 && E.closeMethod !== false ? E.closeMethod : E.hideMethod, o3 = t3 && E.closeDuration !== false ? E.closeDuration : E.hideDuration, s3 = t3 && E.closeEasing !== false ? E.closeEasing : E.hideEasing;
            if (!e2(":focus", I).length || t3)
              return clearTimeout(F.intervalId), I[n2]({
                duration: o3, easing: s3, complete: function () {
                  h(I), clearTimeout(k), E.onHidden && "hidden" !== P.state && E.onHidden(), P.state = "hidden", P.endTime = /* @__PURE__ */ new Date(), f(P);
                }
              });
          }
          function D() {
            (E.timeOut > 0 || E.extendedTimeOut > 0) && (k = setTimeout(b2, E.extendedTimeOut), F.maxHideTime = parseFloat(E.extendedTimeOut), F.hideEta = (/* @__PURE__ */ new Date()).getTime() + F.maxHideTime);
          }
          function H() {
            clearTimeout(k), F.hideEta = 0, I.stop(true, true)[E.showMethod]({ duration: E.showDuration, easing: E.showEasing });
          }
          function x() {
            var e3 = (F.hideEta - (/* @__PURE__ */ new Date()).getTime()) / F.maxHideTime * 100;
            q.width(e3 + "%");
          }
          var E = m(), y = t2.iconClass || E.iconClass;
          if ("undefined" != typeof t2.optionsOverride && (E = e2.extend(E, t2.optionsOverride), y = t2.optionsOverride.iconClass || y), !O2(E, t2)) {
            T++, v = n(E, true);
            var k = null, I = e2("<div/>"), M = e2("<div/>"), B = e2("<div/>"), q = e2("<div/>"), j = e2(E.closeHtml), F = { intervalId: null, hideEta: null, maxHideTime: null }, P = { toastId: T, state: "visible", startTime: /* @__PURE__ */ new Date(), options: E, map: t2 };
            return s2(), r2(), a2(), f(P), E.debug && console && console.log(P), I;
          }
        }
        function m() {
          return e2.extend({}, p(), b.options);
        }
        function h(e3) {
          v || (v = n()), e3.is(":visible") || (e3.remove(), e3 = null, 0 === v.children().length && (v.remove(), w = void 0));
        }
        var v, C, w, T = 0, O = { error: "error", info: "info", success: "success", warning: "warning" }, b = { clear: r, remove: c, error: t, getContainer: n, info: o, options: {}, subscribe: s, success: i, version: "2.1.3", warning: a };
        return b;
      }();
    });
  }("function" == typeof define && define.amd ? define : function (e, t) {
    window.toastr = t(window.jQuery);
  });
  const regex = /(\w+) 审核通过种子ID：(\d+) 发布者ID为：(\d+)/g;
  const listTable = document.querySelector("img.time").parentNode.parentNode.parentNode.parentNode;
  let operationBox;
  let resDom = "";
  let insertTable = () => `
  <table border="1" cellspacing="0" width="940" cellpadding="5">
    <tbody>
      <tr>
        <td class="colhead" align="center">月度审核统计<button id="loadFromHead">开始统计</button></td>
      </tr>
      ${resDom}
    </tbody>
  </table>
  <br>`;
  operationBox = document.createElement("table");
  operationBox.className = "insertTable";
  operationBox.innerHTML = insertTable();
  listTable.insertAdjacentElement("beforebegin", operationBox);
  window.operationBox = operationBox;
  const list = document.querySelectorAll("a");
  let min = 0;
  let max = 0;
  list.forEach(
    (el) => {
      if (el.href.includes("page") && el.href.includes("log.php")) {
        const urlSearchParams = new URLSearchParams(el.href);
        const page = Number(urlSearchParams.get("page"));
        if (page > max)
          max = page;
        if (page < min)
          min = page;
      }
    }
  );
  console.log("min页数:", min, "max页数:", max);
  document.getElementById("loadFromHead").addEventListener("click", async () => {
    const resOb = {};
    let currentPage = new URLSearchParams(window.location.search).get("page");
    if (Number(currentPage)) {
      alert("不是第一页, 请转到第一页");
      return;
    } else {
      console.log(`开始加载...`);
      if (toastr)
        toastr.info("开始加载, 请等待...");
      try {
        for (let i = min + 1; i <= max; i++) {
          await loadPage(i);
          if (toastr)
            toastr.info(`进度: ${i}/${max}`);
        }
        if (toastr)
          toastr.success("加载完毕!", "成功");
        const array = Array.from(listTable.children[0].children);
        array.map(
          (el) => {
            const text = el.children[1].textContent;
            const time = el.children[0].children[0].title;
            const month = new Date(time).getMonth() + 1;
            const year = new Date(time).getFullYear();
            const regRes = text.match(regex);
            if (text.includes("审核通过种子")) {
              const checker = text.split(" 审核通过种子ID：")[0];
              const torrent = text.split(" 审核通过种子ID：")[1].split(" 发布者ID为：")[0];
              const uploader = text.split(" 审核通过种子ID：")[1].split(" 发布者ID为：")[1];
              if (!resOb[checker])
                resOb[checker] = {};
              resOb[checker]["总数"] = resOb[checker]["总数"] ? resOb[checker]["总数"] + 1 : 1;
              if (!resOb[checker][`[${year}年${month}月]`])
                resOb[checker][`[${year}年${month}月]`] = 1;
              else
                resOb[checker][`[${year}年${month}月]`] += 1;
              el.id = `_${checker}${torrent}`;
            } else if (text.includes("踢回候选，发布者ID为")) {
              const checker = text.split(" 将种子ID：")[0];
              const torrent = text.split(" 将种子ID：")[1].split(" 踢回候选，发布者ID为：")[0];
              const uploader = text.split(" 将种子ID：")[1].split(" 踢回候选，发布者ID为：")[1];
              if (!resOb[checker])
                resOb[checker] = {};
              resOb[checker]["总数"] = resOb[checker]["总数"] ? resOb[checker]["总数"] + 1 : 1;
              if (!resOb[checker][`[${year}年${month}月]`])
                resOb[checker][`[${year}年${month}月]`] = 1;
              else
                resOb[checker][`[${year}年${month}月]`] += 1;
            } else {
              console.log(text);
            }
          }
        );
        console.log(resOb);
        displayObjectTree(resOb, operationBox.children[0]);
      } catch (error) {
        console.warn("加载出错了");
        console.warn(error);
        if (toastr)
          toastr.error("加载出错了", "错误");
      }
    }
  });
  async function loadPage(pageNum) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("page", pageNum);
    const NEXT_URL = window.location.origin + window.location.pathname + "?" + urlSearchParams.toString();
    await fetch(NEXT_URL).then((response) => response.text()).then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const table = doc.querySelector("img.time").parentNode.parentNode.parentNode.parentNode;
      table.children[0].children[1].children[0].children[0].title;
      table.children[0].children[table.children[0].children.length - 1].children[0].children[0].title;
      table.children[0].children[0].children[1].textContent = `第${pageNum + 1}页内容`;
      listTable.children[0].append(...Array.from(table.children[0].children));
    }).catch((error) => {
      console.warn("获取不到下页信息, 可能到头了");
      console.warn(error);
      if (toastr)
        toastr.warning("获取不到下页信息, 可能到头了", "警告");
    });
  }
  window.loadPage = loadPage;
  function displayObjectTree(obj, parentElement) {
    const ul = document.createElement("ul");
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = key + ": ";
        li.appendChild(span);
        if (typeof obj[key] === "object") {
          displayObjectTree(obj[key], li);
        } else {
          const valueSpan = document.createElement("span");
          valueSpan.textContent = obj[key];
          li.appendChild(valueSpan);
        }
        ul.appendChild(li);
      }
    }
    parentElement.appendChild(ul);
  }

})();
