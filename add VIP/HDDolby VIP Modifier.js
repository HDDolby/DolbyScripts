// ==UserScript==
// @name         HDDolby VIP Modifier
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  修改HDDolby用户贵宾资格信息
// @author       You
// @match        https://www.hddolby.com/userdetails.php?id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hddolby.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 查找包含 vip_until 输入框的 td 元素
    const vipUntilTd = document.querySelector('td.rowfollow[valign="top"][align="left"] input[name="vip_until"]').closest('td');

    // 创建按钮
    const modifyButton = document.createElement('button');
    modifyButton.textContent = '修改贵宾信息';
    modifyButton.addEventListener('click', function() {
        // 直接获取 UTC+8 时区的当前时间
        const now = new Date();
        const utcPlus8Date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 8, now.getUTCMinutes(), now.getUTCSeconds());
        
        // 增加 31 天
        utcPlus8Date.setDate(utcPlus8Date.getDate() + 31);

        // 格式化日期为 YYYY-MM-DD HH:mm:ss
        const year = utcPlus8Date.getFullYear();
        const month = String(utcPlus8Date.getMonth() + 1).padStart(2, '0');
        const day = String(utcPlus8Date.getDate()).padStart(2, '0');
        const hours = String(utcPlus8Date.getHours()).padStart(2, '0');
        const minutes = String(utcPlus8Date.getMinutes()).padStart(2, '0');
        const seconds = String(utcPlus8Date.getSeconds()).padStart(2, '0');
        const newVipDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        // 修改 vip_until 输入框的值
        const vipUntilInput = document.querySelector('input[name="vip_until"]');
        vipUntilInput.value = newVipDate;

        // 修改用户等级为 VIP
        const classSelect = document.querySelector('select[name="class"]');
        classSelect.value = '10';

        // 选择贵宾资格通过鲸币换取
        const vipAddedYesRadio = document.querySelector('input[name="vip_added"][value="yes"]');
        vipAddedYesRadio.checked = true;

        // 检查 uploaded 输入框的值，若为 0 则修改为 1
        const uploadedInput = document.querySelector('input[name="uploaded"]');
        if (uploadedInput.value === '0') {
            uploadedInput.value = '1';
        }
    });

    // 将按钮添加到 td 元素中
    vipUntilTd.appendChild(modifyButton);
})();
