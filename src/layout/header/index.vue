<template>
  <div class="header_wrap">
    <ul>
      <li v-for="item in tabsList" :key="item.name" @click="goTourism(item.path)">{{ item.title }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      tabsList: [
        {
          title: '3D智慧城市',
          path: '/cityPark',
        },{
          title: '3D地图',
          path: '/china3DMap',
        },{
          title: '待设计2...',
          path: '/',
        },{
          title: '待设计3...',
          path: '/',
        },{
          title: '待设计4...',
          path: '/',
        },
      ]
    }
  },
  methods: {
    goTourism(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped lang="scss">
.header_wrap {
  height: 80px;
  box-sizing: border-box;
  background-image: linear-gradient(to right, #388397, #654b97, #90839b, #47b0d1, #9159bf);
  ul {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #fff;
    font-size: 24px;
    li {
      box-sizing: border-box;
      height: 100%;
      line-height: 80px;
      padding: 0 30px;
      cursor: pointer;
    }
  }
}
</style>