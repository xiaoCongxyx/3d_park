<template>
  <div class="operator-panel"  @click.stop="() => {}">
    <v-expansion-panels focusable dark v-model="plane">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:default="{ open }">
            <v-row no-gutters>
              <v-col cols="4">
                寻路导航
              </v-col>
              <v-col
                  cols="8"
                  class="text--secondary"
              >
                <v-fade-transition leave-absolute>
                <span
                    v-if="open"
                    key="0"
                >
                  输入起终点
                </span>
                  <span
                      v-else
                      key="1"
                  >
                  {{ startAEndCity }}
                </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content color="success">
          <v-text-field
              v-model="trip.startCity"
              placeholder="起点"
              clearable
          ></v-text-field>
          <v-text-field
              v-model="trip.endCity"
              placeholder="终点"
              clearable
          ></v-text-field>
          <div class="wayFindIng-bnt">
            <v-btn
                class="ma-2"
                outlined
                color="#0ff0ff"
                @click="startFindingWay({start:trip.startCity,end:trip.endCity})"
            >
              开始寻路
            </v-btn>
            <v-btn
                class="ma-2"
                outlined
                color="#ffff00"
                @click="cancelFindingWay"
            >
              取消寻路
            </v-btn>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>


      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:default="{ open }">
            <v-row no-gutters>
              <v-col cols="4">
                绘制飞线
              </v-col>
              <v-col
                  cols="8"
                  class="text--secondary"
              >
                <v-fade-transition leave-absolute>
                <span
                    v-if="open"
                    key="0"
                >
                  请建立连接
                </span>
                  <span
                      v-else
                      key="1"
                  >
                  {{ flyLinePlace }}
                </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content color="success">
          <v-text-field
              v-model="trip.flyLinePlace.start"
              placeholder="起始"
          ></v-text-field>
          <v-text-field
              v-model="trip.flyLinePlace.end"
              placeholder="终止"
          ></v-text-field>
          <div class="wayFindIng-bnt">
            <v-btn
                class="ma-2"
                outlined
                color="#0ff0ff"
                @click.stop="buildFlyLine"
            >
              构建飞线
            </v-btn>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import cityJson from '../../../assets/json/city.json';

export default {
  name: "OperatorPanel",
  data() {
    return {
      trip: {
        startCity: '',
        endCity: '',
        flyLinePlace: {
          start: '',
          end: ''
        }
      },
      plane: []
    }
  },
  methods: {
    startFindingWay(params) {
      let {start, end} = params
      console.log('开始寻路...', start, end, this.checkCity(start), this.checkCity(end))
      if (start.trim() === '' || end.trim() === '') { // 不能为空
        console.log('请输入起始地城市...')
        return false
      } else if (!this.checkCity(start) || !this.checkCity(end)) { // 城市名要存在
        console.log('请输入正确的地级市城市名...')
        return false
      } else if (this.checkCity(start) && this.checkCity(end) && start === end) { // 禁止相同城市寻路
        console.log('近在眼前你寻什么路？')
        return false
      } else {
        this.plane = []
        let result = []
        result.push({
          city: start,
          pos: this.filterCityPos(start)
        })
        result.push({
          city: end,
          pos: this.filterCityPos(end)
        })
        this.$emit('start-finding-way', result)
      }
    },
    cancelFindingWay() {
      this.trip.startCity = ''
      this.trip.endCity = ''
      this.plane = []
      console.log('取消寻路...')
    },
    buildFlyLine() {
      this.plane = []
      console.log('构建飞线...')
    },
    // 是否存在该地级市
    checkCity(city) {
      let isCity = false;
      if (city.trim() === '') {
        isCity = false
      } else {
        cityJson.map(v => {
          if (v.city.includes(city)) {
            isCity = true;
            return false
          }
        })
      }
      return isCity;
    },
    filterCityPos(city) {
      let result;
      cityJson.map(v => {
        if (v.city.includes(city)) {
          result = v.lnglat
          return false
        }
      })
      return result;
    }
  },
  mounted() {
  },
  computed: {
    startAEndCity() {
      let result = '';
      if (this.trip.startCity?.trim() && this.trip.endCity?.trim())
        result = this.trip.startCity + ' --- ' + this.trip.endCity;
      return result;
    },
    flyLinePlace() {
      let result = '';
      if (this.trip.flyLinePlace?.start.trim() && this.trip.flyLinePlace?.end.trim())
        result = this.trip.flyLinePlace.start + ' --- ' + this.trip.flyLinePlace.end;
      return result;
    }
  }
}
</script>

<style scoped lang="scss">
.operator-panel {
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
  width: 350px;
  //max-height: 500px;
  height: 500px;
  padding: 15px;
  z-index: 99;
  background-color: rgba(255, 192, 203, 0.3);

  .wayFindIng-bnt {
    display: flex;
    justify-content: space-evenly;
  }
}
</style>