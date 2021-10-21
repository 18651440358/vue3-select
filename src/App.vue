<template>
  <div id="nav">
          <!-- 分类区域 -->
        <div class="catalog-sorting">
          <!-- 下拉框 -->
          <div class="select-dropdown">
              <tk-select selected="请选择" v-model="select1">
                <template #selectDropDown>
                  <tk-select-item class="select-option" value="最新案例">最新案例</tk-select-item>
                  <tk-select-item class="select-option" value="最热案例">最热案例</tk-select-item>
                </template>
              </tk-select>
          </div>
          {{select1}}
<hr>
          <div class="select-dropdown">
              <tk-select v-model="select2">
                <template #selectDropDown>
                  <tk-select-item class="select-option" value="扬州市">扬州市</tk-select-item>
                  <tk-select-item class="select-option" value="南京市">南京市</tk-select-item>
                  <tk-select-item class="select-option" value="无锡市">无锡市</tk-select-item>
                  <tk-select-item class="select-option" value="徐州市">徐州市</tk-select-item>
                  <tk-select-item class="select-option" value="苏州市">苏州市</tk-select-item>
                  <tk-select-item class="select-option" value="镇江市">镇江市</tk-select-item>
                </template>
              </tk-select>
          </div>
          {{select2}}
  </div>
</template>

<script>
import {ref} from 'vue';
import TkSelect from './components/select/select.vue'
import TkSelectItem from './components/select/select-item.vue'
export default {
  name: 'App',
  components: {TkSelect, TkSelectItem},
  methods: {
    // 检测主题
    checkTheme(){
      var theme = localStorage.getItem("theme");
      window.document.documentElement.setAttribute(
          "data-theme",
          theme ? theme : "light"
      );
    }
  },
  mounted(){
    // 检测主题
    this.checkTheme();
  },
  setup() {
    const select1 = ref();
    const select2 = ref();
    return {
      select1,
      select2
    }
  }
}
</script>

<style lang="scss">
@import './assets/theme/_handle.scss';
// 全局样式

/* 去除浏览器默认样式    开始 */
body {
  min-width: 375px;
  padding: 0;
  margin: 0;
  font-size: 14px;
  line-height: 1.71429;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  text-size-adjust: 100%;
  @include color(mainTextColor);
  @include background-color(mainBackground);
  font-weight: 400;
  font-family: HarmonyOS_Sans_SC, Avenir, Helvetica, Arial, sans-serif;
}
img,video {
  display: block;
  object-fit: cover;
  object-position: center;
  -webkit-touch-callout: none; 
  -webkit-appearance: none;
}
a {
  text-decoration: none;
  @include color(mainTextColor);
}
h1, h2, h3, h4, h5, h6, p{
  margin: 0;
}
*{
  outline: none;
  box-sizing: border-box;
}
video::-webkit-media-controls{
  display: none !important;
}
ul,ul li{
  list-style: none;
  margin: 0;
  padding: 0;
}
/* 去除浏览器默认样式    结束 */

.select-dropdown{
    width: 256px;
    margin-right: auto;
}
</style>
