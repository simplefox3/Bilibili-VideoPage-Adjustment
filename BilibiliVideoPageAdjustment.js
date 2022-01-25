// ==UserScript==
// @name              BiliBili播放页调整
// @license           GPL-3.0 License
// @namespace         https://greasyfork.org/zh-CN/scripts/415804-bilibili%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4-%E8%87%AA%E7%94%A8
// @version           0.4.7
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
// @supportURL        https://github.com/QIUZAIYOU/Bilibili-VideoPage-Adjustment
// @homepageURL       https://github.com/QIUZAIYOU/Bilibili-VideoPage-Adjustment
// ==/UserScript==

$(function() {
    let util = {
        getValue(name) {
            return GM_getValue(name);
        },
        setValue(name, value) {
            GM_setValue(name, value);
        },
        exist(selecter) {
            return $(selecter).length >= 1
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
                name: 'is_vip',
                value: false
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
            if (util.exist('#playerWrap #bilibiliPlayer')) {
                $('html,body').scrollTop($('#bilibiliPlayer').offset().top - top_offset);
                if (click_player_auto_location) {
                    $('#bilibiliPlayer').on('click', function() {
                        $('html,body').scrollTop($('#bilibiliPlayer').offset().top - top_offset);
                    });
                }
            }
            if (util.exist('#player_module #bilibili-player')) {
                $('html,body').scrollTop($('#bilibili-player').offset().top - top_offset);
                if (click_player_auto_location) {
                    $('#bilibili-player').on('click', function() {
                        $('html,body').scrollTop($('#bilibili-player').offset().top - top_offset);
                    });
                }
            }
        },
        getUserVipState() {
            if (util.exist('.bili-avatar-icon--big-vip')) {
                util.setValue('is_vip', true)
            } else {
                util.setValue('is_vip', false)
            }
            console.log(util.getValue('is_vip'))
        },
        getCurrentScreenMod() {
            if (util.exist('#playerWrap #bilibiliPlayer')) {
                const playerClass = $('#bilibiliPlayer').attr('class');
                let mutationObserver = new MutationObserver(() => {
                    if (playerClass.includes('mode-widescreen')) {
                        util.setValue('current_screen_mod', 'widescreen')
                    }
                    if (playerClass.includes('mode-webfullscreen')) {
                        util.setValue('current_screen_mod', 'webfullscreen')
                    }
                });
                mutationObserver.observe($('#bilibiliPlayer')[0], {
                    attributes: true,
                });
            }
            if (util.exist('#player_module #bilibili-player')) {
                let mutationObserver = new MutationObserver(() => {
                    const playerDataScreen = $('#bilibili-player .bpx-player-container').attr('data-screen');
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
                mutationObserver.observe($('#bilibili-player')[0], {
                    attributes: true,
                });
            }
        },
        autoSelectScreenMod() {
            let current_screen_mod = util.getValue('current_screen_mod')
            let selected_screen_mod = util.getValue('selected_screen_mod')
            if (util.exist('#playerWrap #bilibiliPlayer')) {
                // console.log('a', current_screen_mod, selected_screen_mod);
                const playerClass = $('#bilibiliPlayer').attr('class');
                if (selected_screen_mod === 'normal' && current_screen_mod !== 'normal') {
                    $('.bilibili-player-video-btn.closed').click();
                }
                if ((selected_screen_mod === 'widescreen' && current_screen_mod !== 'widescreen') && !playerClass.includes('mode-widescreen')) {
                    $('[data-text="宽屏模式"]').click();
                }
                if ((selected_screen_mod === 'webfullscreen' && current_screen_mod !== 'webfullscreen') && !playerClass.includes('mode-webfullscreen')) {
                    $('[data-text="网页全屏"]').click();
                }
            }
            if (util.exist('#player_module #bilibili-player')) {
                // console.log('b', current_screen_mod, selected_screen_mod);
                const playerDataScreen = $('#bilibili-player .bpx-player-container').attr('data-screen');
                if (selected_screen_mod === 'normal' && current_screen_mod !== 'normal') {
                    $('.squirtle-controller-wrap-right .squirtle-video-item.active').click();
                }
                if ((selected_screen_mod === 'widescreen' && current_screen_mod !== 'widescreen') && playerDataScreen !== 'wide') {
                    $('.squirtle-widescreen-wrap .squirtle-video-widescreen').click();
                }
                if ((selected_screen_mod === 'webfullscreen' && current_screen_mod !== 'webfullscreen') && playerDataScreen !== 'web') {
                    $('.squirtle-pagefullscreen-wrap.squirtle-video-pagefullscreen').click();
                }
            }
        },
        autoSelectVideoHightestQuality() {
            let is_vip = util.getValue('is_vip');
            let auto_select_video_highest_quality = util.getValue('auto_select_video_highest_quality');
            if (auto_select_video_highest_quality) {
                if (is_vip) {
                    if (util.exist('#playerWrap #bilibiliPlayer')) {
                        $('.bui-select-list-wrap > ul > li').eq(0).click();
                    }
                    if (util.exist('#player_module #bilibili-player')) {
                        $('.squirtle-quality-wrap >.squirtle-video-quality > ul > li').eq(0).click();
                    }
                } else {
                    if (util.exist('#playerWrap #bilibiliPlayer')) {
                        const selectVipItemLength = $('.bui-select-list-wrap > ul > li').children('.bilibili-player-bigvip').length;
                        $('.bui-select-list-wrap > ul > li').eq(selectVipItemLength).click();
                    }
                    if (util.exist('#player_module #bilibili-player')) {
                        const selectVipItemLength = $('.squirtle-quality-wrap >.squirtle-video-quality > ul > li').children('.squirtle-bigvip').length;
                        $('.squirtle-quality-wrap >.squirtle-video-quality > ul > li').eq(selectVipItemLength).click();
                    }
                }
            }
        },
        registerMenuCommand() {
            GM_registerMenuCommand('设置', () => {
                let html =
                    `
                    <div style="font-size: 1em;">
                        <label class="player-adjustment-setting-label" style="padding-top:0">
                            是否为大会员
                            <input type="checkbox" id="Is-Vip" ${util.getValue('is_vip') ? 'checked' : '' } class="player-adjustment-setting-checkbox"  >
                        </label>
                        <span class="player-adjustment-setting-tips"> -> 请如实勾选，否则影响自动选择清晰度</span>
                        <label class="player-adjustment-setting-label" id="player-adjustment-Range-Wrapper">
                            <span>播放器顶部偏移(px)</span>
                            <input id="Top-Offset" value="${util.getValue('top_offset')}" style="padding:5px;width: 200px;border: 1px solid #cecece;">
                        </label>
                        <span class="player-adjustment-setting-tips"> -> 参考值：顶部导航栏吸顶时为 71 ，否则为 7</span>
                        <label class="player-adjustment-setting-label">
                            点击播放器时定位
                            <input type="checkbox" id="Click-Player-Auto-Location" ${util.getValue('click_player_auto_location') ? 'checked' : '' }  class="player-adjustment-setting-checkbox" >
                        </label>
                        <div class="player-adjustment-setting-label"
                            style="display: flex;align-items: center;justify-content: space-between;">
                            播放器默认模式
                            <div style="width: 215px;display: flex;align-items: center;justify-content: space-between;">
                                <label class="player-adjustment-setting-label">
                                    <input type="radio" name="Screen-Mod" value="normal" ${util.getValue('selected_screen_mod')==='normal' ? 'checked' : '' }>
                                    小屏
                                </label>
                                <label class="player-adjustment-setting-label">
                                    <input type="radio" name="Screen-Mod" value="widescreen" ${util.getValue('selected_screen_mod')==='widescreen' ? 'checked' : '' }
                                    >宽屏
                                </label>
                                <label class="player-adjustment-setting-label">
                                    <input type="radio" name="Screen-Mod" value="webfullscreen" ${util.getValue('selected_screen_mod')==='webfullscreen' ? 'checked' : '' }>
                                    网页全屏
                                </label>
                            </div>
                        </div>
                        <span class="player-adjustment-setting-tips"> -> 若遇到不能自动选择播放器模式可尝试点击重置</span>
                        <label class="player-adjustment-setting-label">
                            自动选择最高画质
                            <input type="checkbox" id="Auto-Quality" ${util.getValue('auto_select_video_highest_quality') ? 'checked' : '' } class="player-adjustment-setting-checkbox" >
                        </label>
                    </div>
                    `;
                Swal.fire({
                    title: '播放页调整设置',
                    html,
                    icon: 'info',
                    showCloseButton: true,
                    showDenyButton: true,
                    confirmButtonText: '保存',
                    denyButtonText: '重置',
                    footer: '<div style="text-align: center;">如果发现脚本不能用，说明你的播放页面已经更新为新版。<br>目前此脚本不适用新版播放页面， 因为我的两个号都还没收到新版播放页面的推送， 所以暂时没法适配， 等我收到更新后会第一时间适配。</div><hr style="border: none;height: 1px;margin: 12px 0;background: #eaeaea;"><div style="text-align: center;font-size: 1.25em;"><a href="//userstyles.world/style/241/nightmode-for-bilibili-com" target="_blank">夜间哔哩 - </a><a href="//greasyfork.org/zh-CN/scripts/415804-bilibili%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4-%E8%87%AA%E7%94%A8" target="_blank">检查更新</a></div>',
                }).then((res) => {
                    res.isConfirmed && location.reload(true);
                    if (res.isConfirmed) {
                        location.reload(true)
                    } else if (res.isDenied) {
                        util.setValue('current_screen_mod', 'normal');
                        location.reload(true);
                    }
                });
                $('#Is-Vip').change((e) => {
                    util.setValue('auto_select_video_highest_quality', e.target.checked);
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
            });
        },
        addPluginStyle() {
            let style = `
            .swal2-popup{width: 34em !important;padding: 1.25em !important;}
            .swal2-html-container{margin: 0 !important;padding: 16px 5px 0 !important;width: 100% !important;box-sizing: border-box !important;}
            .swal2-footer{flex-direction: column !important;}
            .swal2-close{top: 5px !important;right: 3px !important;}
            .swal2-actions{margin: 7px auto 0 !important;}
            .swal2-styled.swal2-confirm{background-color: #23ADE5 !important;}
            .swal2-icon.swal2-info.swal2-icon-show{display: none !important;}
            .player-adjustment-container,.swal2-container { z-index: 999999999 !important;}
            .player-adjustment-popup { font-size: 14px !important }
            .player-adjustment-setting-label { display: flex !important;align-items: center !important;justify-content: space-between !important;padding-top: 20px !important; }
            .player-adjustment-setting-checkbox { width: 16px !important;height: 16px !important; }
            .player-adjustment-setting-tips{width: 100% !important;display: flex !important;align-items: center !important;padding: 5px !important;margin-top: 10px !important;background: #f5f5f5 !important;box-sizing: border-box !important;color: #666 !important;border-radius: 2px !important;text-align: left !important;}
            .player-adjustment-setting-tips svg{margin-right: 5px !important}
            label.player-adjustment-setting-label input{border: 1px solid #cecece!important;background: #ffffff!important;}
            label.player-adjustment-setting-label input:checked{border-color: #1986b3!important;background: #23ADE5!important;}
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
        applySetting() {
            console.log('top_offset: ' + util.getValue('top_offset'), "\n", 'is_vip: ' + util.getValue('is_vip'), "\n", 'click_player_auto_location: ' + util.getValue('click_player_auto_location'), "\n", 'current_screen_mod: ' + util.getValue('current_screen_mod'), "\n", 'selected_screen_mod: ' + util.getValue('selected_screen_mod'), "\n", 'auto_select_video_highest_quality: ' + util.getValue('auto_select_video_highest_quality'));
            let applyChange = setInterval(() => {
                let selected_screen_mod = util.getValue('selected_screen_mod');
                if (util.exist('#playerWrap #bilibiliPlayer')) {
                    const playerClass = $('#bilibiliPlayer').attr('class');
                    if (util.exist('.bilibili-player-video-control-bottom')) {
                        main.autoLocation();
                        main.autoSelectScreenMod();
                        main.autoSelectVideoHightestQuality();
                        if ((selected_screen_mod === 'normal' && !playerClass.includes('mode-')) || (selected_screen_mod === 'widescreen' && playerClass.includes('mode-widescreen')) || (selected_screen_mod === 'webfullscreen' && playerClass.includes('mode-webfullscreen'))) {
                            clearInterval(applyChange)
                        }
                    }
                }
                if (util.exist('#player_module #bilibili-player')) {
                    const playerDataScreen = $('#bilibili-player .bpx-player-container').attr('data-screen');
                    if (util.exist('.squirtle-controller-wrap')) {
                        main.autoLocation();
                        main.autoSelectScreenMod();
                        main.autoSelectVideoHightestQuality();
                        if ((selected_screen_mod === 'normal' && playerDataScreen === 'normal') || (selected_screen_mod === 'widescreen' && playerDataScreen === 'wide') || (selected_screen_mod === 'webfullscreen' && playerDataScreen === 'web')) {
                            clearInterval(applyChange)
                        }
                    }
                }
            }, 500);
        },
        isTopWindow() {
            return window.self === window.top;
        },
        init() {
            this.initValue();
            this.addPluginStyle();
            this.getCurrentScreenMod();
            this.applySetting();
            this.isTopWindow() && this.registerMenuCommand();
            window.history.pushState = function() {
                main.applySetting();
            };
        },
    }
    main.init();
});
