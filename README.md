---
theme: juejin
---
> 呃哼~ 第一次在掘金发帖. 写不好请见谅 👀

本人学生 🐶, 平时在外面没事接点小项目小赚一笔补贴生活费. 之前一直都是使用`Vue2.x`的版本做项目, 暑假刚刚学习了`Vue3`想着新项目就直接用`Vue3`上手.

### 效果展示
好了, 话不多说先给大佬们看看效果样式:

![bs470-ngit5.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0084e64b4b945bf87b321adcac5337b~tplv-k3u1fbpfcp-watermark.image?)

### 组件难点
因为下拉框可能会在某些情况下被挡住, 所以这里的下拉框被挂载到了`body`标签上, 并且下拉框中的选项往往是以`<slot>`插槽的形式编写, 这里就会困扰到很多小白, 搞不明白怎么样才能在 `下拉框` 与`触发下拉按钮` 之间关联响应式事件与数据.

### 组件的使用
```html
<tk-select selected="请选择">
    <template #selectDropDown>
        <tk-select-item value="最新案例">最新案例</tk-select-item>
        <tk-select-item value="最热案例">最热案例</tk-select-item>
    </template>
</tk-select>

<hr>

<tk-select>
    <template #selectDropDown>
        <tk-select-item value="扬州市">扬州市</tk-select-item>
        <tk-select-item value="南京市">南京市</tk-select-item>
        <tk-select-item value="无锡市">无锡市</tk-select-item>
        <tk-select-item value="徐州市">徐州市</tk-select-item>
        <tk-select-item value="苏州市">苏州市</tk-select-item>
        <tk-select-item value="镇江市">镇江市</tk-select-item>
    </template>
</tk-select>
```

### 参数说明
`tk-select` 为**select下选项**父标签, 必须含有插槽 `#selectDropDown` 才能正常使用

| Attribute | Description | Accepted Values | Default |
| --- | --- | --- | --- |
| selected | 默认选中的值,如果不填或为空则默认选中插槽中的第一个 `tk-select-item` 中的值 | - | - |

`tk-select-item` 为**select下选项**子标签(选项标签), `tk-select-item` 内可以继续写入其他 `HTML` 内容, 每项的具体值由**props** `value` 决定
| Attribute | Description | Accepted Values | Default |
| --- | --- | --- | --- |
| value | 词选项默认返回的数据 **(必须设置)** | - | - |

### v-modal
可以使用 `v-modal` 实时获取到 **下拉选项** 选取到的值

> `注意:` 这里的 `v-modal` 并没有做成双向绑定, 这里只用于获取到 `select` 中选中的值, 只能用于获取, 主动修改其值并无效果, 并且不支持 `v-model` 修饰符

```html
<tk-select v-model="selectValue">
    ...
</tk-select>

<script>
import { ref } from 'vue';
export default {
    setup(){
        // 接收select选中的值
        const selectValue = ref();
        
        return {
            selectValue
        }
    }
}
</script>
```

### 实现思路
首先看看目录结构

```
src
 |
 |
 |-- components
 |      |
 |      |-- select
 |            |
 |            |-- select.vue
 |            |-- select-item.vue
 |            |-- selectBus.js
 |
 |
 |-- utils
 |    |-- token.js
```
两个 `.vue` 文件用来的干嘛的没什么好说的, `selectBus.js` 解决 `Vue3` 中无法安装 `eventBus` 的问题, `token.js` 用于给每组 `select` 与 `select-item` 相互绑定.

#### 首先我们看看 selectBus.js 里面的内容
我们先看看 `vue3` 官网怎么说的 [进入官网](https://v3.vuejs.org/guide/migration/events-api.html#event-bus). 说人话的意思就是不可以像 `vue2` 那样愉快的安装**Bus**, 需要**自己实现事件接口**或者使用**第三方插件**.
这里官网也给出了具体实现方案.
```javascript
// selectBus.js
import emitter from 'tiny-emitter/instance'

export default {
    $on: (...args) => emitter.on(...args),
    $once: (...args) => emitter.once(...args),
    $off: (...args) => emitter.off(...args),
    $emit: (...args) => emitter.emit(...args)
}
```

#### select.vue 文件是我们的父组件
`vue3` 新增 `<teleport>` 标签, 可以将标签内的元素挂载到任意位置, [查看官方文档](https://v3.vuejs.org/guide/teleport.html)
```html
// teleport 用法
// 将<h1>挂载到body上

<teleport to="body">
    <h1>标题</h1>
</teleport>
```

`select` 主要有触发下拉按钮`tk-select-button`和下拉列表`tk-select-dropdown`组成, 下拉框中的选项未来将由插槽插入.

```html
<!-- select.vue -->
<template>
  <!-- 下拉框 -->
  <div class="tk-select"> 
      <div ref="select_button" class="tk-select-button" @click="selectOpen = !selectOpen">
          <!-- 选中内容 -->
          <span>{{selctValue}}</span>
          <!-- 右侧小箭头 -->
          <div class="select-icon" :class="{'selectOpen':selectOpen}">
              <i class="fi fi-rr-angle-small-down"></i>
          </div>
      </div>
      <!-- 下拉框 -->
      <teleport to="body">
          <transition name="select">
            <div ref="select_dropdown" v-show="selectOpen" :style="dropdownStyle" class="tk-select-dropdown">
                <ul>
                    <slot name="selectDropDown"></slot>
                </ul>
            </div>
          </transition>
      </teleport>
  </div>
</template>
```
首先解决下拉列表打开&关闭和定位的问题
```js
import { ref, onDeactivated } from 'vue';
export default {
    // 获取按钮
    const select_button = ref(null);
    // 获取下拉框
    const select_dropdown = ref(null);
    
    // 下拉框位置参数
    const dropdownPosition = ref({x:0,y:0,w:0})

    // 下拉框位置
    const dropdownStyle = computed(()=>{
        return {
            left: `${dropdownPosition.value.x}px`,
            top:  `${dropdownPosition.value.y}px`,
            width: `${dropdownPosition.value.w}px`
        }
    })
    
    // 计算下拉框位置
    function calculateLocation(){
        var select_button_dom = select_button.value.getBoundingClientRect()
        dropdownPosition.value.w = select_button_dom.width
        dropdownPosition.value.x = select_button_dom.left
        dropdownPosition.value.y = select_button_dom.top + select_button_dom.height + 5
    }
    
    // 每次下拉框打开时重新计算位置
    watch(selectOpen,(val)=>{
        if(val)
            // 计算位置
            calculateLocation();
    })
    
    // ---------------------------------增加一点修饰---------------------------------------
    // 点击非按钮或下拉框区域也会收起下拉框
    window.addEventListener('click',(event)=>{
        if(!select_button.value.contains(event.target) && !select_dropdown.value.contains(event.target) ){
            selectOpen.value = false
        }
    })
    
    // 当页面滚动或改变大小时重新计算位置
    window.addEventListener('resize',()=>{
        // 计算面板位置
        calculateLocation();
    })
    window.addEventListener('scroll',()=>{
        // 计算面板位置
        calculateLocation();
    })
    
    // 当组件卸载时释放这些监听
    onDeactivated(() => {
        window.removeEventListener('resize')
        window.removeEventListener('scroll')
        window.removeEventListener('click')
    })
    
    return {
        select_button,
        select_dropdown,
        dropdownPosition,
        dropdownStyle,
        calculateLocation
    }
}
```
#### 让我们继续看看select-item.vue , 这是我们的子组件
```html
<!-- select-item.vue -->
<template>
  <li class="tk-select-item" :class="{'active':active}" @click="chooseSelectItem">
      <slot></slot>
  </li>
</template>

<script>
// 引入Bus
import Bus from './selectBus'
export default {
    setup(props){
        // 当选项被点击时
        function chooseSelectItem(){
            // 将被点击项目的value返回给select
            Bus.$emit('chooseSelectItem',props.value);
        }
    }
}
</script>
```
在 `select.vue` 中接收事件
```html
setup(){
    // 选中内容
    const selctValue = ref('');
    ...
    onMounted(()=>{
        Bus.$on('chooseSelectItem',(res)=>{
            // 修改显示值
            selctValue.value = res.value
            // 关闭下拉框
            selectOpen.value = false
        })
    })
    ...
}
```
到这里下拉选项框基本就完成了. 我们像页面添加第一个下拉选项时非常完美,但是如果页面上有两个`select`存在时问题来了. 我们发现当控制其中一个选项被选中是, 另外一个`select`显示的值也随之改变. 我们需要将一组 `select` & `select-item` 进行绑定,让Bus在接受时知道事件来自于哪个里面的 `select-item`

在`vue2`中我们通常获取实例的parent然后一层一层寻找父类`select`, 但是在 `vue3` setup中并不能获取到正确的parent, 所以我想到了可以在 `select` 创建时派发一个 `token` 在讲此令牌传给所有子类, 好了理论存在, 开始实践.

#### provide & inject
在vue中使用`provide`可以像子类、孙类等等后代传输数据, 后代使用`inject`接收数据.[查看官网](https://v3.vuejs.org/guide/component-provide-inject.html#provide-inject)

![components_provide.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d23f6f31aefc4ca3855572cb8698bdcc~tplv-k3u1fbpfcp-watermark.image?)

#### 派发token令牌
这里可以模仿Java中的UNID
```js
// token.js
function code() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function tokenFun() {
    return (code() + code() + "-" + code() + "-" + code() + "-" + code() + "-" + code() + code() + code());
}
```
在 `select` 创建时生成 `token` 并派发给后代
```js
// select.vue
import {tokenFun} from '@/utils/token'
import {provide, getCurrentInstance} from 'vue';

...

setup(){

    ...
    
    // 获取实例
    const page = getCurrentInstance()

    var token = 'select-' + tokenFun();
    // 缓存token
    page.token = token
    // 给子元素派发token
    provide('token',token)
  
  return {
      token
  }
}
```
这样我们在子类接收后每次使用bus发送数据时带上token
```js
// select-item.vue
import {ref, getCurrentInstance, inject} from 'vue';

...

setup(){

    ...
    
    // 获取实例
    const page = getCurrentInstance();
    
    // 接收token
    const token = inject('token');
    // 缓存token
    page.token = token
    
    // 选择下拉
    function chooseSelectItem(){
        // 在使用Bus发送数据时带上token
        Bus.$emit('chooseSelectItem',{token: token,value: props.value});
    }
}

```
在 `select.vue` 监听Bus后先验证token
```js
onMounted(()=>{
    Bus.$on('chooseSelectItem',(res)=>{
        // 判断发送数据的子孙携带的token是否和实例一样
        if(res.token === page.token){
            // 修改显示值
            selctValue.value = res.value
            // 关闭下拉框
            selectOpen.value = false
        }
    })
}) 
```
### 大功告成, 这样我们就做好了一个select下拉选项, 下拉部分挂于body标签

#### 全部代码
#### select.vue
```html
<template>
  <!-- 下拉框 -->
  <div class="tk-select"> 
      <div ref="select_button" class="tk-select-button" @click="selectOpen = !selectOpen">
          <!-- 选中内容 -->
          <span>{{selctValue}}</span>
          <div class="select-icon" :class="{'selectOpen':selectOpen}">
              <i class="fi fi-rr-angle-small-down"></i>
          </div>
      </div>
      <!-- 下拉框 -->
      <teleport to="body">
          <transition name="select">
            <div ref="select_dropdown" v-show="selectOpen" :style="dropdownStyle" class="tk-select-dropdown">
                <ul>
                    <slot name="selectDropDown"></slot>
                </ul>
            </div>
          </transition>
      </teleport>
  </div>
</template>

<script>
import {tokenFun} from '@/utils/token'
import Bus from './selectBus'
import {ref,onMounted,computed,watch,onDeactivated,provide,getCurrentInstance} from 'vue';
export default {
    name: 'TkSelect',
    props: {
        selected: String
    },
    setup(props,ctx){

        const page = getCurrentInstance()

        // 获取按钮
        const select_button = ref(null);
        const select_dropdown = ref(null);

        // 打开状态
        const selectOpen = ref(false);

        // 选中内容
        const selctValue = ref('');

        // 下拉框位置
        const dropdownPosition = ref({x:0,y:0,w:0})

        // 下拉框位置
        const dropdownStyle = computed(()=>{
            return {
                left: `${dropdownPosition.value.x}px`,
                top:  `${dropdownPosition.value.y}px`,
                width: `${dropdownPosition.value.w}px`
            }
        })

        watch(selectOpen,(val)=>{
            if(val)
                // 计算位置
                calculateLocation();
        })

        watch(selctValue,()=>{
            ctx.emit('update:modelValue', selctValue.value)
        })

        // 计算位置
        function calculateLocation(){
            var select_button_dom = select_button.value.getBoundingClientRect()
            dropdownPosition.value.w = select_button_dom.width
            dropdownPosition.value.x = select_button_dom.left
            dropdownPosition.value.y = select_button_dom.top + select_button_dom.height + 5
        }

        window.addEventListener('click',(event)=>{
            if(!select_button.value.contains(event.target) && !select_dropdown.value.contains(event.target) ){
                selectOpen.value = false
            }
        })
         window.addEventListener('touchstart',(event)=>{
            if(!select_button.value.contains(event.target) && !select_dropdown.value.contains(event.target) ){
                selectOpen.value = false
            }
        })

        window.addEventListener('resize',()=>{
            // 计算面板位置
            calculateLocation();
        })
        window.addEventListener('scroll',()=>{
            // 计算面板位置
            calculateLocation();
        })

        onDeactivated(()=>{
            window.removeEventListener('resize')
            window.removeEventListener('scroll')
            window.removeEventListener('click')
            window.removeEventListener('touchstart')
            Bus.$off('chooseSelectItem');
        })

        var token = 'select-' + tokenFun();
        // 获取生成的token
        page.token = token
        // 给子元素派发token
        provide('token',token)

        onMounted(()=>{
             Bus.$on('chooseSelectItem',(res)=>{
                 if(res.token === page.token){
                    selctValue.value = res.value
                    selectOpen.value = false
                    Bus.$emit('chooseActive',{token:token,value:selctValue.value})
                 }
            })
            if(props.selected){
                selctValue.value = props.selected
                Bus.$emit('chooseActive',{token:token,value:selctValue.value})
            }else{
                selctValue.value = ctx.slots.selectDropDown()[0].props.value
                Bus.$emit('chooseActive',{token:token,value:selctValue.value})
            }
        })

        return {
            selectOpen,
            selctValue,
            select_dropdown,
            select_button,
            dropdownStyle,
            dropdownPosition,
            calculateLocation,
            token
        }
    }
}
</script>

<style lang="scss" scoped>
// 下拉框
.tk-select-button{
    width: 100%;
    height: 48px;
    padding: 0 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: #E6E8EC 2px solid;
    background-color: #FCFCFD;
    cursor: pointer;
    transition: border .2s;
}
.tk-select-button:hover{
    border: #23262F 2px solid;
}
.tk-select-button span{
    font-weight: 500;
    user-select: none;
}

// icon
.select-icon{
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: #E6E8EC 2px solid;
    transition: all .2s;
}
.select-icon.selectOpen{
    transform: rotate(180deg);
}

// 下拉框
.tk-select-dropdown{
    position: fixed;
    background-color: #FCFCFD;
}
.tk-select-dropdown ul{
    overflow: hidden;
    border-radius: 12px;
    border: #E6E8EC 2px solid;
    box-shadow: 0 4px 12px rgba(35,38,47 ,0.1);
}

.select-enter-from, .select-leave-to{
    opacity: 0;
    transform: scale(0.9);
}
.select-enter-active, .select-leave-active{
    transform-origin: top center;
    transition: opacity .4s cubic-bezier(0.5, 0, 0, 1.25), transform .2s cubic-bezier(0.5, 0, 0, 1.25);
}
</style>
```

#### select-item.vue
```html
<template>
  <li class="tk-select-item" :class="{'active':active}" @click="chooseSelectItem">
      <slot></slot>
  </li>
</template>

<script>
import Bus from './selectBus'
import {ref, getCurrentInstance, inject, onDeactivated} from 'vue';
export default {
    name: "TkSelectItem",
    props: ['value'],
    setup(props){

        const page = getCurrentInstance();

        const active = ref(false);
       
        // 接收token
        const token = inject('token');
        page.token = token
        Bus.$on('chooseActive',(res)=>{
            if(res.token !== page.token)
                return
            if(res.value == props.value)
                active.value = true
            else
                active.value = false
            })

        // 选择下拉
        function chooseSelectItem(){
            Bus.$emit('chooseSelectItem',{token: token,value: props.value});
        }

        onDeactivated(()=>{
            Bus.$off('chooseActive')
        })

        return {
            chooseSelectItem,
            active,
            token
        }
    }
}
</script>

<style lang="scss" scoped>
.tk-select-item.active{
    color: #3772FF;
    background-color: #F3F5F6;
    user-select: none;
}
</style>
```

#### token.js
```js
function code() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function tokenFun() {
    return (code() + code() + "-" + code() + "-" + code() + "-" + code() + "-" + code() + code() + code());
}
```

#### selectBus.js
```js
import emitter from 'tiny-emitter/instance'

export default {
    $on: (...args) => emitter.on(...args),
    $once: (...args) => emitter.once(...args),
    $off: (...args) => emitter.off(...args),
    $emit: (...args) => emitter.emit(...args)
}
```





  

