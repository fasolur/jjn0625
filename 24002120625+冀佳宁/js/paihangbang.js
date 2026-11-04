/**
 * 排行榜新闻页 · 通用 Tab 选项卡组件
 * 作者：冀佳宁
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：Tab 选项卡切换（新闻 / 证券 / 理财 / 博客）
 *
 * 用法：给任意容器加 data-jjn-tabs，内部放若干 [data-jjn-tab] 按钮
 * 和对应 [data-jjn-panel] 面板，脚本会自动接管，可同时存在多个实例。
 */
(function () {
    'use strict';

    /**
     * 主要功能：在指定容器内绑定选项卡点击监听，点击时先清除全部选项卡
     * 与面板的选中状态，再把当前点击的选项卡设为选中，并显示对应面板
     * 作者：冀佳宁
     * @param {HTMLElement} jjn_root 带 data-jjn-tabs 的容器
     */
    function jjn_initTabs(jjn_root) {
        var jjn_tabs = jjn_root.querySelectorAll('[data-jjn-tab]');
        var jjn_panels = jjn_root.querySelectorAll('[data-jjn-panel]');

        if (!jjn_tabs.length) {
            return;
        }

        /**
         * 主要功能：切换选项卡激活状态——先逐个移除全部选项卡的选中样式和面板的显示状态，
         * 再为当前选项卡及其对应面板设置选中状态
         * 作者：冀佳宁
         * @param {HTMLElement} jjn_current 当前被点击的选项卡
         */
        function jjn_activateTab(jjn_current) {
            var jjn_key = jjn_current.getAttribute('data-jjn-tab');

            // 第一步：清除所有选项卡的选中状态
            Array.prototype.forEach.call(jjn_tabs, function (jjn_tab) {
                jjn_tab.classList.remove('jjn_tab_active');
                jjn_tab.setAttribute('aria-selected', 'false');
            });

            // 第一步：同时隐藏所有面板
            Array.prototype.forEach.call(jjn_panels, function (jjn_panel) {
                jjn_panel.classList.remove('jjn_panel_active');
            });

            // 第二步：设置当前元素（选项卡及其面板）的选中状态
            jjn_current.classList.add('jjn_tab_active');
            jjn_current.setAttribute('aria-selected', 'true');

            Array.prototype.forEach.call(jjn_panels, function (jjn_panel) {
                if (jjn_panel.getAttribute('data-jjn-panel') === jjn_key) {
                    jjn_panel.classList.add('jjn_panel_active');
                }
            });
        }

        // 监听事件：为每个选项卡绑定点击
        Array.prototype.forEach.call(jjn_tabs, function (jjn_tab) {
            jjn_tab.addEventListener('click', function () {
                jjn_activateTab(jjn_tab);
            });
        });
    }

    /**
     * 主要功能：页面加载后查找所有 data-jjn-tabs 容器并逐个初始化选项卡
     * 作者：冀佳宁
     */
    function jjn_bootTabs() {
        var jjn_roots = document.querySelectorAll('[data-jjn-tabs]');
        Array.prototype.forEach.call(jjn_roots, function (jjn_root) {
            jjn_initTabs(jjn_root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', jjn_bootTabs);
    } else {
        jjn_bootTabs();
    }
})();
