// ==UserScript==
// @name              BiliBili播放页调整
// @license           GPL-3.0 License
// @namespace         https://greasyfork.org/zh-CN/scripts/415804-bilibili%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4-%E8%87%AA%E7%94%A8
// @version           0.5.3
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

$(function () {
  const util = {
    getValue (name) {
      return GM_getValue(name)
    },
    setValue (name, value) {
      GM_setValue(name, value)
    },
    exist (selecter) {
      return $(selecter).length >= 1
    },
    addStyle (id, tag, css) {
      tag = tag || 'style'
      const doc = document
      const styleDom = doc.getElementById(id)
      if (styleDom) return
      const style = doc.createElement(tag)
      style.rel = 'stylesheet'
      style.id = id
      tag === 'style' ? (style.innerHTML = css) : (style.href = css)
      document.head.appendChild(style)
    },
    getScrollTop () {
      var scroll_top = 0
      if (document.documentElement && document.documentElement.scrollTop) {
        scroll_top = document.documentElement.scrollTop
      } else if (document.body) {
        scroll_top = document.body.scrollTop
      }
      return scroll_top
    }
  }
  const main = {
    initValue () {
      const value = [
        {
          name: 'offset_top',
          value: 7
        },
        {
          name: 'player_offset_top',
          value: 160
        },
        {
          name: 'is_vip',
          value: false
        },
        {
          name: 'click_player_auto_locate',
          value: true
        },
        {
          name: 'current_screen_mod',
          value: 'normal'
        },
        {
          name: 'selected_screen_mod',
          value: 'widescreen'
        },
        {
          name: 'auto_select_video_highest_quality',
          value: true
        }
      ]
      value.forEach((v) => {
        if (util.getValue(v.name) === undefined) {
          util.setValue(v.name, v.value)
        }
      })
    },
    autoLocation () {
      const offset_top = util.getValue('offset_top')
      const click_player_auto_locate = util.getValue(
        'click_player_auto_locate'
      )
      if (util.exist('#playerWrap #bilibiliPlayer')) {
        const player_offset_top = $('#bilibiliPlayer').offset().top
        util.setValue('player_offset_top', player_offset_top)
        $('html,body').scrollTop(player_offset_top - offset_top)
        if (click_player_auto_locate) {
          $('#bilibiliPlayer').on('click', function () {
            $('html,body').scrollTop(player_offset_top - offset_top)
          })
        }
      }
      if (util.exist('#player_module #bilibili-player')) {
        const player_offset_top = $('#bilibili-player').offset().top
        util.setValue('player_offset_top', player_offset_top)
        $('html,body').scrollTop(player_offset_top - offset_top)
        if (click_player_auto_locate) {
          $('#bilibili-player').on('click', function () {
            $('html,body').scrollTop(player_offset_top - offset_top)
          })
        }
      }
    },
    getUserVipState () {
      if (util.exist('.bili-avatar-icon--big-vip')) {
        util.setValue('is_vip', true)
      } else {
        util.setValue('is_vip', false)
      }
      console.log(util.getValue('is_vip'))
    },
    getCurrentScreenMod () {
      if (util.exist('#playerWrap #bilibiliPlayer')) {
        const playerClass = $('#bilibiliPlayer').attr('class')
        const mutationObserver = new MutationObserver(() => {
          if (playerClass.includes('mode-widescreen')) {
            util.setValue('current_screen_mod', 'widescreen')
          }
          if (playerClass.includes('mode-webfullscreen')) {
            util.setValue('current_screen_mod', 'webfullscreen')
          }
        })
        mutationObserver.observe($('#bilibiliPlayer')[0], {
          attributes: true
        })
      }
      if (util.exist('#player_module #bilibili-player')) {
        const mutationObserver = new MutationObserver(() => {
          const playerDataScreen = $(
            '#bilibili-player .bpx-player-container'
          ).attr('data-screen')
          if (playerDataScreen === 'normal') {
            util.setValue('current_screen_mod', 'normal')
          }
          if (playerDataScreen === 'wide') {
            util.setValue('current_screen_mod', 'widescreen')
          }
          if (playerDataScreen === 'web') {
            util.setValue('current_screen_mod', 'webfullscreen')
          }
        })
        mutationObserver.observe($('#bilibili-player')[0], {
          attributes: true
        })
      }
    },
    autoSelectScreenMod () {
      const current_screen_mod = util.getValue('current_screen_mod')
      const selected_screen_mod = util.getValue('selected_screen_mod')
      if (util.exist('#playerWrap #bilibiliPlayer')) {
        // console.log('a', current_screen_mod, selected_screen_mod);
        const playerClass = $('#bilibiliPlayer').attr('class')
        if (
          selected_screen_mod === 'normal' &&
          current_screen_mod !== 'normal'
        ) {
          $('.bilibili-player-video-btn.closed').click()
        }
        if (
          selected_screen_mod === 'widescreen' &&
          current_screen_mod !== 'widescreen' &&
          !playerClass.includes('mode-widescreen')
        ) {
          $('[data-text="宽屏模式"]').click()
        }
        if (
          selected_screen_mod === 'webfullscreen' &&
          current_screen_mod !== 'webfullscreen' &&
          !playerClass.includes('mode-webfullscreen')
        ) {
          $('[data-text="网页全屏"]').click()
        }
      }
      if (util.exist('#player_module #bilibili-player')) {
        // console.log('b', current_screen_mod, selected_screen_mod);
        const playerDataScreen = $(
          '#bilibili-player .bpx-player-container'
        ).attr('data-screen')
        if (
          selected_screen_mod === 'normal' &&
          current_screen_mod !== 'normal'
        ) {
          $(
            '.squirtle-controller-wrap-right .squirtle-video-item.active'
          ).click()
        }
        if (
          selected_screen_mod === 'widescreen' &&
          current_screen_mod !== 'widescreen' &&
          playerDataScreen !== 'wide'
        ) {
          $('.squirtle-widescreen-wrap .squirtle-video-widescreen').click()
        }
        if (
          selected_screen_mod === 'webfullscreen' &&
          current_screen_mod !== 'webfullscreen' &&
          playerDataScreen !== 'web'
        ) {
          $(
            '.squirtle-pagefullscreen-wrap.squirtle-video-pagefullscreen'
          ).click()
        }
      }
    },
    autoSelectVideoHightestQuality () {
      const is_vip = util.getValue('is_vip')
      const auto_select_video_highest_quality = util.getValue(
        'auto_select_video_highest_quality'
      )
      if (auto_select_video_highest_quality) {
        if (is_vip) {
          if (util.exist('#playerWrap #bilibiliPlayer')) {
            $('.bui-select-list-wrap > ul > li').eq(0).click()
          }
          if (util.exist('#player_module #bilibili-player')) {
            $('.squirtle-quality-wrap >.squirtle-video-quality > ul > li')
              .eq(0)
              .click()
          }
        } else {
          if (util.exist('#playerWrap #bilibiliPlayer')) {
            const selectVipItemLength = $(
              '.bui-select-list-wrap > ul > li'
            ).children('.bilibili-player-bigvip').length
            $('.bui-select-list-wrap > ul > li').eq(selectVipItemLength).click()
          }
          if (util.exist('#player_module #bilibili-player')) {
            const selectVipItemLength = $(
              '.squirtle-quality-wrap >.squirtle-video-quality > ul > li'
            ).children('.squirtle-bigvip').length
            $('.squirtle-quality-wrap >.squirtle-video-quality > ul > li')
              .eq(selectVipItemLength)
              .click()
          }
        }
      }
    },
    registerMenuCommand () {
      GM_registerMenuCommand('设置', () => {
        const html = `
                  <div style="font-size: 1em;">
                      <label class="player-adjustment-setting-label" style="padding-top:0!important;">
                          是否为大会员
                          <input type="checkbox" id="Is-Vip" ${util.getValue('is_vip') ? 'checked' : ''
          } class="player-adjustment-setting-checkbox"  >
                      </label>
                      <span class="player-adjustment-setting-tips"> -> 请如实勾选，否则影响自动选择清晰度</span>
                      <label class="player-adjustment-setting-label" id="player-adjustment-Range-Wrapper">
                          <span>播放器顶部偏移(px)</span>
                          <input id="Top-Offset" value="${util.getValue(
            'offset_top'
          )}" style="padding:5px;width: 200px;border: 1px solid #cecece;">
                      </label>
                      <span class="player-adjustment-setting-tips"> -> 参考值：顶部导航栏吸顶时为 71 ，否则为 7</span>
                      <label class="player-adjustment-setting-label">
                          点击播放器时定位
                          <input type="checkbox" id="Click-Player-Auto-Location" ${util.getValue('click_player_auto_locate')
            ? 'checked'
            : ''
          }  class="player-adjustment-setting-checkbox" >
                      </label>
                      <div class="player-adjustment-setting-label"
                          style="display: flex;align-items: center;justify-content: space-between;">
                          播放器默认模式
                          <div style="width: 215px;display: flex;align-items: center;justify-content: space-between;">
                              <label class="player-adjustment-setting-label" style="padding-top:0!important;">
                                  <input type="radio" name="Screen-Mod" value="normal" ${util.getValue('selected_screen_mod') ===
            'normal'
            ? 'checked'
            : ''
          }>
                                  小屏
                              </label>
                              <label class="player-adjustment-setting-label" style="padding-top:0!important;">
                                  <input type="radio" name="Screen-Mod" value="widescreen" ${util.getValue('selected_screen_mod') ===
            'widescreen'
            ? 'checked'
            : ''
          }
                                  >宽屏
                              </label>
                              <label class="player-adjustment-setting-label" style="padding-top:0!important;">
                                  <input type="radio" name="Screen-Mod" value="webfullscreen" ${util.getValue('selected_screen_mod') ===
            'webfullscreen'
            ? 'checked'
            : ''
          }>
                                  网页全屏
                              </label>
                          </div>
                      </div>
                      <span class="player-adjustment-setting-tips"> -> 若遇到不能自动选择播放器模式可尝试点击重置</span>
                      <label class="player-adjustment-setting-label">
                          自动选择最高画质
                          <input type="checkbox" id="Auto-Quality" ${util.getValue('auto_select_video_highest_quality')
            ? 'checked'
            : ''
          } class="player-adjustment-setting-checkbox" >
                      </label>
                  </div>
                  `
        Swal.fire({
          title: '播放页调整设置',
          html,
          icon: 'info',
          showCloseButton: true,
          showDenyButton: true,
          confirmButtonText: '保存',
          denyButtonText: '重置',
          footer:
            '<div style="text-align: center;">如果发现脚本不能用，说明你的播放页面已经更新为新版。<br>目前此脚本不适用新版播放页面， 因为我的两个号都还没收到新版播放页面的推送， 所以暂时没法适配， 等我收到更新后会第一时间适配。</div><hr style="border: none;height: 1px;margin: 12px 0;background: #eaeaea;"><div style="text-align: center;font-size: 1.25em;"><a href="//userstyles.world/style/241/nightmode-for-bilibili-com" target="_blank">夜间哔哩 - </a><a href="//greasyfork.org/zh-CN/scripts/415804-bilibili%E6%92%AD%E6%94%BE%E9%A1%B5%E8%B0%83%E6%95%B4-%E8%87%AA%E7%94%A8" target="_blank">检查更新</a></div>'
        }).then((res) => {
          res.isConfirmed && location.reload(true)
          if (res.isConfirmed) {
            location.reload(true)
          } else if (res.isDenied) {
            util.setValue('current_screen_mod', 'normal')
            location.reload(true)
          }
        })
        $('#Is-Vip').change((e) => {
          util.setValue('is_vip', e.target.checked)
        })
        $('#Top-Offset').change((e) => {
          util.setValue('offset_top', e.target.value)
        })
        $('#Click-Player-Auto-Location').change((e) => {
          util.setValue('click_player_auto_locate', e.target.checked)
          // console.log(util.getValue('click_player_auto_locate'))
        })
        $('#Auto-Quality').change((e) => {
          util.setValue('auto_select_video_highest_quality', e.target.checked)
        })
        $('input[name="Screen-Mod"]').click(function () {
          util.setValue('selected_screen_mod', $(this).val())
          // console.log(util.getValue('selected_screen_mod'));
        })
      })
    },
    addPluginStyle () {
      const style = `
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
          `
      if (document.head) {
        util.addStyle(
          'swal-pub-style',
          'style',
          GM_getResourceText('swalStyle')
        )
        util.addStyle('player-adjustment-style', 'style', style)
      }
      const headObserver = new MutationObserver(() => {
        util.addStyle(
          'swal-pub-style',
          'style',
          GM_getResourceText('swalStyle')
        )
        util.addStyle('player-adjustment-style', 'style', style)
      })
      headObserver.observe(document.head, { childList: true, subtree: true })
    },
    applySetting () {
      console.log(
        'offset_top: ' + util.getValue('offset_top'),
        '\n',
        'player_offset_top: ' + util.getValue('player_offset_top'),
        '\n',
        'is_vip: ' + util.getValue('is_vip'),
        '\n',
        'click_player_auto_locate: ' +
        util.getValue('click_player_auto_locate'),
        '\n',
        'current_screen_mod: ' + util.getValue('current_screen_mod'),
        '\n',
        'selected_screen_mod: ' + util.getValue('selected_screen_mod'),
        '\n',
        'auto_select_video_highest_quality: ' +
        util.getValue('auto_select_video_highest_quality')
      )
      const applyChange = setInterval(() => {
        const selected_screen_mod = util.getValue('selected_screen_mod')
        if (util.exist('#playerWrap #bilibiliPlayer')) {
          const playerClass = $('#bilibiliPlayer').attr('class')
          if (util.exist('.bilibili-player-video-control-bottom')) {
            main.insertLocateButton()
            main.autoLocation()
            main.autoSelectScreenMod()
            main.autoSelectVideoHightestQuality()
            if (
              (selected_screen_mod === 'normal' &&
                !playerClass.includes('mode-')) ||
              (selected_screen_mod === 'widescreen' &&
                playerClass.includes('mode-widescreen')) ||
              (selected_screen_mod === 'webfullscreen' &&
                playerClass.includes('mode-webfullscreen'))
            ) {
              clearInterval(applyChange)
            }
          }
        }
        if (util.exist('#player_module #bilibili-player')) {
          const playerDataScreen = $(
            '#bilibili-player .bpx-player-container'
          ).attr('data-screen')
          if (util.exist('.squirtle-controller-wrap')) {
            main.insertLocateButton()
            main.autoLocation()
            main.autoSelectScreenMod()
            main.autoSelectVideoHightestQuality()
            if (
              (selected_screen_mod === 'normal' &&
                playerDataScreen === 'normal') ||
              (selected_screen_mod === 'widescreen' &&
                playerDataScreen === 'wide') ||
              (selected_screen_mod === 'webfullscreen' &&
                playerDataScreen === 'web')
            ) {
              clearInterval(applyChange)
            }
          }
        }
      }, 1000)
    },
    insertLocateButton () {
      const locateButtonHtml = `<div class="nav-btn-item locate" title="定位至播放器">
        <svg t="1643419779790" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1775" width="200" height="200" style="width: 50%;height: 100%;fill: currentColor;"><path d="M512 352c-88.008 0-160.002 72-160.002 160 0 88.008 71.994 160 160.002 160 88.01 0 159.998-71.992 159.998-160 0-88-71.988-160-159.998-160z m381.876 117.334c-19.21-177.062-162.148-320-339.21-339.198V64h-85.332v66.134c-177.062 19.198-320 162.136-339.208 339.198H64v85.334h66.124c19.208 177.062 162.144 320 339.208 339.208V960h85.332v-66.124c177.062-19.208 320-162.146 339.21-339.208H960v-85.334h-66.124zM512 810.666c-164.274 0-298.668-134.396-298.668-298.666 0-164.272 134.394-298.666 298.668-298.666 164.27 0 298.664 134.396 298.664 298.666S676.27 810.666 512 810.666z" p-id="1776"></path></svg></div>`
      const floatNav = $('.float-nav .nav-menu')
      const locateButton = $('.float-nav .nav-menu .nav-btn-item.locate')
      const offset_top = util.getValue('offset_top')
      const player_offset_top = util.getValue('player_offset_top')
      floatNav.prepend(locateButtonHtml)
      locateButton.not(':first-child').remove()
      floatNav.on('click', '.locate', function () {
        $('html,body').scrollTop(player_offset_top - offset_top)
      })
    },
    removeBigVipMask () {
      const bigVipObersver = new MutationObserver(() => {
        if (util.exist('.bili-dialog-m')) {
          $('.bili-dialog-m').each(function () {
            if ($(this).has('.q1080p')) {
              $(this).remove()
            }
          })
        }
      })
      bigVipObersver.observe($('#app')[0], {
        childList: true,
        subtree: true,
        attributes: true
      })
    },
    isTopWindow () {
      return window.self === window.top
    },
    init () {
      this.initValue()
      this.addPluginStyle()
      this.getCurrentScreenMod()
      this.applySetting()
      this.removeBigVipMask()
      this.isTopWindow() && this.registerMenuCommand()
      window.history.pushState = function () {
        main.applySetting()
      }
    }
  }
  main.init()
})
