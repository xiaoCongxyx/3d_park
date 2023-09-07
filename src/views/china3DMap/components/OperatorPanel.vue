<template>
  <div class="operator-panel">
    <v-expansion-panels focusable dark>
      <v-expansion-panel @click="panelChange">
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
                @click="startFindingWay"
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
                Trip name
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
                  Enter a name for the trip
                </span>
                  <span
                      v-else
                      key="1"
                  >
                  {{ trip.name }}
                </span>
                </v-fade-transition>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content color="success">
          <v-text-field
              v-model="trip.name"
              placeholder="Caribbean Cruise"
          ></v-text-field>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
export default {
  name: "OperatorPanel",
  data() {
    return {
      trip: {
        startCity: '',
        endCity: '',
        name: '',
      },
    }
  },
  methods: {
    panelChange(e) {
      console.log(e,'切换折叠状态...')
    },
    startFindingWay() {
      console.log('开始寻路...')
    },
    cancelFindingWay() {
      console.log('取消寻路...')
    }
  },
  computed: {
    startAEndCity() {
      let result = '';
      console.log(this.trip.startCity)
      if (this.trip.startCity?.trim() && this.trip.endCity?.trim())
        result = this.trip.startCity + ' --- ' + this.trip.endCity;
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