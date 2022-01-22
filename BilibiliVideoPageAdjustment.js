// ==UserScript==
// @name              BiliBili播放页调整
// @namespace         https://greasyfork.org/zh-CN/scripts/415804-bilibili%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4-%E8%87%AA%E7%94%A8
// @version           0.2.4
// @description       1.自动定位到播放器（进入播放页，可自动定位到播放器，可设置偏移量及是否在点击主播放器时定位）；2.可设置是否自动选择最高画质；3.可设置播放器默认模式；
// @author            QIAN
// @match             *://*.bilibili.com/video/*
// @match             *://*.bilibili.com/bangumi/play/*
// @require           https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// @require           https://cdn.jsdelivr.net/npm/sweetalert2@11.3.6/dist/sweetalert2.all.min.js
// @resource          swalStyle https://cdn.jsdelivr.net/npm/sweetalert2@11.3.6/dist/sweetalert2.min.css
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_registerMenuCommand
// @grant             GM_getResourceText
// ==/UserScript==

$(function() {
    let util = {
        getValue(name) {
            return GM_getValue(name);
        },
        setValue(name, value) {
            GM_setValue(name, value);
        },
        exist(id) {
            return Boolean($(id).length >= 1)
        },
        addStyle(id, tag, css) {
            tag = tag || 'style';
            let doc = document,
                styleDom = doc.getElementById(id);
            if (styleDom) return;
            let style = doc.createElement(tag);
            style.rel = 'stylesheet';
            style.id = id;
            tag === 'style' ? style.innerHTML = css : style.href = css;
            document.head.appendChild(style);
        },
    };
    let main = {
        initValue() {
            let value = [{
                name: 'top_offset',
                value: 7
            }, {
                name: 'click_player_auto_location',
                value: true
            }, {
                name: 'current_screen_mod',
                value: 'normal'
            }, {
                name: 'selected_screen_mod',
                value: 'widescreen'
            }, {
                name: 'auto_select_video_highest_quality',
                value: true
            }, {
                name: 'delay',
                value: 3800
            }];
            value.forEach((v) => {
                if (util.getValue(v.name) === undefined) {
                    util.setValue(v.name, v.value);
                }
            });
        },
        autoLocation() {
            let top_offset = util.getValue('top_offset')
            let click_player_auto_location = util.getValue('click_player_auto_location')
            if (util.exist('#bilibiliPlayer')) {
                $('html,body').scrollTop($('#bilibiliPlayer').offset().top - top_offset);
                if (click_player_auto_location) {
                    $('#bilibiliPlayer').on('click', function() {
                        $('html,body').scrollTop($('#bilibiliPlayer').offset().top - top_offset);
                    });
                }
            }
            if (util.exist('#bilibili-player')) {
                $('html,body').scrollTop($('#bilibili-player').offset().top - top_offset);
                if (click_player_auto_location) {
                    $('#bilibili-player').on('click', function() {
                        $('html,body').scrollTop($('#bilibili-player').offset().top - top_offset);
                    });
                }
            }
        },
        getCurrentScreenMod() {
            if (util.exist('#bilibiliPlayer')) {
                const playerClass = $('#bilibiliPlayer').attr('class');
                let mutationObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (playerClass.includes('mode-widescreen')) {
                            util.setValue('current_screen_mod', 'widescreen')
                        }
                        if (playerClass.includes('mode-webfullscreen')) {
                            util.setValue('current_screen_mod', 'webfullscreen')
                        }
                    });
                });
                mutationObserver.observe($('#bilibiliPlayer')[0], {
                    attributes: true,
                });
            }
            if (util.exist('#bilibili-player')) {
                const playerDataScreen = $('#bilibili-player .bpx-player-container').attr('data-screen');
                let mutationObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (playerDataScreen === 'normal') {
                            util.setValue('current_screen_mod', 'normal')
                        }
                        if (playerDataScreen === 'wide') {
                            util.setValue('current_screen_mod', 'widescreen')
                        }
                        if (playerDataScreen === 'web') {
                            util.setValue('current_screen_mod', 'webfullscreen')
                        }
                    });
                });
                mutationObserver.observe($('#bilibili-player')[0], {
                    attributes: true,
                });
            }
        },
        autoSelectScreenMod() {
            let current_screen_mod = util.getValue('current_screen_mod')
            let selected_screen_mod = util.getValue('selected_screen_mod')
            console.log(current_screen_mod, selected_screen_mod);
            if (util.exist('#bilibili-player')) {
                if (selected_screen_mod === 'normal' && current_screen_mod !== 'normal') {
                    $('.bilibili-player-video-btn.closed').click();
                }
                if (selected_screen_mod === 'widescreen' && current_screen_mod !== 'widescreen') {
                    $('.bilibili-player-video-btn.bilibili-player-video-btn-widescreen').click();
                }
                if (selected_screen_mod === 'webfullscreen' && current_screen_mod !== 'webfullscreen') {
                    $('.bilibili-player-video-btn.bilibili-player-video-web-fullscreen').click();
                }
            }
            if (util.exist('#bilibili-player')) {
                if (selected_screen_mod === 'normal' && current_screen_mod !== 'normal') {
                    $('.squirtle-controller-wrap-right .squirtle-video-item.active').click();
                }
                if (selected_screen_mod === 'widescreen' && current_screen_mod !== 'widescreen') {
                    $('.squirtle-widescreen-wrap .squirtle-video-widescreen').click();
                }
                if (selected_screen_mod === 'webfullscreen' && current_screen_mod !== 'webfullscreen') {
                    $('.squirtle-pagefullscreen-wrap.squirtle-video-pagefullscreen').click();
                }
            }
        },
        autoSelectVideoHightestQuality() {
            let auto_select_video_highest_quality = util.getValue('auto_select_video_highest_quality')
            if (auto_select_video_highest_quality) {
                if (util.exist('#bilibiliPlayer')) {
                    $('.bui-select-list-wrap > ul > li').eq(0).click();
                }
                if (util.exist('#bilibili-player')) {
                    $('.squirtle-quality-wrap >.squirtle-video-quality > ul > li').eq(0).click();
                }
            }
        },
        registerMenuCommand() {
            GM_registerMenuCommand('设置', () => {
                let html =
                    `
                      <div style="font-size: 1em;">
                        <label class="player-adjustment-setting-label" id="player-adjustment-Range-Wrapper" style="padding-top:0"><span>播放器顶部偏移(px)</span><input  id="Top-Offset" value="${util.getValue('top_offset')}" style="padding:5px;width: 200px;border: 1px solid #cecece;"></label>
                        <span class="player-adjustment-setting-tips"> -> 播放器顶部与浏览器窗口留白距离</span>
                        <label class="player-adjustment-setting-label">点击播放器时定位<input type="checkbox" id="Click-Player-Auto-Location" ${util.getValue('click_player_auto_location') ? 'checked' : ''} class="player-adjustment-setting-checkbox" style="width:auto!important;"></label>
                        <div class="player-adjustment-setting-label" style="display: flex;align-items: center;justify-content: space-between;">播放器默认模式
                        <div style="width: 215px;display: flex;align-items: center;justify-content: space-between;">
                          <label><input type="radio" name="Screen-Mod" value="normal" ${util.getValue('selected_screen_mod')==='normal' ? 'checked' : ''}>小屏</label>
                          <label><input type="radio" name="Screen-Mod" value="widescreen" ${util.getValue('selected_screen_mod')==='widescreen' ? 'checked' : ''}>宽屏</label>
                          <label><input type="radio" name="Screen-Mod" value="webfullscreen" ${util.getValue('selected_screen_mod')==='webfullscreen' ? 'checked' : ''}>网页全屏</label>
                         </div>
                        </div>
                        <label class="player-adjustment-setting-label">自动选择最高画质<input type="checkbox" id="Auto-Quality" ${util.getValue('auto_select_video_highest_quality') ? 'checked' : ''} class="player-adjustment-setting-checkbox" style="width:auto!important;"></label>
                        <label class="player-adjustment-setting-label" id="player-adjustment-Range-Wrapper"><span>脚本延迟执行时间(ms)</span><input  id="Delay-Time"  value="${util.getValue('delay')}" style="padding:5px;width: 200px;border: 1px solid #cecece;"></label>
                        <span class="player-adjustment-setting-tips" style="flex-direction: column;"><span style="padding-bottom: 5px;margin-bottom: 3px;border-bottom: 1px solid #cecece;"> -> 设置延迟防止脚本在播放器未完全加载时就运行，导致脚本失效，该项视当前网络环境调整。通常需要多次调整才能达到满意效果。</span><span style="color:red"> -> 普通视频播放页与番剧播放页播放器不同，请以番剧播放页播放器加载时机为准，这样二者可以兼顾，但对普通视频播放页来说脚本延迟时间可能会稍微有些长。</span></span>
                      </div>
                      `;
                Swal.fire({
                    title: '播放页调整设置',
                    html,
                    icon: 'info',
                    showCloseButton: true,
                    confirmButtonText: '保存',
                    footer: '<div style="text-align: center;font-size: 1.25em;"><a href="//userstyles.world/style/241/nightmode-for-bilibili-com" target="_blank">夜间哔哩 - </a><a href="//greasyfork.org/zh-CN/scripts/415804-bilibili%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4-%E8%87%AA%E7%94%A8" target="_blank">检查更新</a></div>',
                }).then((res) => {
                    res.isConfirmed && history.go(0);
                });

                $('#Top-Offset').change((e) => {
                    util.setValue('top_offset', e.target.value);
                });
                $('#Click-Player-Auto-Location').change((e) => {
                    util.setValue('click_player_auto_location', e.target.checked);
                    // console.log(util.getValue('click_player_auto_location'))
                });
                $('#Auto-Quality').change((e) => {
                    util.setValue('auto_select_video_highest_quality', e.target.checked);
                });
                $('input[name="Screen-Mod"]').click(function() {
                    util.setValue('selected_screen_mod', $(this).val());
                    // console.log(util.getValue('selected_screen_mod'));
                });
                $('#Delay-Time').change((e) => {
                    util.setValue('delay', e.target.value);
                });
            });
        },
        addPluginStyle() {
            let style = `
            .swal2-popup{width: 34em;}
            .swal2-html-container{margin: 0;padding: 10px;width: 100%;box-sizing: border-box;}
            .swal2-close{top: 5px;right: 3px;}
            .swal2-actions{margin: 7px auto 0;}
            .swal2-icon.swal2-info.swal2-icon-show{display: none !important;}
            .player-adjustment-container,.swal2-container { z-index: 999999999!important }
            .player-adjustment-popup { font-size: 14px !important }
            .player-adjustment-setting-label { display: flex;align-items: center;justify-content: space-between;padding-top: 20px; }
            .player-adjustment-setting-checkbox { width: 16px;height: 16px; }
            .player-adjustment-setting-tips{width: 100%;display: flex;align-items: center;padding: 5px;margin-top: 10px;background: #f5f5f5;box-sizing: border-box;color: #666;border-radius: 2px;text-align: left;}
            .player-adjustment-setting-tips svg{margin-right: 5px}
            `;
            if (document.head) {
                util.addStyle('swal-pub-style', 'style', GM_getResourceText('swalStyle'));
                util.addStyle('player-adjustment-style', 'style', style);
            }
            const headObserver = new MutationObserver(() => {
                util.addStyle('swal-pub-style', 'style', GM_getResourceText('swalStyle'));
                util.addStyle('player-adjustment-style', 'style', style);
            });
            headObserver.observe(document.head, { childList: true, subtree: true });
        },
        isTopWindow() {
            return window.self === window.top;
        },
        init() {
            const delay = util.getValue('delay')
            this.initValue();
            this.addPluginStyle();
            this.getCurrentScreenMod();
            setTimeout(function() {
                main.autoLocation();
                main.autoSelectScreenMod();
                main.autoSelectVideoHightestQuality();
            }, delay);
            this.registerMenuCommand();
        },
    }
    main.init();
});
