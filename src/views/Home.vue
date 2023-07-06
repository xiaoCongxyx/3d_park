<template>
  <div class="home">
    <Header />
    <router-view />
  </div>
</template>

<script>
// @ is an alias to /src
import Header from '@/layout/header'
import Footer from '@/layout/footer'

export default {
  name: 'Home',
  components: {
    Header,
    Footer
  },
  data () {
    return {

    }
  },
  mounted() {
  },
  created() {
  },
  computed: {},
  watch: {},
  methods: {

  },
}
</script>

<style scoped lang="scss">
.home {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
