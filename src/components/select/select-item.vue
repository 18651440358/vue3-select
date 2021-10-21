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
@import "../../assets/theme/_handle.scss";
.tk-select-item.active{
    @include color(primary);
    @include background-color(hoverBackground);
    user-select: none;
}
</style>